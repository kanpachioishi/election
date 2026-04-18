const DATA = window.ELECTION_SITE_DATA;

const TYPE_LABELS = {
  national: "国政",
  prefectural: "都道府県",
  municipal: "市区町村",
  by_election: "補欠",
};

const SUBTYPE_LABELS = {
  governor: "知事",
  assembly: "議会",
  mayor: "首長",
  upper_house: "参院",
  lower_house: "衆院",
};

const MACRO_REGION_LABELS = {
  hokkaido: "北海道",
  tohoku: "東北",
  kanto: "関東",
  chubu: "中部",
  kansai: "関西",
  chugoku: "中国",
  shikoku: "四国",
  kyushu_okinawa: "九州・沖縄",
};

const PREFECTURE_TO_MACRO_REGION = {
  "01": "hokkaido",
  "02": "tohoku",
  "03": "tohoku",
  "04": "tohoku",
  "05": "tohoku",
  "06": "tohoku",
  "07": "tohoku",
  "08": "kanto",
  "09": "kanto",
  "10": "kanto",
  "11": "kanto",
  "12": "kanto",
  "13": "kanto",
  "14": "kanto",
  "15": "chubu",
  "16": "chubu",
  "17": "chubu",
  "18": "chubu",
  "19": "chubu",
  "20": "chubu",
  "21": "chubu",
  "22": "chubu",
  "23": "chubu",
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

const KIND_LABELS = {
  candidate_list: "候補者",
  bulletin: "選挙公報",
  early_voting: "期日前投票",
  polling_place: "投票所",
  other: "その他",
};

const RESOURCE_GROUPS = [
  {
    kind: "candidate_list",
    heading: "候補者を確認",
    note: "立候補者や届出情報を確認できます。",
    action: "候補者を見る",
  },
  {
    kind: "bulletin",
    heading: "選挙公報を読む",
    note: "候補者の主張や政策を公式PDFなどで確認できます。",
    action: "公報を開く",
  },
  {
    kind: "early_voting",
    heading: "期日前投票を確認",
    note: "期間、場所、受付時間などの案内へ進みます。",
    action: "期日前を見る",
  },
  {
    kind: "polling_place",
    heading: "投票所を確認",
    note: "投票所や当日の投票案内を確認できます。",
    action: "投票所を見る",
  },
  {
    kind: "other",
    heading: "関連する公式情報",
    note: "選挙管理委員会などの公式ページを確認できます。",
    action: "公式情報を見る",
  },
];

const state = {
  query: "",
  type: "all",
  macroRegion: "all",
  prefecture: "all",
  municipality: "all",
  selectedId: null,
};

const els = {
  heroMetrics: document.getElementById("heroMetrics"),
  generatedNote: document.getElementById("generatedNote"),
  searchInput: document.getElementById("searchInput"),
  typeFilter: document.getElementById("typeFilter"),
  macroRegionFilter: document.getElementById("macroRegionFilter"),
  prefectureFilter: document.getElementById("prefectureFilter"),
  municipalityFilter: document.getElementById("municipalityFilter"),
  resetFilters: document.getElementById("resetFilters"),
  resultSummary: document.getElementById("resultSummary"),
  electionList: document.getElementById("electionList"),
  detail: document.getElementById("detail"),
  coverageGrid: document.getElementById("coverageGrid"),
};

const prefectureRegions = DATA.regions
  .filter((region) => region.level === "prefecture")
  .sort((left, right) => left.prefCode.localeCompare(right.prefCode));

const municipalityRegions = DATA.regions
  .filter((region) => region.level === "municipality")
  .sort((left, right) => left.prefCode.localeCompare(right.prefCode) || left.displayName.localeCompare(right.displayName, "ja"));

const regionById = new Map(DATA.regions.map((region) => [region.id, region]));

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateText) {
  if (!dateText) return "未定";
  const date = new Date(`${dateText}T00:00:00+09:00`);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;
}

function formatDateTime(dateText) {
  if (!dateText) return "";
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return String(dateText);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getDaysFromToday(dateText) {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(`${dateText}T00:00:00+09:00`);
  return Math.ceil((target - base) / 86400000);
}

function getDateBadge(election) {
  const days = getDaysFromToday(election.voteDate);
  if (days === 0) return { text: "本日", tone: "hot" };
  if (days > 0 && days <= 30) return { text: `あと${days}日`, tone: "hot" };
  if (days > 0) return { text: `あと${days}日`, tone: "future" };
  return { text: "終了", tone: "muted" };
}

function normalizeText(value) {
  return String(value ?? "").toLowerCase().replaceAll(/\s+/g, "");
}

function getPostalMatch(query) {
  const digits = query.replace(/[^\d]/g, "");
  if (digits.length < 3) return null;
  const prefix = digits.slice(0, 3);
  return DATA.postalPrefixes.find((entry) => entry.prefix === prefix) ?? null;
}

function getPostalDigits(query) {
  return query.replace(/[^\d]/g, "");
}

function electionSearchText(election) {
  return normalizeText([
    election.id,
    election.slug,
    election.name,
    election.description,
    election.primaryRegionName,
    election.primaryRegionShortName,
    election.prefectureName,
    election.resources.map((resource) => `${resource.kind} ${resource.title} ${resource.summary}`).join(" "),
  ].join(" "));
}

function getMacroRegionByPrefCode(prefCode) {
  return PREFECTURE_TO_MACRO_REGION[String(prefCode ?? "").padStart(2, "0")] ?? null;
}

function electionMatchesLocation(election) {
  const municipalityRegion = state.municipality !== "all" ? regionById.get(state.municipality) : null;

  if (state.municipality !== "all") {
    if (election.scopeType === "all") return true;
    if (election.primaryRegionId === state.municipality) return true;
    if (municipalityRegion && election.prefectureRegionId === municipalityRegion.prefectureRegionId) return true;
    return false;
  }

  if (state.prefecture !== "all") {
    if (election.scopeType === "all") return true;
    if (election.primaryRegionId === state.prefecture) return true;
    if (election.prefectureRegionId === state.prefecture) return true;
    return false;
  }

  if (state.macroRegion !== "all") {
    if (election.scopeType === "all") return true;
    const prefCode = election.prefectureRegionId?.replace("pref-", "") || "";
    return getMacroRegionByPrefCode(prefCode) === state.macroRegion;
  }

  return true;
}

function isJointElectionCandidate(election) {
  return ["municipal", "by_election"].includes(election.type) &&
    ["mayor", "assembly"].includes(election.subtype) &&
    Boolean(election.primaryRegionId) &&
    Boolean(election.voteDate);
}

function getJointElectionKey(election) {
  return [
    election.primaryRegionId,
    election.voteDate,
    election.noticeDate ?? "",
    election.phase,
  ].join("|");
}

function shouldBuildJointElection(bucket) {
  return bucket.some((election) => election.subtype === "mayor") &&
    bucket.some((election) => election.subtype === "assembly");
}

function sortSubtypeValues(subtypes) {
  const order = { mayor: 0, assembly: 1, governor: 2, upper_house: 3, lower_house: 4 };
  return [...new Set(subtypes)].sort((left, right) => (order[left] ?? 99) - (order[right] ?? 99));
}

function dedupeResourcesByUrl(resources) {
  const byUrl = new Map();
  for (const resource of sortResources(resources)) {
    const key = String(resource.url ?? "").trim();
    if (!key) continue;
    const existing = byUrl.get(key);
    if (!existing) {
      byUrl.set(key, { ...resource });
      continue;
    }

    const preferred = existing.kind === "other" ? existing : resource.kind === "other" ? resource : existing;
    byUrl.set(key, {
      ...preferred,
      summary: preferred.summary || existing.summary || resource.summary,
    });
  }
  return [...byUrl.values()];
}

function getJointSourceUrl(bucket) {
  const sharedOther = bucket
    .flatMap((election) => election.resources ?? [])
    .find((resource) => resource.kind === "other" && resource.url);
  return sharedOther?.url || bucket[0]?.sourceUrl || "";
}

function buildJointElection(bucket) {
  const base = bucket[0];
  const regionLabel = base.primaryRegionShortName || base.primaryRegionName;
  const includedNames = bucket.map((election) => election.name);
  const resources = dedupeResourcesByUrl(bucket.flatMap((election) => election.resources ?? []));
  const resourceKinds = [...new Set(resources.map((resource) => resource.kind).filter(Boolean))];

  return {
    ...base,
    id: `joint:${getJointElectionKey(base)}`,
    name: `${regionLabel}の同時選挙`,
    description: "同じ日に同じ地域で投票する選挙をまとめて表示しています。",
    subtypes: sortSubtypeValues(bucket.map((election) => election.subtype)),
    electionIds: bucket.map((election) => election.id),
    includedElectionNames: includedNames,
    resources,
    resourceKinds,
    sourceUrl: getJointSourceUrl(bucket),
    isJoint: true,
  };
}

function buildDisplayElections(elections) {
  const buckets = new Map();
  for (const election of elections) {
    if (!isJointElectionCandidate(election)) continue;
    const key = getJointElectionKey(election);
    const bucket = buckets.get(key) ?? [];
    bucket.push(election);
    buckets.set(key, bucket);
  }

  const seenJointKeys = new Set();

  return elections.flatMap((election) => {
    if (!isJointElectionCandidate(election)) {
      return [{ ...election, subtypes: [election.subtype], electionIds: [election.id], includedElectionNames: [election.name], isJoint: false }];
    }

    const key = getJointElectionKey(election);
    const bucket = buckets.get(key) ?? [election];

    if (!shouldBuildJointElection(bucket)) {
      return [{ ...election, subtypes: [election.subtype], electionIds: [election.id], includedElectionNames: [election.name], isJoint: false }];
    }

    if (seenJointKeys.has(key)) {
      return [];
    }

    seenJointKeys.add(key);
    return [buildJointElection(bucket)];
  });
}

function getFilteredElections() {
  const query = normalizeText(state.query);
  const postalMatch = getPostalMatch(state.query);

  return DATA.elections
    .filter((election) => election.phase === "upcoming")
    .filter((election) => state.type === "all" || election.type === state.type)
    .filter((election) => electionMatchesLocation(election))
    .filter((election) => {
      if (!query) return true;
      if (postalMatch) {
        const matchesMunicipality = election.primaryRegionId === postalMatch.regionId;
        const matchesPrefecture = election.prefectureRegionId === postalMatch.prefectureRegionId;
        return matchesMunicipality || matchesPrefecture || election.scopeType === "all";
      }
      return electionSearchText(election).includes(query);
    })
    .sort((left, right) => {
      if (left.phase !== right.phase) {
        return left.phase === "upcoming" ? -1 : 1;
      }
      if (left.phase === "upcoming") {
        return left.voteDate.localeCompare(right.voteDate);
      }
      return right.voteDate.localeCompare(left.voteDate);
    });
}

function isDefaultBrowse() {
  return !state.query &&
    state.type === "all" &&
    state.macroRegion === "all" &&
    state.prefecture === "all" &&
    state.municipality === "all";
}

function getElectionView() {
  const filteredRaw = getFilteredElections();
  const filtered = buildDisplayElections(filteredRaw);
  if (!isDefaultBrowse()) {
    return {
      elections: filtered,
      total: filtered.length,
      mode: "filtered",
    };
  }

  return {
    elections: ensureSelectedElectionVisible(filtered, filtered),
    total: filtered.length,
    mode: "default",
  };
}

function ensureSelectedElectionVisible(visible, allElections) {
  if (!state.selectedId || visible.some((election) => election.id === state.selectedId)) {
    return visible;
  }

  const selected = allElections.find((election) => election.id === state.selectedId || election.electionIds?.includes(state.selectedId));
  return selected ? [...visible, selected] : visible;
}

function renderSelect(select, options, selected) {
  select.innerHTML = options
    .map((option) => `<option value="${escapeHtml(option.value)}"${option.value === selected ? " selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("");
}

function initFilters() {
  renderSelect(els.typeFilter, [
    { value: "all", label: "すべて" },
    ...Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ], state.type);

  renderLocationFilters();
}

function renderLocationFilters() {
  renderSelect(els.macroRegionFilter, [
    { value: "all", label: "すべて" },
    ...Object.entries(MACRO_REGION_LABELS).map(([value, label]) => ({ value, label })),
  ], state.macroRegion);

  const prefectureOptions = prefectureRegions
    .filter((region) => state.macroRegion === "all" || getMacroRegionByPrefCode(region.prefCode) === state.macroRegion)
    .map((region) => ({
      value: region.id,
      label: region.name,
    }));

  renderSelect(els.prefectureFilter, [
    { value: "all", label: state.macroRegion === "all" ? "地方を選んでください" : "すべて" },
    ...prefectureOptions,
  ], state.prefecture);
  els.prefectureFilter.disabled = state.macroRegion === "all";

  const municipalityOptions = municipalityRegions
    .filter((region) => state.prefecture !== "all" && region.prefectureRegionId === state.prefecture)
    .map((region) => ({
      value: region.id,
      label: region.name,
    }));

  renderSelect(els.municipalityFilter, [
    { value: "all", label: state.prefecture === "all" ? "都道府県を選んでください" : "すべて" },
    ...municipalityOptions,
  ], state.municipality);
  els.municipalityFilter.disabled = state.prefecture === "all";
}

function renderHero() {
  if (!els.heroMetrics || !els.generatedNote) {
    return;
  }

  const metrics = [
    ["選挙", DATA.stats.elections],
    ["公式リンク", DATA.stats.resourceLinks],
    ["掲載地域", DATA.stats.regions],
    ["対応郵便番号", DATA.stats.postalPrefixes],
  ];

  els.heroMetrics.innerHTML = metrics.map(([label, value]) => `
    <div class="metric-card">
      <strong>${value}</strong>
      <span>${label}</span>
    </div>
  `).join("");

  els.generatedNote.textContent = `データ更新: ${formatDateTime(DATA.sourceGeneratedAt)}`;
}

function renderCoverage() {
  const resourceRows = Object.entries(KIND_LABELS)
    .map(([kind, label]) => [label, DATA.stats.byResourceKind[kind] ?? 0]);
  const typeRows = Object.entries(TYPE_LABELS)
    .map(([type, label]) => [label, DATA.stats.byType[type] ?? 0]);

  const groups = [
    { title: "選挙種別", rows: typeRows },
    { title: "公式リンク種別", rows: resourceRows },
  ];

  els.coverageGrid.innerHTML = groups.map((group) => `
    <article class="coverage-card">
      <h3>${escapeHtml(group.title)}</h3>
      ${group.rows.map(([label, value]) => `
        <div class="coverage-row">
          <span>${escapeHtml(label)}</span>
          <strong>${value}</strong>
        </div>
      `).join("")}
    </article>
  `).join("");
}

function renderResourceChips(election) {
  return election.resourceKinds.map((kind) => `
    <span class="kind-chip ${kind}">${escapeHtml(KIND_LABELS[kind] ?? kind)}</span>
  `).join("");
}

function renderSubtypePills(election) {
  return (election.subtypes ?? [election.subtype])
    .map((subtype) => `<span class="subtype-pill ${escapeHtml(subtype ?? "unknown")}">${escapeHtml(SUBTYPE_LABELS[subtype] ?? subtype)}</span>`)
    .join("");
}

function hasActiveFilters() {
  return Boolean(state.query) ||
    state.type !== "all" ||
    state.macroRegion !== "all" ||
    state.prefecture !== "all" ||
    state.municipality !== "all";
}

function getEmptyStateHints() {
  const hints = [];
  const digits = getPostalDigits(state.query);
  const hasPostalQuery = digits.length >= 3;
  const postalMatch = getPostalMatch(state.query);

  if (hasPostalQuery && !postalMatch) {
    hints.push("入力された郵便番号の先頭3桁は、まだ対応データに入っていません。市区町村名や都道府県名でも試してください。");
  } else if (hasPostalQuery && postalMatch) {
    hints.push(`${postalMatch.prefix} は ${postalMatch.regionName} に対応する郵便番号データです。地方や種別の条件を外すと見つかる場合があります。`);
  } else if (state.query) {
    hints.push("地域名、選挙名、候補者、公報など、検索語を短くすると見つかる場合があります。");
  }

  if (state.type !== "all") hints.push(`種別が「${TYPE_LABELS[state.type] ?? state.type}」に絞られています。`);
  if (state.municipality !== "all") {
    const region = regionById.get(state.municipality);
    hints.push(`市区町村が「${region?.name ?? state.municipality}」に絞られています。`);
  } else if (state.prefecture !== "all") {
    const region = regionById.get(state.prefecture);
    hints.push(`都道府県が「${region?.name ?? state.prefecture}」に絞られています。`);
  } else if (state.macroRegion !== "all") {
    hints.push(`地方が「${MACRO_REGION_LABELS[state.macroRegion] ?? state.macroRegion}」に絞られています。`);
  }

  if (!hints.length) {
    hints.push("掲載中のデータに該当する選挙がまだありません。対応地域は順次拡張中です。");
  }

  return hints;
}

function getEmptyStateActions() {
  const actions = [];
  const digits = getPostalDigits(state.query);
  const hasPostalQuery = digits.length >= 3;
  const postalMatch = getPostalMatch(state.query);
  const hasNarrowFilters = state.type !== "all" ||
    state.macroRegion !== "all" ||
    state.prefecture !== "all" ||
    state.municipality !== "all";

  if (hasNarrowFilters) {
    actions.push({ action: "relax-filters", label: "フィルターを広げる", primary: true });
  }

  if (hasPostalQuery && !postalMatch) {
    actions.push({ action: "search-region", label: "地域名で探す", primary: !hasNarrowFilters });
  } else if (state.query) {
    actions.push({ action: "focus-search", label: "検索語を変える", primary: !hasNarrowFilters });
  }

  if (hasActiveFilters()) {
    actions.push({ action: "reset-all", label: "条件をリセット", primary: !actions.length });
  }

  actions.push({ action: "coverage", label: "対応状況を見る", primary: false });
  return actions;
}

function renderElectionList(elections) {
  if (!elections.length) {
    const hints = getEmptyStateHints();
    const actions = getEmptyStateActions();
    els.electionList.innerHTML = `
      <div class="empty-state">
        <p class="empty-kicker">no matched elections</p>
        <h3>該当する選挙がありません</h3>
        <p class="empty-reason">掲載中のデータ範囲では一致する選挙が見つかりませんでした。</p>
        <ul>
          ${hints.slice(0, 4).map((hint) => `<li>${escapeHtml(hint)}</li>`).join("")}
        </ul>
        <div class="empty-actions">
          ${actions.map((item) => item.action === "coverage"
            ? `<a class="empty-action" href="#coverage">${escapeHtml(item.label)}</a>`
            : `<button class="empty-action${item.primary ? " primary" : ""}" type="button" data-empty-action="${escapeHtml(item.action)}">${escapeHtml(item.label)}</button>`
          ).join("")}
        </div>
      </div>
    `;
    return;
  }

  els.electionList.innerHTML = elections.map((election) => {
    const badge = getDateBadge(election);
    const selected = election.id === state.selectedId ? " selected" : "";
    return `
      <article class="election-card${selected}" data-election-id="${escapeHtml(election.id)}">
        <button class="card-main" type="button">
          <span class="card-topline">
            <span class="type-pill ${election.type}">${escapeHtml(TYPE_LABELS[election.type] ?? election.type)}</span>
            ${renderSubtypePills(election)}
            <span class="date-badge ${badge.tone}">${escapeHtml(badge.text)}</span>
          </span>
          <strong>${escapeHtml(election.name)}</strong>
          <span class="card-region">${escapeHtml(election.isJoint ? election.includedElectionNames.join(" / ") : election.primaryRegionName)}</span>
          <span class="card-date">${escapeHtml(formatDate(election.voteDate))}</span>
          <span class="chip-row">${renderResourceChips(election)}</span>
        </button>
        <a class="card-detail-link" href="#detail" data-detail-jump>詳細を見る</a>
      </article>
    `;
  }).join("");
}

function groupResources(resources) {
  return resources.reduce((groups, resource) => {
    if (!groups[resource.kind]) groups[resource.kind] = [];
    groups[resource.kind].push(resource);
    return groups;
  }, {});
}

function sortResources(resources) {
  return [...resources].sort((left, right) => {
    const leftOrder = left.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.displayOrder ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder || String(left.title ?? "").localeCompare(String(right.title ?? ""), "ja");
  });
}

function getResourceGroups(grouped) {
  const knownKinds = new Set(RESOURCE_GROUPS.map((group) => group.kind));
  const knownGroups = RESOURCE_GROUPS.filter((group) => grouped[group.kind]?.length);
  const unknownGroups = Object.keys(grouped)
    .filter((kind) => !knownKinds.has(kind))
    .sort()
    .map((kind) => ({
      kind,
      heading: KIND_LABELS[kind] ?? "関連する公式情報",
      note: "公式ページまたは公式PDFとして確認できたリンクです。",
      action: "公式情報を見る",
    }));

  return [...knownGroups, ...unknownGroups];
}

function getSpecialDetailLink(election) {
  if (election.isJoint) return "";
  const links = {
    "el-pref-15-governor-2026": {
      href: "elections/niigata-governor-2026.html",
      text: "報道ベースの出馬動向は専用ページへ",
    },
    "el-pref-25-governor-2026": {
      href: "elections/shiga-governor-2026.html",
      text: "報道ベースの候補予定者ページへ",
    },
    "el-mun-10209-mayor-2026": {
      href: "elections/fujioka-mayor-2026.html",
      text: "報道ベースの候補予定者ページへ",
    },
  };
  const detailLink = links[election.id];
  if (!detailLink) return "";

  return `
    <a class="source-link" href="${detailLink.href}">${detailLink.text}</a>
  `;
}

function isPdfResource(resource) {
  return /\.pdf(?:$|[?#])/i.test(String(resource.url ?? "")) || /pdf/i.test(String(resource.title ?? ""));
}

function getResourceSummary(resource, election) {
  const resourceType = isPdfResource(resource) ? "PDF" : "ページ";
  const fallback = String(resource.summary ?? "").trim() || "公式リンク";
  const title = String(resource.title ?? "");
  const isSharedPage = /市長・市議会議員選挙|市長選.*市議会議員選挙|市議会議員選挙.*市長選/.test(title)
    || /市議会議員選挙/.test(fallback);

  if (resource.kind === "candidate_list") {
    return `立候補届出や候補者氏名を確認できる公式${resourceType}。`;
  }
  if (resource.kind === "bulletin") {
    if (isSharedPage) {
      return `市長選と市議会議員選挙をまとめた選挙公報の公式${resourceType}。`;
    }
    return `候補者の主張や経歴を確認できる選挙公報の公式${resourceType}。`;
  }
  if (resource.kind === "early_voting") {
    if (isSharedPage) {
      return `市長選と市議会議員選挙でも使う期日前投票の公式${resourceType}。`;
    }
    return `期日前投票の期間、場所、受付時間を確認できる公式${resourceType}。`;
  }
  if (resource.kind === "polling_place") {
    if (isSharedPage) {
      return `市長選と市議会議員選挙でも使う投票所案内の公式${resourceType}。`;
    }
    return `投票所の場所や対象区域を確認できる公式${resourceType}。`;
  }
  if (resource.kind === "other" && isSharedPage) {
    return `市長選と市議会議員選挙をまとめた公式${resourceType}。`;
  }
  return fallback;
}

function renderDetail(election) {
  if (!election) {
    els.detail.innerHTML = `
      <div class="detail-empty">
        <h3>選挙を選んでください</h3>
        <p>左のカードを選ぶと、公式リンクと日程がここに表示されます。</p>
      </div>
    `;
    return;
  }

  const badge = getDateBadge(election);
  const resourceSections = sortResources(election.resources)
    .map((resource) => `
      <a class="resource-link ${escapeHtml(resource.kind ?? "other")}" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">
        <span>
          <strong>${escapeHtml(resource.title)}</strong>
          <small>${escapeHtml(getResourceSummary(resource, election))}</small>
        </span>
      </a>
    `).join("");

  els.detail.innerHTML = `
    <article class="detail-card">
      <div class="detail-kicker">
        <span class="type-pill ${election.type}">${escapeHtml(TYPE_LABELS[election.type] ?? election.type)}</span>
        ${renderSubtypePills(election)}
        <span class="date-badge ${badge.tone}">${escapeHtml(badge.text)}</span>
      </div>
      <h3>${escapeHtml(election.name)}</h3>
      <p class="detail-desc">${escapeHtml(election.description)}</p>
      ${election.isJoint ? `
        <p class="detail-included">
          <strong>含まれる選挙</strong>
          <span>${escapeHtml(election.includedElectionNames.join(" / "))}</span>
        </p>
      ` : ""}
      <dl class="detail-facts">
        <div><dt>投票日</dt><dd>${escapeHtml(formatDate(election.voteDate))}</dd></div>
        <div><dt>告示日</dt><dd>${escapeHtml(formatDate(election.noticeDate))}</dd></div>
        <div><dt>地域</dt><dd>${escapeHtml(election.primaryRegionName)}</dd></div>
      </dl>
      <a class="source-link" href="${escapeHtml(election.sourceUrl)}" target="_blank" rel="noopener noreferrer">確認元の公式ページを開く</a>
      ${getSpecialDetailLink(election)}
      <div class="resources">
        <h4>公式リンク</h4>
        ${resourceSections || "<p>表示できる公式リンクがまだありません。</p>"}
      </div>
    </article>
  `;
}

function renderSummary(view) {
  els.resultSummary.textContent = "";
  els.resultSummary.hidden = true;
}

function selectElection(id, shouldScroll = false) {
  const isSameSelection = state.selectedId === id;
  if (isSameSelection && !shouldScroll) return;

  state.selectedId = id;
  const selected = buildDisplayElections(getFilteredElections()).find((election) => election.id === id || election.electionIds?.includes(id)) ?? null;
  if (!isSameSelection) {
    renderDetail(selected);
    document.querySelectorAll(".election-card").forEach((card) => {
      card.classList.toggle("selected", card.dataset.electionId === id);
    });
    if (id) history.replaceState(null, "", `#${id}`);
  }
  if (shouldScroll) document.getElementById("detail").scrollIntoView({ behavior: "smooth", block: "start" });
}

function render() {
  const view = getElectionView();
  const elections = view.elections;
  if (!state.selectedId || !elections.some((election) => election.id === state.selectedId || election.electionIds?.includes(state.selectedId))) {
    state.selectedId = elections[0]?.id ?? null;
  }

  renderSummary(view);
  renderElectionList(elections);
  renderDetail(elections.find((election) => election.id === state.selectedId || election.electionIds?.includes(state.selectedId)) ?? null);
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  els.typeFilter.addEventListener("change", (event) => {
    state.type = event.target.value;
    render();
  });

  els.macroRegionFilter.addEventListener("change", (event) => {
    state.macroRegion = event.target.value;
    state.prefecture = "all";
    state.municipality = "all";
    renderLocationFilters();
    render();
  });

  els.prefectureFilter.addEventListener("change", (event) => {
    state.prefecture = event.target.value;
    state.municipality = "all";
    renderLocationFilters();
    render();
  });

  els.municipalityFilter.addEventListener("change", (event) => {
    state.municipality = event.target.value;
    render();
  });

  els.resetFilters.addEventListener("click", () => {
    state.query = "";
    state.type = "all";
    state.macroRegion = "all";
    state.prefecture = "all";
    state.municipality = "all";
    els.searchInput.value = "";
    initFilters();
    render();
  });

  els.electionList.addEventListener("click", (event) => {
    const emptyAction = event.target.closest("[data-empty-action]");
    if (emptyAction) {
      const action = emptyAction.dataset.emptyAction;
      if (action === "relax-filters") {
        state.type = "all";
        state.macroRegion = "all";
        state.prefecture = "all";
        state.municipality = "all";
        initFilters();
        render();
        return;
      }
      if (action === "search-region") {
        state.query = "";
        state.type = "all";
        state.macroRegion = "all";
        state.prefecture = "all";
        state.municipality = "all";
        els.searchInput.value = "";
        initFilters();
        render();
        els.searchInput.focus();
        return;
      }
      if (action === "focus-search") {
        els.searchInput.focus();
        return;
      }
      if (action === "reset-all") {
        els.resetFilters.click();
        els.searchInput.focus();
      }
      return;
    }

    const card = event.target.closest(".election-card");
    if (!card) return;
    const shouldJumpToDetail = Boolean(event.target.closest("[data-detail-jump]"));
    if (shouldJumpToDetail) event.preventDefault();
    selectElection(card.dataset.electionId, shouldJumpToDetail);
  });

}

function initFromHash() {
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  const displayElections = buildDisplayElections(DATA.elections);
  if (displayElections.some((election) => election.id === id || election.electionIds?.includes(id))) {
    state.selectedId = id;
  }
}

initFromHash();
initFilters();
renderHero();
renderCoverage();
bindEvents();
render();
