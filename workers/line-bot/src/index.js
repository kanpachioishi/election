const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), request, env);
    }

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        return withCors(json({ ok: true, service: "notification-worker" }), request, env);
      }

      if (request.method === "GET" && url.pathname === "/push/api/config") {
        return withCors(await handlePushConfig(env), request, env);
      }

      if (request.method === "POST" && url.pathname === "/line/webhook") {
        return withCors(await handleWebhook(request, env, ctx), request, env);
      }

      if (request.method === "POST" && url.pathname === "/notifications/api/session") {
        return withCors(await handleSession(request, env), request, env);
      }

      if (request.method === "POST" && url.pathname === "/notifications/api/subscriptions") {
        return withCors(await handleSubscriptionUpsert(request, env), request, env);
      }

      if (request.method === "POST" && url.pathname === "/notifications/api/delivery-status") {
        return withCors(await handleDeliveryStatusUpdate(request, env), request, env);
      }

      if (request.method === "POST" && url.pathname === "/push/api/subscriptions") {
        return withCors(await handlePushSubscriptionUpsert(request, env), request, env);
      }

      if (request.method === "DELETE" && url.pathname === "/push/api/subscriptions") {
        return withCors(await handlePushSubscriptionDelete(request, env), request, env);
      }

      return withCors(json({ error: "Not found" }, 404), request, env);
    } catch (error) {
      return withCors(
        json(
          {
            error: error instanceof HttpError ? error.message : "Internal Server Error",
            detail: error instanceof Error ? error.message : String(error),
          },
          error instanceof HttpError ? error.status : 500,
        ),
        request,
        env,
      );
    }
  },
};

async function handleWebhook(request, env, ctx) {
  const signature = request.headers.get("x-line-signature");
  const rawBody = await request.text();

  if (!signature) {
    return json({ error: "Missing x-line-signature header" }, 401);
  }

  const isValid = await verifyLineWebhookSignature(rawBody, signature, env.LINE_CHANNEL_SECRET);
  if (!isValid) {
    return json({ error: "Invalid LINE webhook signature" }, 401);
  }

  const payload = parseJson(rawBody);
  const events = Array.isArray(payload.events) ? payload.events : [];

  for (const event of events) {
    const eventId = event.webhookEventId ?? buildSyntheticWebhookEventId(event);
    const lineUid = event?.source?.userId ?? null;

    await env.DB.prepare(
      `INSERT OR IGNORE INTO line_webhook_event (
        webhook_event_id,
        event_type,
        line_uid,
        payload_json,
        processing_status,
        processing_attempts
      ) VALUES (?1, ?2, ?3, ?4, 'received', 0)`,
    )
      .bind(eventId, event.type ?? "unknown", lineUid, JSON.stringify(event))
      .run();

    ctx.waitUntil(processWebhookEvent(env, eventId, event));
  }

  return json({ ok: true, eventCount: events.length });
}

async function processWebhookEvent(env, eventId, event) {
  try {
    const lineUid = event?.source?.userId ?? null;

    if (event.type === "follow" && lineUid) {
      await upsertLineUser(env, lineUid, {
        followStatus: "active",
        preserveDeliveryStatus: true,
        clearBlockedAt: true,
      });
      await insertDeliveryStatusHistory(env, lineUid, "active", "webhook_follow", "system");
    }

    if (event.type === "unfollow" && lineUid) {
      await markLineUserBlocked(env, lineUid);
      await insertDeliveryStatusHistory(env, lineUid, "blocked", "webhook_unfollow", "system");
    }

    if ((event.type === "message" || event.type === "postback") && lineUid) {
      await env.DB.prepare(
        `UPDATE line_user
         SET last_interaction_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE line_uid = ?1`,
      )
        .bind(lineUid)
        .run();
    }

    await env.DB.prepare(
      `UPDATE line_webhook_event
       SET processing_status = 'processed',
           processed_at = CURRENT_TIMESTAMP,
           processing_attempts = processing_attempts + 1,
           error_message = NULL
       WHERE webhook_event_id = ?1`,
    )
      .bind(eventId)
      .run();
  } catch (error) {
    await env.DB.prepare(
      `UPDATE line_webhook_event
       SET processing_status = CASE
         WHEN processing_attempts + 1 >= 5 THEN 'dead_letter'
         ELSE 'retry_wait'
       END,
           processing_attempts = processing_attempts + 1,
           next_retry_at = CASE
             WHEN processing_attempts + 1 >= 5 THEN NULL
             ELSE datetime('now', '+5 minutes')
           END,
           error_message = ?2
       WHERE webhook_event_id = ?1`,
    )
      .bind(eventId, error instanceof Error ? error.message : String(error))
      .run();
  }
}

async function handleSession(request, env) {
  const body = await request.json();
  const identity = await verifyLiffIdentity(body, env);
  const user = await getOrCreateLineUserFromIdentity(env, identity);
  const subscription = await getActiveSubscription(env, user.id);
  const pushSubscription = await getActiveWebPushSubscriptionForUser(env, user.id);

  return json({
    ok: true,
    session: {
      lineUid: identity.lineUid,
      followStatus: user.follow_status,
      deliveryStatus: user.delivery_status,
      currentSubscription: subscription
        ? {
            prefRegionId: subscription.pref_region_id,
            municipalityRegionId: subscription.municipality_region_id,
            status: subscription.status,
          }
        : null,
      currentPushSubscription: pushSubscription,
    },
  });
}

async function handleSubscriptionUpsert(request, env) {
  const body = await request.json();
  const identity = await verifyLiffIdentity(body, env);
  const { prefRegionId, municipalityRegionId } = validateRegionSelection(body);
  const user = await getOrCreateLineUserFromIdentity(env, identity);

  if (user.follow_status === "blocked") {
    return json({ error: "Blocked users can't update subscription" }, 403);
  }

  await env.DB.prepare(
    `UPDATE line_user_region_subscription
     SET status = 'inactive',
         updated_at = CURRENT_TIMESTAMP
     WHERE line_user_pk = ?1
       AND status = 'active'`,
  )
    .bind(user.id)
    .run();

  await env.DB.prepare(
    `INSERT INTO line_user_region_subscription (
      line_user_pk,
      pref_region_id,
      municipality_region_id,
      status,
      registration_source,
      confirmed_at
    ) VALUES (?1, ?2, ?3, 'active', 'liff', CURRENT_TIMESTAMP)`,
  )
    .bind(user.id, prefRegionId, municipalityRegionId)
    .run();

  await env.DB.prepare(
    `INSERT INTO line_user_region_subscription_history (
      line_user_pk,
      pref_region_id,
      municipality_region_id,
      change_type,
      changed_by
    ) VALUES (?1, ?2, ?3, 'update', 'user')`,
  )
    .bind(user.id, prefRegionId, municipalityRegionId)
    .run();

  return json({
    ok: true,
    subscription: {
      prefRegionId,
      municipalityRegionId,
      registrationSource: "liff",
    },
  });
}

async function handleDeliveryStatusUpdate(request, env) {
  const body = await request.json();
  const identity = await verifyLiffIdentity(body, env);
  const user = await getOrCreateLineUserFromIdentity(env, identity);
  const nextStatus = body.action === "pause" ? "paused" : body.action === "resume" ? "active" : null;

  if (!nextStatus) {
    return json({ error: "action must be pause or resume" }, 400);
  }

  const previousStatus = user.delivery_status;
  if (previousStatus === nextStatus) {
    return json({ ok: true, deliveryStatus: nextStatus });
  }

  await env.DB.prepare(
    `UPDATE line_user
     SET delivery_status = ?2,
         delivery_status_changed_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?1`,
  )
    .bind(user.id, nextStatus)
    .run();

  await env.DB.prepare(
    `INSERT INTO line_user_delivery_status_history (
      line_user_pk,
      from_status,
      to_status,
      change_reason,
      changed_by
    ) VALUES (?1, ?2, ?3, ?4, 'user')`,
  )
    .bind(user.id, previousStatus, nextStatus, nextStatus === "paused" ? "user_pause" : "user_resume")
    .run();

  return json({ ok: true, deliveryStatus: nextStatus });
}

async function handlePushConfig(env) {
  if (!env.WEB_PUSH_VAPID_PUBLIC_KEY) {
    return json({ error: "WEB_PUSH_VAPID_PUBLIC_KEY is not configured" }, 503);
  }

  return json({
    ok: true,
    vapidPublicKey: env.WEB_PUSH_VAPID_PUBLIC_KEY,
  });
}

async function handlePushSubscriptionUpsert(request, env) {
  const body = await request.json();
  const identity = await verifyLiffIdentity(body, env);
  const user = await getOrCreateLineUserFromIdentity(env, identity);
  rejectBlockedUser(user);

  const regionSubscription = await requireActiveRegionSubscription(env, user.id);
  const pushSubscription = validatePushSubscription(body?.subscription);
  const userAgent = normalizeOptionalText(request.headers.get("user-agent"));

  await env.DB.prepare(
    `INSERT INTO web_push_subscription (
      line_user_pk,
      line_uid,
      line_user_region_subscription_pk,
      pref_region_id,
      municipality_region_id,
      endpoint,
      p256dh_key,
      auth_key,
      content_encoding,
      expiration_time,
      user_agent,
      status,
      deleted_at,
      last_seen_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 'active', NULL, CURRENT_TIMESTAMP)
    ON CONFLICT(endpoint) DO UPDATE SET
      line_user_pk = excluded.line_user_pk,
      line_uid = excluded.line_uid,
      line_user_region_subscription_pk = excluded.line_user_region_subscription_pk,
      pref_region_id = excluded.pref_region_id,
      municipality_region_id = excluded.municipality_region_id,
      p256dh_key = excluded.p256dh_key,
      auth_key = excluded.auth_key,
      content_encoding = excluded.content_encoding,
      expiration_time = excluded.expiration_time,
      user_agent = excluded.user_agent,
      status = 'active',
      deleted_at = NULL,
      last_seen_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP`,
  )
    .bind(
      user.id,
      user.line_uid,
      regionSubscription.id,
      regionSubscription.pref_region_id,
      regionSubscription.municipality_region_id,
      pushSubscription.endpoint,
      pushSubscription.keys.p256dh,
      pushSubscription.keys.auth,
      pushSubscription.contentEncoding,
      pushSubscription.expirationTime,
      userAgent,
    )
    .run();

  return json({
    ok: true,
    subscription: {
      endpoint: pushSubscription.endpoint,
      lineUid: user.line_uid,
      prefRegionId: regionSubscription.pref_region_id,
      municipalityRegionId: regionSubscription.municipality_region_id,
      status: "active",
    },
  });
}

async function handlePushSubscriptionDelete(request, env) {
  const body = await request.json();
  const identity = await verifyLiffIdentity(body, env);
  const user = await getOrCreateLineUserFromIdentity(env, identity);
  rejectBlockedUser(user);

  const endpoint = validatePushSubscriptionEndpoint(body);
  const result = await env.DB.prepare(
    `UPDATE web_push_subscription
     SET status = 'deleted',
         deleted_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE line_user_pk = ?1
       AND endpoint = ?2
       AND status = 'active'`,
  )
    .bind(user.id, endpoint)
    .run();

  return json({
    ok: true,
    endpoint,
    deleted: Number(result.meta?.changes ?? 0) > 0,
  });
}

async function verifyLiffIdentity(body, env) {
  if (!body?.idToken) {
    throw new HttpError(400, "idToken is required");
  }

  if (!env.LINE_LOGIN_CHANNEL_ID) {
    throw new HttpError(500, "LINE_LOGIN_CHANNEL_ID is not configured");
  }

  const verifyResponse = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      id_token: body.idToken,
      client_id: env.LINE_LOGIN_CHANNEL_ID,
    }),
  });

  if (!verifyResponse.ok) {
    throw new HttpError(401, "Failed to verify LIFF idToken");
  }

  const verified = await verifyResponse.json();
  if (!verified?.sub) {
    throw new HttpError(401, "LINE idToken verify response has no sub");
  }

  if (env.LINE_REQUIRE_FRIENDSHIP !== "false" && body.accessToken) {
    const friendshipResponse = await fetch("https://api.line.me/friendship/v1/status", {
      headers: {
        authorization: `Bearer ${body.accessToken}`,
      },
    });

    if (!friendshipResponse.ok) {
      throw new HttpError(401, "Failed to verify LINE friendship status");
    }

    const friendship = await friendshipResponse.json();
    if (!friendship?.friendFlag) {
      throw new HttpError(403, "The user has not added the LINE Official Account as a friend");
    }
  }

  return {
    lineUid: verified.sub,
    displayName: verified.name ?? null,
  };
}

function validateRegionSelection(body) {
  const prefRegionId = String(body?.prefRegionId ?? "");
  const municipalityRegionId = String(body?.municipalityRegionId ?? "");

  if (!/^pref-\d{2}$/.test(prefRegionId)) {
    throw new HttpError(400, "prefRegionId is invalid");
  }

  if (!/^mun-\d{5}$/.test(municipalityRegionId)) {
    throw new HttpError(400, "municipalityRegionId is invalid");
  }

  const prefCodeFromMunicipality = municipalityRegionId.slice(4, 6);
  const prefCodeFromPref = prefRegionId.slice(5, 7);

  if (prefCodeFromMunicipality !== prefCodeFromPref) {
    throw new HttpError(400, "prefRegionId must match the municipality parent prefecture");
  }

  return {
    prefRegionId,
    municipalityRegionId,
  };
}

async function getOrCreateLineUserFromIdentity(env, identity) {
  let user = await getLineUserByUid(env, identity.lineUid);
  if (user) {
    return user;
  }

  await env.DB.prepare(
    `INSERT INTO line_user (
      line_uid,
      follow_status,
      delivery_status,
      friendship_confirmed_at,
      delivery_status_changed_at,
      last_interaction_at
    ) VALUES (?1, 'active', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
  )
    .bind(identity.lineUid)
    .run();

  user = await getLineUserByUid(env, identity.lineUid);
  return user;
}

async function getLineUserByUid(env, lineUid) {
  const result = await env.DB.prepare(
    `SELECT *
     FROM line_user
     WHERE line_uid = ?1
     LIMIT 1`,
  )
    .bind(lineUid)
    .first();

  return result ?? null;
}

async function getActiveSubscription(env, lineUserPk) {
  const result = await env.DB.prepare(
    `SELECT *
     FROM line_user_region_subscription
     WHERE line_user_pk = ?1
       AND status = 'active'
     LIMIT 1`,
  )
    .bind(lineUserPk)
    .first();

  return result ?? null;
}

async function requireActiveRegionSubscription(env, lineUserPk) {
  const subscription = await getActiveSubscription(env, lineUserPk);
  if (!subscription) {
    throw new HttpError(409, "An active region subscription is required");
  }

  return subscription;
}

async function getActiveWebPushSubscriptionForUser(env, lineUserPk) {
  const result = await env.DB.prepare(
    `SELECT endpoint,
            pref_region_id,
            municipality_region_id,
            status,
            last_seen_at
     FROM web_push_subscription
     WHERE line_user_pk = ?1
       AND status = 'active'
     ORDER BY updated_at DESC
     LIMIT 1`,
  )
    .bind(lineUserPk)
    .first();

  if (!result) {
    return null;
  }

  return {
    endpoint: result.endpoint,
    prefRegionId: result.pref_region_id,
    municipalityRegionId: result.municipality_region_id,
    status: result.status,
    lastSeenAt: result.last_seen_at || null,
  };
}

async function upsertLineUser(env, lineUid, options) {
  const existing = await getLineUserByUid(env, lineUid);
  if (!existing) {
    await env.DB.prepare(
      `INSERT INTO line_user (
        line_uid,
        follow_status,
        delivery_status,
        friendship_confirmed_at,
        last_interaction_at
      ) VALUES (?1, ?2, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    )
      .bind(lineUid, options.followStatus)
      .run();
    return;
  }

  const deliveryStatus = options.preserveDeliveryStatus ? existing.delivery_status : "active";
  await env.DB.prepare(
    `UPDATE line_user
     SET follow_status = ?2,
         delivery_status = ?3,
         friendship_confirmed_at = COALESCE(friendship_confirmed_at, CURRENT_TIMESTAMP),
         blocked_at = CASE WHEN ?4 = 1 THEN NULL ELSE blocked_at END,
         last_interaction_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE line_uid = ?1`,
  )
    .bind(lineUid, options.followStatus, deliveryStatus, options.clearBlockedAt ? 1 : 0)
    .run();
}

async function markLineUserBlocked(env, lineUid) {
  const existing = await getLineUserByUid(env, lineUid);
  if (!existing) {
    await env.DB.prepare(
      `INSERT INTO line_user (
        line_uid,
        follow_status,
        delivery_status,
        blocked_at
      ) VALUES (?1, 'blocked', 'active', CURRENT_TIMESTAMP)`,
    )
      .bind(lineUid)
      .run();
    return;
  }

  await env.DB.prepare(
    `UPDATE line_user
     SET follow_status = 'blocked',
         blocked_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE line_uid = ?1`,
  )
    .bind(lineUid)
    .run();
}

async function insertDeliveryStatusHistory(env, lineUid, toStatus, reason, changedBy) {
  const user = await getLineUserByUid(env, lineUid);
  if (!user) return;

  await env.DB.prepare(
    `INSERT INTO line_user_delivery_status_history (
      line_user_pk,
      from_status,
      to_status,
      change_reason,
      changed_by
    ) VALUES (?1, ?2, ?3, ?4, ?5)`,
  )
    .bind(user.id, user.delivery_status, toStatus, reason, changedBy)
    .run();
}

function rejectBlockedUser(user) {
  if (user.follow_status === "blocked") {
    throw new HttpError(403, "Blocked users can't manage push subscriptions");
  }
}

function validatePushSubscription(subscription) {
  if (!subscription || typeof subscription !== "object") {
    throw new HttpError(400, "subscription is required");
  }

  const endpoint = normalizeOptionalText(subscription.endpoint);
  const p256dh = normalizeOptionalText(subscription?.keys?.p256dh);
  const auth = normalizeOptionalText(subscription?.keys?.auth);
  const contentEncoding = normalizeOptionalText(subscription.contentEncoding);
  const expirationTime = normalizeExpirationTime(subscription.expirationTime);

  if (!endpoint) {
    throw new HttpError(400, "subscription.endpoint is required");
  }

  if (!p256dh || !auth) {
    throw new HttpError(400, "subscription.keys.p256dh and subscription.keys.auth are required");
  }

  return {
    endpoint,
    keys: {
      p256dh,
      auth,
    },
    contentEncoding,
    expirationTime,
  };
}

function validatePushSubscriptionEndpoint(body) {
  const endpoint = normalizeOptionalText(body?.endpoint ?? body?.subscription?.endpoint);
  if (!endpoint) {
    throw new HttpError(400, "endpoint is required");
  }

  return endpoint;
}

function normalizeOptionalText(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function normalizeExpirationTime(value) {
  if (value === null || value === undefined || value === "") return null;
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    throw new HttpError(400, "subscription.expirationTime must be numeric");
  }

  return Math.trunc(normalized);
}

async function verifyLineWebhookSignature(rawBody, providedSignature, secret) {
  if (!secret) {
    throw new HttpError(500, "LINE_CHANNEL_SECRET is not configured");
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expectedSignature = arrayBufferToBase64(signatureBuffer);

  return timingSafeEqual(expectedSignature, providedSignature);
}

function buildSyntheticWebhookEventId(event) {
  return [
    event.type ?? "unknown",
    event.timestamp ?? Date.now(),
    event?.source?.userId ?? "anonymous",
  ].join(":");
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

function withCors(response, request, env) {
  const origin = request.headers.get("origin");
  const allowedOrigin = resolveAllowedOrigin(origin, env);
  response.headers.set("access-control-allow-methods", "GET,POST,DELETE,OPTIONS");
  response.headers.set("access-control-allow-headers", "content-type,authorization");
  if (allowedOrigin) {
    response.headers.set("access-control-allow-origin", allowedOrigin);
  }
  response.headers.set("vary", "origin");
  return response;
}

function resolveAllowedOrigin(origin, env) {
  const configured = env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || "*";
  const allowedOrigins = configured
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (allowedOrigins.includes("*")) {
    return "*";
  }

  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }

  if (!origin) {
    return allowedOrigins[0] || null;
  }

  return null;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: JSON_HEADERS,
  });
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
