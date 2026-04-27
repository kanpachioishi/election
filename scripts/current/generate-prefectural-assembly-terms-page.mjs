import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const termsPath = path.join(repoRoot, "data", "v1", "prefectural_assembly_terms.json");
const outputPath = path.join(repoRoot, "site", "pages", "prefectural-assembly-terms.html");

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

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${year}/${month}/${day}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function formatPercent(value) {
  return `${Number(value).toFixed(2).replace(/\.?0+$/, "")}%`;
}

function getTermYear(value) {
  return String(value ?? "").slice(0, 4);
}

function renderRows(records) {
  return records
    .slice()
    .sort((left, right) => left.term_end.localeCompare(right.term_end) || left.pref_code.localeCompare(right.pref_code))
    .map((record) => [
      `            <tr data-cycle="${record.unified_local_election_cycle ? "unified" : "non-unified"}" data-term-year="${escapeHtml(getTermYear(record.term_end))}" data-term-end="${escapeHtml(record.term_end)}">`,
      `              <td>${escapeHtml(record.prefecture_name)}</td>`,
      `              <td>${escapeHtml(formatDate(record.last_regular_election_vote_date))}</td>`,
      `              <td>${escapeHtml(formatDate(record.term_end))}</td>`,
      `              <td>${escapeHtml(formatNumber(record.district_count))}</td>`,
      `              <td>${escapeHtml(formatNumber(record.seat_count))}</td>`,
      `              <td>${escapeHtml(formatPercent(record.turnout_percent))}</td>`,
      `              <td>${escapeHtml(formatPercent(record.previous_turnout_percent))}</td>`,
      `              <td>${record.unified_local_election_cycle ? "統一地方選" : "非統一"}</td>`,
      `              <td>${escapeHtml(record.verification?.last_checked_at?.slice(0, 10) ?? "")}</td>`,
      `              <td><a href="${escapeHtml(record.verification?.source_url)}" target="_blank" rel="noopener noreferrer">確認元</a></td>`,
      "            </tr>",
    ].join("\n"))
    .join("\n");
}

function renderTermYearOptions(records) {
  const years = [...new Set(records.map((record) => getTermYear(record.term_end)).filter(Boolean))].sort();
  return years.map((year) => `            <option value="${escapeHtml(year)}">${escapeHtml(year)}年</option>`).join("\n");
}

function renderPage(data) {
  const rows = renderRows(data.records);
  const yearOptions = renderTermYearOptions(data.records);
  const generatedDate = data.generated_at?.slice(0, 10) ?? "";
  const sourceLabel = data.source?.label ?? "確認元";
  const sourceUrl = data.source?.url ?? "";
  const snapshotPath = data.source?.snapshot_path ?? "";

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>県議会任期台帳 - わたしの選挙</title>
    <meta name="description" content="都道府県議会議員選挙の前回投票日、任期満了日、定数、選挙区数を確認するための台帳です。">
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
        --ok: #8bd8a9;
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

      .source-panel,
      .filter-bar {
        margin: 0 0 20px;
        padding: 16px 18px;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: rgba(16, 33, 49, 0.88);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
      }

      .source-panel {
        display: grid;
        gap: 8px;
      }

      .source-panel dl {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 8px 16px;
        margin: 0;
      }

      .source-panel dt {
        color: var(--muted);
        font-weight: 800;
      }

      .source-panel dd {
        margin: 0;
      }

      .source-panel a,
      td a {
        color: var(--accent);
        text-decoration: none;
      }

      .source-panel a:hover,
      .source-panel a:focus-visible,
      td a:hover,
      td a:focus-visible {
        text-decoration: underline;
      }

      .filter-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
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

      .filter-field select {
        min-height: 44px;
        padding: 10px 12px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(7, 19, 29, 0.9);
        color: var(--text);
        font: inherit;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin: 0 0 20px;
      }

      .summary-item {
        padding: 14px 16px;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: rgba(16, 33, 49, 0.84);
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

      .count-note {
        margin: 0 0 14px;
        color: var(--muted);
        font-size: 0.92rem;
      }

      .table-wrap {
        overflow: auto;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: rgba(16, 33, 49, 0.92);
        box-shadow: 0 22px 48px rgba(0, 0, 0, 0.28);
      }

      table {
        width: 100%;
        min-width: 1120px;
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
        white-space: nowrap;
      }

      tbody tr:hover {
        background: rgba(255, 210, 122, 0.05);
      }

      tbody tr[hidden] {
        display: none;
      }

      @media (max-width: 760px) {
        main {
          width: min(100% - 20px, 1440px);
          margin: 28px auto 48px;
        }

        .summary-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .source-panel dl {
          grid-template-columns: 1fr;
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
        <a href="prefectural-assembly-terms.html" aria-current="page">県議会任期台帳</a>
        <a href="prefectural-assembly-districts.html">県議選挙区台帳</a>
        <a href="prefectural-assembly-official-links.html">県議公式リンク台帳</a>
        <a href="privacy.html">プライバシーと通知</a>
        <a href="contact.html">お問い合わせ</a>
      </nav>
    </header>

    <main>
      <h1>県議会任期台帳</h1>
      <p>都道府県議会議員選挙の前回投票日、任期満了日、選挙区数、定数を一覧できます。知事選確認時に、県議選や県議補選の見落としを防ぐための台帳です。</p>

      <section class="source-panel" aria-label="台帳の確認元">
        <dl>
          <dt>確認元</dt>
          <dd><a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sourceLabel)}</a></dd>
          <dt>生成日</dt>
          <dd>${escapeHtml(generatedDate)}</dd>
          <dt>保存スナップショット</dt>
          <dd>${escapeHtml(snapshotPath)}</dd>
        </dl>
      </section>

      <section class="summary-grid" aria-label="台帳概要">
        <div class="summary-item">
          <span>登録件数</span>
          <strong>${formatNumber(data.records.length)}件</strong>
        </div>
        <div class="summary-item">
          <span>統一地方選サイクル</span>
          <strong>${formatNumber(data.records.filter((record) => record.unified_local_election_cycle).length)}県</strong>
        </div>
        <div class="summary-item">
          <span>非統一</span>
          <strong>${formatNumber(data.records.filter((record) => !record.unified_local_election_cycle).length)}県</strong>
        </div>
        <div class="summary-item">
          <span>最短任期満了</span>
          <strong>${escapeHtml(formatDate(data.records.map((record) => record.term_end).sort()[0]))}</strong>
        </div>
      </section>

      <div class="filter-bar">
        <div class="filter-field">
          <label for="cycleFilter">選挙サイクル</label>
          <select id="cycleFilter">
            <option value="all">すべて</option>
            <option value="unified">統一地方選サイクル</option>
            <option value="non-unified">非統一</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="termYearFilter">任期満了年</label>
          <select id="termYearFilter">
            <option value="all">すべて</option>
${yearOptions}
          </select>
        </div>
        <div class="filter-field">
          <label for="termEndSort">任期満了日</label>
          <select id="termEndSort">
            <option value="asc">日付が近い順</option>
            <option value="desc">日付が遠い順</option>
          </select>
        </div>
      </div>

      <p class="count-note" id="countNote">${formatNumber(data.records.length)}件表示</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>都道府県</th>
              <th>前回投票日</th>
              <th>任期満了日</th>
              <th>選挙区数</th>
              <th>定数</th>
              <th>投票率</th>
              <th>前回投票率</th>
              <th>サイクル</th>
              <th>確認日</th>
              <th>確認元</th>
            </tr>
          </thead>
          <tbody id="assemblyTermRows">
${rows}
          </tbody>
        </table>
      </div>
    </main>

    <script>
      const rows = Array.from(document.querySelectorAll("#assemblyTermRows tr"));
      const cycleFilter = document.querySelector("#cycleFilter");
      const termYearFilter = document.querySelector("#termYearFilter");
      const termEndSort = document.querySelector("#termEndSort");
      const countNote = document.querySelector("#countNote");
      const tbody = document.querySelector("#assemblyTermRows");

      function applyFilters() {
        const cycleValue = cycleFilter.value;
        const yearValue = termYearFilter.value;

        const orderedRows = rows.slice().sort((left, right) => {
          const result = left.dataset.termEnd.localeCompare(right.dataset.termEnd);
          return termEndSort.value === "desc" ? -result : result;
        });

        let visibleCount = 0;

        for (const row of orderedRows) {
          const matchesCycle = cycleValue === "all" || row.dataset.cycle === cycleValue;
          const matchesYear = yearValue === "all" || row.dataset.termYear === yearValue;
          const visible = matchesCycle && matchesYear;
          row.hidden = !visible;
          if (visible) visibleCount += 1;
          tbody.appendChild(row);
        }

        countNote.textContent = visibleCount.toLocaleString("ja-JP") + "件表示";
      }

      cycleFilter.addEventListener("change", applyFilters);
      termYearFilter.addEventListener("change", applyFilters);
      termEndSort.addEventListener("change", applyFilters);
      applyFilters();
    </script>
  </body>
</html>
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const data = await readJson(termsPath);
  const output = renderPage(data);

  if (args.check) {
    const current = await fs.readFile(outputPath, "utf8");
    if (current !== output) {
      throw new Error("site/pages/prefectural-assembly-terms.html differs from data/v1/prefectural_assembly_terms.json");
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
