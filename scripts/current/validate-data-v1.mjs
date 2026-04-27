import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const dataRoot = path.resolve(repoRoot, "data", "v1");

const REGION_LEVELS = new Set(["prefecture", "municipality"]);
const MATCH_KINDS = new Set(["exact", "candidate"]);
const CONFIDENCE_LEVELS = new Set(["high", "medium", "low"]);
const ELECTION_TYPES = new Set(["national", "prefectural", "municipal", "by_election"]);
const SCOPE_TYPES = new Set(["all", "region", "multi_region"]);
const PHASES = new Set(["upcoming", "ongoing", "ended", "archived"]);
const RESOURCE_KINDS = new Set(["candidate_list", "bulletin", "early_voting", "polling_place", "other"]);
const SOURCE_TYPES = new Set(["official", "official_aggregated", "statistical_source", "manual_summary"]);
const VERIFICATION_STATUSES = new Set(["verified", "needs_update", "unverified"]);
const CANDIDATE_SIGNAL_STATUSES = new Set(["official_candidate", "announced", "interested", "related_interest", "draft", "considering", "withdrawn"]);
const CANDIDATE_SIGNAL_INCUMBENCIES = new Set(["incumbent", "newcomer", "former_governor", "former_official", "unknown"]);
const CANDIDATE_SIGNAL_SOURCE_TYPES = new Set(["official", "person_statement", "media_report", "party_statement", "organization_statement"]);
const CANDIDATE_EVENT_TYPES = new Set(["announced", "reported_interest", "endorsement", "support", "office_opening", "policy", "withdrawal", "official_candidate", "other"]);
const CANDIDATE_ENDORSEMENT_RELATION_TYPES = new Set(["recommend", "support"]);
const CANDIDATE_PROFILE_STATUSES = new Set(["official_candidate", "reported_candidate", "related_interest", "announced", "interested", "considering", "withdrawn"]);
const CANDIDATE_PROFILE_LINK_KINDS = new Set(["official_profile", "institution_profile", "personal_profile", "policy"]);
const PAGE_STATUS_OFFICIAL_CANDIDATE_LIST_STATUSES = new Set(["not_included", "published"]);
const LOCAL_GOVERNMENT_SITE_KINDS = new Set(["municipality_home", "prefecture_home", "election_commission", "assembly", "mayor", "governor"]);
const PREFECTURAL_ASSEMBLY_OFFICIAL_LINK_KINDS = new Set([
  "election_hub",
  "election_commission",
  "assembly_home",
  "member_roster",
  "districts",
  "recent_regular_election",
  "candidate_bulletin_archive",
]);

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PREF_CODE = /^\d{2}$/;
const MUNICIPALITY_CODE = /^\d{5}$/;
const POSTAL_CODE = /^\d{7}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const RFC_3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const errors = [];

function pushError(filePath, message) {
  const relativePath = path.relative(repoRoot, filePath) || filePath;
  errors.push(`${relativePath}: ${message}`);
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidUrl(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidDate(value) {
  if (!ISO_DATE.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

function isValidDateTime(value) {
  if (!RFC_3339.test(value)) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");

  try {
    return JSON.parse(raw);
  } catch (error) {
    pushError(filePath, `JSON parse error: ${error.message}`);
    return null;
  }
}

function validateCollectionRoot(data, filePath, extraKeyName = null) {
  if (!isPlainObject(data)) {
    pushError(filePath, "root must be an object");
    return false;
  }

  if (data.schema_version !== 1) {
    pushError(filePath, "schema_version must be 1");
  }

  if (!isValidDateTime(data.generated_at)) {
    pushError(filePath, "generated_at must be RFC 3339");
  }

  if (!Array.isArray(data.records)) {
    pushError(filePath, "records must be an array");
    return false;
  }

  if (extraKeyName !== null && !isNonEmptyString(data[extraKeyName])) {
    pushError(filePath, `${extraKeyName} must be a non-empty string`);
  }

  return true;
}

function validateVerification(verification, filePath, label) {
  if (!isPlainObject(verification)) {
    pushError(filePath, `${label}.verification must be an object`);
    return;
  }

  if (!isValidUrl(verification.source_url)) {
    pushError(filePath, `${label}.verification.source_url must be an absolute URL`);
  }

  if (!SOURCE_TYPES.has(verification.source_type)) {
    pushError(filePath, `${label}.verification.source_type is invalid`);
  }

  if (!isValidDateTime(verification.confirmed_at)) {
    pushError(filePath, `${label}.verification.confirmed_at must be RFC 3339`);
  }

  if (!isValidDateTime(verification.last_checked_at)) {
    pushError(filePath, `${label}.verification.last_checked_at must be RFC 3339`);
  }

  if (!VERIFICATION_STATUSES.has(verification.status)) {
    pushError(filePath, `${label}.verification.status is invalid`);
  }

  if (!(verification.note === null || typeof verification.note === "string")) {
    pushError(filePath, `${label}.verification.note must be string or null`);
  }

  if (verification.source_type === "manual_summary" && verification.status === "verified") {
    pushError(filePath, `${label}.verification.source_type=manual_summary cannot be verified`);
  }
}

function validateElectionPageStatus(pageStatus, filePath, label) {
  if (pageStatus === null) {
    return;
  }

  if (!isPlainObject(pageStatus)) {
    pushError(filePath, `${label}.page_status must be an object`);
    return;
  }

  if (!isNonEmptyString(pageStatus.label)) {
    pushError(filePath, `${label}.page_status.label must be a non-empty string`);
  }

  if (!isNonEmptyString(pageStatus.summary)) {
    pushError(filePath, `${label}.page_status.summary must be a non-empty string`);
  }

  if (!PAGE_STATUS_OFFICIAL_CANDIDATE_LIST_STATUSES.has(pageStatus.official_candidate_list_status)) {
    pushError(filePath, `${label}.page_status.official_candidate_list_status is invalid`);
  }

  validateElectionPageStatusOfficialCandidateList(
    pageStatus.official_candidate_list,
    pageStatus.official_candidate_list_status,
    filePath,
    label,
  );

  if (!isNonEmptyString(pageStatus.transition_note)) {
    pushError(filePath, `${label}.page_status.transition_note must be a non-empty string`);
  }

  if (!isValidDate(pageStatus.as_of ?? "")) {
    pushError(filePath, `${label}.page_status.as_of must be YYYY-MM-DD`);
  }
}

function validateElectionPageStatusOfficialCandidateList(officialCandidateList, status, filePath, label) {
  const fieldLabel = `${label}.page_status.official_candidate_list`;
  const isPublished = status === "published";

  if (officialCandidateList === undefined || officialCandidateList === null) {
    if (isPublished) {
      pushError(filePath, `${fieldLabel} must be an object when official_candidate_list_status=published`);
    }
    return;
  }

  if (!isPlainObject(officialCandidateList)) {
    pushError(filePath, `${fieldLabel} must be an object or null`);
    return;
  }

  if (!isNonEmptyString(officialCandidateList.label)) {
    pushError(filePath, `${fieldLabel}.label must be a non-empty string`);
  }

  if (!isValidUrl(officialCandidateList.url)) {
    pushError(filePath, `${fieldLabel}.url must be an absolute URL`);
  }

  if (!(officialCandidateList.summary === undefined || officialCandidateList.summary === null || typeof officialCandidateList.summary === "string")) {
    pushError(filePath, `${fieldLabel}.summary must be string or null when present`);
  }

  if (!(officialCandidateList.source_name === undefined || officialCandidateList.source_name === null || typeof officialCandidateList.source_name === "string")) {
    pushError(filePath, `${fieldLabel}.source_name must be string or null when present`);
  }

  if (isPublished && !isNonEmptyString(officialCandidateList.source_name)) {
    pushError(filePath, `${fieldLabel}.source_name must be a non-empty string when official_candidate_list_status=published`);
  }

  if (!(officialCandidateList.published_at === undefined || officialCandidateList.published_at === null || isValidDate(officialCandidateList.published_at))) {
    pushError(filePath, `${fieldLabel}.published_at must be YYYY-MM-DD or null when present`);
  }

  if (!(officialCandidateList.last_checked_at === undefined || officialCandidateList.last_checked_at === null || isValidDateTime(officialCandidateList.last_checked_at))) {
    pushError(filePath, `${fieldLabel}.last_checked_at must be RFC 3339 or null when present`);
  }

  if (isPublished && !isValidDateTime(officialCandidateList.last_checked_at ?? "")) {
    pushError(filePath, `${fieldLabel}.last_checked_at must be RFC 3339 when official_candidate_list_status=published`);
  }
}

function validateElectionPageUpdates(pageUpdates, filePath, label) {
  if (!Array.isArray(pageUpdates)) {
    pushError(filePath, `${label}.page_updates must be an array`);
    return;
  }

  for (let updateIndex = 0; updateIndex < pageUpdates.length; updateIndex += 1) {
    const update = pageUpdates[updateIndex];
    const updateLabel = `${label}.page_updates[${updateIndex}]`;

    if (!isPlainObject(update)) {
      pushError(filePath, `${updateLabel} must be an object`);
      continue;
    }

    if (!isValidDate(update.date ?? "")) {
      pushError(filePath, `${updateLabel}.date must be YYYY-MM-DD`);
    }

    if (!isNonEmptyString(update.title)) {
      pushError(filePath, `${updateLabel}.title must be a non-empty string`);
    }

    if (!isNonEmptyString(update.summary)) {
      pushError(filePath, `${updateLabel}.summary must be a non-empty string`);
    }
  }
}

async function listJsonFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(dirPath, entry.name))
    .sort();
}

async function listJsonFilesIfExists(dirPath) {
  try {
    return await listJsonFiles(dirPath);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

const regionsPath = path.join(dataRoot, "regions.json");
const electionsPath = path.join(dataRoot, "elections.json");
const localGovernmentSitesPath = path.join(dataRoot, "local_government_sites.json");
const prefecturalAssemblyTermsPath = path.join(dataRoot, "prefectural_assembly_terms.json");
const prefecturalAssemblyDistrictsPath = path.join(dataRoot, "prefectural_assembly_districts.json");
const prefecturalAssemblyOfficialLinksPath = path.join(dataRoot, "prefectural_assembly_official_links.json");
const postalDir = path.join(dataRoot, "postal_code_mappings");
const resourceDir = path.join(dataRoot, "election_resource_links");
const candidateSignalDir = path.join(dataRoot, "candidate_signals");
const candidateEndorsementDir = path.join(dataRoot, "candidate_endorsements");
const candidateProfileDir = path.join(dataRoot, "candidate_profiles");

const [
  regionsData,
  electionsData,
  localGovernmentSitesData,
  prefecturalAssemblyTermsData,
  prefecturalAssemblyDistrictsData,
  prefecturalAssemblyOfficialLinksData,
  postalFiles,
  resourceFiles,
  candidateSignalFiles,
  candidateEndorsementFiles,
  candidateProfileFiles,
] = await Promise.all([
  readJson(regionsPath),
  readJson(electionsPath),
  readJson(localGovernmentSitesPath),
  readJson(prefecturalAssemblyTermsPath),
  readJson(prefecturalAssemblyDistrictsPath),
  readJson(prefecturalAssemblyOfficialLinksPath),
  listJsonFiles(postalDir),
  listJsonFiles(resourceDir),
  listJsonFilesIfExists(candidateSignalDir),
  listJsonFilesIfExists(candidateEndorsementDir),
  listJsonFilesIfExists(candidateProfileDir),
]);

const postalDataList = await Promise.all(postalFiles.map(async (filePath) => [filePath, await readJson(filePath)]));
const resourceDataList = await Promise.all(resourceFiles.map(async (filePath) => [filePath, await readJson(filePath)]));
const candidateSignalDataList = await Promise.all(candidateSignalFiles.map(async (filePath) => [filePath, await readJson(filePath)]));
const candidateEndorsementDataList = await Promise.all(candidateEndorsementFiles.map(async (filePath) => [filePath, await readJson(filePath)]));
const candidateProfileDataList = await Promise.all(candidateProfileFiles.map(async (filePath) => [filePath, await readJson(filePath)]));

if (regionsData) {
  validateCollectionRoot(regionsData, regionsPath);
}

if (electionsData) {
  validateCollectionRoot(electionsData, electionsPath);
}

if (localGovernmentSitesData) {
  validateCollectionRoot(localGovernmentSitesData, localGovernmentSitesPath);
}

if (prefecturalAssemblyTermsData) {
  validateCollectionRoot(prefecturalAssemblyTermsData, prefecturalAssemblyTermsPath);
}

if (prefecturalAssemblyDistrictsData) {
  validateCollectionRoot(prefecturalAssemblyDistrictsData, prefecturalAssemblyDistrictsPath);
}

if (prefecturalAssemblyOfficialLinksData) {
  validateCollectionRoot(prefecturalAssemblyOfficialLinksData, prefecturalAssemblyOfficialLinksPath);
}

for (const [filePath, data] of postalDataList) {
  if (data) {
    validateCollectionRoot(data, filePath, "prefix");
  }
}

for (const [filePath, data] of resourceDataList) {
  if (data) {
    validateCollectionRoot(data, filePath, "election_id");
  }
}

for (const [filePath, data] of candidateSignalDataList) {
  if (data) {
    validateCollectionRoot(data, filePath, "election_id");
  }
}

for (const [filePath, data] of candidateEndorsementDataList) {
  if (data) {
    validateCollectionRoot(data, filePath, "election_id");
  }
}

for (const [filePath, data] of candidateProfileDataList) {
  if (data) {
    validateCollectionRoot(data, filePath, "election_id");
  }
}

const regionIds = new Set();
const prefectureSlugSet = new Set();
const municipalitySlugSet = new Set();
const regionIdToRecord = new Map();

if (regionsData?.records) {
  for (let index = 0; index < regionsData.records.length; index += 1) {
    const record = regionsData.records[index];
    const label = `records[${index}]`;

    if (!isPlainObject(record)) {
      pushError(regionsPath, `${label} must be an object`);
      continue;
    }

    if (!isNonEmptyString(record.id) || !KEBAB_CASE.test(record.id)) {
      pushError(regionsPath, `${label}.id must be kebab-case`);
    } else if (regionIds.has(record.id)) {
      pushError(regionsPath, `${label}.id must be unique`);
    } else {
      regionIds.add(record.id);
      regionIdToRecord.set(record.id, record);
    }

    if (!REGION_LEVELS.has(record.level)) {
      pushError(regionsPath, `${label}.level is invalid`);
    }

    if (!PREF_CODE.test(record.pref_code ?? "")) {
      pushError(regionsPath, `${label}.pref_code must be a 2-digit string`);
    }

    if (!isNonEmptyString(record.name)) {
      pushError(regionsPath, `${label}.name must be a non-empty string`);
    }

    if (!isNonEmptyString(record.slug) || !KEBAB_CASE.test(record.slug)) {
      pushError(regionsPath, `${label}.slug must be kebab-case`);
    }

    if (!isNonEmptyString(record.display_name)) {
      pushError(regionsPath, `${label}.display_name must be a non-empty string`);
    }

    validateVerification(record.verification, regionsPath, label);

    if (record.level === "prefecture") {
      if (record.id !== `pref-${record.pref_code}`) {
        pushError(regionsPath, `${label}.id must match pref_code for prefecture`);
      }

      if (record.municipality_code !== null) {
        pushError(regionsPath, `${label}.municipality_code must be null for prefecture`);
      }

      if (record.parent_region_id !== null) {
        pushError(regionsPath, `${label}.parent_region_id must be null for prefecture`);
      }

      if (isNonEmptyString(record.slug)) {
        if (prefectureSlugSet.has(record.slug)) {
          pushError(regionsPath, `${label}.slug must be unique among prefectures`);
        } else {
          prefectureSlugSet.add(record.slug);
        }
      }
    }

    if (record.level === "municipality") {
      if (record.id !== `mun-${record.municipality_code}`) {
        pushError(regionsPath, `${label}.id must match municipality_code for municipality`);
      }

      if (!MUNICIPALITY_CODE.test(record.municipality_code ?? "")) {
        pushError(regionsPath, `${label}.municipality_code must be a 5-digit string for municipality`);
      }

      if ((record.municipality_code ?? "").slice(0, 2) !== record.pref_code) {
        pushError(regionsPath, `${label}.pref_code must match municipality_code prefix`);
      }

      if (!isNonEmptyString(record.parent_region_id)) {
        pushError(regionsPath, `${label}.parent_region_id is required for municipality`);
      }

      if (isNonEmptyString(record.slug) && isNonEmptyString(record.parent_region_id)) {
        const slugKey = `${record.parent_region_id}|${record.slug}`;
        if (municipalitySlugSet.has(slugKey)) {
          pushError(regionsPath, `${label}.slug must be unique within the same parent_region_id`);
        } else {
          municipalitySlugSet.add(slugKey);
        }
      }
    }
  }

  for (let index = 0; index < regionsData.records.length; index += 1) {
    const record = regionsData.records[index];
    const label = `records[${index}]`;

    if (record.level === "municipality" && isNonEmptyString(record.parent_region_id)) {
      const parent = regionIdToRecord.get(record.parent_region_id);
      if (!parent) {
        pushError(regionsPath, `${label}.parent_region_id must reference an existing region`);
      } else if (parent.level !== "prefecture") {
        pushError(regionsPath, `${label}.parent_region_id must reference a prefecture`);
      }
    }
  }
}

const electionIds = new Set();
const electionSlugs = new Set();
const electionIdToRecord = new Map();

if (electionsData?.records) {
  for (let index = 0; index < electionsData.records.length; index += 1) {
    const record = electionsData.records[index];
    const label = `records[${index}]`;

    if (!isPlainObject(record)) {
      pushError(electionsPath, `${label} must be an object`);
      continue;
    }

    if (!isNonEmptyString(record.id) || !KEBAB_CASE.test(record.id) || !record.id.startsWith("el-")) {
      pushError(electionsPath, `${label}.id must be kebab-case and start with el-`);
    } else if (electionIds.has(record.id)) {
      pushError(electionsPath, `${label}.id must be unique`);
    } else {
      electionIds.add(record.id);
      electionIdToRecord.set(record.id, record);
    }

    if (!isNonEmptyString(record.slug) || !KEBAB_CASE.test(record.slug)) {
      pushError(electionsPath, `${label}.slug must be kebab-case`);
    } else if (electionSlugs.has(record.slug)) {
      pushError(electionsPath, `${label}.slug must be unique`);
    } else {
      electionSlugs.add(record.slug);
    }

    if (!isNonEmptyString(record.name)) {
      pushError(electionsPath, `${label}.name must be a non-empty string`);
    }

    if (!ELECTION_TYPES.has(record.type)) {
      pushError(electionsPath, `${label}.type is invalid`);
    }

    if (!(record.subtype === null || isNonEmptyString(record.subtype))) {
      pushError(electionsPath, `${label}.subtype must be string or null`);
    }

    if (!PHASES.has(record.phase)) {
      pushError(electionsPath, `${label}.phase is invalid`);
    }

    if (!isValidDate(record.vote_date ?? "")) {
      pushError(electionsPath, `${label}.vote_date must be YYYY-MM-DD`);
    }

    if (!(record.notice_date === null || isValidDate(record.notice_date))) {
      pushError(electionsPath, `${label}.notice_date must be YYYY-MM-DD or null`);
    }

    if (isValidDate(record.vote_date ?? "") && isValidDate(record.notice_date ?? "") && record.notice_date > record.vote_date) {
      pushError(electionsPath, `${label}.notice_date must not be after vote_date`);
    }

    if (!(record.description === null || typeof record.description === "string")) {
      pushError(electionsPath, `${label}.description must be string or null`);
    }

    if (record.page_status !== undefined) {
      validateElectionPageStatus(record.page_status, electionsPath, label);
    }

    if (record.page_updates !== undefined) {
      validateElectionPageUpdates(record.page_updates, electionsPath, label);
    }

    if (!SCOPE_TYPES.has(record.scope_type)) {
      pushError(electionsPath, `${label}.scope_type is invalid`);
    }

    validateVerification(record.verification, electionsPath, label);

    if (record.type === "national") {
      if (record.scope_type !== "all") {
        pushError(electionsPath, `${label}.scope_type must be all for national elections`);
      }

      if (record.primary_region_id !== null) {
        pushError(electionsPath, `${label}.primary_region_id must be null for national elections`);
      }
    } else if (!isNonEmptyString(record.primary_region_id)) {
      pushError(electionsPath, `${label}.primary_region_id is required for local elections`);
    }

    if (record.scope_type === "multi_region") {
      if (!Array.isArray(record.included_region_ids) || record.included_region_ids.length < 2) {
        pushError(electionsPath, `${label}.included_region_ids must contain at least 2 regions for multi_region`);
      }
    } else if (record.included_region_ids !== null) {
      pushError(electionsPath, `${label}.included_region_ids must be null unless scope_type is multi_region`);
    }
  }

  for (let index = 0; index < electionsData.records.length; index += 1) {
    const record = electionsData.records[index];
    const label = `records[${index}]`;

    if (isNonEmptyString(record.primary_region_id) && !regionIdToRecord.has(record.primary_region_id)) {
      pushError(electionsPath, `${label}.primary_region_id must reference an existing region`);
    }

    if (Array.isArray(record.included_region_ids)) {
      for (let regionIndex = 0; regionIndex < record.included_region_ids.length; regionIndex += 1) {
        const regionId = record.included_region_ids[regionIndex];
        if (!regionIdToRecord.has(regionId)) {
          pushError(electionsPath, `${label}.included_region_ids[${regionIndex}] must reference an existing region`);
        }
      }
    }
  }
}

const localGovernmentSiteIds = new Set();
const localGovernmentSiteKeys = new Set();
let localGovernmentSiteRecordCount = 0;

if (localGovernmentSitesData?.records) {
  for (let index = 0; index < localGovernmentSitesData.records.length; index += 1) {
    const record = localGovernmentSitesData.records[index];
    const label = `records[${index}]`;

    if (!isPlainObject(record)) {
      pushError(localGovernmentSitesPath, `${label} must be an object`);
      continue;
    }

    localGovernmentSiteRecordCount += 1;

    if (!isNonEmptyString(record.id) || !KEBAB_CASE.test(record.id)) {
      pushError(localGovernmentSitesPath, `${label}.id must be kebab-case`);
    } else if (localGovernmentSiteIds.has(record.id)) {
      pushError(localGovernmentSitesPath, `${label}.id must be unique`);
    } else {
      localGovernmentSiteIds.add(record.id);
    }

    if (!isNonEmptyString(record.region_id)) {
      pushError(localGovernmentSitesPath, `${label}.region_id must be a non-empty string`);
    } else if (!regionIdToRecord.has(record.region_id)) {
      pushError(localGovernmentSitesPath, `${label}.region_id must reference an existing region`);
    }

    if (!LOCAL_GOVERNMENT_SITE_KINDS.has(record.site_kind)) {
      pushError(localGovernmentSitesPath, `${label}.site_kind is invalid`);
    }

    if (!isNonEmptyString(record.label)) {
      pushError(localGovernmentSitesPath, `${label}.label must be a non-empty string`);
    }

    if (!isValidUrl(record.url)) {
      pushError(localGovernmentSitesPath, `${label}.url must be an absolute URL`);
    }

    validateVerification(record.verification, localGovernmentSitesPath, label);

    if (!(record.note === null || typeof record.note === "string")) {
      pushError(localGovernmentSitesPath, `${label}.note must be string or null`);
    }

    if (isNonEmptyString(record.region_id) && isNonEmptyString(record.site_kind)) {
      const pairKey = `${record.region_id}|${record.site_kind}`;
      if (localGovernmentSiteKeys.has(pairKey)) {
        pushError(localGovernmentSitesPath, `${label} duplicates region_id + site_kind`);
      } else {
        localGovernmentSiteKeys.add(pairKey);
      }
    }

    const region = isNonEmptyString(record.region_id) ? regionIdToRecord.get(record.region_id) : null;
    if (region) {
      if (record.site_kind === "municipality_home" && region.level !== "municipality") {
        pushError(localGovernmentSitesPath, `${label}.region_id must reference a municipality for municipality_home`);
      }

      if (record.site_kind === "prefecture_home" && region.level !== "prefecture") {
        pushError(localGovernmentSitesPath, `${label}.region_id must reference a prefecture for prefecture_home`);
      }

      if (record.site_kind === "mayor" && region.level !== "municipality") {
        pushError(localGovernmentSitesPath, `${label}.region_id must reference a municipality for mayor`);
      }

      if (record.site_kind === "governor" && region.level !== "prefecture") {
        pushError(localGovernmentSitesPath, `${label}.region_id must reference a prefecture for governor`);
      }
    }
  }
}

const prefecturalAssemblyTermIds = new Set();
const prefecturalAssemblyTermPrefCodes = new Set();
const prefecturalAssemblyTermByPrefCode = new Map();
let prefecturalAssemblyTermRecordCount = 0;

if (prefecturalAssemblyTermsData?.records) {
  if (!isPlainObject(prefecturalAssemblyTermsData.source)) {
    pushError(prefecturalAssemblyTermsPath, "source must be an object");
  } else {
    const source = prefecturalAssemblyTermsData.source;

    if (!isNonEmptyString(source.label)) {
      pushError(prefecturalAssemblyTermsPath, "source.label must be a non-empty string");
    }

    if (!isValidUrl(source.url)) {
      pushError(prefecturalAssemblyTermsPath, "source.url must be an absolute URL");
    }

    if (!SOURCE_TYPES.has(source.source_type)) {
      pushError(prefecturalAssemblyTermsPath, "source.source_type is invalid");
    }

    if (!isValidDateTime(source.retrieved_at ?? "")) {
      pushError(prefecturalAssemblyTermsPath, "source.retrieved_at must be RFC 3339");
    }

    if (!isNonEmptyString(source.snapshot_path)) {
      pushError(prefecturalAssemblyTermsPath, "source.snapshot_path must be a non-empty string");
    }
  }

  for (let index = 0; index < prefecturalAssemblyTermsData.records.length; index += 1) {
    const record = prefecturalAssemblyTermsData.records[index];
    const label = `records[${index}]`;

    if (!isPlainObject(record)) {
      pushError(prefecturalAssemblyTermsPath, `${label} must be an object`);
      continue;
    }

    prefecturalAssemblyTermRecordCount += 1;

    if (!isNonEmptyString(record.id) || !KEBAB_CASE.test(record.id)) {
      pushError(prefecturalAssemblyTermsPath, `${label}.id must be kebab-case`);
    } else if (prefecturalAssemblyTermIds.has(record.id)) {
      pushError(prefecturalAssemblyTermsPath, `${label}.id must be unique`);
    } else {
      prefecturalAssemblyTermIds.add(record.id);
    }

    if (!PREF_CODE.test(record.pref_code ?? "")) {
      pushError(prefecturalAssemblyTermsPath, `${label}.pref_code must be a 2-digit string`);
    } else if (prefecturalAssemblyTermPrefCodes.has(record.pref_code)) {
      pushError(prefecturalAssemblyTermsPath, `${label}.pref_code must be unique`);
    } else {
      prefecturalAssemblyTermPrefCodes.add(record.pref_code);
      prefecturalAssemblyTermByPrefCode.set(record.pref_code, record);
    }

    if (isNonEmptyString(record.id) && PREF_CODE.test(record.pref_code ?? "") && record.id !== `pref-assembly-term-${record.pref_code}`) {
      pushError(prefecturalAssemblyTermsPath, `${label}.id must match pref_code`);
    }

    if (!isNonEmptyString(record.prefecture_name)) {
      pushError(prefecturalAssemblyTermsPath, `${label}.prefecture_name must be a non-empty string`);
    }

    if (!isNonEmptyString(record.region_id)) {
      pushError(prefecturalAssemblyTermsPath, `${label}.region_id must be a non-empty string`);
    } else {
      const region = regionIdToRecord.get(record.region_id);

      if (!region) {
        pushError(prefecturalAssemblyTermsPath, `${label}.region_id must reference an existing region`);
      } else {
        if (region.level !== "prefecture") {
          pushError(prefecturalAssemblyTermsPath, `${label}.region_id must reference a prefecture`);
        }

        if (isNonEmptyString(record.pref_code) && region.pref_code !== record.pref_code) {
          pushError(prefecturalAssemblyTermsPath, `${label}.pref_code must match region.pref_code`);
        }

        if (isNonEmptyString(record.prefecture_name) && region.name !== record.prefecture_name) {
          pushError(prefecturalAssemblyTermsPath, `${label}.prefecture_name must match region.name`);
        }
      }
    }

    if (!isNonEmptyString(record.election_name)) {
      pushError(prefecturalAssemblyTermsPath, `${label}.election_name must be a non-empty string`);
    }

    if (!isValidDate(record.last_regular_election_vote_date ?? "")) {
      pushError(prefecturalAssemblyTermsPath, `${label}.last_regular_election_vote_date must be YYYY-MM-DD`);
    }

    if (!isValidDate(record.term_end ?? "")) {
      pushError(prefecturalAssemblyTermsPath, `${label}.term_end must be YYYY-MM-DD`);
    }

    if (isValidDate(record.last_regular_election_vote_date ?? "") && isValidDate(record.term_end ?? "") && record.last_regular_election_vote_date > record.term_end) {
      pushError(prefecturalAssemblyTermsPath, `${label}.last_regular_election_vote_date must not be after term_end`);
    }

    if (!Number.isInteger(record.district_count) || record.district_count < 1) {
      pushError(prefecturalAssemblyTermsPath, `${label}.district_count must be an integer >= 1`);
    }

    if (!Number.isInteger(record.seat_count) || record.seat_count < 1) {
      pushError(prefecturalAssemblyTermsPath, `${label}.seat_count must be an integer >= 1`);
    }

    for (const fieldName of ["turnout_percent", "previous_turnout_percent"]) {
      if (typeof record[fieldName] !== "number" || record[fieldName] < 0 || record[fieldName] > 100) {
        pushError(prefecturalAssemblyTermsPath, `${label}.${fieldName} must be a number from 0 to 100`);
      }
    }

    if (typeof record.unified_local_election_cycle !== "boolean") {
      pushError(prefecturalAssemblyTermsPath, `${label}.unified_local_election_cycle must be boolean`);
    }

    if (!(record.note === null || typeof record.note === "string")) {
      pushError(prefecturalAssemblyTermsPath, `${label}.note must be string or null`);
    }

    validateVerification(record.verification, prefecturalAssemblyTermsPath, label);
  }

  if (prefecturalAssemblyTermRecordCount !== 47) {
    pushError(prefecturalAssemblyTermsPath, "records must contain 47 prefectural assembly term records");
  }
}

const prefecturalAssemblyDistrictIds = new Set();
const prefecturalAssemblyDistrictKeys = new Set();
const prefecturalAssemblyDistrictStatsByPrefCode = new Map();
let prefecturalAssemblyDistrictRecordCount = 0;

if (prefecturalAssemblyDistrictsData?.records) {
  if (!isPlainObject(prefecturalAssemblyDistrictsData.coverage)) {
    pushError(prefecturalAssemblyDistrictsPath, "coverage must be an object");
  } else {
    const coverage = prefecturalAssemblyDistrictsData.coverage;

    if (!isNonEmptyString(coverage.status)) {
      pushError(prefecturalAssemblyDistrictsPath, "coverage.status must be a non-empty string");
    }

    for (const fieldName of ["prefecture_count", "district_count", "seat_count"]) {
      if (!Number.isInteger(coverage[fieldName]) || coverage[fieldName] < 0) {
        pushError(prefecturalAssemblyDistrictsPath, `coverage.${fieldName} must be an integer >= 0`);
      }
    }

    if (!(coverage.note === null || typeof coverage.note === "string")) {
      pushError(prefecturalAssemblyDistrictsPath, "coverage.note must be string or null");
    }
  }

  for (let index = 0; index < prefecturalAssemblyDistrictsData.records.length; index += 1) {
    const record = prefecturalAssemblyDistrictsData.records[index];
    const label = `records[${index}]`;

    if (!isPlainObject(record)) {
      pushError(prefecturalAssemblyDistrictsPath, `${label} must be an object`);
      continue;
    }

    prefecturalAssemblyDistrictRecordCount += 1;

    if (!isNonEmptyString(record.id) || !KEBAB_CASE.test(record.id)) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.id must be kebab-case`);
    } else if (prefecturalAssemblyDistrictIds.has(record.id)) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.id must be unique`);
    } else {
      prefecturalAssemblyDistrictIds.add(record.id);
    }

    if (!PREF_CODE.test(record.pref_code ?? "")) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.pref_code must be a 2-digit string`);
    }

    if (isNonEmptyString(record.id) && PREF_CODE.test(record.pref_code ?? "") && !record.id.startsWith(`pref-assembly-district-${record.pref_code}-`)) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.id must include pref_code`);
    }

    if (!isNonEmptyString(record.prefecture_name)) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.prefecture_name must be a non-empty string`);
    }

    if (!isNonEmptyString(record.region_id)) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.region_id must be a non-empty string`);
    } else {
      const region = regionIdToRecord.get(record.region_id);

      if (!region) {
        pushError(prefecturalAssemblyDistrictsPath, `${label}.region_id must reference an existing region`);
      } else {
        if (region.level !== "prefecture") {
          pushError(prefecturalAssemblyDistrictsPath, `${label}.region_id must reference a prefecture`);
        }

        if (isNonEmptyString(record.pref_code) && region.pref_code !== record.pref_code) {
          pushError(prefecturalAssemblyDistrictsPath, `${label}.pref_code must match region.pref_code`);
        }

        if (isNonEmptyString(record.prefecture_name) && region.name !== record.prefecture_name) {
          pushError(prefecturalAssemblyDistrictsPath, `${label}.prefecture_name must match region.name`);
        }
      }
    }

    if (!isNonEmptyString(record.district_name)) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.district_name must be a non-empty string`);
    }

    if (!(record.area_label === null || isNonEmptyString(record.area_label))) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.area_label must be string or null`);
    }

    if (!Number.isInteger(record.seat_count) || record.seat_count < 1) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.seat_count must be an integer >= 1`);
    }

    if (!Number.isInteger(record.display_order) || record.display_order < 1) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.display_order must be an integer >= 1`);
    }

    if (!isNonEmptyString(record.applies_to)) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.applies_to must be a non-empty string`);
    }

    if (!isNonEmptyString(record.source_snapshot_path)) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.source_snapshot_path must be a non-empty string`);
    }

    if (!(record.note === null || typeof record.note === "string")) {
      pushError(prefecturalAssemblyDistrictsPath, `${label}.note must be string or null`);
    }

    validateVerification(record.verification, prefecturalAssemblyDistrictsPath, label);

    if (isNonEmptyString(record.pref_code) && isNonEmptyString(record.district_name)) {
      const key = `${record.pref_code}|${record.district_name}`;
      if (prefecturalAssemblyDistrictKeys.has(key)) {
        pushError(prefecturalAssemblyDistrictsPath, `${label} duplicates pref_code + district_name`);
      } else {
        prefecturalAssemblyDistrictKeys.add(key);
      }
    }

    if (PREF_CODE.test(record.pref_code ?? "")) {
      const stats = prefecturalAssemblyDistrictStatsByPrefCode.get(record.pref_code) ?? { districtCount: 0, seatCount: 0 };
      stats.districtCount += 1;
      stats.seatCount += Number.isInteger(record.seat_count) ? record.seat_count : 0;
      prefecturalAssemblyDistrictStatsByPrefCode.set(record.pref_code, stats);
    }
  }

  if (isPlainObject(prefecturalAssemblyDistrictsData.coverage)) {
    const coverage = prefecturalAssemblyDistrictsData.coverage;
    if (coverage.prefecture_count !== prefecturalAssemblyDistrictStatsByPrefCode.size) {
      pushError(prefecturalAssemblyDistrictsPath, "coverage.prefecture_count must match covered prefectures");
    }

    if (coverage.district_count !== prefecturalAssemblyDistrictRecordCount) {
      pushError(prefecturalAssemblyDistrictsPath, "coverage.district_count must match records length");
    }

    const seatCount = [...prefecturalAssemblyDistrictStatsByPrefCode.values()].reduce((sum, stats) => sum + stats.seatCount, 0);
    if (coverage.seat_count !== seatCount) {
      pushError(prefecturalAssemblyDistrictsPath, "coverage.seat_count must match records seat_count total");
    }
  }

  for (const [prefCode, stats] of prefecturalAssemblyDistrictStatsByPrefCode) {
    const termRecord = prefecturalAssemblyTermByPrefCode.get(prefCode);
    if (!termRecord) {
      pushError(prefecturalAssemblyDistrictsPath, `pref_code ${prefCode} must exist in prefectural_assembly_terms`);
      continue;
    }

    if (stats.districtCount !== termRecord.district_count) {
      pushError(prefecturalAssemblyDistrictsPath, `pref_code ${prefCode} district_count must match prefectural_assembly_terms`);
    }

    if (stats.seatCount !== termRecord.seat_count) {
      pushError(prefecturalAssemblyDistrictsPath, `pref_code ${prefCode} seat_count must match prefectural_assembly_terms`);
    }
  }
}

const prefecturalAssemblyOfficialLinkIds = new Set();
const prefecturalAssemblyOfficialLinkKeys = new Set();
const prefecturalAssemblyOfficialLinkPrefs = new Set();
let prefecturalAssemblyOfficialLinkRecordCount = 0;

if (prefecturalAssemblyOfficialLinksData?.records) {
  if (!isPlainObject(prefecturalAssemblyOfficialLinksData.coverage)) {
    pushError(prefecturalAssemblyOfficialLinksPath, "coverage must be an object");
  } else {
    const coverage = prefecturalAssemblyOfficialLinksData.coverage;

    if (!isNonEmptyString(coverage.status)) {
      pushError(prefecturalAssemblyOfficialLinksPath, "coverage.status must be a non-empty string");
    }

    for (const fieldName of ["prefecture_count", "link_count"]) {
      if (!Number.isInteger(coverage[fieldName]) || coverage[fieldName] < 0) {
        pushError(prefecturalAssemblyOfficialLinksPath, `coverage.${fieldName} must be an integer >= 0`);
      }
    }

    if (!(coverage.note === null || typeof coverage.note === "string")) {
      pushError(prefecturalAssemblyOfficialLinksPath, "coverage.note must be string or null");
    }
  }

  for (let index = 0; index < prefecturalAssemblyOfficialLinksData.records.length; index += 1) {
    const record = prefecturalAssemblyOfficialLinksData.records[index];
    const label = `records[${index}]`;

    if (!isPlainObject(record)) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label} must be an object`);
      continue;
    }

    prefecturalAssemblyOfficialLinkRecordCount += 1;

    if (!isNonEmptyString(record.id) || !KEBAB_CASE.test(record.id)) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.id must be kebab-case`);
    } else if (prefecturalAssemblyOfficialLinkIds.has(record.id)) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.id must be unique`);
    } else {
      prefecturalAssemblyOfficialLinkIds.add(record.id);
    }

    if (!PREF_CODE.test(record.pref_code ?? "")) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.pref_code must be a 2-digit string`);
    } else {
      prefecturalAssemblyOfficialLinkPrefs.add(record.pref_code);

      if (!prefecturalAssemblyTermByPrefCode.has(record.pref_code)) {
        pushError(prefecturalAssemblyOfficialLinksPath, `${label}.pref_code must exist in prefectural_assembly_terms`);
      }
    }

    if (isNonEmptyString(record.id) && PREF_CODE.test(record.pref_code ?? "") && !record.id.startsWith(`pref-assembly-link-${record.pref_code}-`)) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.id must include pref_code`);
    }

    if (!isNonEmptyString(record.prefecture_name)) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.prefecture_name must be a non-empty string`);
    }

    if (!isNonEmptyString(record.region_id)) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.region_id must be a non-empty string`);
    } else {
      const region = regionIdToRecord.get(record.region_id);

      if (!region) {
        pushError(prefecturalAssemblyOfficialLinksPath, `${label}.region_id must reference an existing region`);
      } else {
        if (region.level !== "prefecture") {
          pushError(prefecturalAssemblyOfficialLinksPath, `${label}.region_id must reference a prefecture`);
        }

        if (isNonEmptyString(record.pref_code) && region.pref_code !== record.pref_code) {
          pushError(prefecturalAssemblyOfficialLinksPath, `${label}.pref_code must match region.pref_code`);
        }

        if (isNonEmptyString(record.prefecture_name) && region.name !== record.prefecture_name) {
          pushError(prefecturalAssemblyOfficialLinksPath, `${label}.prefecture_name must match region.name`);
        }
      }
    }

    if (!PREFECTURAL_ASSEMBLY_OFFICIAL_LINK_KINDS.has(record.link_kind)) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.link_kind is invalid`);
    }

    if (!isNonEmptyString(record.title)) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.title must be a non-empty string`);
    }

    if (!isValidUrl(record.url)) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.url must be an absolute URL`);
    }

    if (!isNonEmptyString(record.summary)) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.summary must be a non-empty string`);
    }

    if (!Number.isInteger(record.display_order) || record.display_order < 1) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.display_order must be an integer >= 1`);
    }

    if (record.is_official !== true) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.is_official must be true`);
    }

    if (!isValidDateTime(record.last_checked_at)) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.last_checked_at must be RFC 3339`);
    }

    validateVerification(record.verification, prefecturalAssemblyOfficialLinksPath, label);

    if (isValidUrl(record.url) && isValidUrl(record.verification?.source_url) && record.url !== record.verification.source_url) {
      pushError(prefecturalAssemblyOfficialLinksPath, `${label}.verification.source_url must match url`);
    }

    if (isNonEmptyString(record.pref_code) && isNonEmptyString(record.link_kind)) {
      const key = `${record.pref_code}|${record.link_kind}`;
      if (prefecturalAssemblyOfficialLinkKeys.has(key)) {
        pushError(prefecturalAssemblyOfficialLinksPath, `${label} duplicates pref_code + link_kind`);
      } else {
        prefecturalAssemblyOfficialLinkKeys.add(key);
      }
    }
  }

  if (isPlainObject(prefecturalAssemblyOfficialLinksData.coverage)) {
    const coverage = prefecturalAssemblyOfficialLinksData.coverage;

    if (coverage.prefecture_count !== prefecturalAssemblyOfficialLinkPrefs.size) {
      pushError(prefecturalAssemblyOfficialLinksPath, "coverage.prefecture_count must match covered prefectures");
    }

    if (coverage.link_count !== prefecturalAssemblyOfficialLinkRecordCount) {
      pushError(prefecturalAssemblyOfficialLinksPath, "coverage.link_count must match records length");
    }
  }
}

const postalPairSet = new Set();
let postalRecordCount = 0;

for (const [filePath, data] of postalDataList) {
  if (!data?.records) {
    continue;
  }

  const prefix = data.prefix;
  const expectedPrefix = path.basename(filePath, ".json");

  if (prefix !== expectedPrefix) {
    pushError(filePath, "prefix must match the file name");
  }

  for (let index = 0; index < data.records.length; index += 1) {
    const record = data.records[index];
    const label = `records[${index}]`;

    if (!isPlainObject(record)) {
      pushError(filePath, `${label} must be an object`);
      continue;
    }

    postalRecordCount += 1;

    if (!POSTAL_CODE.test(record.postal_code ?? "")) {
      pushError(filePath, `${label}.postal_code must be a 7-digit string`);
    }

    if ((record.postal_code ?? "").slice(0, 3) !== prefix) {
      pushError(filePath, `${label}.postal_code prefix must match file prefix`);
    }

    if (!isNonEmptyString(record.region_id)) {
      pushError(filePath, `${label}.region_id must be a non-empty string`);
    } else if (!regionIdToRecord.has(record.region_id)) {
      pushError(filePath, `${label}.region_id must reference an existing region`);
    }

    if (!MATCH_KINDS.has(record.match_kind)) {
      pushError(filePath, `${label}.match_kind is invalid`);
    }

    if (!CONFIDENCE_LEVELS.has(record.confidence)) {
      pushError(filePath, `${label}.confidence is invalid`);
    }

    validateVerification(record.verification, filePath, label);

    if (!(record.note === null || typeof record.note === "string")) {
      pushError(filePath, `${label}.note must be string or null`);
    }

    if (isNonEmptyString(record.postal_code) && isNonEmptyString(record.region_id)) {
      const pairKey = `${record.postal_code}|${record.region_id}`;
      if (postalPairSet.has(pairKey)) {
        pushError(filePath, `${label} duplicates postal_code + region_id`);
      } else {
        postalPairSet.add(pairKey);
      }
    }
  }
}

const resourceIds = new Set();
let resourceRecordCount = 0;

for (const [filePath, data] of resourceDataList) {
  if (!data?.records) {
    continue;
  }

  const expectedElectionId = path.basename(filePath, ".json");

  if (data.election_id !== expectedElectionId) {
    pushError(filePath, "election_id must match the file name");
  }

  if (!electionIdToRecord.has(data.election_id)) {
    pushError(filePath, "file election_id must reference an existing election");
  }

  for (let index = 0; index < data.records.length; index += 1) {
    const record = data.records[index];
    const label = `records[${index}]`;

    if (!isPlainObject(record)) {
      pushError(filePath, `${label} must be an object`);
      continue;
    }

    resourceRecordCount += 1;

    if (!isNonEmptyString(record.id) || !KEBAB_CASE.test(record.id)) {
      pushError(filePath, `${label}.id must be kebab-case`);
    } else if (resourceIds.has(record.id)) {
      pushError(filePath, `${label}.id must be unique`);
    } else {
      resourceIds.add(record.id);
    }

    if (record.election_id !== data.election_id) {
      pushError(filePath, `${label}.election_id must match file election_id`);
    }

    if (!electionIdToRecord.has(record.election_id)) {
      pushError(filePath, `${label}.election_id must reference an existing election`);
    }

    if (!RESOURCE_KINDS.has(record.kind)) {
      pushError(filePath, `${label}.kind is invalid`);
    }

    if (!isNonEmptyString(record.title)) {
      pushError(filePath, `${label}.title must be a non-empty string`);
    }

    if (!isValidUrl(record.url)) {
      pushError(filePath, `${label}.url must be an absolute URL`);
    }

    if (!(record.summary === null || typeof record.summary === "string")) {
      pushError(filePath, `${label}.summary must be string or null`);
    }

    if (typeof record.is_official !== "boolean") {
      pushError(filePath, `${label}.is_official must be boolean`);
    } else if (record.is_official !== true) {
      pushError(filePath, `${label}.is_official must be true for publishable resource links`);
    }

    if (!Number.isInteger(record.display_order) || record.display_order < 1) {
      pushError(filePath, `${label}.display_order must be an integer >= 1`);
    }

    validateVerification(record.verification, filePath, label);

    if (record.verification?.status !== "verified") {
      pushError(filePath, `${label}.verification.status must be verified for publishable resource links`);
    }
  }
}

const candidateSignalIds = new Set();
let candidateSignalRecordCount = 0;

function validateCandidateEvidence(evidence, filePath, label) {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    pushError(filePath, `${label}.evidence must contain at least one source`);
    return;
  }

  for (let evidenceIndex = 0; evidenceIndex < evidence.length; evidenceIndex += 1) {
    const item = evidence[evidenceIndex];
    const evidenceLabel = `${label}.evidence[${evidenceIndex}]`;

    if (!isPlainObject(item)) {
      pushError(filePath, `${evidenceLabel} must be an object`);
      continue;
    }

    if (!isNonEmptyString(item.source_name)) {
      pushError(filePath, `${evidenceLabel}.source_name must be a non-empty string`);
    }

    if (!CANDIDATE_SIGNAL_SOURCE_TYPES.has(item.source_type)) {
      pushError(filePath, `${evidenceLabel}.source_type is invalid`);
    }

    if (!isNonEmptyString(item.title)) {
      pushError(filePath, `${evidenceLabel}.title must be a non-empty string`);
    }

    if (!isValidUrl(item.url)) {
      pushError(filePath, `${evidenceLabel}.url must be an absolute URL`);
    }

    if (!(item.published_at === null || isValidDate(item.published_at))) {
      pushError(filePath, `${evidenceLabel}.published_at must be YYYY-MM-DD or null`);
    }
  }
}

for (const [filePath, data] of candidateSignalDataList) {
  if (!data?.records) {
    continue;
  }

  const expectedElectionId = path.basename(filePath, ".json");

  if (data.election_id !== expectedElectionId) {
    pushError(filePath, "election_id must match the file name");
  }

  if (!electionIdToRecord.has(data.election_id)) {
    pushError(filePath, "file election_id must reference an existing election");
  }

  for (let index = 0; index < data.records.length; index += 1) {
    const record = data.records[index];
    const label = `records[${index}]`;

    if (!isPlainObject(record)) {
      pushError(filePath, `${label} must be an object`);
      continue;
    }

    candidateSignalRecordCount += 1;

    if (!isNonEmptyString(record.id) || !KEBAB_CASE.test(record.id)) {
      pushError(filePath, `${label}.id must be kebab-case`);
    } else if (candidateSignalIds.has(record.id)) {
      pushError(filePath, `${label}.id must be unique`);
    } else {
      candidateSignalIds.add(record.id);
    }

    if (record.election_id !== data.election_id) {
      pushError(filePath, `${label}.election_id must match file election_id`);
    }

    if (!electionIdToRecord.has(record.election_id)) {
      pushError(filePath, `${label}.election_id must reference an existing election`);
    }

    if (!isNonEmptyString(record.person_name)) {
      pushError(filePath, `${label}.person_name must be a non-empty string`);
    }

    if (!isNonEmptyString(record.person_slug) || !KEBAB_CASE.test(record.person_slug)) {
      pushError(filePath, `${label}.person_slug must be kebab-case`);
    }

    if (!CANDIDATE_SIGNAL_STATUSES.has(record.status)) {
      pushError(filePath, `${label}.status is invalid`);
    }

    if (!CANDIDATE_SIGNAL_INCUMBENCIES.has(record.incumbency)) {
      pushError(filePath, `${label}.incumbency is invalid`);
    }

    if (!isNonEmptyString(record.summary)) {
      pushError(filePath, `${label}.summary must be a non-empty string`);
    }

    if (!CONFIDENCE_LEVELS.has(record.confidence)) {
      pushError(filePath, `${label}.confidence is invalid`);
    }

    if (!Number.isInteger(record.display_order) || record.display_order < 1) {
      pushError(filePath, `${label}.display_order must be an integer >= 1`);
    }

    if (!isValidDateTime(record.last_checked_at)) {
      pushError(filePath, `${label}.last_checked_at must be RFC 3339`);
    }

    if (!(record.status_reason === undefined || record.status_reason === null || typeof record.status_reason === "string")) {
      pushError(filePath, `${label}.status_reason must be string or null when present`);
    }

    if (!(record.latest_event_at === undefined || record.latest_event_at === null || isValidDate(record.latest_event_at))) {
      pushError(filePath, `${label}.latest_event_at must be YYYY-MM-DD or null when present`);
    }

    if (record.events !== undefined) {
      if (!Array.isArray(record.events)) {
        pushError(filePath, `${label}.events must be an array when present`);
      } else {
        for (let eventIndex = 0; eventIndex < record.events.length; eventIndex += 1) {
          const event = record.events[eventIndex];
          const eventLabel = `${label}.events[${eventIndex}]`;

          if (!isPlainObject(event)) {
            pushError(filePath, `${eventLabel} must be an object`);
            continue;
          }

          if (!isValidDate(event.event_date ?? "")) {
            pushError(filePath, `${eventLabel}.event_date must be YYYY-MM-DD`);
          }

          if (!CANDIDATE_EVENT_TYPES.has(event.event_type)) {
            pushError(filePath, `${eventLabel}.event_type is invalid`);
          }

          if (!isNonEmptyString(event.headline)) {
            pushError(filePath, `${eventLabel}.headline must be a non-empty string`);
          }

          if (!(event.summary === null || typeof event.summary === "string")) {
            pushError(filePath, `${eventLabel}.summary must be string or null`);
          }

          if (!Array.isArray(event.source_refs)) {
            pushError(filePath, `${eventLabel}.source_refs must be an array`);
          } else {
            for (let sourceRefIndex = 0; sourceRefIndex < event.source_refs.length; sourceRefIndex += 1) {
              if (!isNonEmptyString(event.source_refs[sourceRefIndex])) {
                pushError(filePath, `${eventLabel}.source_refs[${sourceRefIndex}] must be a non-empty string`);
              }
            }
          }
        }
      }
    }

    validateCandidateEvidence(record.evidence, filePath, label);
  }
}

const candidateEndorsementIds = new Set();
let candidateEndorsementRecordCount = 0;

for (const [filePath, data] of candidateEndorsementDataList) {
  if (!data?.records) {
    continue;
  }

  const expectedElectionId = path.basename(filePath, ".json");

  if (data.election_id !== expectedElectionId) {
    pushError(filePath, "election_id must match the file name");
  }

  if (!electionIdToRecord.has(data.election_id)) {
    pushError(filePath, "file election_id must reference an existing election");
  }

  for (let index = 0; index < data.records.length; index += 1) {
    const record = data.records[index];
    const label = `records[${index}]`;

    if (!isPlainObject(record)) {
      pushError(filePath, `${label} must be an object`);
      continue;
    }

    candidateEndorsementRecordCount += 1;

    if (!isNonEmptyString(record.id) || !KEBAB_CASE.test(record.id)) {
      pushError(filePath, `${label}.id must be kebab-case`);
    } else if (candidateEndorsementIds.has(record.id)) {
      pushError(filePath, `${label}.id must be unique`);
    } else {
      candidateEndorsementIds.add(record.id);
    }

    if (record.election_id !== data.election_id) {
      pushError(filePath, `${label}.election_id must match file election_id`);
    }

    if (!electionIdToRecord.has(record.election_id)) {
      pushError(filePath, `${label}.election_id must reference an existing election`);
    }

    if (!isNonEmptyString(record.person_name)) {
      pushError(filePath, `${label}.person_name must be a non-empty string`);
    }

    if (!isNonEmptyString(record.person_slug) || !KEBAB_CASE.test(record.person_slug)) {
      pushError(filePath, `${label}.person_slug must be kebab-case`);
    }

    if (!isNonEmptyString(record.endorser_name)) {
      pushError(filePath, `${label}.endorser_name must be a non-empty string`);
    }

    if (!CANDIDATE_ENDORSEMENT_RELATION_TYPES.has(record.relation_type)) {
      pushError(filePath, `${label}.relation_type is invalid`);
    }

    if (!(record.summary === null || typeof record.summary === "string")) {
      pushError(filePath, `${label}.summary must be string or null`);
    }

    if (!CONFIDENCE_LEVELS.has(record.confidence)) {
      pushError(filePath, `${label}.confidence is invalid`);
    }

    if (!Number.isInteger(record.display_order) || record.display_order < 1) {
      pushError(filePath, `${label}.display_order must be an integer >= 1`);
    }

    if (!isValidDateTime(record.last_checked_at)) {
      pushError(filePath, `${label}.last_checked_at must be RFC 3339`);
    }

    validateCandidateEvidence(record.evidence, filePath, label);
  }
}

const candidateProfileIds = new Set();
let candidateProfileRecordCount = 0;

function validateCandidateProfileLinks(collection, filePath, label, fieldName) {
  if (!Array.isArray(collection)) {
    pushError(filePath, `${label}.${fieldName} must be an array`);
    return;
  }

  for (let itemIndex = 0; itemIndex < collection.length; itemIndex += 1) {
    const item = collection[itemIndex];
    const itemLabel = `${label}.${fieldName}[${itemIndex}]`;

    if (!isPlainObject(item)) {
      pushError(filePath, `${itemLabel} must be an object`);
      continue;
    }

    if (!isNonEmptyString(item.label)) {
      pushError(filePath, `${itemLabel}.label must be a non-empty string`);
    }

    if (!isValidUrl(item.url)) {
      pushError(filePath, `${itemLabel}.url must be an absolute URL`);
    }

    if (fieldName === "official_socials" && !isNonEmptyString(item.platform)) {
      pushError(filePath, `${itemLabel}.platform must be a non-empty string`);
    }

    if (!(item.platform === undefined || item.platform === null || isNonEmptyString(item.platform))) {
      pushError(filePath, `${itemLabel}.platform must be string or null when present`);
    }

    if (!(item.summary === undefined || item.summary === null || typeof item.summary === "string")) {
      pushError(filePath, `${itemLabel}.summary must be string or null when present`);
    }

    if (!(item.source_name === undefined || item.source_name === null || isNonEmptyString(item.source_name))) {
      pushError(filePath, `${itemLabel}.source_name must be string or null when present`);
    }

    if (!(item.last_checked_at === undefined || item.last_checked_at === null || isValidDateTime(item.last_checked_at))) {
      pushError(filePath, `${itemLabel}.last_checked_at must be RFC 3339 or null when present`);
    }

    if (!(item.published_at === undefined || item.published_at === null || isValidDate(item.published_at))) {
      pushError(filePath, `${itemLabel}.published_at must be YYYY-MM-DD or null when present`);
    }
  }
}

function validateCandidateProfileFacts(collection, filePath, label, fieldName) {
  if (!Array.isArray(collection)) {
    pushError(filePath, `${label}.${fieldName} must be an array`);
    return;
  }

  for (let itemIndex = 0; itemIndex < collection.length; itemIndex += 1) {
    const item = collection[itemIndex];
    const itemLabel = `${label}.${fieldName}[${itemIndex}]`;

    if (!isPlainObject(item)) {
      pushError(filePath, `${itemLabel} must be an object`);
      continue;
    }

    if (!isNonEmptyString(item.title)) {
      pushError(filePath, `${itemLabel}.title must be a non-empty string`);
    }

    if (!(item.summary === undefined || item.summary === null || typeof item.summary === "string")) {
      pushError(filePath, `${itemLabel}.summary must be string or null when present`);
    }

    if (!(item.period === undefined || item.period === null || typeof item.period === "string")) {
      pushError(filePath, `${itemLabel}.period must be string or null when present`);
    }

    if (!(item.date === undefined || item.date === null || isValidDate(item.date))) {
      pushError(filePath, `${itemLabel}.date must be YYYY-MM-DD or null when present`);
    }

    if (!(item.source_name === undefined || item.source_name === null || isNonEmptyString(item.source_name))) {
      pushError(filePath, `${itemLabel}.source_name must be string or null when present`);
    }

    if (!(item.url === undefined || item.url === null || isValidUrl(item.url))) {
      pushError(filePath, `${itemLabel}.url must be an absolute URL or null when present`);
    }
  }
}

for (const [filePath, data] of candidateProfileDataList) {
  if (!data?.records) {
    continue;
  }

  const expectedElectionId = path.basename(filePath, ".json");

  if (data.election_id !== expectedElectionId) {
    pushError(filePath, "election_id must match the file name");
  }

  if (!electionIdToRecord.has(data.election_id)) {
    pushError(filePath, "file election_id must reference an existing election");
  }

  for (let index = 0; index < data.records.length; index += 1) {
    const record = data.records[index];
    const label = `records[${index}]`;

    if (!isPlainObject(record)) {
      pushError(filePath, `${label} must be an object`);
      continue;
    }

    candidateProfileRecordCount += 1;

    if (!isNonEmptyString(record.id) || !KEBAB_CASE.test(record.id)) {
      pushError(filePath, `${label}.id must be kebab-case`);
    } else if (candidateProfileIds.has(record.id)) {
      pushError(filePath, `${label}.id must be unique`);
    } else {
      candidateProfileIds.add(record.id);
    }

    if (record.election_id !== data.election_id) {
      pushError(filePath, `${label}.election_id must match file election_id`);
    }

    if (!electionIdToRecord.has(record.election_id)) {
      pushError(filePath, `${label}.election_id must reference an existing election`);
    }

    if (!isNonEmptyString(record.person_name)) {
      pushError(filePath, `${label}.person_name must be a non-empty string`);
    }

    if (!(record.person_kana === undefined || record.person_kana === null || isNonEmptyString(record.person_kana))) {
      pushError(filePath, `${label}.person_kana must be a non-empty string or null when present`);
    }

    if (!(record.birth_date === undefined || record.birth_date === null || isValidDate(record.birth_date))) {
      pushError(filePath, `${label}.birth_date must be YYYY-MM-DD or null when present`);
    }

    if (!(record.identity_labels === undefined || Array.isArray(record.identity_labels))) {
      pushError(filePath, `${label}.identity_labels must be an array when present`);
    } else if (Array.isArray(record.identity_labels)) {
      for (let itemIndex = 0; itemIndex < record.identity_labels.length; itemIndex += 1) {
        if (!isNonEmptyString(record.identity_labels[itemIndex])) {
          pushError(filePath, `${label}.identity_labels[${itemIndex}] must be a non-empty string`);
        }
      }
    }

    if (!isNonEmptyString(record.person_slug) || !KEBAB_CASE.test(record.person_slug)) {
      pushError(filePath, `${label}.person_slug must be kebab-case`);
    }

    if (!CANDIDATE_PROFILE_STATUSES.has(record.profile_status)) {
      pushError(filePath, `${label}.profile_status is invalid`);
    }

    if (!isNonEmptyString(record.summary)) {
      pushError(filePath, `${label}.summary must be a non-empty string`);
    }

    if (!(record.current_or_recent_role === undefined || record.current_or_recent_role === null || isNonEmptyString(record.current_or_recent_role))) {
      pushError(filePath, `${label}.current_or_recent_role must be a non-empty string or null when present`);
    }

    if (!(record.official_site_url === null || isValidUrl(record.official_site_url))) {
      pushError(filePath, `${label}.official_site_url must be a URL or null`);
    }

    if (!Array.isArray(record.official_sns)) {
      pushError(filePath, `${label}.official_sns must be an array`);
    } else {
      for (let snsIndex = 0; snsIndex < record.official_sns.length; snsIndex += 1) {
        const sns = record.official_sns[snsIndex];
        const snsLabel = `${label}.official_sns[${snsIndex}]`;

        if (!isPlainObject(sns)) {
          pushError(filePath, `${snsLabel} must be an object`);
          continue;
        }

        if (!isNonEmptyString(sns.platform)) {
          pushError(filePath, `${snsLabel}.platform must be a non-empty string`);
        }

        if (!isNonEmptyString(sns.label)) {
          pushError(filePath, `${snsLabel}.label must be a non-empty string`);
        }

        if (!isValidUrl(sns.url)) {
          pushError(filePath, `${snsLabel}.url must be an absolute URL`);
        }
      }
    }

    for (const [fieldName, collection] of [
      ["profile_pages", record.profile_pages],
      ["policy_links", record.policy_links],
    ]) {
      if (!Array.isArray(collection)) {
        pushError(filePath, `${label}.${fieldName} must be an array`);
        continue;
      }

      for (let itemIndex = 0; itemIndex < collection.length; itemIndex += 1) {
        const item = collection[itemIndex];
        const itemLabel = `${label}.${fieldName}[${itemIndex}]`;

        if (!isPlainObject(item)) {
          pushError(filePath, `${itemLabel} must be an object`);
          continue;
        }

        if (!isNonEmptyString(item.label)) {
          pushError(filePath, `${itemLabel}.label must be a non-empty string`);
        }

        if (!isValidUrl(item.url)) {
          pushError(filePath, `${itemLabel}.url must be an absolute URL`);
        }

        if (!(item.kind === null || CANDIDATE_PROFILE_LINK_KINDS.has(item.kind))) {
          pushError(filePath, `${itemLabel}.kind is invalid`);
        }
      }
    }

    for (const [fieldName, collection] of [
      ["career_items", record.career_items],
      ["election_history", record.election_history],
    ]) {
      if (!Array.isArray(collection)) {
        pushError(filePath, `${label}.${fieldName} must be an array`);
        continue;
      }

      for (let itemIndex = 0; itemIndex < collection.length; itemIndex += 1) {
        const item = collection[itemIndex];
        const itemLabel = `${label}.${fieldName}[${itemIndex}]`;

        if (!isPlainObject(item)) {
          pushError(filePath, `${itemLabel} must be an object`);
          continue;
        }

        if (!isNonEmptyString(item.label)) {
          pushError(filePath, `${itemLabel}.label must be a non-empty string`);
        }

        if (!(item.summary === null || typeof item.summary === "string")) {
          pushError(filePath, `${itemLabel}.summary must be string or null`);
        }
      }
    }

    if (!Number.isInteger(record.display_order) || record.display_order < 1) {
      pushError(filePath, `${label}.display_order must be an integer >= 1`);
    }

    if (!isValidDateTime(record.last_checked_at)) {
      pushError(filePath, `${label}.last_checked_at must be RFC 3339`);
    }

    validateCandidateEvidence(record.evidence, filePath, label);
  }
}

if (errors.length > 0) {
  console.error("data/v1 validation failed");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("data/v1 validation passed");
console.log(
  [
    `regions=${regionsData?.records?.length ?? 0}`,
    `elections=${electionsData?.records?.length ?? 0}`,
    `local_government_sites=${localGovernmentSiteRecordCount}`,
    `prefectural_assembly_terms=${prefecturalAssemblyTermRecordCount}`,
    `prefectural_assembly_districts=${prefecturalAssemblyDistrictRecordCount}`,
    `prefectural_assembly_official_links=${prefecturalAssemblyOfficialLinkRecordCount}`,
    `postal_code_mappings=${postalRecordCount}`,
    `election_resource_links=${resourceRecordCount}`,
    `candidate_signals=${candidateSignalRecordCount}`,
    `candidate_endorsements=${candidateEndorsementRecordCount}`,
    `candidate_profiles=${candidateProfileRecordCount}`,
  ].join(" "),
);
