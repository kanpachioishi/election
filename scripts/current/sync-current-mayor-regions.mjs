import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const defaultSourceDir = path.join(
  repoRoot,
  "artifacts",
  "private",
  "sources",
  "current-mayors",
  "soumu-municipality-codes-2024-01-01",
);
const findingsRoot = path.join(repoRoot, "research", "current-mayors", "findings");
const regionsPath = path.join(repoRoot, "data", "v1", "regions.json");

const SOUMU_CODE_TABLE_URL = "https://www.soumu.go.jp/denshijiti/code.html";
const SOUMU_CODE_XLSX_URL = "https://www.soumu.go.jp/main_content/000925835.xlsx";
const SOURCE_NOTE = "総務省「都道府県コード及び市区町村コード」（令和6年1月1日更新）に基づき追加";

const KANA_ROMAJI = {
  ア: "a",
  イ: "i",
  ウ: "u",
  エ: "e",
  オ: "o",
  カ: "ka",
  キ: "ki",
  ク: "ku",
  ケ: "ke",
  コ: "ko",
  サ: "sa",
  シ: "shi",
  ス: "su",
  セ: "se",
  ソ: "so",
  タ: "ta",
  チ: "chi",
  ツ: "tsu",
  テ: "te",
  ト: "to",
  ナ: "na",
  ニ: "ni",
  ヌ: "nu",
  ネ: "ne",
  ノ: "no",
  ハ: "ha",
  ヒ: "hi",
  フ: "fu",
  ヘ: "he",
  ホ: "ho",
  マ: "ma",
  ミ: "mi",
  ム: "mu",
  メ: "me",
  モ: "mo",
  ヤ: "ya",
  ユ: "yu",
  ヨ: "yo",
  ラ: "ra",
  リ: "ri",
  ル: "ru",
  レ: "re",
  ロ: "ro",
  ワ: "wa",
  ヲ: "o",
  ン: "n",
  ガ: "ga",
  ギ: "gi",
  グ: "gu",
  ゲ: "ge",
  ゴ: "go",
  ザ: "za",
  ジ: "ji",
  ズ: "zu",
  ゼ: "ze",
  ゾ: "zo",
  ダ: "da",
  ヂ: "ji",
  ヅ: "zu",
  デ: "de",
  ド: "do",
  バ: "ba",
  ビ: "bi",
  ブ: "bu",
  ベ: "be",
  ボ: "bo",
  パ: "pa",
  ピ: "pi",
  プ: "pu",
  ペ: "pe",
  ポ: "po",
  ヴ: "vu",
  ァ: "a",
  ィ: "i",
  ゥ: "u",
  ェ: "e",
  ォ: "o",
  ャ: "ya",
  ュ: "yu",
  ョ: "yo",
};

const KANA_COMBO_ROMAJI = {
  キャ: "kya",
  キュ: "kyu",
  キョ: "kyo",
  ギャ: "gya",
  ギュ: "gyu",
  ギョ: "gyo",
  シャ: "sha",
  シュ: "shu",
  ショ: "sho",
  ジャ: "ja",
  ジュ: "ju",
  ジョ: "jo",
  チャ: "cha",
  チュ: "chu",
  チョ: "cho",
  ニャ: "nya",
  ニュ: "nyu",
  ニョ: "nyo",
  ヒャ: "hya",
  ヒュ: "hyu",
  ヒョ: "hyo",
  ビャ: "bya",
  ビュ: "byu",
  ビョ: "byo",
  ピャ: "pya",
  ピュ: "pyu",
  ピョ: "pyo",
  ミャ: "mya",
  ミュ: "myu",
  ミョ: "myo",
  リャ: "rya",
  リュ: "ryu",
  リョ: "ryo",
  ファ: "fa",
  フィ: "fi",
  フェ: "fe",
  フォ: "fo",
  ウィ: "wi",
  ウェ: "we",
  ウォ: "wo",
  ティ: "ti",
  ディ: "di",
  ツァ: "tsa",
  ツィ: "tsi",
  ツェ: "tse",
  ツォ: "tso",
};

function parseArgs(argv) {
  const args = {
    write: false,
    sourceDir: defaultSourceDir,
    confirmedAt: new Date().toISOString().replace("Z", "+00:00"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--write") {
      args.write = true;
      continue;
    }
    if (arg === "--source-dir") {
      args.sourceDir = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--confirmed-at") {
      args.confirmedAt = argv[index + 1];
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

function decodeXml(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseSharedStrings(xml) {
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) => {
    const body = match[1]
      .replace(/<rPh\b[\s\S]*?<\/rPh>/g, "")
      .replace(/<phoneticPr\b[^>]*\/>/g, "");
    return [...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
      .map((textMatch) => decodeXml(textMatch[1]))
      .join("");
  });
}

function parseWorksheetRows(xml, sharedStrings) {
  const rows = [];

  for (const rowMatch of xml.matchAll(/<row\b[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = { row_number: Number(rowMatch[1]) };
    const body = rowMatch[2];

    for (const cellMatch of body.matchAll(/<c\b([^>]*)\/>|<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1] ?? cellMatch[2];
      const cellBody = cellMatch[3] ?? "";
      const column = attrs.match(/r="([A-Z]+)\d+"/)?.[1];
      if (!column) continue;

      const rawValue = cellBody.match(/<v>(.*?)<\/v>/)?.[1];
      if (rawValue === undefined) {
        row[column] = "";
      } else if (/\bt="s"/.test(attrs)) {
        row[column] = sharedStrings[Number(rawValue)] ?? "";
      } else {
        row[column] = decodeXml(rawValue);
      }
    }

    rows.push(row);
  }

  return rows;
}

async function loadSoumuMunicipalityCodes(sourceDir) {
  const sharedStringsXml = await fs.readFile(path.join(sourceDir, "xl", "sharedStrings.xml"), "utf8");
  const worksheetXml = await fs.readFile(path.join(sourceDir, "xl", "worksheets", "sheet1.xml"), "utf8");
  const sharedStrings = parseSharedStrings(sharedStringsXml);
  const rows = parseWorksheetRows(worksheetXml, sharedStrings);
  const byPrefAndName = new Map();

  for (const row of rows.slice(1)) {
    if (!/^\d{6}$/.test(row.A ?? "") || !row.B || !row.C) continue;

    const municipalityCode = row.A.slice(0, 5);
    byPrefAndName.set(`${row.B}:${row.C}`, {
      full_code: row.A,
      pref_code: municipalityCode.slice(0, 2),
      pref_name: row.B,
      municipality_code: municipalityCode,
      municipality_name: row.C,
      municipality_kana: row.E ?? null,
    });
  }

  return byPrefAndName;
}

async function loadCurrentMayorMunicipalities() {
  const dirEntries = await fs.readdir(findingsRoot, { withFileTypes: true });
  const records = [];

  for (const entry of dirEntries.filter((item) => item.isDirectory() && /^\d{2}-/.test(item.name)).sort((a, b) => a.name.localeCompare(b.name))) {
    const filePath = path.join(findingsRoot, entry.name, "municipalities.json");
    const data = await readJson(filePath);

    for (const [index, record] of data.records.entries()) {
      records.push({
        pref_code: data.pref_code,
        pref_name: data.pref_name,
        city_name: record.city_name,
        official_url: record.official_url,
        order: index,
      });
    }
  }

  return records;
}

function slugPartFromOfficialUrl(officialUrl) {
  if (!officialUrl) return null;

  let hostname;
  try {
    hostname = new URL(officialUrl).hostname.toLowerCase();
  } catch {
    return null;
  }

  const labels = hostname
    .split(".")
    .filter((label) => label && !["www", "www1", "www2"].includes(label));
  const cityLabelIndex = labels.indexOf("city");
  const candidate = cityLabelIndex >= 0
    ? labels[cityLabelIndex + 1]
    : labels.find((label) => !["lg", "jp", "pref", "metro", "town", "vill", "village", "city"].includes(label));

  const slugPart = candidate
    ?.replace(/^city-/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slugPart || null;
}

function lastVowel(value) {
  const match = value.match(/[aeiou](?!.*[aeiou])/);
  return match?.[0] ?? "";
}

function romanizeMunicipalityKana(kanaValue) {
  let kana = kanaValue?.normalize("NFKC").replace(/\s+/g, "");
  if (!kana) return null;

  kana = kana.replace(/シ$/u, "");
  const chars = [...kana];
  let doubled = false;
  let output = "";

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];

    if (char === "ッ") {
      doubled = true;
      continue;
    }

    if (char === "ー") {
      output += lastVowel(output);
      continue;
    }

    const combo = `${char}${chars[index + 1] ?? ""}`;
    let roman = KANA_COMBO_ROMAJI[combo];
    if (roman) {
      index += 1;
    } else {
      roman = KANA_ROMAJI[char];
    }
    if (!roman) return null;

    if (doubled) {
      output += roman.startsWith("ch") ? "t" : roman[0];
      doubled = false;
    }
    output += roman;
  }

  return output
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || null;
}

function makeMunicipalitySlug({ official_url: officialUrl, municipality_code: municipalityCode, municipality_kana: municipalityKana }, usedSlugKeys, parentRegionId) {
  const slugPart = slugPartFromOfficialUrl(officialUrl) ?? romanizeMunicipalityKana(municipalityKana) ?? municipalityCode;
  const baseSlug = slugPart.endsWith("-shi") ? slugPart : `${slugPart}-shi`;
  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugKeys.has(`${parentRegionId}|${slug}`)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugKeys.add(`${parentRegionId}|${slug}`);
  return slug;
}

function shouldRefreshGeneratedSlug(record) {
  return record.verification?.source_url === SOUMU_CODE_XLSX_URL && /^\d{5}-shi$/.test(record.slug);
}

function buildExistingLookups(regions) {
  const byPrefAndName = new Map();
  const byId = new Map();
  const usedSlugKeys = new Set();

  for (const record of regions.records) {
    byId.set(record.id, record);
    if (record.level === "municipality") {
      byPrefAndName.set(`${record.pref_code}:${record.name}`, record);
      if (record.parent_region_id && record.slug) {
        usedSlugKeys.add(`${record.parent_region_id}|${record.slug}`);
      }
    }
  }

  return { byPrefAndName, byId, usedSlugKeys };
}

function buildRegionRecord({ target, soumuRecord, confirmedAt, usedSlugKeys }) {
  const parentRegionId = `pref-${target.pref_code}`;
  const municipalityCode = soumuRecord.municipality_code;

  return {
    id: `mun-${municipalityCode}`,
    level: "municipality",
    pref_code: target.pref_code,
    municipality_code: municipalityCode,
    name: target.city_name,
    slug: makeMunicipalitySlug(
      {
        official_url: target.official_url,
        municipality_code: municipalityCode,
        municipality_kana: soumuRecord.municipality_kana,
      },
      usedSlugKeys,
      parentRegionId,
    ),
    parent_region_id: parentRegionId,
    display_name: `${target.pref_name}${target.city_name}`,
    verification: {
      source_url: SOUMU_CODE_XLSX_URL,
      source_type: "official",
      confirmed_at: confirmedAt,
      last_checked_at: confirmedAt,
      status: "verified",
      note: SOURCE_NOTE,
    },
  };
}

function summarize(records) {
  const byPref = new Map();
  for (const record of records) {
    byPref.set(record.pref_code, (byPref.get(record.pref_code) ?? 0) + 1);
  }
  return [...byPref.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([prefCode, count]) => `${prefCode}:${count}`)
    .join(" ");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [regions, targets, soumuCodes] = await Promise.all([
    readJson(regionsPath),
    loadCurrentMayorMunicipalities(),
    loadSoumuMunicipalityCodes(args.sourceDir),
  ]);
  const { byPrefAndName, byId, usedSlugKeys } = buildExistingLookups(regions);
  const additions = [];
  const slugUpdates = [];
  const missingCodes = [];
  const conflicts = [];

  for (const target of targets) {
    const existing = byPrefAndName.get(`${target.pref_code}:${target.city_name}`);
    const soumuRecord = soumuCodes.get(`${target.pref_name}:${target.city_name}`);

    if (!soumuRecord) {
      missingCodes.push(`${target.pref_name}${target.city_name}`);
      continue;
    }

    if (existing) {
      if (existing.municipality_code !== soumuRecord.municipality_code) {
        conflicts.push(`${target.pref_name}${target.city_name}: existing=${existing.municipality_code} soumu=${soumuRecord.municipality_code}`);
      }
      if (shouldRefreshGeneratedSlug(existing)) {
        usedSlugKeys.delete(`${existing.parent_region_id}|${existing.slug}`);
        const nextSlug = makeMunicipalitySlug(
          {
            official_url: target.official_url,
            municipality_code: soumuRecord.municipality_code,
            municipality_kana: soumuRecord.municipality_kana,
          },
          usedSlugKeys,
          existing.parent_region_id,
        );
        if (nextSlug !== existing.slug) {
          slugUpdates.push(`${target.pref_name}${target.city_name}: ${existing.slug} -> ${nextSlug}`);
          existing.slug = nextSlug;
        }
      }
      continue;
    }

    const id = `mun-${soumuRecord.municipality_code}`;
    if (byId.has(id)) {
      conflicts.push(`${target.pref_name}${target.city_name}: ${id} already exists as ${byId.get(id).name}`);
      continue;
    }

    const record = buildRegionRecord({
      target,
      soumuRecord,
      confirmedAt: args.confirmedAt,
      usedSlugKeys,
    });
    additions.push(record);
    byId.set(record.id, record);
    byPrefAndName.set(`${record.pref_code}:${record.name}`, record);
  }

  if (missingCodes.length || conflicts.length) {
    for (const item of missingCodes) {
      console.error(`Missing Soumu code: ${item}`);
    }
    for (const item of conflicts) {
      console.error(`Conflict: ${item}`);
    }
    throw new Error(`Cannot sync regions: missing=${missingCodes.length}, conflicts=${conflicts.length}`);
  }

  additions.sort((left, right) => {
    const prefCompare = left.pref_code.localeCompare(right.pref_code);
    if (prefCompare !== 0) return prefCompare;
    return left.municipality_code.localeCompare(right.municipality_code);
  });

  const nextRegions = {
    ...regions,
    generated_at: args.confirmedAt,
    records: [...regions.records, ...additions],
  };

  if (args.write) {
    await fs.writeFile(regionsPath, `${JSON.stringify(nextRegions, null, 2)}\n`, "utf8");
  }

  console.log(`source_page=${SOUMU_CODE_TABLE_URL}`);
  console.log(`source_xlsx=${SOUMU_CODE_XLSX_URL}`);
  console.log(`current_mayor_cities=${targets.length}`);
  console.log(`soumu_code_rows=${soumuCodes.size}`);
  console.log(`additions=${additions.length}`);
  console.log(`additions_by_pref=${summarize(additions) || "(none)"}`);
  console.log(`slug_updates=${slugUpdates.length}`);
  console.log(`write=${args.write}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
