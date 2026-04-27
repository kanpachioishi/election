import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const linksPath = path.join(repoRoot, "data", "v1", "prefectural_assembly_official_links.json");
const outputPath = path.join(repoRoot, "site", "pages", "prefectural-assembly-official-links.html");

const LINK_KIND_LABELS = new Map([
  ["election_hub", "選挙入口"],
  ["election_commission", "選管"],
  ["assembly_home", "議会"],
  ["member_roster", "議員名簿"],
  ["districts", "選挙区・定数"],
  ["recent_regular_election", "直近一般選挙"],
  ["candidate_bulletin_archive", "候補者・公報"],
]);

function parseArgs(argv) {
  const args = {
    write: false,
    check: false,
  };

  for (const arg of argv) {
    if (arg === "--write") {
      args.write = true;
      continue;
    }

    if (arg === "--check") {
      args.check = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function getLinkKindLabel(kind) {
  return LINK_KIND_LABELS.get(kind) ?? kind;
}

function renderPrefectureOptions(records) {
  const prefs = [...new Map(records.map((record) => [record.pref_code, record.prefecture_name])).entries()]
    .sort((left, right) => left[0].localeCompare(right[0]));

  return prefs
    .map(([prefCode, prefName]) => `            <option value="${escapeHtml(prefCode)}">${escapeHtml(prefName)}</option>`)
    .join("\n");
}

function renderKindOptions(records) {
  const kinds = [...new Set(records.map((record) => record.link_kind))]
    .sort((left, right) => getLinkKindLabel(left).localeCompare(getLinkKindLabel(right), "ja"));

  return kinds
    .map((kind) => `            <option value="${escapeHtml(kind)}">${escapeHtml(getLinkKindLabel(kind))}</option>`)
    .join("\n");
}

function renderRows(records) {
  return records
    .slice()
    .sort((left, right) => left.pref_code.localeCompare(right.pref_code) || left.display_order - right.display_order)
    .map((record) => [
      `            <tr data-pref-code="${escapeHtml(record.pref_code)}" data-link-kind="${escapeHtml(record.link_kind)}" data-prefecture="${escapeHtml(record.prefecture_name)}">`,
      `              <td>${escapeHtml(record.prefecture_name)}</td>`,
      `              <td><span class="kind-pill">${escapeHtml(getLinkKindLabel(record.link_kind))}</span></td>`,
      `              <td><a class="link-title" href="${escapeHtml(record.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(record.title)}</a><span class="summary">${escapeHtml(record.summary)}</span></td>`,
      `              <td>${escapeHtml(record.last_checked_at?.slice(0, 10) ?? "")}</td>`,
      `              <td>${escapeHtml(record.verification?.status ?? "")}</td>`,
      "            </tr>",
    ].join("\n"))
    .join("\n");
}

function renderPage(data) {
  const generatedDate = data.generated_at?.slice(0, 10) ?? "";
  const records = data.records ?? [];
  const rows = renderRows(records);
  const prefectureOptions = renderPrefectureOptions(records);
  const kindOptions = renderKindOptions(records);
  const coveredPrefectures = data.coverage?.prefecture_count ?? new Set(records.map((record) => record.pref_code)).size;
  const linkCount = data.coverage?.link_count ?? records.length;
  const categoryCount = new Set(records.map((record) => record.link_kind)).size;
  const coverageNote = data.coverage?.note ?? "";

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>県議会公式リンク台帳 - わたしの選挙</title>
    <meta name="description" content="都道府県議会議員選挙を確認するときに使う、選管、議会、議員名簿、選挙区・定数、選挙公報などの公式リンク台帳です。">
    <meta name="theme-color" content="#0b1219">
    <link rel="manifest" href="../manifest.webmanifest">
    <link rel="icon" href="../icons/app-icon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="../icons/app-icon.svg">
    <link rel="stylesheet" href="../assets/styles.css">
    <style>
      :root {
        color-scheme: dark;
        --bg: #07131d;
        --panel: #102131;
        --line: rgba(244, 239, 227, 0.14);
        --text: #f4efe3;
        --muted: #a9bdd0;
        --accent: #ffd27a;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: linear-gradient(135deg, #122230 0%, var(--bg) 52%, #163748 100%);
        color: var(--text);
        font-family: "BIZ UDPGothic", "Yu Gothic", sans-serif;
      }

      main {
        width: min(1440px, calc(100% - 32px));
        margin: 48px auto 64px;
      }

      h1 {
        margin: 0 0 12px;
        font-family: "Yu Mincho", "Hiragino Mincho ProN", serif;
        font-size: clamp(2.1rem, 4.8vw, 3.4rem);
        font-weight: 500;
        line-height: 1.08;
      }

      p {
        margin: 0 0 24px;
        color: var(--muted);
        line-height: 1.8;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin: 0 0 20px;
      }

      .summary-item,
      .filter-bar,
      .note-panel,
      .table-wrap {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: rgba(16, 33, 49, 0.88);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
      }

      .summary-item {
        padding: 14px 16px;
      }

      .summary-item span {
        display: block;
        color: var(--muted);
        font-size: 0.8rem;
        font-weight: 800;
      }

      .summary-item strong {
        display: block;
        margin-top: 4px;
        color: var(--text);
        font-size: 1.35rem;
      }

      .note-panel {
        margin: 0 0 20px;
        padding: 16px 18px;
      }

      .note-panel p {
        margin: 0;
      }

      .note-panel a,
      td a {
        color: var(--accent);
        text-decoration: none;
      }

      .note-panel a:hover,
      .note-panel a:focus-visible,
      td a:hover,
      td a:focus-visible {
        text-decoration: underline;
      }

      .filter-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin: 0 0 20px;
        padding: 16px 18px;
      }

      .filter-field {
        display: grid;
        gap: 6px;
        min-width: 220px;
      }

      .filter-field label {
        color: var(--muted);
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.03em;
      }

      .filter-field select,
      .filter-field input {
        min-height: 44px;
        padding: 10px 12px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: rgba(7, 19, 29, 0.9);
        color: var(--text);
        font: inherit;
      }

      .filter-field.wide {
        min-width: min(380px, 100%);
        flex: 1;
      }

      .count-note {
        margin: 0 0 14px;
        color: var(--muted);
        font-size: 0.92rem;
      }

      .table-wrap {
        overflow: auto;
      }

      table {
        width: 100%;
        min-width: 1040px;
        border-collapse: collapse;
      }

      thead th {
        position: sticky;
        top: 0;
        background: rgba(12, 23, 34, 0.98);
        color: var(--accent);
        text-align: left;
        font-size: 0.9rem;
        font-weight: 800;
        letter-spacing: 0.03em;
      }

      th,
      td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--line);
        vertical-align: top;
      }

      tbody tr:hover {
        background: rgba(255, 210, 122, 0.05);
      }

      tbody tr[hidden] {
        display: none;
      }

      .kind-pill {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 4px 9px;
        border: 1px solid rgba(255, 210, 122, 0.32);
        border-radius: 999px;
        color: var(--accent);
        font-size: 0.82rem;
        font-weight: 800;
        white-space: nowrap;
      }

      .link-title {
        display: inline-block;
        font-weight: 800;
      }

      .summary {
        display: block;
        margin-top: 6px;
        color: var(--muted);
        line-height: 1.7;
      }

      @media (max-width: 760px) {
        main {
          width: min(100% - 20px, 1440px);
          margin: 28px auto 48px;
        }

        .summary-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    </style>
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
        <a href="about.html">このサイトについて</a>
        <a href="verification-policy.html">情報の確認基準</a>
        <a href="current-mayors.html">現職市長台帳</a>
        <a href="current-governors.html">現職知事台帳</a>
        <a href="prefectural-assembly-terms.html">県議会任期台帳</a>
        <a href="prefectural-assembly-districts.html">県議選挙区台帳</a>
        <a href="prefectural-assembly-official-links.html" aria-current="page">県議公式リンク台帳</a>
      </nav>
    </header>

    <main>
      <h1>県議会公式リンク台帳</h1>
      <p>県議会議員選挙を確認するときに使う公式導線を、選管、議会、議員名簿、選挙区・定数、直近一般選挙、選挙公報系に分けて整理しています。</p>

      <section class="summary-grid" aria-label="台帳概要">
        <div class="summary-item">
          <span>掲載都道府県</span>
          <strong>${formatNumber(coveredPrefectures)}件</strong>
        </div>
        <div class="summary-item">
          <span>公式リンク</span>
          <strong>${formatNumber(linkCount)}件</strong>
        </div>
        <div class="summary-item">
          <span>リンク種別</span>
          <strong>${formatNumber(categoryCount)}種</strong>
        </div>
        <div class="summary-item">
          <span>生成日</span>
          <strong>${escapeHtml(generatedDate)}</strong>
        </div>
      </section>

      <section class="note-panel">
        <p>${escapeHtml(coverageNote)} 詳細な選挙区・定数の台帳は <a href="prefectural-assembly-districts.html">県議選挙区台帳</a> に分けています。</p>
      </section>

      <div class="filter-bar">
        <div class="filter-field wide">
          <label for="searchInput">キーワード</label>
          <input id="searchInput" type="search" placeholder="例: 選挙公報、議員名簿、定数">
        </div>
        <div class="filter-field">
          <label for="prefectureFilter">都道府県</label>
          <select id="prefectureFilter">
            <option value="all">すべて</option>
${prefectureOptions}
          </select>
        </div>
        <div class="filter-field">
          <label for="kindFilter">リンク種別</label>
          <select id="kindFilter">
            <option value="all">すべて</option>
${kindOptions}
          </select>
        </div>
      </div>

      <p class="count-note" id="countNote">${formatNumber(linkCount)}件表示</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>都道府県</th>
              <th>種別</th>
              <th>公式リンク</th>
              <th>確認日</th>
              <th>状態</th>
            </tr>
          </thead>
          <tbody id="linkRows">
${rows}
          </tbody>
        </table>
      </div>
    </main>

    <script>
      const rows = Array.from(document.querySelectorAll("#linkRows tr"));
      const searchInput = document.querySelector("#searchInput");
      const prefectureFilter = document.querySelector("#prefectureFilter");
      const kindFilter = document.querySelector("#kindFilter");
      const countNote = document.querySelector("#countNote");

      function normalize(value) {
        return value.toLowerCase().replace(/\\s+/g, "");
      }

      function applyFilters() {
        const keyword = normalize(searchInput.value);
        const prefCode = prefectureFilter.value;
        const linkKind = kindFilter.value;
        let visibleCount = 0;

        for (const row of rows) {
          const matchesPrefecture = prefCode === "all" || row.dataset.prefCode === prefCode;
          const matchesKind = linkKind === "all" || row.dataset.linkKind === linkKind;
          const matchesKeyword = !keyword || normalize(row.textContent).includes(keyword);
          const visible = matchesPrefecture && matchesKind && matchesKeyword;
          row.hidden = !visible;
          if (visible) visibleCount += 1;
        }

        countNote.textContent = visibleCount.toLocaleString("ja-JP") + "件表示";
      }

      searchInput.addEventListener("input", applyFilters);
      prefectureFilter.addEventListener("change", applyFilters);
      kindFilter.addEventListener("change", applyFilters);
      applyFilters();
    </script>
  </body>
</html>
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const data = await readJson(linksPath);
  const output = renderPage(data);

  if (args.check) {
    const current = await fs.readFile(outputPath, "utf8");
    if (current !== output) {
      throw new Error("site/pages/prefectural-assembly-official-links.html differs from data/v1/prefectural_assembly_official_links.json");
    }
    return;
  }

  if (args.write) {
    await fs.writeFile(outputPath, output, "utf8");
    return;
  }

  process.stdout.write(output);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
