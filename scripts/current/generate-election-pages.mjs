import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const dataV1Root = path.join(repoRoot, "data", "v1");
const electionsDir = path.join(repoRoot, "site", "elections");
const generatedMarker = "AUTO-GENERATED ELECTION DETAIL PAGE. DO NOT EDIT.";

const TYPE_LABELS = {
  national: "国政",
  prefectural: "都道府県",
  municipal: "市区町村",
  by_election: "補欠",
};

const SUBTYPE_LABELS = {
  governor: "知事",
  assembly: "議会",
  mayor: "首長",
  upper_house: "参院",
  lower_house: "衆院",
};

const KIND_LABELS = {
  candidate_list: "候補者一覧",
  bulletin: "選挙公報",
  early_voting: "期日前投票",
  polling_place: "投票所",
  other: "関連する公式情報",
};

const KIND_ORDER = ["candidate_list", "bulletin", "early_voting", "polling_place", "other"];

function parseArgs(argv) {
  const args = {
    write: false,
    check: false,
    asOf: getTodayJstDateText(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--write") {
      args.write = true;
      continue;
    }
    if (arg === "--check") {
      args.check = true;
      continue;
    }
    if (arg === "--as-of") {
      args.asOf = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(args.asOf)) {
    throw new Error(`--as-of must be YYYY-MM-DD: ${args.asOf}`);
  }
  if (args.write && args.check) {
    throw new Error("Use either --write or --check, not both.");
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/generate-election-pages.mjs [--write|--check] [--as-of YYYY-MM-DD]

Generates static detail pages for upcoming elections under site/elections/.
Existing custom pages without the generated marker are preserved.
`);
}

function getTodayJstDateText() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function listJsonFilesIfExists(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => path.join(dirPath, entry.name))
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function readFileIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function isVerified(record) {
  return record?.verification?.status === "verified";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value) {
  if (!value) return "未定";
  const [year, month, day] = value.split("-");
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}年${values.month}月${values.day}日 ${values.hour}:${values.minute}`;
}

function sortJa(left, right) {
  return String(left ?? "").localeCompare(String(right ?? ""), "ja");
}

function getPrefecture(region, regionById) {
  if (!region) return null;
  if (region.level === "prefecture") return region;
  return regionById.get(region.parent_region_id) ?? null;
}

function getElectionLabel(election) {
  return `${TYPE_LABELS[election.type] ?? election.type} / ${SUBTYPE_LABELS[election.subtype] ?? election.subtype}`;
}

function getResourceSortKey(resource) {
  const kindIndex = KIND_ORDER.includes(resource.kind) ? KIND_ORDER.indexOf(resource.kind) : KIND_ORDER.length;
  const displayOrder = Number.isFinite(resource.display_order) ? resource.display_order : Number.MAX_SAFE_INTEGER;
  return [kindIndex, displayOrder, resource.title ?? ""];
}

function sortResources(resources) {
  return resources.slice().sort((left, right) => {
    const leftKey = getResourceSortKey(left);
    const rightKey = getResourceSortKey(right);
    return leftKey[0] - rightKey[0] ||
      leftKey[1] - rightKey[1] ||
      sortJa(leftKey[2], rightKey[2]);
  });
}

function groupResources(resources) {
  return sortResources(resources).reduce((groups, resource) => {
    if (!groups.has(resource.kind)) groups.set(resource.kind, []);
    groups.get(resource.kind).push(resource);
    return groups;
  }, new Map());
}

function sortByDisplayOrder(items = []) {
  return items.slice().sort((left, right) => {
    const leftOrder = Number.isFinite(left.display_order) ? left.display_order : Number.MAX_SAFE_INTEGER;
    const rightOrder = Number.isFinite(right.display_order) ? right.display_order : Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder || sortJa(left.label ?? left.title ?? left.id, right.label ?? right.title ?? right.id);
  });
}

function getGuideIconName(itemOrId) {
  const id = typeof itemOrId === "string" ? itemOrId : itemOrId?.id;
  const label = typeof itemOrId === "string" ? "" : itemOrId?.label;
  const text = `${id ?? ""} ${label ?? ""}`.toLowerCase();

  if (/early/.test(text) || /期日前/.test(text)) return "clock";
  if (/polling|place|投票所/.test(text)) return "map-pin";
  if (/counting|開票/.test(text)) return "ballot";
  if (/candidate|候補/.test(text)) return "list";
  if (/bulletin|公報/.test(text)) return "file";
  if (/turnout|投票状況/.test(text)) return "chart";
  if (/contact|問い合わせ/.test(text)) return "phone";
  if (/vote|当日|投票/.test(text)) return "calendar";
  return "info";
}

function renderGuideIcon(itemOrId) {
  return `<span class="guide-icon guide-icon--${escapeHtml(getGuideIconName(itemOrId))}" aria-hidden="true"></span>`;
}

function getLocalGovernmentSite(election, localGovernmentSiteByKey, regionById) {
  const region = regionById.get(election.primary_region_id);
  const prefecture = getPrefecture(region, regionById);
  const municipalitySite = localGovernmentSiteByKey.get(`${election.primary_region_id}|municipality_home`);
  if (municipalitySite) {
    return {
      label: "自治体公式サイト",
      url: municipalitySite.url,
      lastCheckedAt: municipalitySite.verification?.last_checked_at ?? null,
    };
  }

  const prefectureSite = localGovernmentSiteByKey.get(`${prefecture?.id}|prefecture_home`);
  if (prefectureSite) {
    return {
      label: "都道府県公式サイト",
      url: prefectureSite.url,
      lastCheckedAt: prefectureSite.verification?.last_checked_at ?? null,
    };
  }

  return null;
}

function getRegionInfo(election, regionById) {
  const primaryRegion = regionById.get(election.primary_region_id);
  const prefecture = getPrefecture(primaryRegion, regionById);
  return {
    primaryRegion,
    prefecture,
    primaryRegionName: primaryRegion?.display_name ?? "全国",
    primaryRegionShortName: primaryRegion?.name ?? "全国",
    prefectureName: prefecture?.name ?? null,
  };
}

function getPageHref(election) {
  return `${election.slug}.html`;
}

function getPagePath(election) {
  return path.join(electionsDir, getPageHref(election));
}

function getCanonicalPath(election) {
  return `/elections/${getPageHref(election)}`;
}

function renderResourceCards(resources) {
  if (!resources.length) {
    return `<p class="resource-empty">この区分の確認済み公式リンクはまだありません。</p>`;
  }

  return resources.map((resource) => `
            <a class="election-resource" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">
              <span>
                <strong>${escapeHtml(resource.title)}</strong>
                ${resource.summary ? `<small>${escapeHtml(resource.summary)}</small>` : ""}
              </span>
              <em>${escapeHtml(formatDateTime(resource.verification?.last_checked_at))}</em>
            </a>`).join("");
}

function renderResourceSections(resources) {
  const grouped = groupResources(resources);
  const kinds = [
    ...KIND_ORDER.filter((kind) => grouped.has(kind)),
    ...[...grouped.keys()].filter((kind) => !KIND_ORDER.includes(kind)).sort(),
  ];

  if (!kinds.length) {
    return `
          <section class="election-section">
            <h2>公式リンク</h2>
            <p class="resource-empty">この選挙の公式リソースリンクはまだ登録されていません。確認でき次第追加します。</p>
          </section>`;
  }

  return kinds.map((kind) => `
          <section class="election-section">
            <h2>${escapeHtml(KIND_LABELS[kind] ?? "公式リンク")}</h2>
            <div class="resource-stack">
${renderResourceCards(grouped.get(kind) ?? [])}
            </div>
          </section>`).join("\n");
}

function renderResourceBlock(resources, pageDetail) {
  if (!pageDetail) return renderResourceSections(resources);

  return `
        <section class="official-link-intro">
          <p class="eyebrow">official links</p>
          <h2>公式ページで原文を確認する</h2>
          <p>上の要点は公式ページをもとに整理しています。投票所の詳細、期日前投票の制度、最新の掲載内容は、下の公式リンクで確認してください。</p>
        </section>
${renderResourceSections(resources)}`;
}

function renderGuideChecklistItem(item) {
  return `
            <article class="guide-card">
              ${renderGuideIcon(item)}
              <span class="guide-card-label">${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
              ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
              <a href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener noreferrer">公式確認元</a>
            </article>`;
}

function renderGuideSection(section) {
  const items = (section.items ?? []).map((item) => {
    const note = item.note ? `
                  <span>${escapeHtml(item.note)}</span>` : "";
    return `
              <div>
                <dt>${escapeHtml(item.label)}${item.derived ? "<small>導出</small>" : ""}</dt>
                <dd>
                  <strong>${escapeHtml(item.value)}</strong>${note}
                </dd>
              </div>`;
  }).join("");

  return `
          <section class="guide-detail-section">
            <div class="guide-section-heading">
              <div class="guide-title-row">
                ${renderGuideIcon(section)}
                <h3>${escapeHtml(section.title)}</h3>
              </div>
              <a href="${escapeHtml(section.source_url)}" target="_blank" rel="noopener noreferrer">公式確認元</a>
            </div>
            <p>${escapeHtml(section.summary)}</p>
            <dl class="guide-fact-list">
${items}
            </dl>
          </section>`;
}

function renderGuideFollowup(item) {
  const nextCheck = item.next_check_date ? `次回確認: ${formatDate(item.next_check_date)}` : "次回確認日未定";
  return `
            <article class="followup-item ${escapeHtml(item.status)}">
              ${renderGuideIcon(item)}
              <span class="followup-label">${escapeHtml(item.label)}</span>
              <strong>まだ掲載待ち</strong>
              <em>${escapeHtml(nextCheck)}</em>
              <p>${escapeHtml(item.summary)}</p>
              <a href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener noreferrer">確認先</a>
            </article>`;
}

function renderGuideContact(contact) {
  if (!contact) return "";
  return `
          <section class="guide-detail-section">
            <div class="guide-section-heading">
              <div class="guide-title-row">
                ${renderGuideIcon("contact")}
                <h3>問い合わせ先</h3>
              </div>
              <a href="${escapeHtml(contact.source_url)}" target="_blank" rel="noopener noreferrer">公式確認元</a>
            </div>
            <dl class="guide-fact-list">
              <div>
                <dt>窓口</dt>
                <dd><strong>${escapeHtml(contact.label)}</strong></dd>
              </div>
              <div>
                <dt>電話</dt>
                <dd><strong>${escapeHtml(contact.phone)}</strong></dd>
              </div>
              <div>
                <dt>所在地</dt>
                <dd>
                  <strong>${escapeHtml(contact.address)}</strong>
                  ${contact.note ? `<span>${escapeHtml(contact.note)}</span>` : ""}
                </dd>
              </div>
            </dl>
          </section>`;
}

function renderElectionPageDetail(detail) {
  if (!detail) return "";
  const checklist = sortByDisplayOrder(detail.checklist)
    .map(renderGuideChecklistItem)
    .join("");
  const sections = sortByDisplayOrder(detail.sections)
    .map(renderGuideSection)
    .join("");
  const followups = sortByDisplayOrder(detail.followups)
    .map(renderGuideFollowup)
    .join("");
  const followupSection = followups ? `
        <section class="guide-followups">
          <div class="guide-subheading">
            <h3>まだ出ていない情報</h3>
            <p>候補者一覧や選挙公報は、告示後に公式公開されることが多い情報です。未公開のものを候補者情報として扱わず、公開確認後に追加します。</p>
          </div>
          <div class="followup-list">
${followups}
          </div>
        </section>` : "";

  return `
    <section class="voter-guide" aria-label="投票前チェック">
      <div class="guide-heading">
        <p class="eyebrow">official checklist</p>
        <h2>${escapeHtml(detail.title)}</h2>
        <p>${escapeHtml(detail.summary)}</p>
      </div>
      <div class="guide-checklist">
${checklist}
      </div>
${followupSection}
      <div class="guide-subheading guide-subheading--detail">
        <h3>詳しく確認する</h3>
        <p>期日前投票の場所や投票所の確認方法など、投票前に迷いやすいところだけを補足しています。</p>
      </div>
      <div class="guide-detail-grid">
${sections}
${renderGuideContact(detail.contact)}
      </div>
    </section>`;
}

function renderPage(election, context) {
  const region = getRegionInfo(election, context.regionById);
  const resources = context.resourceMap.get(election.id) ?? [];
  const pageDetail = context.pageDetailMap.get(election.id) ?? null;
  const officialSite = getLocalGovernmentSite(election, context.localGovernmentSiteByKey, context.regionById);
  const lastCheckedAt = election.verification?.last_checked_at ?? election.verification?.confirmed_at ?? "";
  const title = `${election.name} - わたしの選挙`;
  const description = `${election.name}の投票日、告示日、地域、確認済みの公式リンクをまとめた案内ページです。最終確認は各公式ページで行ってください。`;
  const sourceUrl = election.verification?.source_url ?? "";

  return `<!DOCTYPE html>
<!-- ${generatedMarker} -->
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#0b1219">
  <link rel="manifest" href="../manifest.webmanifest">
  <link rel="icon" href="../icons/app-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../icons/app-icon.svg">
  <link rel="canonical" href="${escapeHtml(getCanonicalPath(election))}">
  <link rel="stylesheet" href="../assets/styles.css">
  <link rel="stylesheet" href="../assets/election-page.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="../index.html" aria-label="わたしの選挙トップ">
      <span class="brand-mark" aria-hidden="true">票</span>
      <span>
        <strong>わたしの選挙</strong>
        <small>公式情報への案内</small>
      </span>
    </a>
    <nav class="site-nav" aria-label="主なナビゲーション">
      <a href="../index.html">トップ</a>
      <a href="index.html">選挙ページ一覧</a>
      <a href="../pages/verification-policy.html">情報の確認基準</a>
      <a href="../pages/contact.html">訂正連絡</a>
    </nav>
  </header>

  <main class="election-page">
    <section class="election-hero">
      <p class="eyebrow">${escapeHtml(getElectionLabel(election))}</p>
      <h1>${escapeHtml(election.name)}</h1>
      <p class="lead">${escapeHtml(election.description ?? "公式情報への入口をまとめています。")}</p>
      <p class="election-caution">
        このページは公式機関ではなく、確認済みの公式ページへ進むための案内です。日時、場所、掲載内容は必ず公式ページで最終確認してください。
      </p>
    </section>

    <section class="fact-grid" aria-label="選挙の基本情報">
      <div class="fact-card">
        <span>投票日</span>
        <strong>${escapeHtml(formatDate(election.vote_date))}</strong>
      </div>
      <div class="fact-card">
        <span>告示日</span>
        <strong>${escapeHtml(formatDate(election.notice_date))}</strong>
      </div>
      <div class="fact-card">
        <span>地域</span>
        <strong>${escapeHtml(region.primaryRegionName)}</strong>
      </div>
      <div class="fact-card">
        <span>確認日</span>
        <strong>${escapeHtml(formatDateTime(lastCheckedAt) || "未記録")}</strong>
      </div>
    </section>

    <section class="official-actions" aria-label="公式情報への入口">
      ${sourceUrl ? `<a class="official-action primary" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">
        <span>確認元の公式ページ</span>
        <strong>選挙日程の根拠を開く</strong>
      </a>` : ""}
      ${officialSite ? `<a class="official-action" href="${escapeHtml(officialSite.url)}" target="_blank" rel="noopener noreferrer">
        <span>${escapeHtml(officialSite.label)}</span>
        <strong>自治体・都道府県の公式サイトを開く</strong>
      </a>` : ""}
    </section>
${renderElectionPageDetail(pageDetail)}
    <div class="election-layout">
      <div>
${renderResourceBlock(resources, pageDetail)}
      </div>
      <aside class="election-side">
        <section class="side-panel">
          <h2>掲載基準</h2>
          <p>候補者一覧、選挙公報、期日前投票、投票所などは、公式に公開され、対象選挙との関係が確認できるリンクだけを掲載します。</p>
          <a href="../pages/verification-policy.html">確認基準を見る</a>
        </section>
        <section class="side-panel">
          <h2>確認情報</h2>
          <dl>
            <div>
              <dt>データ基準</dt>
              <dd>${escapeHtml(formatDateTime(context.generatedAt))}</dd>
            </div>
            <div>
              <dt>選挙ID</dt>
              <dd>${escapeHtml(election.id)}</dd>
            </div>
            <div>
              <dt>地域</dt>
              <dd>${escapeHtml(region.prefectureName ? `${region.prefectureName} / ${region.primaryRegionShortName}` : region.primaryRegionName)}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
  </main>

  <footer class="site-footer">
    <p>このサイトは、確認した一次情報をもとに、選挙ごとの公式ページへの導線を整理しています。</p>
    <div class="footer-links">
      <a href="../index.html">トップ</a>
      <a href="index.html">選挙ページ一覧</a>
      <a href="../pages/verification-policy.html">情報の確認基準</a>
      <a href="../pages/privacy.html">プライバシーと通知</a>
      <a href="../pages/contact.html">お問い合わせ</a>
    </div>
  </footer>
  <script src="../assets/pwa.js"></script>
</body>
</html>
`;
}

function renderIndexPage(records, context) {
  const rows = records.map((item) => {
    const election = item.election;
    const region = getRegionInfo(election, context.regionById);
    const resourceCount = (context.resourceMap.get(election.id) ?? []).length;
    const customLabel = item.isCustom ? "専用" : "生成";
    return `
          <article class="election-index-item">
            <a href="${escapeHtml(getPageHref(election))}">
              <span>${escapeHtml(formatDate(election.vote_date))}</span>
              <strong>${escapeHtml(election.name)}</strong>
              <small>${escapeHtml(region.primaryRegionName)} / ${escapeHtml(getElectionLabel(election))} / 公式リンク ${resourceCount}件 / ${customLabel}ページ</small>
            </a>
          </article>`;
  }).join("");

  return `<!DOCTYPE html>
<!-- ${generatedMarker} -->
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>選挙ページ一覧 - わたしの選挙</title>
  <meta name="description" content="今後の選挙について、個別の公式情報案内ページを一覧で確認できます。">
  <meta name="theme-color" content="#0b1219">
  <link rel="manifest" href="../manifest.webmanifest">
  <link rel="icon" href="../icons/app-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../icons/app-icon.svg">
  <link rel="stylesheet" href="../assets/styles.css">
  <link rel="stylesheet" href="../assets/election-page.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="../index.html" aria-label="わたしの選挙トップ">
      <span class="brand-mark" aria-hidden="true">票</span>
      <span>
        <strong>わたしの選挙</strong>
        <small>公式情報への案内</small>
      </span>
    </a>
    <nav class="site-nav" aria-label="主なナビゲーション">
      <a href="../index.html">トップ</a>
      <a href="index.html" aria-current="page">選挙ページ一覧</a>
      <a href="../pages/verification-policy.html">情報の確認基準</a>
      <a href="../pages/contact.html">訂正連絡</a>
    </nav>
  </header>

  <main class="election-page">
    <section class="election-hero">
      <p class="eyebrow">election pages</p>
      <h1>選挙ページ一覧</h1>
      <p class="lead">今後の選挙について、投票日、告示日、確認済みの公式リンクへ進むための個別ページを並べています。</p>
      <p class="election-caution">基準日: ${escapeHtml(formatDate(context.asOf))}。掲載情報は公式ページで最終確認してください。</p>
    </section>
    <section class="election-index-list" aria-label="選挙ページ一覧">
${rows}
    </section>
  </main>

  <footer class="site-footer">
    <p>このサイトは、確認した一次情報をもとに、選挙ごとの公式ページへの導線を整理しています。</p>
    <div class="footer-links">
      <a href="../index.html">トップ</a>
      <a href="../pages/verification-policy.html">情報の確認基準</a>
      <a href="../pages/privacy.html">プライバシーと通知</a>
      <a href="../pages/contact.html">お問い合わせ</a>
    </div>
  </footer>
  <script src="../assets/pwa.js"></script>
</body>
</html>
`;
}

async function buildContext(asOf) {
  const [regionsData, electionsData, localGovernmentSitesData] = await Promise.all([
    readJson(path.join(dataV1Root, "regions.json")),
    readJson(path.join(dataV1Root, "elections.json")),
    readJson(path.join(dataV1Root, "local_government_sites.json")),
  ]);
  const regionById = new Map(regionsData.records.map((record) => [record.id, record]));
  const localGovernmentSiteByKey = new Map(
    localGovernmentSitesData.records
      .filter(isVerified)
      .map((record) => [`${record.region_id}|${record.site_kind}`, record]),
  );
  const [resourceMap, pageDetailMap] = await Promise.all([
    buildResourceMap(),
    buildPageDetailMap(),
  ]);
  const generatedAt = electionsData.generated_at ?? asOf;
  const elections = electionsData.records
    .filter(isVerified)
    .filter((election) => election.vote_date >= asOf)
    .sort((left, right) => left.vote_date.localeCompare(right.vote_date) || sortJa(left.name, right.name));

  return {
    asOf,
    generatedAt,
    regionById,
    localGovernmentSiteByKey,
    resourceMap,
    pageDetailMap,
    elections,
  };
}

async function buildResourceMap() {
  const resourceMap = new Map();
  const files = await listJsonFilesIfExists(path.join(dataV1Root, "election_resource_links"));
  for (const filePath of files) {
    const data = await readJson(filePath);
    resourceMap.set(data.election_id, sortResources((data.records ?? []).filter(isVerified)));
  }
  return resourceMap;
}

async function buildPageDetailMap() {
  const pageDetailMap = new Map();
  const files = await listJsonFilesIfExists(path.join(dataV1Root, "election_page_details"));
  for (const filePath of files) {
    const data = await readJson(filePath);
    pageDetailMap.set(data.election_id, data);
  }
  return pageDetailMap;
}

async function classifyTarget(election) {
  const outputPath = getPagePath(election);
  const existing = await readFileIfExists(outputPath);
  return {
    election,
    outputPath,
    existing,
    isCustom: Boolean(existing && !existing.includes(generatedMarker)),
  };
}

async function writeOrCheckFile(filePath, content, args, label) {
  const existing = await readFileIfExists(filePath);
  if (args.check) {
    if (existing !== content) {
      throw new Error(`${label} is not up to date: ${path.relative(repoRoot, filePath)}`);
    }
    return "checked";
  }

  if (args.write) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf8");
    return existing === content ? "unchanged" : "written";
  }

  return existing === content ? "unchanged" : "pending";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const context = await buildContext(args.asOf);
  const targets = await Promise.all(context.elections.map(classifyTarget));
  const generatedTargets = targets.filter((target) => !target.isCustom);
  const indexPath = path.join(electionsDir, "index.html");
  const indexContent = renderIndexPage(targets, context);

  let written = 0;
  let checked = 0;
  let unchanged = 0;
  let pending = 0;

  for (const target of generatedTargets) {
    const content = renderPage(target.election, context);
    const result = await writeOrCheckFile(target.outputPath, content, args, target.election.id);
    if (result === "written") written += 1;
    if (result === "checked") checked += 1;
    if (result === "unchanged") unchanged += 1;
    if (result === "pending") pending += 1;
  }

  const indexResult = await writeOrCheckFile(indexPath, indexContent, args, "election index");
  if (indexResult === "written") written += 1;
  if (indexResult === "checked") checked += 1;
  if (indexResult === "unchanged") unchanged += 1;
  if (indexResult === "pending") pending += 1;

  const customCount = targets.filter((target) => target.isCustom).length;
  console.log(`election_pages target=${targets.length} generated=${generatedTargets.length} custom=${customCount} as_of=${args.asOf}`);
  console.log(`results written=${written} checked=${checked} unchanged=${unchanged} pending=${pending}`);
  if (!args.write && !args.check && pending > 0) {
    console.log("Run with --write to update files, or --check to verify generated files are current.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
