import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const dataV1Root = path.join(repoRoot, "data", "v1");
const siteDataPath = path.join(repoRoot, "site", "data", "site-data.js");

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

async function listJsonFilesIfExists(dirPath) {
  try {
    return await listJsonFiles(dirPath);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function countBy(items, getKey) {
  return items.reduce((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function isVerified(record) {
  return record?.verification?.status === "verified";
}

function sortJa(left, right) {
  return left.localeCompare(right, "ja");
}

function getPrefecture(region, regionById) {
  if (!region) return null;
  if (region.level === "prefecture") return region;
  return regionById.get(region.parent_region_id) ?? null;
}

function normalizeRegion(region, regionById) {
  const prefecture = getPrefecture(region, regionById);
  return {
    id: region.id,
    level: region.level,
    prefCode: region.pref_code,
    municipalityCode: region.municipality_code,
    name: region.name,
    slug: region.slug,
    displayName: region.display_name,
    parentRegionId: region.parent_region_id,
    prefectureRegionId: prefecture?.id ?? null,
    prefectureName: prefecture?.name ?? region.display_name,
  };
}

function normalizeLocalGovernmentSite(record, regionById) {
  const region = regionById.get(record.region_id) ?? null;
  if (!region) {
    throw new Error(`Unknown region_id in local_government_sites.json: ${record.region_id}`);
  }
  const prefecture = getPrefecture(region, regionById);

  return {
    id: record.id,
    regionId: record.region_id,
    regionLevel: region?.level ?? null,
    prefCode: region?.pref_code ?? prefecture?.pref_code ?? null,
    municipalityCode: region?.municipality_code ?? null,
    prefectureRegionId: prefecture?.id ?? (region?.level === "prefecture" ? region.id : null),
    siteKind: record.site_kind,
    label: record.label,
    url: record.url,
    sourceUrl: record.verification?.source_url ?? record.url,
    lastCheckedAt: record.verification?.last_checked_at ?? null,
    note: record.note ?? null,
  };
}

function normalizeResource(record) {
  return {
    id: record.id,
    kind: record.kind,
    title: record.title,
    url: record.url,
    summary: record.summary,
    isOfficial: record.is_official,
    displayOrder: record.display_order,
    sourceUrl: record.verification?.source_url ?? record.url,
  };
}

function normalizeCandidateEvidence(evidence = []) {
  return evidence.map((item) => ({
    sourceName: item.source_name,
    sourceType: item.source_type,
    title: item.title,
    url: item.url,
    publishedAt: item.published_at,
  }));
}

function normalizeCandidateEvents(events = []) {
  return events.map((event) => ({
    eventDate: event.event_date,
    eventType: event.event_type,
    headline: event.headline,
    summary: event.summary,
    sourceRefs: event.source_refs ?? [],
  }));
}

function normalizeCandidateSignal(record) {
  return {
    id: record.id,
    personName: record.person_name,
    personSlug: record.person_slug,
    status: record.status,
    incumbency: record.incumbency,
    summary: record.summary,
    statusReason: record.status_reason ?? null,
    latestEventAt: record.latest_event_at ?? null,
    confidence: record.confidence,
    displayOrder: record.display_order,
    lastCheckedAt: record.last_checked_at,
    evidence: normalizeCandidateEvidence(record.evidence),
    events: normalizeCandidateEvents(record.events),
  };
}

function normalizeCandidateEndorsement(record) {
  return {
    id: record.id,
    personName: record.person_name,
    personSlug: record.person_slug,
    endorserName: record.endorser_name,
    relationType: record.relation_type,
    summary: record.summary,
    confidence: record.confidence,
    displayOrder: record.display_order,
    lastCheckedAt: record.last_checked_at,
    evidence: normalizeCandidateEvidence(record.evidence),
  };
}

function normalizeCandidateProfileLink(link) {
  return {
    label: link.label,
    url: link.url,
    kind: link.kind ?? null,
    platform: link.platform ?? null,
    summary: link.summary ?? null,
    sourceName: link.source_name ?? null,
    lastCheckedAt: link.last_checked_at ?? null,
    publishedAt: link.published_at ?? null,
  };
}

function normalizeCandidateProfileFactItem(item) {
  return {
    title: item.title ?? item.label,
    summary: item.summary ?? null,
    period: item.period ?? null,
    date: item.date ?? null,
    sourceName: item.source_name ?? null,
    url: item.url ?? null,
  };
}

function normalizeCandidateProfile(record) {
  const profilePages = (record.profile_pages ?? []).map(normalizeCandidateProfileLink);
  const officialSiteUrls = [
    record.official_site_url ? {
      label: "公式サイト",
      url: record.official_site_url,
      kind: "official_profile",
      platform: null,
      summary: null,
      sourceName: null,
      lastCheckedAt: record.last_checked_at,
      publishedAt: null,
    } : null,
    ...profilePages,
  ].filter(Boolean);

  return {
    id: record.id,
    personName: record.person_name,
    personKana: record.person_kana ?? null,
    birthDate: record.birth_date ?? null,
    identityLabels: (record.identity_labels ?? []).slice(),
    personSlug: record.person_slug,
    profileStatus: record.profile_status,
    summary: record.summary,
    currentOrRecentRole: record.current_or_recent_role ?? null,
    officialSiteUrl: record.official_site_url ?? null,
    officialSiteUrls,
    officialSocials: (record.official_sns ?? record.official_socials ?? []).map(normalizeCandidateProfileLink),
    profilePages,
    personStatements: (record.person_statements ?? []).map(normalizeCandidateProfileLink),
    policyLinks: (record.policy_links ?? []).map(normalizeCandidateProfileLink),
    careerItems: (record.career_items ?? []).map(normalizeCandidateProfileFactItem),
    electionHistory: (record.election_history ?? []).map(normalizeCandidateProfileFactItem),
    displayOrder: record.display_order,
    lastCheckedAt: record.last_checked_at,
    evidence: normalizeCandidateEvidence(record.evidence),
  };
}

function normalizeElectionPageStatus(pageStatus) {
  if (!pageStatus) return undefined;

  return {
    label: pageStatus.label,
    summary: pageStatus.summary,
    officialCandidateListStatus: pageStatus.official_candidate_list_status,
    officialCandidateList: normalizeElectionPageStatusLink(pageStatus.official_candidate_list),
    transitionNote: pageStatus.transition_note,
    asOf: pageStatus.as_of,
  };
}

function normalizeElectionPageStatusLink(link) {
  if (!link) return null;

  return {
    label: link.label ?? "公式候補者一覧",
    url: link.url ?? null,
    summary: link.summary ?? null,
    sourceName: link.source_name ?? null,
    publishedAt: link.published_at ?? null,
    lastCheckedAt: link.last_checked_at ?? null,
  };
}

function normalizeElectionPageUpdate(pageUpdate) {
  return {
    date: pageUpdate.date,
    title: pageUpdate.title,
    summary: pageUpdate.summary,
  };
}

async function buildResourceMap() {
  const files = await listJsonFiles(path.join(dataV1Root, "election_resource_links"));
  const resourceMap = new Map();

  for (const filePath of files) {
    const data = await readJson(filePath);
    const resources = data.records
      .filter(isVerified)
      .map(normalizeResource)
      .sort((left, right) => {
        const order = left.displayOrder - right.displayOrder;
        if (order !== 0) return order;
        return sortJa(left.title, right.title);
      });
    resourceMap.set(data.election_id, resources);
  }

  return resourceMap;
}

async function buildCandidateSignalMap() {
  const files = await listJsonFilesIfExists(path.join(dataV1Root, "candidate_signals"));
  const candidateSignalMap = new Map();

  for (const filePath of files) {
    const data = await readJson(filePath);
    const candidateSignals = data.records
      .map(normalizeCandidateSignal)
      .sort((left, right) => {
        const order = left.displayOrder - right.displayOrder;
        if (order !== 0) return order;
        return sortJa(left.personName, right.personName);
      });
    candidateSignalMap.set(data.election_id, candidateSignals);
  }

  return candidateSignalMap;
}

async function buildCandidateEndorsementMap() {
  const files = await listJsonFilesIfExists(path.join(dataV1Root, "candidate_endorsements"));
  const candidateEndorsementMap = new Map();

  for (const filePath of files) {
    const data = await readJson(filePath);
    const candidateEndorsements = data.records
      .map(normalizeCandidateEndorsement)
      .sort((left, right) => {
        const order = left.displayOrder - right.displayOrder;
        if (order !== 0) return order;
        return sortJa(`${left.personName}${left.endorserName}`, `${right.personName}${right.endorserName}`);
      });
    candidateEndorsementMap.set(data.election_id, candidateEndorsements);
  }

  return candidateEndorsementMap;
}

async function buildCandidateProfileMap() {
  const files = await listJsonFilesIfExists(path.join(dataV1Root, "candidate_profiles"));
  const candidateProfileMap = new Map();

  for (const filePath of files) {
    const data = await readJson(filePath);
    const candidateProfiles = data.records
      .map(normalizeCandidateProfile)
      .sort((left, right) => {
        const order = left.displayOrder - right.displayOrder;
        if (order !== 0) return order;
        return sortJa(left.personName, right.personName);
      });
    candidateProfileMap.set(data.election_id, candidateProfiles);
  }

  return candidateProfileMap;
}

async function buildPostalPrefixes(regionById) {
  const files = await listJsonFiles(path.join(dataV1Root, "postal_code_mappings"));
  const prefixes = [];

  for (const filePath of files) {
    const data = await readJson(filePath);
    const verifiedRecords = data.records.filter(
      (record) =>
        isVerified(record) &&
        record.match_kind === "exact" &&
        record.confidence === "high",
    );

    for (const record of verifiedRecords) {
      const region = regionById.get(record.region_id);
      const prefecture = getPrefecture(region, regionById);
      if (!region || !prefecture) continue;

      prefixes.push({
        prefix: data.prefix,
        samplePostalCode: record.postal_code,
        regionId: region.id,
        regionName: region.display_name,
        prefectureRegionId: prefecture.id,
        prefectureName: prefecture.name,
        note: record.note,
      });
    }
  }

  return prefixes.sort((left, right) => left.prefix.localeCompare(right.prefix));
}

function normalizeElection(election, regionById, resourceMap, candidateSignalMap, candidateEndorsementMap, candidateProfileMap) {
  const primaryRegion = election.primary_region_id
    ? regionById.get(election.primary_region_id)
    : null;
  const prefecture = getPrefecture(primaryRegion, regionById);
  const resources = resourceMap.get(election.id) ?? [];
  const candidateSignals = candidateSignalMap.get(election.id) ?? [];
  const candidateEndorsements = candidateEndorsementMap.get(election.id) ?? [];
  const candidateProfiles = candidateProfileMap.get(election.id) ?? [];
  const resourceKinds = [...new Set(resources.map((resource) => resource.kind))];
  const pageStatus = normalizeElectionPageStatus(election.page_status);
  const pageUpdates = (election.page_updates ?? []).map(normalizeElectionPageUpdate);

  return {
    id: election.id,
    slug: election.slug,
    name: election.name,
    type: election.type,
    subtype: election.subtype,
    phase: election.phase,
    voteDate: election.vote_date,
    noticeDate: election.notice_date,
    description: election.description,
    scopeType: election.scope_type,
    primaryRegionId: election.primary_region_id,
    primaryRegionName: primaryRegion?.display_name ?? "全国",
    primaryRegionShortName: primaryRegion?.name ?? "全国",
    prefectureRegionId: prefecture?.id ?? null,
    prefectureName: prefecture?.name ?? null,
    pageStatus,
    pageUpdates,
    sourceUrl: election.verification?.source_url ?? null,
    resourceKinds,
    resources,
    candidateSignals,
    candidateEndorsements,
    candidateProfiles,
  };
}

function renderBrowserData(data) {
  return [
    "// AUTO-GENERATED. DO NOT EDIT.",
    "// Generated from data/v1 by scripts/generate-site-data.mjs.",
    "// Update data/v1 and rerun the generator instead of editing this file.",
    "",
    `window.ELECTION_SITE_DATA = ${JSON.stringify(data, null, 2)};`,
    "",
  ].join("\n");
}

const [regionsData, electionsData, localGovernmentSitesData, resourceMap, candidateSignalMap, candidateEndorsementMap, candidateProfileMap] = await Promise.all([
  readJson(path.join(dataV1Root, "regions.json")),
  readJson(path.join(dataV1Root, "elections.json")),
  readJson(path.join(dataV1Root, "local_government_sites.json")),
  buildResourceMap(),
  buildCandidateSignalMap(),
  buildCandidateEndorsementMap(),
  buildCandidateProfileMap(),
]);

const regionById = new Map(regionsData.records.map((region) => [region.id, region]));
const regions = regionsData.records
  .map((region) => normalizeRegion(region, regionById))
  .sort((left, right) => sortJa(left.displayName, right.displayName));
const elections = electionsData.records
  .filter(isVerified)
  .map((election) => normalizeElection(election, regionById, resourceMap, candidateSignalMap, candidateEndorsementMap, candidateProfileMap))
  .sort((left, right) => {
    const dateCompare = left.voteDate.localeCompare(right.voteDate);
    if (dateCompare !== 0) return dateCompare;
    return sortJa(left.name, right.name);
  });
const localGovernmentSites = localGovernmentSitesData.records
  .filter(isVerified)
  .map((record) => normalizeLocalGovernmentSite(record, regionById))
  .sort((left, right) => {
    const prefCompare = String(left.prefCode ?? "").localeCompare(String(right.prefCode ?? ""));
    if (prefCompare !== 0) return prefCompare;
    return String(left.regionId).localeCompare(String(right.regionId), "ja");
  });
const postalPrefixes = await buildPostalPrefixes(regionById);
const allResources = elections.flatMap((election) => election.resources);
const allCandidateSignals = elections.flatMap((election) => election.candidateSignals);
const allCandidateEndorsements = elections.flatMap((election) => election.candidateEndorsements);
const allCandidateProfiles = elections.flatMap((election) => election.candidateProfiles);

const siteData = {
  generatedAt: new Date().toISOString(),
  sourceGeneratedAt: electionsData.generated_at,
  stats: {
    regions: regions.length,
    elections: elections.length,
    resourceLinks: allResources.length,
    postalPrefixes: postalPrefixes.length,
    localGovernmentSites: localGovernmentSites.length,
    byType: countBy(elections, (election) => election.type),
    byPhase: countBy(elections, (election) => election.phase),
    byResourceKind: countBy(allResources, (resource) => resource.kind),
    byLocalGovernmentSiteKind: countBy(localGovernmentSites, (site) => site.siteKind),
    candidateSignals: allCandidateSignals.length,
    byCandidateSignalStatus: countBy(allCandidateSignals, (candidate) => candidate.status),
    candidateEndorsements: allCandidateEndorsements.length,
    byCandidateEndorsementRelationType: countBy(allCandidateEndorsements, (endorsement) => endorsement.relationType),
    candidateProfiles: allCandidateProfiles.length,
    byCandidateProfileStatus: countBy(allCandidateProfiles, (profile) => profile.profileStatus),
  },
  regions,
  elections,
  localGovernmentSites,
  postalPrefixes,
};

const output = renderBrowserData(siteData);
new Function("window", output)({});
await fs.mkdir(path.dirname(siteDataPath), { recursive: true });
await fs.writeFile(siteDataPath, output, "utf8");

console.log("generated site/data/site-data.js");
console.log(`elections=${siteData.stats.elections} resource_links=${siteData.stats.resourceLinks}`);
