import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

function parseArgs(argv) {
  const args = {
    asOf: new Date().toISOString().slice(0, 10),
    format: "markdown",
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
    if (arg === "--json") {
      args.format = "json";
      continue;
    }
    if (arg === "--format") {
      args.format = argv[index + 1];
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

function addYears(dateString, years) {
  const [year, month, day] = dateString.split("-");
  return `${String(Number(year) + years).padStart(4, "0")}-${month}-${day}`;
}

function buildRows({ regions, elections, asOf }) {
  const prefectures = regions.records
    .filter((record) => record.level === "prefecture")
    .sort((left, right) => left.pref_code.localeCompare(right.pref_code));

  return prefectures.map((prefecture) => {
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
    } else if (currentTermElection) {
      note = `4年周期目安 ${addYears(currentTermElection.vote_date, 4).slice(0, 4)}年`;
    }

    return {
      prefecture: prefecture.name,
      pref_code: prefecture.pref_code,
      current_term_basis_vote_date: currentTermElection?.vote_date ?? null,
      current_term_basis_election_id: currentTermElection?.id ?? null,
      next_election_vote_date: nextElection?.vote_date ?? null,
      next_election_notice_date: nextElection?.notice_date ?? null,
      next_election_id: nextElection?.id ?? null,
      status,
      note,
    };
  });
}

function renderMarkdown(rows, asOf) {
  const total = rows.length;
  const confirmed = rows.filter((row) => row.status === "次回日程確認済み").length;
  const missing = rows.filter((row) => row.status === "record missing").length;

  const lines = [
    "# Governor Term Inventory",
    "",
    `as_of: ${asOf}`,
    "",
    "この一覧は厳密な任期満了日の原簿ではなく、`data/v1/elections.json` をもとにした「現行任期の基準選挙」と「次回知事選の確認状況」の棚卸しです。",
    "",
    `- prefectures: ${total}`,
    `- next_election_confirmed: ${confirmed}`,
    `- governor_record_missing: ${missing}`,
    "",
    "| 都道府県 | 現行任期の基準選挙 | 次回知事選 | 状態 | メモ |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.prefecture} | ${row.current_term_basis_vote_date ?? "未投入"} | ${row.next_election_vote_date ?? "未確認"} | ${row.status} | ${row.note || "-"} |`,
    );
  }

  lines.push("");
  return `${lines.join("\n")}`;
}

function renderJavaScript(rows, asOf) {
  const payload = {
    as_of: asOf,
    rows,
  };

  return [
    "// AUTO-GENERATED. DO NOT EDIT.",
    "// Generated from data/v1 by scripts/generate-governor-term-inventory.mjs.",
    "// Update data/v1 and rerun the generator instead of editing this file.",
    "",
    `window.GOVERNOR_TERM_INVENTORY = ${JSON.stringify(payload, null, 2)};`,
    "",
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [regions, elections] = await Promise.all([
    readJson(path.join("data", "v1", "regions.json")),
    readJson(path.join("data", "v1", "elections.json")),
  ]);

  const rows = buildRows({ regions, elections, asOf: args.asOf });

  let output = "";
  if (args.format === "json") {
    output = `${JSON.stringify({ as_of: args.asOf, rows }, null, 2)}\n`;
  } else if (args.format === "js") {
    output = renderJavaScript(rows, args.asOf);
  } else {
    output = `${renderMarkdown(rows, args.asOf)}\n`;
  }

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
