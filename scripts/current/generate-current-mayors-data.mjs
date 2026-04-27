import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const findingsRoot = path.join(repoRoot, "research", "current-mayors", "findings");
const currentPagePath = path.join(repoRoot, "site", "pages", "current-mayors.html");
const outputRoot = path.join(repoRoot, "data", "v1", "current_mayors");
const outputByPrefectureRoot = path.join(outputRoot, "by_prefecture");
const regionsPath = path.join(repoRoot, "data", "v1", "regions.json");

const MACRO_REGION_BY_PREF_CODE = {
  "01": "北海道・東北",
  "02": "北海道・東北",
  "03": "北海道・東北",
  "04": "北海道・東北",
  "05": "北海道・東北",
  "06": "北海道・東北",
  "07": "北海道・東北",
  "08": "関東",
  "09": "関東",
  "10": "関東",
  "11": "関東",
  "12": "関東",
  "13": "関東",
  "14": "関東",
  "15": "甲信越",
  "16": "北陸",
  "17": "北陸",
  "18": "北陸",
  "19": "甲信越",
  "20": "甲信越",
  "21": "東海",
  "22": "東海",
  "23": "東海",
  "24": "関西",
  "25": "関西",
  "26": "関西",
  "27": "関西",
  "28": "関西",
  "29": "関西",
  "30": "関西",
  "31": "中国",
  "32": "中国",
  "33": "中国",
  "34": "中国",
  "35": "中国",
  "36": "四国",
  "37": "四国",
  "38": "四国",
  "39": "四国",
  "40": "九州・沖縄",
  "41": "九州・沖縄",
  "42": "九州・沖縄",
  "43": "九州・沖縄",
  "44": "九州・沖縄",
  "45": "九州・沖縄",
  "46": "九州・沖縄",
  "47": "九州・沖縄",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ROUND_FILE = /^(\d{4}-\d{2}-\d{2})-round(\d+)\.(md|sources\.json)$/;

function parseArgs(argv) {
  const args = {
    write: false,
    generatedAt: new Date().toISOString().replace("Z", "+00:00"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--write") {
      args.write = true;
      continue;
    }
    if (arg === "--generated-at") {
      args.generatedAt = argv[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]*>/g, "")).trim();
}

function cleanMarkdownValue(value) {
  const trimmed = value.trim();
  const unwrapped = trimmed.startsWith("`") && trimmed.endsWith("`")
    ? trimmed.slice(1, -1)
    : trimmed;
  return unwrapped
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function nullableText(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed;
}

function normalizeDateValue(value) {
  const text = nullableText(value);
  if (!text || text === "記載なし" || text === "記載対象外") {
    return { value: null, display: text };
  }

  if (ISO_DATE.test(text)) {
    return { value: text, display: null };
  }

  return { value: null, display: text };
}

function makeKebabSlug(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function htmlHref(value) {
  const match = value.match(/\bhref="([^"]+)"/);
  return match ? decodeHtml(match[1]) : null;
}

function parseCurrentPageRows(html) {
  const rows = [];

  for (const [rowIndex, match] of [...html.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)].entries()) {
    const body = match[2];
    const rawCells = [...body.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => cell[1]);
    if (rawCells.length < 10) continue;

    const cells = rawCells.map(stripTags);
    rows.push({
      public_order: rowIndex,
      macro_region: cells[0],
      pref_name: cells[1],
      city_name: cells[2],
      mayor_name: cells[3],
      term_start_text: cells[4],
      term_end_text: cells[5],
      term_note: nullableText(cells[6]),
      display_source: {
        label: nullableText(cells[7]),
        url: htmlHref(rawCells[7]),
      },
      last_checked_at: nullableText(cells[8]),
      note: nullableText(cells[9]),
    });
  }

  return rows;
}

function sortRoundFiles(files, extension) {
  return files
    .filter((file) => file.endsWith(extension) && ROUND_FILE.test(file))
    .sort((left, right) => {
      const leftMatch = left.match(ROUND_FILE);
      const rightMatch = right.match(ROUND_FILE);
      const dateCompare = leftMatch[1].localeCompare(rightMatch[1]);
      if (dateCompare !== 0) return dateCompare;
      return Number(leftMatch[2]) - Number(rightMatch[2]);
    });
}

function parseFrontMatterValue(markdown, key) {
  const pattern = new RegExp(`^- ${key}:\\s*(.+)$`, "m");
  const match = markdown.match(pattern);
  return match ? cleanMarkdownValue(match[1]) : null;
}

function parseFindingsMarkdown(markdown, knownCityNames) {
  const records = new Map();
  const headings = [...markdown.matchAll(/^(#{2,3})\s+(.+)$/gm)];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const cityName = heading[2].trim();
    if (!knownCityNames.has(cityName)) continue;

    const start = heading.index + heading[0].length;
    const end = index + 1 < headings.length ? headings[index + 1].index : markdown.length;
    const section = markdown.slice(start, end);
    const record = {};

    for (const line of section.split(/\r?\n/)) {
      const match = line.match(/^- ([a-z_]+):\s*(.+)$/);
      if (!match) continue;

      const [, key, rawValue] = match;
      if (["status", "mayor_name", "mayor_name_kana", "term_start", "term_end", "term_note", "note"].includes(key)) {
        record[key] = cleanMarkdownValue(rawValue);
      }
    }

    records.set(cityName, record);
  }

  return records;
}

function normalizeSources(recordSources, defaultCheckedAt) {
  if (!Array.isArray(recordSources)) return [];

  return recordSources.map((source) => ({
    kind: source.kind ?? "other_official",
    title: source.title ?? "公式情報",
    url: source.url ?? null,
    checked_at: source.checked_at ?? defaultCheckedAt ?? null,
    used_for: Array.isArray(source.used_for) ? source.used_for : [],
    publisher: source.publisher ?? null,
    note: source.note ?? null,
  }));
}

async function loadFindingDirectories() {
  const entries = await fs.readdir(findingsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function buildRegionLookup(regions) {
  const byPrefAndName = new Map();
  for (const region of regions.records) {
    if (region.level !== "municipality") continue;
    byPrefAndName.set(`${region.pref_code}:${region.name}`, region);
  }
  return byPrefAndName;
}

async function loadFindingMetadata(dirName) {
  const dirPath = path.join(findingsRoot, dirName);
  const files = await fs.readdir(dirPath);
  const municipalities = await readJson(path.join(dirPath, "municipalities.json"));
  const cityNames = new Set(municipalities.records.map((record) => record.city_name));
  const markdownByCity = new Map();
  const sourcesByCity = new Map();
  const artifactsByCity = new Map();
  let investigatedAt = municipalities.generated_at?.slice(0, 10) ?? null;

  for (const file of sortRoundFiles(files, ".md")) {
    const markdown = await fs.readFile(path.join(dirPath, file), "utf8");
    investigatedAt = parseFrontMatterValue(markdown, "investigated_at") ?? investigatedAt;
    const parsedRecords = parseFindingsMarkdown(markdown, cityNames);
    for (const [cityName, record] of parsedRecords) {
      markdownByCity.set(cityName, {
        ...(markdownByCity.get(cityName) ?? {}),
        ...record,
      });
      const artifacts = artifactsByCity.get(cityName) ?? [];
      artifacts.push(path.join("research", "current-mayors", "findings", dirName, file));
      artifactsByCity.set(cityName, artifacts);
    }
  }

  for (const file of sortRoundFiles(files, ".sources.json")) {
    const sourceData = await readJson(path.join(dirPath, file));
    const sourceInvestigatedAt = sourceData.investigated_at ?? investigatedAt;
    for (const record of sourceData.records ?? []) {
      const cityName = record.city_name;
      if (!cityName) continue;
      sourcesByCity.set(cityName, {
        status: record.status ?? sourcesByCity.get(cityName)?.status ?? null,
        municipality_code: record.municipality_code ?? sourcesByCity.get(cityName)?.municipality_code ?? null,
        sources: normalizeSources(record.sources, sourceInvestigatedAt),
      });
      const artifacts = artifactsByCity.get(cityName) ?? [];
      artifacts.push(path.join("research", "current-mayors", "findings", dirName, file));
      artifactsByCity.set(cityName, artifacts);
    }
  }

  return {
    pref_code: municipalities.pref_code ?? dirName.slice(0, 2),
    pref_slug: dirName.slice(3),
    pref_name: municipalities.pref_name,
    investigated_at: investigatedAt,
    city_order: municipalities.records.map((record) => record.city_name),
    city_official_urls: new Map(municipalities.records.map((record) => [record.city_name, record.official_url ?? null])),
    markdownByCity,
    sourcesByCity,
    artifactsByCity,
  };
}

function buildFallbackSource(pageRow) {
  if (!pageRow.display_source.label && !pageRow.display_source.url) return [];
  return [
    {
      kind: "public_page_source",
      title: pageRow.display_source.label ?? "確認元URL",
      url: pageRow.display_source.url,
      checked_at: pageRow.last_checked_at,
      used_for: [],
      publisher: null,
      note: "Initial canonical migration fallback from site/pages/current-mayors.html",
    },
  ];
}

function buildRecord({ pageRow, region, prefMeta, cityIndex }) {
  const markdownRecord = prefMeta.markdownByCity.get(pageRow.city_name) ?? {};
  const sourceRecord = prefMeta.sourcesByCity.get(pageRow.city_name) ?? {};
  const termStartRaw = pageRow.term_start_text;
  const termEndRaw = pageRow.term_end_text;
  const termStart = normalizeDateValue(termStartRaw);
  const termEnd = normalizeDateValue(termEndRaw);
  const municipalityCode = sourceRecord.municipality_code ?? region?.municipality_code ?? null;
  const regionId = region?.id ?? (municipalityCode ? `mun-${municipalityCode}` : null);
  const citySlug = region?.slug ?? makeKebabSlug(pageRow.city_name);
  const sources = sourceRecord.sources?.length ? sourceRecord.sources : buildFallbackSource(pageRow);
  const status = markdownRecord.status ?? sourceRecord.status ?? "confirmed";
  const artifacts = [
    path.join("site", "pages", "current-mayors.html"),
    ...(prefMeta.artifactsByCity.get(pageRow.city_name) ?? []),
  ];
  const findingsValues = {};

  for (const key of ["mayor_name", "term_start", "term_end", "term_note", "note"]) {
    if (markdownRecord[key] !== undefined) {
      findingsValues[key] = markdownRecord[key];
    }
  }

  return {
    id: regionId ? `mayor-${regionId}` : `mayor-${prefMeta.pref_code}-${citySlug}`,
    region_id: regionId,
    pref_code: prefMeta.pref_code,
    pref_name: prefMeta.pref_name,
    municipality_code: municipalityCode,
    city_name: pageRow.city_name,
    city_slug: citySlug,
    macro_region: pageRow.macro_region ?? MACRO_REGION_BY_PREF_CODE[prefMeta.pref_code] ?? null,
    mayor_name: pageRow.mayor_name,
    mayor_name_kana: markdownRecord.mayor_name_kana ?? null,
    term_start: termStart.value,
    term_start_display: termStart.display,
    term_end: termEnd.value,
    term_end_display: termEnd.display,
    term_note: nullableText(pageRow.term_note),
    status,
    investigated_at: prefMeta.investigated_at ?? pageRow.last_checked_at,
    sources,
    display_source: pageRow.display_source,
    last_checked_at: pageRow.last_checked_at,
    note: nullableText(pageRow.note),
    findings_values: Object.keys(findingsValues).length ? findingsValues : null,
    public_order: pageRow.public_order,
    prefecture_city_order: cityIndex,
    source_artifacts: [...new Set(artifacts)],
  };
}

async function buildData(generatedAt) {
  const [html, regions, dirNames] = await Promise.all([
    fs.readFile(currentPagePath, "utf8"),
    readJson(regionsPath),
    loadFindingDirectories(),
  ]);

  const regionByPrefAndName = buildRegionLookup(regions);
  const pageRows = parseCurrentPageRows(html);
  const pageRowsByPrefAndCity = new Map(pageRows.map((row) => [`${row.pref_name}:${row.city_name}`, row]));
  const byPrefecture = [];

  for (const dirName of dirNames) {
    const prefMeta = await loadFindingMetadata(dirName);
    const records = [];

    for (const [cityIndex, cityName] of prefMeta.city_order.entries()) {
      const pageRow = pageRowsByPrefAndCity.get(`${prefMeta.pref_name}:${cityName}`);
      if (!pageRow) {
        throw new Error(`Missing current-mayors.html row for ${prefMeta.pref_name} ${cityName}`);
      }

      const region = regionByPrefAndName.get(`${prefMeta.pref_code}:${cityName}`) ?? null;
      records.push(buildRecord({ pageRow, region, prefMeta, cityIndex }));
    }

    byPrefecture.push({
      schema_version: 1,
      generated_at: generatedAt,
      pref_code: prefMeta.pref_code,
      pref_slug: prefMeta.pref_slug,
      pref_name: prefMeta.pref_name,
      source_snapshot: {
        public_page: "site/pages/current-mayors.html",
        findings_dir: path.join("research", "current-mayors", "findings", dirName),
        note: "Initial canonical migration built from the published table and enriched with findings artifacts.",
      },
      records,
    });
  }

  const canonical = {
    schema_version: 1,
    generated_at: generatedAt,
    source_snapshot: {
      public_page: "site/pages/current-mayors.html",
      findings_root: "research/current-mayors/findings",
      note: "Initial canonical migration. Future updates should edit data/v1/current_mayors and regenerate the public table from it.",
    },
    records: byPrefecture.flatMap((prefecture) => prefecture.records),
  };

  if (canonical.records.length !== pageRows.length) {
    throw new Error(`Record count mismatch: canonical=${canonical.records.length}, current page=${pageRows.length}`);
  }

  return { canonical, byPrefecture };
}

async function writeData({ canonical, byPrefecture }) {
  await fs.mkdir(outputByPrefectureRoot, { recursive: true });

  await fs.writeFile(
    path.join(outputRoot, "canonical.json"),
    `${JSON.stringify(canonical, null, 2)}\n`,
    "utf8",
  );

  for (const prefecture of byPrefecture) {
    const fileName = `${prefecture.pref_code}-${prefecture.pref_slug}.json`;
    await fs.writeFile(
      path.join(outputByPrefectureRoot, fileName),
      `${JSON.stringify(prefecture, null, 2)}\n`,
      "utf8",
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const data = await buildData(args.generatedAt);

  if (args.write) {
    await writeData(data);
    return;
  }

  process.stdout.write(`${JSON.stringify(data.canonical, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
