import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const electionsPath = path.join(repoRoot, "data", "v1", "elections.json");
const resourceDir = path.join(repoRoot, "data", "v1", "election_resource_links");
const DEFAULT_TARGET_KINDS = ["candidate_list", "bulletin"];

function parseArgs(argv) {
  const args = {
    from: null,
    to: null,
    asOf: getTodayJstDateText(),
    kinds: DEFAULT_TARGET_KINDS,
    format: "markdown",
    includeComplete: false,
    subtype: "all",
    type: "all",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      index += 1;
      if (index >= argv.length) throw new Error(`${arg} requires a value`);
      return argv[index];
    };

    if (arg === "--from") {
      args.from = next();
      continue;
    }
    if (arg === "--to") {
      args.to = next();
      continue;
    }
    if (arg === "--as-of") {
      args.asOf = next();
      continue;
    }
    if (arg === "--kinds") {
      args.kinds = next().split(",").map((kind) => kind.trim()).filter(Boolean);
      continue;
    }
    if (arg === "--format") {
      args.format = next();
      continue;
    }
    if (arg === "--include-complete") {
      args.includeComplete = true;
      continue;
    }
    if (arg === "--subtype") {
      args.subtype = next();
      continue;
    }
    if (arg === "--type") {
      args.type = next();
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(`Usage: node scripts/current/list-election-resource-followups.mjs --from YYYY-MM-DD --to YYYY-MM-DD [options]

Options:
  --as-of YYYY-MM-DD          Reference date for due/scheduled status. Default: today in JST.
  --kinds a,b                 Resource kinds to check. Default: candidate_list,bulletin.
  --type TYPE                 Filter election type. Default: all.
  --subtype SUBTYPE           Filter election subtype. Default: all.
  --format markdown|json      Output format. Default: markdown.
  --include-complete          Include elections that already have all target kinds.
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

function assertIsoDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    throw new Error(`${label} must be YYYY-MM-DD`);
  }
}

function parseIsoDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatIsoDate(date) {
  return [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(dateText, days) {
  const date = parseIsoDate(dateText);
  date.setUTCDate(date.getUTCDate() + days);
  return formatIsoDate(date);
}

function isWeekend(dateText) {
  const day = parseIsoDate(dateText).getUTCDay();
  return day === 0 || day === 6;
}

function nextBusinessDayAfter(dateText) {
  if (!dateText) return null;
  let candidate = addDays(dateText, 1);
  while (isWeekend(candidate)) {
    candidate = addDays(candidate, 1);
  }
  return candidate;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readResourceMap() {
  const entries = await fs.readdir(resourceDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(resourceDir, entry.name))
    .sort();
  const pairs = await Promise.all(files.map(async (filePath) => {
    const data = await readJson(filePath);
    return [data.election_id, data.records ?? []];
  }));
  return new Map(pairs);
}

function statusFor({ missingKinds, recheckDate, voteDate }, asOf) {
  if (missingKinds.length === 0) return "complete";
  if (!recheckDate) return "needs_notice_date";
  if (voteDate < asOf) return "past_vote_missing";
  if (recheckDate <= asOf) return "due";
  return "scheduled";
}

function priorityFor(status, recheckDate, asOf) {
  if (status === "due" || status === "past_vote_missing") return "P0";
  if (status === "needs_notice_date") return "P1";
  if (!recheckDate) return "P2";
  return addDays(asOf, 7) >= recheckDate ? "P1" : "P2";
}

function buildRows(elections, resourceMap, args) {
  return elections
    .filter((election) => election.vote_date >= args.from && election.vote_date <= args.to)
    .filter((election) => args.type === "all" || election.type === args.type)
    .filter((election) => args.subtype === "all" || election.subtype === args.subtype)
    .map((election) => {
      const records = resourceMap.get(election.id) ?? [];
      const presentKinds = [...new Set(records.map((record) => record.kind).filter(Boolean))].sort();
      const missingKinds = args.kinds.filter((kind) => !presentKinds.includes(kind));
      const recheckDate = nextBusinessDayAfter(election.notice_date);
      const status = statusFor({ missingKinds, recheckDate, voteDate: election.vote_date }, args.asOf);
      return {
        priority: priorityFor(status, recheckDate, args.asOf),
        status,
        recheck_date: recheckDate,
        vote_date: election.vote_date,
        notice_date: election.notice_date,
        election_id: election.id,
        election_name: election.name,
        type: election.type,
        subtype: election.subtype,
        missing_kinds: missingKinds,
        present_kinds: presentKinds,
        source_url: election.verification?.source_url ?? "",
      };
    })
    .filter((row) => args.includeComplete || row.missing_kinds.length > 0)
    .sort((left, right) => {
      const priorityOrder = { P0: 0, P1: 1, P2: 2 };
      const priorityCompare = (priorityOrder[left.priority] ?? 99) - (priorityOrder[right.priority] ?? 99);
      if (priorityCompare !== 0) return priorityCompare;
      return String(left.recheck_date ?? "9999-12-31").localeCompare(String(right.recheck_date ?? "9999-12-31")) ||
        left.vote_date.localeCompare(right.vote_date) ||
        left.election_name.localeCompare(right.election_name, "ja");
    });
}

function countBy(rows, key) {
  return rows.reduce((counts, row) => {
    const value = row[key] ?? "";
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function escapeMarkdownCell(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
}

function renderMarkdown(rows, args) {
  const statusCounts = countBy(rows, "status");
  const priorityCounts = countBy(rows, "priority");
  const lines = [
    "# Election Resource Follow-ups",
    "",
    `Generated: ${new Date().toISOString()}`,
    `As of: ${args.asOf}`,
    `Vote date range: ${args.from} to ${args.to}`,
    `Target kinds: ${args.kinds.join(", ")}`,
    `Filters: type=${args.type}, subtype=${args.subtype}`,
    "",
    `Rows: ${rows.length}`,
    `Status counts: ${Object.entries(statusCounts).map(([key, value]) => `${key}=${value}`).join(", ") || "none"}`,
    `Priority counts: ${Object.entries(priorityCounts).map(([key, value]) => `${key}=${value}`).join(", ") || "none"}`,
    "",
    "| priority | status | recheck_date | vote_date | notice_date | election_id | election | type | missing | present | source |",
    "|---|---|---:|---:|---:|---|---|---|---|---|---|",
  ];

  for (const row of rows) {
    const source = row.source_url ? `[source](${row.source_url})` : "";
    lines.push([
      row.priority,
      row.status,
      row.recheck_date ?? "",
      row.vote_date,
      row.notice_date ?? "",
      row.election_id,
      row.election_name,
      `${row.type}/${row.subtype}`,
      row.missing_kinds.join(", "),
      row.present_kinds.join(", "),
      source,
    ].map(escapeMarkdownCell).join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  assertIsoDate(args.from, "--from");
  assertIsoDate(args.to, "--to");
  assertIsoDate(args.asOf, "--as-of");
  if (!["markdown", "json"].includes(args.format)) {
    throw new Error("--format must be markdown or json");
  }

  const [electionsData, resourceMap] = await Promise.all([
    readJson(electionsPath),
    readResourceMap(),
  ]);
  const rows = buildRows(electionsData.records ?? [], resourceMap, args);

  if (args.format === "json") {
    process.stdout.write(`${JSON.stringify({ args, rows }, null, 2)}\n`);
    return;
  }

  process.stdout.write(renderMarkdown(rows, args));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
