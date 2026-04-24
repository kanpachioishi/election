import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const dataV1Root = path.join(repoRoot, "data", "v1");
const legacyRegionsPath = path.join(repoRoot, "data", "regions.js");
const legacyElectionsPath = path.join(repoRoot, "data", "elections.js");

const warnings = [];

function warn(message) {
  warnings.push(message);
}

function byLocale(a, b) {
  return a.localeCompare(b, "ja");
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function listJsonFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(dirPath, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function isVerified(record) {
  return record?.verification?.status === "verified";
}

function toJavaScriptLiteral(value) {
  return JSON.stringify(value, null, 2);
}

function extractTurnoutBlock(sourceText) {
  const marker = "// 投票率データ（衆議院選挙）";
  const index = sourceText.indexOf(marker);
  if (index === -1) {
    throw new Error("data/elections.js から TURNOUT_* ブロックを抽出できませんでした。");
  }
  return sourceText.slice(index).trim();
}

function mapLegacyElectionType(election, primaryRegion) {
  if (election.type === "national") {
    return "national";
  }

  if (election.type === "prefectural") {
    return "prefectural";
  }

  if (election.type === "municipal" || election.type === "by_election") {
    warn(`legacy ELECTIONS skipped unsupported election type: ${election.id} (${election.type})`);
    return null;
  }

  warn(`legacy ELECTIONS skipped unknown election type: ${election.id}`);
  return null;
}

function buildLegacyRegions({ regionById, postalCollections }) {
  const legacyRegions = {};

  for (const collection of postalCollections) {
    const exactVerified = collection.records.filter(
      (record) =>
        isVerified(record) &&
        record.match_kind === "exact" &&
        record.confidence === "high",
    );

    if (exactVerified.length === 0) {
      continue;
    }

    const regionIds = [...new Set(exactVerified.map((record) => record.region_id))];
    if (regionIds.length !== 1) {
      warn(
        `postal prefix ${collection.prefix} skipped because it maps to multiple verified exact regions: ${regionIds.join(", ")}`,
      );
      continue;
    }

    const region = regionById.get(regionIds[0]);
    if (!region) {
      warn(`postal prefix ${collection.prefix} skipped because region ${regionIds[0]} was not found`);
      continue;
    }

    const prefecture =
      region.level === "municipality" ? regionById.get(region.parent_region_id) : region;
    if (!prefecture) {
      warn(`postal prefix ${collection.prefix} skipped because prefecture for ${region.id} was not found`);
      continue;
    }

    legacyRegions[collection.prefix] = {
      prefecture: prefecture.name,
      city: region.level === "municipality" ? region.name : region.display_name,
      prefCode: region.pref_code,
    };
  }

  return Object.fromEntries(
    Object.entries(legacyRegions).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function buildLegacyElectionRegions({ election, regionById }) {
  if (election.type === "national" || election.scope_type === "all") {
    return ["all"];
  }

  if (election.scope_type !== "region") {
    warn(`legacy ELECTIONS skipped unsupported scope_type: ${election.id} (${election.scope_type})`);
    return null;
  }

  const scopedRegionIds =
    election.primary_region_id
      ? [election.primary_region_id]
      : [];

  const prefCodes = [...new Set(
    scopedRegionIds
      .map((regionId) => regionById.get(regionId))
      .filter(Boolean)
      .map((region) => region.pref_code),
  )].sort((a, b) => a.localeCompare(b));

  if (prefCodes.length === 0) {
    warn(`election ${election.id} skipped because no legacy region codes could be derived`);
    return null;
  }

  return prefCodes;
}

function buildLegacyElections({ elections, regionById }) {
  return elections
    .filter((election) => isVerified(election))
    .map((election) => {
      const primaryRegion = election.primary_region_id
        ? regionById.get(election.primary_region_id)
        : null;
      const type = mapLegacyElectionType(election, primaryRegion);
      if (!type) {
        return null;
      }

      const regions = buildLegacyElectionRegions({ election, regionById });
      if (!regions) {
        return null;
      }

      return {
        id: election.id,
        name: election.name,
        date: election.vote_date,
        type,
        description: election.description ?? "",
        regions,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      const dateCompare = left.date.localeCompare(right.date);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return byLocale(left.name, right.name);
    });
}

function renderLegacyRegions(legacyRegions) {
  return [
    "// AUTO-GENERATED. DO NOT EDIT.",
    "// Generated from data/v1 by scripts/generate-legacy-data.mjs.",
    "// Update data/v1 and rerun the generator instead of editing this file.",
    "",
    "const REGIONS = " + toJavaScriptLiteral(legacyRegions) + ";",
    "",
  ].join("\n");
}

function renderLegacyElections({ legacyElections, turnoutBlock }) {
  return [
    "// AUTO-GENERATED. DO NOT EDIT.",
    "// Generated from data/v1 by scripts/generate-legacy-data.mjs.",
    "// Update data/v1 and rerun the generator instead of editing the ELECTIONS block directly.",
    "// TURNOUT_* remains transitional and is preserved until turnout data migrates to the canonical model.",
    "",
    "const ELECTIONS = " + toJavaScriptLiteral(legacyElections) + ";",
    "",
    turnoutBlock,
    "",
  ].join("\n");
}

const [regionsData, electionsData, postalFiles, currentLegacyElections] = await Promise.all([
  readJson(path.join(dataV1Root, "regions.json")),
  readJson(path.join(dataV1Root, "elections.json")),
  listJsonFiles(path.join(dataV1Root, "postal_code_mappings")),
  fs.readFile(legacyElectionsPath, "utf8"),
]);

const postalCollections = await Promise.all(postalFiles.map((filePath) => readJson(filePath)));
const regionById = new Map(regionsData.records.map((region) => [region.id, region]));

const legacyRegions = buildLegacyRegions({ regionById, postalCollections });
const legacyElections = buildLegacyElections({
  elections: electionsData.records,
  regionById,
});

const turnoutBlock = extractTurnoutBlock(currentLegacyElections);
const nextLegacyRegions = renderLegacyRegions(legacyRegions);
const nextLegacyElections = renderLegacyElections({ legacyElections, turnoutBlock });

// Syntax-check generated browser scripts before writing them.
new Function(nextLegacyRegions);
new Function(nextLegacyElections);

await fs.writeFile(legacyRegionsPath, nextLegacyRegions, "utf8");
await fs.writeFile(legacyElectionsPath, nextLegacyElections, "utf8");

console.log(`generated data/regions.js (${Object.keys(legacyRegions).length} prefixes)`);
console.log(`generated data/elections.js (${legacyElections.length} elections)`);

if (warnings.length > 0) {
  console.warn("warnings:");
  for (const message of warnings) {
    console.warn(`- ${message}`);
  }
}
