import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const MACRO_REGION_LABELS = {
  hokkaido_tohoku: "北海道・東北",
  kanto: "関東",
  hokuriku: "北陸",
  koshinetsu: "甲信越",
  tokai: "東海",
  kansai: "関西",
  chugoku: "中国",
  shikoku: "四国",
  kyushu_okinawa: "九州・沖縄",
};

const PREFECTURE_TO_MACRO_REGION = {
  "01": "hokkaido_tohoku",
  "02": "hokkaido_tohoku",
  "03": "hokkaido_tohoku",
  "04": "hokkaido_tohoku",
  "05": "hokkaido_tohoku",
  "06": "hokkaido_tohoku",
  "07": "hokkaido_tohoku",
  "08": "kanto",
  "09": "kanto",
  "10": "kanto",
  "11": "kanto",
  "12": "kanto",
  "13": "kanto",
  "14": "kanto",
  "15": "koshinetsu",
  "16": "hokuriku",
  "17": "hokuriku",
  "18": "hokuriku",
  "19": "koshinetsu",
  "20": "koshinetsu",
  "21": "tokai",
  "22": "tokai",
  "23": "tokai",
  "24": "kansai",
  "25": "kansai",
  "26": "kansai",
  "27": "kansai",
  "28": "kansai",
  "29": "kansai",
  "30": "kansai",
  "31": "chugoku",
  "32": "chugoku",
  "33": "chugoku",
  "34": "chugoku",
  "35": "chugoku",
  "36": "shikoku",
  "37": "shikoku",
  "38": "shikoku",
  "39": "shikoku",
  "40": "kyushu_okinawa",
  "41": "kyushu_okinawa",
  "42": "kyushu_okinawa",
  "43": "kyushu_okinawa",
  "44": "kyushu_okinawa",
  "45": "kyushu_okinawa",
  "46": "kyushu_okinawa",
  "47": "kyushu_okinawa",
};

function parseArgs(argv) {
  const args = {
    asOf: new Date().toISOString().slice(0, 10),
    write: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--as-of") {
      args.asOf = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--write") {
      args.write = argv[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function readJson(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  return JSON.parse(await fs.readFile(fullPath, "utf8"));
}

function sortByVoteDate(items) {
  return [...items].sort((left, right) => left.vote_date.localeCompare(right.vote_date));
}

function buildInventoryByPrefCode(regions, elections, asOf) {
  const prefectures = regions.records
    .filter((record) => record.level === "prefecture")
    .sort((left, right) => left.pref_code.localeCompare(right.pref_code));

  const map = new Map();

  for (const prefecture of prefectures) {
    const governorElections = sortByVoteDate(
      elections.records.filter(
        (record) =>
          record.subtype === "governor" &&
          record.primary_region_id === prefecture.id,
      ),
    );

    const currentTermElection =
      [...governorElections]
        .reverse()
        .find((record) => record.vote_date < asOf || record.phase === "archived") ?? null;

    const nextElection =
      governorElections.find(
        (record) => record.vote_date >= asOf && record.phase === "upcoming",
      ) ?? null;

    let status = "次回日程未確認";
    let note = "";

    if (!currentTermElection && !nextElection) {
      status = "record missing";
      note = "知事選 record 未投入";
    } else if (nextElection) {
      status = "次回日程確認済み";
      note = `告示 ${nextElection.notice_date}`;
    }

    map.set(prefecture.pref_code, {
      current_term_basis_vote_date: currentTermElection?.vote_date ?? null,
      current_term_basis_election_id: currentTermElection?.id ?? null,
      next_election_vote_date: nextElection?.vote_date ?? null,
      next_election_notice_date: nextElection?.notice_date ?? null,
      next_election_id: nextElection?.id ?? null,
      status,
      inventory_note: note,
    });
  }

  return map;
}

function buildRows({ currentGovernors, regions, elections, asOf }) {
  const prefectures = new Map(
    regions.records
      .filter((record) => record.level === "prefecture")
      .map((record) => [record.pref_code, record]),
  );
  const inventoryByPrefCode = buildInventoryByPrefCode(regions, elections, asOf);

  return currentGovernors.records
    .slice()
    .sort((left, right) => left.pref_code.localeCompare(right.pref_code))
    .map((record) => {
      const prefecture = prefectures.get(record.pref_code);
      if (!prefecture) {
        throw new Error(`Unknown prefecture code in current-governors.json: ${record.pref_code}`);
      }

      const inventory = inventoryByPrefCode.get(record.pref_code);
      if (!inventory) {
        throw new Error(`Missing inventory row for prefecture code: ${record.pref_code}`);
      }

      const macroRegionKey = PREFECTURE_TO_MACRO_REGION[record.pref_code];
      const macroRegion = MACRO_REGION_LABELS[macroRegionKey] ?? "未分類";
      const notes = [];

      if (inventory.inventory_note) {
        notes.push(`棚卸し: ${inventory.inventory_note}`);
      }
      if (record.note) {
        notes.push(record.note);
      }

      return {
        pref_code: record.pref_code,
        macro_region: macroRegion,
        prefecture: prefecture.name,
        governor_name: record.governor_name,
        term_count: record.term_count,
        current_term_basis_vote_date: inventory.current_term_basis_vote_date,
        current_term_basis_election_id: inventory.current_term_basis_election_id,
        next_election_vote_date: inventory.next_election_vote_date,
        next_election_notice_date: inventory.next_election_notice_date,
        next_election_id: inventory.next_election_id,
        status: inventory.status,
        source_label: record.source_label,
        source_url: record.source_url,
        last_checked_date: record.last_checked_date,
        note: notes.join(" / "),
      };
    });
}

function renderJavaScript(rows, asOf) {
  const payload = {
    as_of: asOf,
    rows,
  };

  return [
    "// AUTO-GENERATED. DO NOT EDIT.",
    "// Generated from data/v1/current-governors.json and data/v1/elections.json.",
    "// Update data/v1 and rerun the generator instead of editing this file.",
    "",
    `window.CURRENT_GOVERNORS_DATA = ${JSON.stringify(payload, null, 2)};`,
    "",
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [currentGovernors, regions, elections] = await Promise.all([
    readJson(path.join("data", "v1", "current-governors.json")),
    readJson(path.join("data", "v1", "regions.json")),
    readJson(path.join("data", "v1", "elections.json")),
  ]);

  const rows = buildRows({ currentGovernors, regions, elections, asOf: args.asOf });
  const output = renderJavaScript(rows, args.asOf);

  if (args.write) {
    await fs.writeFile(path.resolve(repoRoot, args.write), output, "utf8");
    return;
  }

  process.stdout.write(output);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
