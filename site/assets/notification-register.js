(function initNotificationRegisterPage() {
  const DATA = window.ELECTION_SITE_DATA;
  const CONFIG = window.NOTIFICATION_REGISTER_CONFIG || {};
  const PREVIEW_SELECTION_KEY = "notification-register-preview";
  const PREVIEW_PUSH_KEY = "notification-webpush-preview";
  const form = document.getElementById("notificationRegisterForm");
  const prefectureSelect = document.getElementById("prefectureSelect");
  const municipalitySelect = document.getElementById("municipalitySelect");
  const saveButton = document.getElementById("saveButton");
  const pauseButton = document.getElementById("pauseButton");
  const resumeButton = document.getElementById("resumeButton");
  const statusMessage = document.getElementById("notificationStatus");
  const loginState = document.getElementById("loginState");
  const deliveryState = document.getElementById("deliveryState");
  const currentPrefecture = document.getElementById("currentPrefecture");
  const currentMunicipality = document.getElementById("currentMunicipality");
  const webPushCard = document.getElementById("webPushCard");
  const webPushIntro = document.getElementById("webPushIntro");
  const webPushStatusMessage = document.getElementById("webPushStatusMessage");
  const iosInstallGuide = document.getElementById("iosInstallGuide");
  const pushPermissionGuide = document.getElementById("pushPermissionGuide");
  const pushPermissionCopy = document.getElementById("pushPermissionCopy");
  const enablePushButton = document.getElementById("enablePushButton");
  const installAppButton = document.getElementById("installAppButton");
  const disablePushButton = document.getElementById("disablePushButton");
  const pushUnsupported = document.getElementById("pushUnsupported");
  const pushUnsupportedCopy = document.getElementById("pushUnsupportedCopy");
  const pushSupportState = document.getElementById("pushSupportState");
  const pushInstallState = document.getElementById("pushInstallState");
  const pushPermissionState = document.getElementById("pushPermissionState");
  const pushSubscriptionState = document.getElementById("pushSubscriptionState");

  const regions = Array.isArray(DATA?.regions) ? DATA.regions : [];
  const prefectures = regions
    .filter((region) => region.level === "prefecture")
    .sort((left, right) => left.displayName.localeCompare(right.displayName, "ja"));
  const municipalitiesByPrefecture = new Map();

  for (const region of regions) {
    if (region.level !== "municipality") continue;
    if (!municipalitiesByPrefecture.has(region.prefectureRegionId)) {
      municipalitiesByPrefecture.set(region.prefectureRegionId, []);
    }
    municipalitiesByPrefecture.get(region.prefectureRegionId).push(region);
  }

  for (const group of municipalitiesByPrefecture.values()) {
    group.sort((left, right) => left.displayName.localeCompare(right.displayName, "ja"));
  }

  const state = {
    identity: null,
    session: null,
    registration: null,
    pushConfig: null,
    currentPushSubscription: null,
    pushPreview: loadMockPushState(),
  };

  setupPrefectureOptions();
  wireEvents();
  bootstrap().catch((error) => {
    setStatus(`初期化に失敗しました: ${error.message}`, true);
    refreshWebPushUi();
  });

  function wireEvents() {
    prefectureSelect.addEventListener("change", () => {
      renderMunicipalityOptions(prefectureSelect.value);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const prefRegionId = prefectureSelect.value;
      const municipalityRegionId = municipalitySelect.value;
      if (!prefRegionId || !municipalityRegionId) {
        setStatus("都道府県と市区町村を選んでください。", true);
        return;
      }

      if (!CONFIG.apiBaseUrl) {
        persistMockSelection({
          prefRegionId,
          municipalityRegionId,
          deliveryStatus: readCurrentDeliveryStatus(),
        });
        reflectSelection(prefRegionId, municipalityRegionId, readCurrentDeliveryStatus());
        setStatus("API 未接続のため、ローカルプレビューとして保存しました。", false);
        setWebPushMessage(buildRegionSavedMessage());
        return;
      }

      if (!state.identity?.idToken) {
        setStatus("この端末ではまだ通知保存APIに接続していません。", true);
        return;
      }

      try {
        lockForm(true);
        const response = await fetch(joinApiPath("/notifications/api/subscriptions"), {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            idToken: state.identity.idToken,
            accessToken: state.identity.accessToken,
            prefRegionId,
            municipalityRegionId,
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "登録に失敗しました。");
        }

        reflectSelection(prefRegionId, municipalityRegionId, "active");
        setStatus("地域登録を更新しました。", false);
        setWebPushMessage(buildRegionSavedMessage());
      } catch (error) {
        setStatus(error.message, true);
      } finally {
        lockForm(false);
      }
    });

    pauseButton.addEventListener("click", () => updateDeliveryStatus("pause"));
    resumeButton.addEventListener("click", () => updateDeliveryStatus("resume"));
    enablePushButton.addEventListener("click", enableBrowserPush);
    installAppButton.addEventListener("click", triggerInstallPrompt);
    disablePushButton.addEventListener("click", disableBrowserPush);
    window.addEventListener("pwa:install-available", refreshWebPushUi);
    window.addEventListener("pwa:installed", () => {
      setWebPushMessage("ホーム画面追加が完了しました。次に通知許可を確認できます。");
      refreshWebPushUi();
    });
  }

  async function bootstrap() {
    if (!prefectures.length) {
      setStatus("地域データが見つかりません。", true);
      refreshWebPushUi();
      return;
    }

    if (window.liff && CONFIG.liffId) {
      await window.liff.init({ liffId: CONFIG.liffId });
      if (!window.liff.isLoggedIn()) {
        window.liff.login();
        return;
      }

      state.identity = {
        idToken: window.liff.getIDToken(),
        accessToken: window.liff.getAccessToken(),
      };
      loginState.textContent = "認証済み";
    } else {
      loginState.textContent = "この端末で管理";
    }

    if (CONFIG.apiBaseUrl && state.identity?.idToken) {
      await loadPushConfig();
      await loadRemoteSession();
      return;
    }

    const mock = loadMockSelection();
    if (mock) {
      reflectSelection(mock.prefRegionId, mock.municipalityRegionId, mock.deliveryStatus || "active");
      setStatus("ローカルプレビューの選択内容を表示しています。", false);
    } else {
      selectDefaultPrefecture();
      setStatus("この端末の通知登録として保存できます。", false);
    }

    refreshWebPushUi();
  }

  async function loadRemoteSession() {
    try {
      const response = await fetch(joinApiPath("/notifications/api/session"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          idToken: state.identity.idToken,
          accessToken: state.identity.accessToken,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "セッション取得に失敗しました。");
      }

      state.session = payload.session;
      state.currentPushSubscription = payload.session.currentPushSubscription || null;
      const subscription = payload.session.currentSubscription;
      if (subscription) {
        reflectSelection(subscription.prefRegionId, subscription.municipalityRegionId, payload.session.deliveryStatus);
      } else {
        deliveryState.textContent = translateDeliveryStatus(payload.session.deliveryStatus);
        state.registration = null;
        selectDefaultPrefecture();
      }

      setStatus("現在の登録状態を取得しました。", false);
    } catch (error) {
      setStatus(error.message, true);
      state.registration = null;
      selectDefaultPrefecture();
    }

    refreshWebPushUi();
  }

  async function updateDeliveryStatus(action) {
    if (!CONFIG.apiBaseUrl) {
      const nextStatus = action === "pause" ? "paused" : "active";
      deliveryState.textContent = translateDeliveryStatus(nextStatus);
      persistMockSelection({ deliveryStatus: nextStatus });
      setStatus("API 未接続のため、ローカル表示だけ更新しました。", false);
      return;
    }

    if (!state.identity?.idToken) {
      setStatus("この端末ではまだ通知保存APIに接続していません。", true);
      return;
    }

    try {
      const response = await fetch(joinApiPath("/notifications/api/delivery-status"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          idToken: state.identity.idToken,
          accessToken: state.identity.accessToken,
          action,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "通知状態の更新に失敗しました。");
      }

      deliveryState.textContent = translateDeliveryStatus(payload.deliveryStatus);
      setStatus(action === "pause" ? "地域通知を止めました。" : "地域通知を再開しました。", false);
    } catch (error) {
      setStatus(error.message, true);
    }
  }

  async function enableBrowserPush() {
    const environment = getPushEnvironment();
    if (!state.registration) {
      setWebPushMessage("先に地域登録を完了してください。");
      return;
    }

    if (!environment.hasNotification || !environment.canRequestPermission) {
      setWebPushMessage("この環境では通知許可の確認に進めません。");
      refreshWebPushUi();
      return;
    }

    if (environment.isIos && !environment.isStandalone) {
      setWebPushMessage("iPhone はホーム画面に追加したあと、追加したアイコンから開いて通知を設定してください。");
      refreshWebPushUi();
      return;
    }

    if (Notification.permission === "denied") {
      setWebPushMessage("通知はすでに拒否されています。ブラウザ設定から通知を許可してください。");
      refreshWebPushUi();
      return;
    }

    try {
      enablePushButton.disabled = true;
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        if (CONFIG.apiBaseUrl && state.identity?.idToken) {
          await saveWebPushSubscription();
        } else {
          state.currentPushSubscription = {
            status: "active",
            lastSeenAt: new Date().toISOString(),
            prefRegionId: state.registration.prefRegionId,
            municipalityRegionId: state.registration.municipalityRegionId,
          };
        }
        state.pushPreview = {
          permission: "granted",
          connectedAt: new Date().toISOString(),
        };
        persistMockPushState(state.pushPreview);
        setWebPushMessage("この端末で通知受け取りの準備が完了しました。");
      } else if (permission === "denied") {
        state.pushPreview = null;
        state.currentPushSubscription = null;
        persistMockPushState(null);
        setWebPushMessage("通知は拒否されました。必要になったらブラウザ設定から再度変更できます。");
      } else {
        setWebPushMessage("通知許可はまだ保留です。必要に応じてタイミングを変えて試してください。");
      }
    } catch (error) {
      setWebPushMessage(`通知許可の確認に失敗しました: ${error.message}`);
    } finally {
      enablePushButton.disabled = false;
      refreshWebPushUi();
    }
  }

  async function disableBrowserPush() {
    const environment = getPushEnvironment();
    if (!environment.hasServiceWorker || !environment.hasPushManager) {
      setWebPushMessage("この環境では通知解除を実行できません。");
      return;
    }

    try {
      disablePushButton.disabled = true;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      const endpoint = state.currentPushSubscription?.endpoint || subscription?.endpoint || null;

      if (CONFIG.apiBaseUrl && state.identity?.idToken && endpoint) {
        const response = await fetch(joinApiPath("/push/api/subscriptions"), {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            idToken: state.identity.idToken,
            accessToken: state.identity.accessToken,
            endpoint,
          }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "通知解除に失敗しました。");
        }
      }

      if (subscription) {
        await subscription.unsubscribe();
      }

      state.currentPushSubscription = null;
      state.pushPreview = null;
      persistMockPushState(null);
      setWebPushMessage("この端末の通知購読を解除しました。");
    } catch (error) {
      setWebPushMessage(`通知解除に失敗しました: ${error.message}`);
    } finally {
      disablePushButton.disabled = false;
      refreshWebPushUi();
    }
  }

  async function triggerInstallPrompt() {
    const deferredPrompt = window.PWA_CONTEXT?.deferredPrompt;
    if (!deferredPrompt) {
      setWebPushMessage("このブラウザではインストール案内を直接開けません。メニューからホーム画面追加をお試しください。");
      refreshWebPushUi();
      return;
    }

    try {
      installAppButton.disabled = true;
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        setWebPushMessage("ホーム画面追加を受け付けました。インストール完了後に通知設定へ進めます。");
      } else {
        setWebPushMessage("ホーム画面追加は見送りになりました。あとから再度実行できます。");
      }
    } catch (error) {
      setWebPushMessage(`ホーム画面追加の表示に失敗しました: ${error.message}`);
    } finally {
      installAppButton.disabled = false;
      refreshWebPushUi();
    }
  }

  function setupPrefectureOptions() {
    prefectureSelect.innerHTML = [
      `<option value="">都道府県を選んでください</option>`,
      ...prefectures.map((prefecture) => `<option value="${prefecture.id}">${escapeHtml(prefecture.displayName)}</option>`),
    ].join("");
  }

  function renderMunicipalityOptions(prefRegionId, selectedMunicipalityId = "") {
    const municipalities = municipalitiesByPrefecture.get(prefRegionId) || [];
    municipalitySelect.innerHTML = [
      `<option value="">市区町村を選んでください</option>`,
      ...municipalities.map((municipality) => {
        const selected = municipality.id === selectedMunicipalityId ? " selected" : "";
        return `<option value="${municipality.id}"${selected}>${escapeHtml(municipality.displayName)}</option>`;
      }),
    ].join("");
  }

  function reflectSelection(prefRegionId, municipalityRegionId, currentDeliveryStatus) {
    prefectureSelect.value = prefRegionId;
    renderMunicipalityOptions(prefRegionId, municipalityRegionId);

    const pref = prefectures.find((entry) => entry.id === prefRegionId);
    const municipality = (municipalitiesByPrefecture.get(prefRegionId) || []).find((entry) => entry.id === municipalityRegionId);

    currentPrefecture.textContent = pref ? pref.displayName : "未登録";
    currentMunicipality.textContent = municipality ? municipality.displayName : "未登録";
    deliveryState.textContent = translateDeliveryStatus(currentDeliveryStatus || "active");
    state.registration = pref && municipality ? { prefRegionId, municipalityRegionId } : null;
    refreshWebPushUi();
  }

  function selectDefaultPrefecture() {
    const firstPrefecture = prefectures[0];
    if (!firstPrefecture) return;
    prefectureSelect.value = firstPrefecture.id;
    renderMunicipalityOptions(firstPrefecture.id);
  }

  function refreshWebPushUi() {
    const environment = getPushEnvironment();
    const hasRegistration = Boolean(state.registration?.municipalityRegionId);

    webPushCard.hidden = !hasRegistration;
    if (!hasRegistration) {
      return;
    }

    const iosNeedsInstall = environment.isIos && !environment.isStandalone;
    const canShowPermission = environment.hasNotification &&
      environment.canRequestPermission &&
      (!environment.isIos || environment.isStandalone);
    const showUnsupported = !environment.hasServiceWorker || !environment.hasNotification;

    iosInstallGuide.hidden = !iosNeedsInstall;
    pushPermissionGuide.hidden = !canShowPermission;
    pushUnsupported.hidden = !showUnsupported;

    installAppButton.hidden = !(environment.canInstallPrompt && !environment.isStandalone);
    enablePushButton.disabled = !canShowPermission;
    disablePushButton.hidden = !state.currentPushSubscription;

    if (environment.isIos) {
      pushPermissionCopy.textContent = environment.isStandalone
        ? "ホーム画面から開いているので、このまま通知許可を確認できます。"
        : "iPhone はホーム画面に追加したあと、追加したアイコンから開いて通知設定に進みます。";
    } else if (environment.canInstallPrompt && !environment.isStandalone) {
      pushPermissionCopy.textContent = "対応ブラウザではホーム画面追加と通知許可をこの端末で進められます。";
    } else {
      pushPermissionCopy.textContent = "対応ブラウザでは、この端末で通知許可の確認に進めます。";
    }

    pushUnsupportedCopy.textContent = environment.hasServiceWorker
      ? "このブラウザでは通知APIが使えません。Safari または対応ブラウザの最新版で開き直してください。"
      : "この環境では Service Worker に未対応のため、Web Push を有効にできません。";

    webPushIntro.textContent = environment.isIos
      ? "登録地域の通知を受け取るには、iPhone ではホーム画面追加と通知許可の順で進めます。"
      : "登録地域の通知を受け取るには、この端末でホーム画面追加と通知許可を進めます。";

    pushSupportState.textContent = describePushSupport(environment);
    pushInstallState.textContent = describeInstallState(environment);
    pushPermissionState.textContent = describePermissionState(environment);
    pushSubscriptionState.textContent = describeSubscriptionState(environment);
  }

  async function loadPushConfig() {
    try {
      const response = await fetch(joinApiPath("/push/api/config"));
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Push設定の取得に失敗しました。");
      }
      state.pushConfig = payload;
    } catch (error) {
      state.pushConfig = null;
      setWebPushMessage(`Push設定を取得できませんでした: ${error.message}`);
    }
  }

  async function saveWebPushSubscription() {
    if (!state.pushConfig?.vapidPublicKey) {
      throw new Error("Web Push の公開鍵が未設定です。");
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(state.pushConfig.vapidPublicKey),
      });
    }

    const response = await fetch(joinApiPath("/push/api/subscriptions"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        idToken: state.identity.idToken,
        accessToken: state.identity.accessToken,
        permission: Notification.permission,
        subscription: subscription.toJSON(),
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Push購読の保存に失敗しました。");
    }

    state.currentPushSubscription = payload.subscription || null;
  }

  function getPushEnvironment() {
    const ua = navigator.userAgent || "";
    const isTouchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    const isIos = /iPhone|iPad|iPod/.test(ua) || isTouchMac;
    const isStandalone = window.PWA_CONTEXT?.isStandalone ||
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    const hasServiceWorker = "serviceWorker" in navigator;
    const hasNotification = "Notification" in window;
    const hasPushManager = "PushManager" in window;
    const canRequestPermission = hasNotification && typeof Notification.requestPermission === "function";
    const canInstallPrompt = Boolean(window.PWA_CONTEXT?.canInstall && window.PWA_CONTEXT?.deferredPrompt);
    const permission = hasNotification ? Notification.permission : "unsupported";

    return {
      isIos,
      isStandalone,
      hasServiceWorker,
      hasNotification,
      hasPushManager,
      canRequestPermission,
      canInstallPrompt,
      permission,
    };
  }

  function describePushSupport(environment) {
    if (!environment.hasServiceWorker || !environment.hasNotification) return "未対応";
    if (environment.isIos && !environment.isStandalone) return "対応前: ホーム画面追加が必要";
    if (!environment.hasPushManager) return "一部対応";
    return "対応";
  }

  function describeInstallState(environment) {
    if (environment.isStandalone) return "ホーム画面アプリで利用中";
    if (environment.isIos) return "ホーム画面追加が必要";
    if (environment.canInstallPrompt) return "追加可能";
    return "ブラウザで利用中";
  }

  function describePermissionState(environment) {
    if (!environment.hasNotification) return "未対応";
    if (environment.permission === "granted") return "許可済み";
    if (environment.permission === "denied") return "拒否";
    if (environment.isIos && !environment.isStandalone) return "ホーム画面追加後に確認";
    return "未許可";
  }

  function describeSubscriptionState(environment) {
    if (environment.permission !== "granted") return "未開始";
    if (state.currentPushSubscription?.status === "active" && isPushSubscriptionSynced()) return "この端末で購読中";
    if (state.currentPushSubscription?.status === "active") return "地域変更後の更新待ち";
    if (state.pushPreview?.connectedAt) return "接続準備中";
    return "許可済み / 未保存";
  }

  function buildRegionSavedMessage() {
    if (state.currentPushSubscription?.status === "active" && !isPushSubscriptionSynced()) {
      return "地域登録を更新しました。この端末の通知先も新しい地域に更新してください。";
    }
    return "地域登録が完了しました。この端末で通知の受け取り準備を進められます。";
  }

  function isPushSubscriptionSynced() {
    if (!state.registration || !state.currentPushSubscription) {
      return false;
    }

    return state.registration.prefRegionId === state.currentPushSubscription.prefRegionId &&
      state.registration.municipalityRegionId === state.currentPushSubscription.municipalityRegionId;
  }

  function loadMockSelection() {
    const raw = localStorage.getItem(PREVIEW_SELECTION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function persistMockSelection(partial) {
    const current = loadMockSelection() || {};
    localStorage.setItem(PREVIEW_SELECTION_KEY, JSON.stringify({ ...current, ...partial }));
  }

  function loadMockPushState() {
    const raw = localStorage.getItem(PREVIEW_PUSH_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function persistMockPushState(value) {
    if (!value) {
      localStorage.removeItem(PREVIEW_PUSH_KEY);
      return;
    }
    localStorage.setItem(PREVIEW_PUSH_KEY, JSON.stringify(value));
  }

  function joinApiPath(pathname) {
    return `${CONFIG.apiBaseUrl.replace(/\/$/, "")}${pathname}`;
  }

  function lockForm(isLocked) {
    saveButton.disabled = isLocked;
    prefectureSelect.disabled = isLocked;
    municipalitySelect.disabled = isLocked;
  }

  function readCurrentDeliveryStatus() {
    return deliveryState.textContent === "一時停止中" ? "paused" : "active";
  }

  function setStatus(message, isError) {
    statusMessage.innerHTML = isError
      ? `<strong>エラー:</strong> ${escapeHtml(message)}`
      : escapeHtml(message);
    statusMessage.style.color = isError ? "var(--red)" : "var(--muted)";
  }

  function setWebPushMessage(message) {
    webPushStatusMessage.textContent = message;
  }

  function translateDeliveryStatus(status) {
    if (status === "paused") return "一時停止中";
    if (status === "blocked") return "ブロック中";
    return "有効";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const normalized = (base64String + padding).replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(normalized);
    const output = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      output[index] = binary.charCodeAt(index);
    }
    return output;
  }
})();
