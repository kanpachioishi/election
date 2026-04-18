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

const PHASE_LABELS = {
  upcoming: "これから",
  archived: "終了",
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
  phase: "all",
  kind: "all",
  region: "all",
  selectedId: null,
  showAllDefault: false,
};

const els = {
  heroMetrics: document.getElementById("heroMetrics"),
  generatedNote: document.getElementById("generatedNote"),
  searchInput: document.getElementById("searchInput"),
  typeFilter: document.getElementById("typeFilter"),
  phaseFilter: document.getElementById("phaseFilter"),
  kindFilter: document.getElementById("kindFilter"),
  regionFilter: document.getElementById("regionFilter"),
  resetFilters: document.getElementById("resetFilters"),
  resultSummary: document.getElementById("resultSummary"),
  electionList: document.getElementById("electionList"),
  detail: document.getElementById("detail"),
  coverageGrid: document.getElementById("coverageGrid"),
};

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

function electionMatchesRegion(election, regionValue) {
  if (regionValue === "all") return true;
  if (election.primaryRegionId === regionValue) return true;
  if (election.prefectureRegionId === regionValue) return true;
  return election.scopeType === "all" && regionValue.startsWith("pref-");
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
    .filter((election) => state.type === "all" || election.type === state.type)
    .filter((election) => state.phase === "all" || election.phase === state.phase)
    .filter((election) => state.kind === "all" || election.resourceKinds.includes(state.kind))
    .filter((election) => electionMatchesRegion(election, state.region))
    .filter((election) => {
      if (!query) return true;
      if (postalMatch) {
        return electionMatchesRegion(election, postalMatch.regionId) ||
          electionMatchesRegion(election, postalMatch.prefectureRegionId);
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
    state.phase === "all" &&
    state.kind === "all" &&
    state.region === "all";
}

function getElectionView() {
  const filteredRaw = getFilteredElections();
  const filtered = buildDisplayElections(filteredRaw);
  if (!isDefaultBrowse() || state.showAllDefault) {
    return {
      elections: filtered,
      total: filtered.length,
      mode: state.showAllDefault && isDefaultBrowse() ? "defaultAll" : "filtered",
    };
  }

  const upcoming = filtered.filter((election) => election.phase === "upcoming");

  return {
    elections: ensureSelectedElectionVisible(upcoming, filtered),
    total: filtered.length,
    mode: "default",
    upcomingCount: upcoming.length,
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

  renderSelect(els.phaseFilter, [
    { value: "all", label: "すべて" },
    ...Object.entries(PHASE_LABELS).map(([value, label]) => ({ value, label })),
  ], state.phase);

  renderSelect(els.kindFilter, [
    { value: "all", label: "すべて" },
    ...Object.entries(KIND_LABELS).map(([value, label]) => ({ value, label })),
  ], state.kind);

  const regionOptions = DATA.regions
    .filter((region) => region.level === "prefecture" || DATA.elections.some((election) => election.primaryRegionId === region.id))
    .sort((left, right) => {
      const levelOrder = { prefecture: 0, municipality: 1 };
      return left.prefCode.localeCompare(right.prefCode) ||
        levelOrder[left.level] - levelOrder[right.level] ||
        left.displayName.localeCompare(right.displayName, "ja");
    })
    .map((region) => ({
      value: region.id,
      label: region.level === "prefecture" ? region.name : `　${region.name}`,
    }));

  renderSelect(els.regionFilter, [{ value: "all", label: "すべて" }, ...regionOptions], state.region);
}

function renderHero() {
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
  const phaseRows = Object.entries(PHASE_LABELS)
    .map(([phase, label]) => [label, DATA.stats.byPhase[phase] ?? 0]);

  const groups = [
    { title: "選挙種別", rows: typeRows },
    { title: "状態", rows: phaseRows },
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
    state.phase !== "all" ||
    state.kind !== "all" ||
    state.region !== "all";
}

function getEmptyStateHints() {
  const hints = [];
  const digits = getPostalDigits(state.query);
  const hasPostalQuery = digits.length >= 3;
  const postalMatch = getPostalMatch(state.query);

  if (hasPostalQuery && !postalMatch) {
    hints.push("入力された郵便番号の先頭3桁は、まだ対応データに入っていません。市区町村名や都道府県名でも試してください。");
  } else if (hasPostalQuery && postalMatch) {
    hints.push(`${postalMatch.prefix} は ${postalMatch.regionName} に対応する郵便番号データです。地域やリンク種別の条件を外すと見つかる場合があります。`);
  } else if (state.query) {
    hints.push("地域名、選挙名、候補者、公報など、検索語を短くすると見つかる場合があります。");
  }

  if (state.type !== "all") hints.push(`種別が「${TYPE_LABELS[state.type] ?? state.type}」に絞られています。`);
  if (state.phase !== "all") hints.push(`状態が「${PHASE_LABELS[state.phase] ?? state.phase}」に絞られています。`);
  if (state.kind !== "all") hints.push(`公式リンクが「${KIND_LABELS[state.kind] ?? state.kind}」ありに絞られています。`);
  if (state.region !== "all") {
    const region = DATA.regions.find((entry) => entry.id === state.region);
    hints.push(`地域が「${region?.displayName ?? region?.name ?? state.region}」に絞られています。`);
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
    state.phase !== "all" ||
    state.kind !== "all" ||
    state.region !== "all";

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
  const elections = view.elections;
  const postalMatch = getPostalMatch(state.query);
  if (view.mode === "default") {
    els.resultSummary.innerHTML = `
      <span>初期表示: ${view.upcomingCount}件のこれからの選挙を表示しています。</span>
      <button class="summary-action" type="button" data-show-all>全${view.total}件を見る</button>
    `;
    return;
  }

  if (view.mode === "defaultAll") {
    els.resultSummary.innerHTML = `
      <span>全${view.total}件を表示しています。</span>
      <button class="summary-action" type="button" data-show-initial>初期表示に戻す</button>
    `;
    return;
  }

  const fragments = [`${elections.length}件を表示`];
  if (postalMatch) {
    fragments.push(`${postalMatch.prefix} は ${postalMatch.regionName} に対応`);
  }
  if (state.kind !== "all") {
    fragments.push(`${KIND_LABELS[state.kind]}あり`);
  }
  els.resultSummary.textContent = fragments.join(" / ");
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

  els.phaseFilter.addEventListener("change", (event) => {
    state.phase = event.target.value;
    render();
  });

  els.kindFilter.addEventListener("change", (event) => {
    state.kind = event.target.value;
    render();
  });

  els.regionFilter.addEventListener("change", (event) => {
    state.region = event.target.value;
    render();
  });

  els.resetFilters.addEventListener("click", () => {
    state.query = "";
    state.type = "all";
    state.phase = "all";
    state.kind = "all";
    state.region = "all";
    state.showAllDefault = false;
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
        state.phase = "all";
        state.kind = "all";
        state.region = "all";
        state.showAllDefault = false;
        initFilters();
        render();
        return;
      }
      if (action === "search-region") {
        state.query = "";
        state.type = "all";
        state.phase = "all";
        state.kind = "all";
        state.region = "all";
        state.showAllDefault = false;
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

  els.resultSummary.addEventListener("click", (event) => {
    if (event.target.closest("[data-show-all]")) {
      state.showAllDefault = true;
      render();
      return;
    }
    if (event.target.closest("[data-show-initial]")) {
      state.showAllDefault = false;
      render();
    }
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
