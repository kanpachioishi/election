import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const canonicalPath = path.join(repoRoot, "data", "v1", "current_mayors", "canonical.json");
const currentPagePath = path.join(repoRoot, "site", "pages", "current-mayors.html");

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

function isAbsoluteHttpUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function displayDate(value, display) {
  return value ?? display ?? "記載なし";
}

function renderSource(source) {
  const label = source?.label ?? "確認元";
  if (!isAbsoluteHttpUrl(source?.url)) {
    return escapeHtml(label);
  }

  return `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

function renderRows(records) {
  return records
    .slice()
    .sort((left, right) => left.public_order - right.public_order)
    .map((record) => {
      const macroRegion = record.macro_region ?? "";
      const prefecture = record.pref_name ?? prefectureNameFromCode(record.pref_code);
      return [
        `            <tr data-macro-region="${escapeHtml(macroRegion)}" data-prefecture="${escapeHtml(prefecture)}">`,
        `              <td>${escapeHtml(macroRegion)}</td>`,
        `              <td>${escapeHtml(prefecture)}</td>`,
        `              <td>${escapeHtml(record.city_name)}</td>`,
        `              <td>${escapeHtml(record.mayor_name)}</td>`,
        `              <td>${escapeHtml(displayDate(record.term_start, record.term_start_display))}</td>`,
        `              <td>${escapeHtml(displayDate(record.term_end, record.term_end_display))}</td>`,
        `              <td>${escapeHtml(record.term_note ?? "記載なし")}</td>`,
        `              <td>${renderSource(record.display_source)}</td>`,
        `              <td>${escapeHtml(record.last_checked_at ?? record.investigated_at ?? "")}</td>`,
        `              <td>${escapeHtml(record.note ?? "")}</td>`,
        "            </tr>",
      ].join("\n");
    })
    .join("\n");
}

function prefectureNameFromCode(prefCode) {
  return prefCode;
}

function renderPage(template, records) {
  const rows = renderRows(records);
  return template.replace(
    /<tbody id="mayorRows">[\s\S]*?<\/tbody>/,
    `<tbody id="mayorRows">\n${rows}\n          </tbody>`,
  );
}

function stripTags(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function tableCells(html) {
  return [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)]
    .map((row) => [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => stripTags(cell[1])))
    .filter((row) => row.length > 0);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [canonical, template] = await Promise.all([
    readJson(canonicalPath),
    fs.readFile(currentPagePath, "utf8"),
  ]);
  const output = renderPage(template, canonical.records);

  if (args.check) {
    const currentRows = tableCells(template);
    const generatedRows = tableCells(output);
    if (JSON.stringify(currentRows) !== JSON.stringify(generatedRows)) {
      throw new Error("site/pages/current-mayors.html table content differs from data/v1/current_mayors/canonical.json");
    }
    return;
  }

  if (args.write) {
    await fs.writeFile(currentPagePath, output, "utf8");
    return;
  }

  process.stdout.write(output);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
