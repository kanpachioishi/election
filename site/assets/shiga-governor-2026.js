(function () {
  "use strict";

  const ELECTION_ID = "el-pref-25-governor-2026";
  const root = document.getElementById("app");
  const data = window.ELECTION_SITE_DATA;

  const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const dateWithWeekdayFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });
  const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const compactDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  const resourceKindLabels = {
    candidate_list: "候補者",
    bulletin: "選挙公報",
    early_voting: "期日前投票",
    polling_place: "投票所",
    other: "その他"
  };

  function formatDate(value) {
    if (!value) {
      return "未設定";
    }
    const parsed = value.length === 10 ? new Date(`${value}T00:00:00+09:00`) : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return dateFormatter.format(parsed);
  }

  function formatDateWithWeekday(value) {
    if (!value) {
      return "未設定";
    }
    const parsed = value.length === 10 ? new Date(`${value}T00:00:00+09:00`) : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return dateWithWeekdayFormatter.format(parsed);
  }

  function formatDateTime(value) {
    if (!value) {
      return "未設定";
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return dateTimeFormatter.format(parsed);
  }

  function formatDateTimeCompact(value) {
    if (!value) {
      return "未確認";
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return compactDateTimeFormatter.format(parsed).replace(/\//g, "/");
  }

  function parseIsoDate(value) {
    const text = normalizeText(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return null;
    }
    const parsed = new Date(`${text}T00:00:00+09:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function calculateAgeOnDate(birthDate, referenceDate) {
    const birth = parseIsoDate(birthDate);
    const reference = parseIsoDate(referenceDate);
    if (!birth || !reference || reference < birth) {
      return null;
    }
    let age = reference.getFullYear() - birth.getFullYear();
    const birthMonth = birth.getMonth();
    const birthDay = birth.getDate();
    if (reference.getMonth() < birthMonth || (reference.getMonth() === birthMonth && reference.getDate() < birthDay)) {
      age -= 1;
    }
    return age;
  }

  function profileAgeLabel(profile, election) {
    const age = calculateAgeOnDate(profile.birthDate || profile.birth_date, election.voteDate || election.vote_date);
    return Number.isInteger(age) ? `${age}歳（投票日時点）` : "";
  }

  function profileAgeShortLabel(profile, election) {
    const age = calculateAgeOnDate(profile.birthDate || profile.birth_date, election.voteDate || election.vote_date);
    return Number.isInteger(age) ? `${age}歳` : "未確認";
  }

  function formatCandidateDisplayName(value) {
    const text = normalizeText(value);
    const overrides = {
      "三日月大造": "三日月　大造"
    };
    return overrides[text] || text;
  }

  function formatCandidateDisplayKana(value) {
    const text = normalizeText(value);
    const overrides = {
      "みかづきたいぞう": "みかづき　たいぞう"
    };
    return overrides[text] || text;
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    if (text !== undefined && text !== null) {
      el.textContent = text;
    }
    return el;
  }

  function appendLink(parent, href, text, className) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = text;
    if (/^https?:\/\//.test(href)) {
      link.target = "_blank";
      link.rel = "noreferrer noopener";
    }
    if (className) {
      link.className = className;
    }
    parent.appendChild(link);
    return link;
  }

  function groupBy(arr, keyFn) {
    return arr.reduce((map, item) => {
      const key = keyFn(item);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
      return map;
    }, new Map());
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function getElection() {
    if (!data || !Array.isArray(data.elections)) {
      return null;
    }
    return data.elections.find((item) => item.id === ELECTION_ID) || null;
  }

  function sourceKey(source) {
    return normalizeText(source.url || source.sourceUrl || source.title || source.name);
  }

  function collectReportSources(election) {
    const sources = [];
    const seen = new Set();
    const pushSource = (source, context) => {
      if (!source) {
        return;
      }
      const key = sourceKey(source);
      if (!key || seen.has(key)) {
        return;
      }
      seen.add(key);
      sources.push({
        title: source.title || source.sourceName || "出典",
        sourceName: source.sourceName || source.source_name || "報道",
        url: source.url,
        publishedAt: source.publishedAt || source.published_at || "",
        sourceType: source.sourceType || source.source_type || "media_report",
        context
      });
    };

    (election.candidateSignals || []).forEach((signal) => {
      (signal.evidence || []).forEach((source) => pushSource(source, signal.personName));
    });
    (election.candidateEndorsements || []).forEach((item) => {
      (item.evidence || []).forEach((source) => pushSource(source, `${item.personName} / ${item.endorserName}`));
    });

    return sources.sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  }

  function createBadge(text, tone) {
    const badge = createEl("span", `badge badge--${tone}`);
    badge.textContent = text;
    return badge;
  }

  function toArray(value) {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }
    if (typeof value === "object") {
      return Object.values(value).filter(Boolean);
    }
    return [value];
  }

  function firstText(...values) {
    for (const value of values) {
      const text = normalizeText(value);
      if (text) {
        return text;
      }
    }
    return "";
  }

  function profileStatusLabel(status) {
    const labels = {
      planned: "候補予定者",
      reported_candidate: "報道ベースの候補予定者",
      related_interest: "関連動向",
      interested: "関連動向",
      announced: "出馬表明済み",
      official_candidate: "公式候補者",
      endorsed: "推薦あり",
      support: "支持あり"
    };
    return labels[status] || normalizeText(status) || "未設定";
  }

  function normalizeLinkItem(item, fallbackLabel) {
    if (!item) {
      return null;
    }
    if (typeof item === "string") {
      return { label: fallbackLabel || item, url: item };
    }
    if (typeof item !== "object") {
      return null;
    }
    const url = normalizeText(item.url || item.href || item.link || item.sourceUrl);
    const label = firstText(item.label, item.title, item.name, item.platform, fallbackLabel, url);
    return label || url ? {
      label: label || url,
      url,
      summary: firstText(item.summary, item.description, item.note),
      meta: firstText(item.sourceName, item.publishedAt ? formatDate(item.publishedAt) : "", item.source)
    } : null;
  }

  function renderProfileBlock(title, items, renderItem) {
    const list = toArray(items);
    if (!list.length) {
      return null;
    }
    const block = createEl("section", "profile-card__block");
    block.appendChild(createEl("h5", "profile-card__block-title", title));
    const body = createEl("div", "profile-card__list");
    list.forEach((item) => {
      const row = renderItem(item);
      if (row) {
        body.appendChild(row);
      }
    });
    if (!body.children.length) {
      return null;
    }
    block.appendChild(body);
    return block;
  }

  function renderProfileLinkItem(item, fallbackLabel) {
    const normalized = normalizeLinkItem(item, fallbackLabel);
    if (!normalized) {
      return null;
    }
    const row = createEl("div", "profile-card__item");
    const titleRow = createEl("div", "profile-card__item-title-row");
    if (normalized.url) {
      appendLink(titleRow, normalized.url, normalized.label, "inline-link");
    } else {
      titleRow.appendChild(createEl("strong", "profile-card__item-title", normalized.label));
    }
    row.appendChild(titleRow);
    if (normalized.summary) {
      row.appendChild(createEl("p", "profile-card__item-summary", normalized.summary));
    }
    if (normalized.meta) {
      row.appendChild(createEl("span", "profile-card__item-meta", normalized.meta));
    }
    return row;
  }

  function renderProfileFactItem(item) {
    if (!item) {
      return null;
    }
    if (typeof item === "string") {
      return createEl("div", "profile-card__item", item);
    }
    const row = createEl("div", "profile-card__item");
    const title = firstText(item.title, item.label, item.name, item.office, item.role, item.period, item.date);
    if (title) {
      row.appendChild(createEl("strong", "profile-card__item-title", title));
    }
    const metaParts = [
      firstText(item.summary, item.description, item.detail),
      firstText(item.period, item.term),
      firstText(item.sourceName, item.source)
    ].filter(Boolean);
    const dateText = firstText(item.date, item.publishedAt);
    if (dateText) {
      metaParts.push(dateText.length >= 10 ? formatDate(dateText) : dateText);
    }
    if (metaParts.length) {
      row.appendChild(createEl("p", "profile-card__item-summary", metaParts.join(" / ")));
    }
    if (item.url || item.href || item.link) {
      appendLink(row, item.url || item.href || item.link, "出典を開く", "inline-link");
    }
    return row;
  }

  function getCandidateProfiles(election) {
    const profiles = toArray(election.candidateProfiles);
    return profiles
      .map((profile, index) => ({ profile, index }))
      .filter(({ profile }) => profile && typeof profile === "object")
      .sort((a, b) => (a.profile.displayOrder || a.index) - (b.profile.displayOrder || b.index))
      .map(({ profile }) => profile);
  }

  function isRelatedInterestStatus(status) {
    const normalized = normalizeText(status).toLowerCase();
    return normalized === "related_interest" || normalized === "interested";
  }

  function isRelatedInterestProfile(profile) {
    const status = profile && (profile.status || profile.profileStatus);
    return isRelatedInterestStatus(status);
  }

  function isRelatedInterestSignal(signal) {
    const status = signal && signal.status;
    return isRelatedInterestStatus(status);
  }

  function getPrimaryCandidateProfiles(election) {
    return getCandidateProfiles(election).filter((profile) => !isRelatedInterestProfile(profile));
  }

  function getRelatedInterestProfiles(election) {
    return getCandidateProfiles(election).filter(isRelatedInterestProfile);
  }

  function hostLabelFromUrl(url) {
    if (!url) {
      return "";
    }
    try {
      const host = new URL(url, window.location.href).hostname.replace(/^www\./, "").toLowerCase();
      if (host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com")) {
        return "X";
      }
      if (host === "youtu.be" || host.endsWith(".youtu.be") || host.includes("youtube.com")) {
        return "YouTube";
      }
      if (host.includes("instagram.com")) {
        return "Instagram";
      }
      if (host.includes("facebook.com")) {
        return "Facebook";
      }
      if (host.includes("note.com")) {
        return "note";
      }
      if (host.includes("line.me")) {
        return "LINE";
      }
    } catch (_error) {
      return "";
    }
    return "";
  }

  function createSummaryLinkChip(link) {
    if (!link || !link.url) {
      return null;
    }
    const chip = document.createElement("a");
    chip.href = link.url;
    chip.textContent = link.label;
    chip.className = "profile-card__summary-link";
    if (/^https?:\/\//.test(link.url)) {
      chip.target = "_blank";
      chip.rel = "noreferrer noopener";
    }
    chip.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    return chip;
  }

  function summaryLinkLabel(value) {
    const label = firstText(value);
    return label.toLowerCase() === "x" ? "X" : label;
  }

  function pickRepresentativeLink(items, fallbackLabel, resolveLabel) {
    const list = toArray(items);
    for (const item of list) {
      const normalized = normalizeLinkItem(item, fallbackLabel);
      if (!normalized || !normalized.url) {
        continue;
      }
      const label = firstText(
        resolveLabel ? resolveLabel(item, normalized) : "",
        normalized.label,
        fallbackLabel,
        normalized.url
      );
      return {
        label: summaryLinkLabel(label),
        url: normalized.url
      };
    }
    return null;
  }

  function collectProfileSummaryLinks(profile) {
    const links = [];
    const seen = new Set();
    const push = (link) => {
      if (!link || !link.url || seen.has(link.url)) {
        return;
      }
      seen.add(link.url);
      links.push(link);
    };

    push(pickRepresentativeLink(
      profile.officialSiteUrls || profile.officialSites || profile.officialSiteUrl || profile.website || profile.websites,
      "公式サイト",
      (item, normalized) => firstText(item.label, item.title, item.name, hostLabelFromUrl(normalized.url), "公式サイト")
    ));
    push(pickRepresentativeLink(
      profile.profileLinks || profile.profileLink || profile.profileUrl || profile.profileUrls || profile.profilePage || profile.profilePages || profile.profilePageUrls || profile.bioUrl || profile.bioUrls,
      "プロフィール",
      (item, normalized) => firstText(item.label, item.title, item.name, hostLabelFromUrl(normalized.url), "プロフィール")
    ));
    push(pickRepresentativeLink(
      profile.officialSocials || profile.socials || profile.officialSocialLinks || profile.personSocials || profile.selfSocials || profile.personSocialLinks || profile.selfSocialLinks,
      "SNS",
      (item, normalized) => firstText(item.platform, item.site, item.label, item.title, hostLabelFromUrl(normalized.url), "SNS")
    ));
    push(pickRepresentativeLink(
      profile.policyLinks || profile.policies,
      "政策",
      (item, normalized) => firstText(item.label, item.title, item.name, hostLabelFromUrl(normalized.url), "政策")
    ));

    return links;
  }

  function deriveIdentityLabelFromRole(role) {
    const text = normalizeText(role);
    if (!text) {
      return "";
    }
    if (/現職/.test(text) && /知事/.test(text)) {
      return "現職知事";
    }
    if (/元/.test(text) && /知事/.test(text)) {
      return "元知事";
    }
    if (/県議/.test(text)) {
      return "県議";
    }
    if (/市議/.test(text)) {
      return "市議";
    }
    if (/知事/.test(text)) {
      return "知事";
    }
    if (/(衆議院|衆院)/.test(text) && /議員/.test(text)) {
      return "衆院議員";
    }
    if (/(参議院|参院)/.test(text) && /議員/.test(text)) {
      return "参院議員";
    }
    if (/元/.test(text) && /議員/.test(text)) {
      return "元議員";
    }
    return "";
  }

  function collectProfileIdentityLabels(profile) {
    const labels = [];
    const seen = new Set();
    const push = (value) => {
      const label = normalizeText(value);
      if (!label || seen.has(label)) {
        return;
      }
      seen.add(label);
      labels.push(label);
    };
    const explicitLabels = toArray(profile.identityLabels);
    explicitLabels.forEach((item) => {
      if (typeof item === "string") {
        push(item);
        return;
      }
      if (item && typeof item === "object") {
        push(firstText(item.label, item.title, item.name, item.text, item.value, item.summary, item.description));
      }
    });
    if (labels.length) {
      return labels;
    }

    push(deriveIdentityLabelFromRole(firstText(profile.currentOrRecentRole, profile.currentTitle, profile.role, profile.title, profile.position, profile.office)));

    if (profile.status === "related_interest" || profile.profileStatus === "related_interest" || profile.status === "interested" || profile.profileStatus === "interested") {
      push("関連動向");
    }

    if (toArray(profile.officialSiteUrls || profile.officialSites || profile.officialSiteUrl || profile.website || profile.websites).length) {
      push("公式サイトあり");
    }
    if (toArray(profile.profileLinks || profile.profileLink || profile.profileUrl || profile.profileUrls || profile.profilePage || profile.profilePages || profile.profilePageUrls || profile.bioUrl || profile.bioUrls).length) {
      push("プロフィールあり");
    }
    if (toArray(profile.officialSocials || profile.socials || profile.officialSocialLinks || profile.personSocials || profile.selfSocials || profile.personSocialLinks || profile.selfSocialLinks).length) {
      push("SNSあり");
    }
    if (toArray(profile.personBlogs || profile.personBlog || profile.blogs || profile.blogUrl || profile.blogUrls || profile.blog || profile.selfBlogs || profile.selfBlogUrls).length) {
      push("本人ブログ");
    }
    if (toArray(profile.policyLinks || profile.policies).length) {
      push("政策ページあり");
    }

    return labels;
  }

  function flattenValues(...values) {
    return values.flatMap((value) => toArray(value));
  }

  function collectComparisonLinks(profile) {
    const slots = [
      {
        key: "officialSite",
        label: "公式・本人サイト",
        items: flattenValues(profile.officialSiteUrls, profile.officialSites, profile.officialSiteUrl, profile.website, profile.websites),
        resolveLabel: (item, normalized) => firstText(item.label, item.title, item.name, hostLabelFromUrl(normalized.url), "公式・本人サイト")
      },
      {
        key: "socials",
        label: "SNS",
        items: flattenValues(profile.officialSocials, profile.socials, profile.officialSocialLinks, profile.personSocials, profile.selfSocials, profile.personSocialLinks, profile.selfSocialLinks),
        resolveLabel: (item, normalized) => firstText(item.platform, item.site, item.label, item.title, hostLabelFromUrl(normalized.url), "SNS")
      },
      {
        key: "profile",
        label: "プロフィール",
        items: flattenValues(profile.profileLinks, profile.profileLink, profile.profileUrl, profile.profileUrls, profile.profilePage, profile.profilePages, profile.profilePageUrls, profile.bioUrl, profile.bioUrls),
        resolveLabel: (item, normalized) => firstText(item.label, item.title, item.name, hostLabelFromUrl(normalized.url), "プロフィール")
      },
      {
        key: "policy",
        label: "政策",
        items: flattenValues(profile.policyLinks, profile.policies),
        resolveLabel: (item, normalized) => firstText(item.label, item.title, item.name, hostLabelFromUrl(normalized.url), "政策")
      }
    ];

    return slots.map((slot) => ({
      key: slot.key,
      label: slot.label,
      link: pickRepresentativeLink(slot.items, slot.label, slot.resolveLabel)
    }));
  }

  function findSignalForProfile(election, profile) {
    const targetSlug = firstText(profile.personSlug, profile.slug, profile.id).toLowerCase();
    const targetName = firstText(profile.personName, profile.name);
    return toArray(election.candidateSignals).find((signal) => {
      const signalSlug = firstText(signal.personSlug, signal.slug, signal.id).toLowerCase();
      const signalName = firstText(signal.personName, signal.name);
      return (targetSlug && signalSlug && targetSlug === signalSlug) || (targetName && signalName && targetName === signalName);
    }) || null;
  }

  function incumbencyShortLabel(value) {
    const incumbency = normalizeText(value).toLowerCase();
    if (incumbency === "incumbent") {
      return "現職";
    }
    if (incumbency === "newcomer") {
      return "新人";
    }
    if (incumbency === "former_governor" || incumbency === "former_official") {
      return "元職";
    }
    return "未確認";
  }

  function profileStatusShortLabel(value) {
    const status = normalizeText(value).toLowerCase();
    if (status === "official_candidate") {
      return "公式候補者";
    }
    if (status === "announced") {
      return "出馬表明";
    }
    if (status === "reported_candidate") {
      return "報道確認";
    }
    if (status === "planned") {
      return "候補予定";
    }
    if (status === "related_interest" || status === "interested") {
      return "関連動向";
    }
    return normalizeText(profileStatusLabel(status)) || "未確認";
  }

  function isAvailabilityIdentityLabel(label) {
    const text = normalizeText(label);
    return /あり$/.test(text) || /サイト/.test(text) || /ブログ/.test(text) || /プロフィール/.test(text) || /X$/.test(text) || text === "関連動向";
  }

  function profileRoleSummary(profile) {
    const identityRole = toArray(profile.identityLabels)
      .map((label) => normalizeText(label))
      .find((label) => label && !isAvailabilityIdentityLabel(label));
    return identityRole || firstText(profile.currentOrRecentRole, profile.currentTitle, profile.role, profile.title, profile.position, profile.office, "未確認");
  }

  function profilePathwaySummary(profile) {
    const slots = collectComparisonLinks(profile);
    const available = slots.filter((slot) => slot.link).length;
    return `${available}/${slots.length}`;
  }

  function renderQuickCompareStandingSummary(profile, signal) {
    const summary = createEl("div", "quick-compare-card__metric-value--stacked quick-compare-card__metric-stack");
    const incumbencyRow = createEl("div", "quick-compare-card__metric-stack-line quick-compare-card__metric-stack-line--secondary");
    incumbencyRow.appendChild(createEl("span", "quick-compare-card__metric-label", "区分"));
    incumbencyRow.appendChild(createEl("strong", "quick-compare-card__metric-value", incumbencyShortLabel(signal && signal.incumbency)));
    summary.appendChild(incumbencyRow);

    const roleRow = createEl("div", "quick-compare-card__metric-stack-line quick-compare-card__metric-stack-line--primary");
    roleRow.appendChild(createEl("span", "quick-compare-card__metric-label", "肩書"));
    roleRow.appendChild(createEl("strong", "quick-compare-card__metric-value", profileRoleSummary(profile)));
    summary.appendChild(roleRow);

    summary.setAttribute("aria-label", `区分 ${incumbencyShortLabel(signal && signal.incumbency)}。肩書 ${profileRoleSummary(profile)}`);
    return summary;
  }

  function classifyEndorsementGroup(endorserName) {
    const text = normalizeText(endorserName);
    if (!text) {
      return { key: "other", label: "その他" };
    }
    if (text.includes("市長会") || text.includes("町村会") || text.includes("首長")) {
      return { key: "mayor", label: "首長系" };
    }
    if (text.includes("連合") || text.includes("労組") || text.includes("労働組合")) {
      return { key: "union", label: "労組系" };
    }
    if (text.includes("党") || text.includes("自民") || text.includes("公明") || text.includes("立憲") || text.includes("国民") || text.includes("維新") || text.includes("共産") || text.includes("社民") || text.includes("れいわ")) {
      return { key: "party", label: "政党系" };
    }
    return { key: "other", label: "その他" };
  }

  function summarizeEndorsementsForProfile(election, profile) {
    const targetSlug = firstText(profile.personSlug, profile.slug, profile.id).toLowerCase();
    const targetName = firstText(profile.personName, profile.name);
    const groups = new Map();
    toArray(election.candidateEndorsements).forEach((item) => {
      const itemSlug = firstText(item.personSlug, item.slug, item.id).toLowerCase();
      const itemName = firstText(item.personName, item.name);
      const matches = (targetSlug && itemSlug && targetSlug === itemSlug) || (targetName && itemName && targetName === itemName);
      if (!matches) {
        return;
      }
      const group = classifyEndorsementGroup(item.endorserName);
      if (!groups.has(group.key)) {
        groups.set(group.key, {
          key: group.key,
          label: group.label,
          count: 0,
          endorsers: []
        });
      }
      const bucket = groups.get(group.key);
      bucket.count += 1;
      bucket.endorsers.push(firstText(item.endorserName, item.organizationName, item.sourceName));
    });
    return ["party", "mayor", "union", "other"]
      .map((key) => groups.get(key))
      .filter(Boolean)
      .map((group) => ({
        ...group,
        endorsers: group.endorsers.filter(Boolean)
      }));
  }

  function latestCheckTimestamp(election, profile, signal) {
    const targetSlug = firstText(profile.personSlug, profile.slug, profile.id).toLowerCase();
    const targetName = firstText(profile.personName, profile.name);
    const candidates = [
      firstText(profile.lastCheckedAt, profile.updatedAt, profile.checkedAt),
      signal ? firstText(signal.lastCheckedAt, signal.updatedAt, signal.checkedAt) : ""
    ];
    toArray(election.candidateEndorsements).forEach((item) => {
      const itemSlug = firstText(item.personSlug, item.slug, item.id).toLowerCase();
      const itemName = firstText(item.personName, item.name);
      const matches = (targetSlug && itemSlug && targetSlug === itemSlug) || (targetName && itemName && targetName === itemName);
      if (matches) {
        candidates.push(firstText(item.lastCheckedAt, item.updatedAt, item.checkedAt));
      }
    });
    return candidates
      .map((value) => normalizeText(value))
      .filter(Boolean)
      .sort((a, b) => String(b).localeCompare(String(a)))[0] || "";
  }

  function renderQuickCompareMetric(label, value) {
    const item = createEl("div", "quick-compare-card__metric");
    item.appendChild(createEl("span", "quick-compare-card__metric-label", label));
    if (value && typeof value === "object" && typeof value.nodeType === "number") {
      item.appendChild(value);
    } else {
      item.appendChild(createEl("strong", "quick-compare-card__metric-value", value));
    }
    return item;
  }

  function renderQuickCompareLinkChips(profile) {
    const chipRow = createEl("div", "quick-compare-card__chips");
    collectComparisonLinks(profile).forEach((slot) => {
      const hasLink = Boolean(slot.link);
      const shortLabel = {
        officialSite: "サイト",
        socials: "SNS",
        profile: "プロフィール",
        policy: "政策"
      }[slot.key] || slot.label;
      const chip = createEl(
        "span",
        `quick-compare-card__chip${hasLink ? " quick-compare-card__chip--present" : " quick-compare-card__chip--missing"}`,
        `${shortLabel} ${hasLink ? "あり" : "なし"}`
      );
      chip.setAttribute("aria-label", `${shortLabel} ${hasLink ? "あり" : "なし"}`);
      chipRow.appendChild(chip);
    });
    return chipRow;
  }

  function renderEndorsementGroupChips(groups) {
    const chipRow = createEl("div", "quick-compare-card__chips quick-compare-card__endorsement-groups");
    if (!groups.length) {
      chipRow.appendChild(createEl("span", "quick-compare-card__chip quick-compare-card__chip--missing", "なし"));
      return chipRow;
    }
    groups.forEach((group) => {
      const chip = createEl(
        "span",
        `quick-compare-card__chip quick-compare-card__chip--present quick-compare-card__endorsement-group quick-compare-card__endorsement-group--${group.key}`,
        `${group.label} ${group.count}件`
      );
      if (group.endorsers.length) {
        const endorserList = group.endorsers.join("、");
        chip.title = `${group.label}: ${endorserList}`;
        chip.setAttribute("aria-label", `${group.label} ${group.count}件。${endorserList}`);
      }
      chipRow.appendChild(chip);
    });
    return chipRow;
  }

  function renderQuickCompareCard(profile, election) {
    const signal = findSignalForProfile(election, profile);
    const slug = firstText(profile.personSlug, profile.slug, profile.id, "profile").replace(/[^a-z0-9_-]/gi, "-");
    const card = createEl("article", "quick-compare-card");
    card.id = `quick-compare-${slug}`;

    const head = createEl("div", "quick-compare-card__head");
    const titleWrap = createEl("div", "quick-compare-card__title-wrap");
    const titleRow = createEl("div", "quick-compare-card__title-row");
    titleRow.appendChild(createEl("h4", "quick-compare-card__title", formatCandidateDisplayName(firstText(profile.personName, profile.name))));
    titleRow.appendChild(createEl("span", "quick-compare-card__age", profileAgeShortLabel(profile, election)));
    titleWrap.appendChild(titleRow);
    const subtitle = normalizeText(profile.personKana)
      ? formatCandidateDisplayKana(profile.personKana)
      : firstText(profile.personSlug, profile.slug);
    if (subtitle) {
      titleWrap.appendChild(createEl("p", "quick-compare-card__subtitle", subtitle));
    }
    head.appendChild(titleWrap);
    head.appendChild(createBadge(profileStatusShortLabel(firstText(signal && signal.status, profile.profileStatus, profile.status)), signal && signal.status === "official_candidate" ? "official" : "motion"));
    card.appendChild(head);

    const metrics = createEl("div", "quick-compare-card__metrics");
    const endorsementGroups = summarizeEndorsementsForProfile(election, profile);
    [
      ["立場", renderQuickCompareStandingSummary(profile, signal)],
      ["導線", profilePathwaySummary(profile)],
      ["推薦・支持", renderEndorsementGroupChips(endorsementGroups)],
      ["状態", profileStatusShortLabel(firstText(signal && signal.status, profile.profileStatus, profile.status))],
      ["最終確認", formatDateTimeCompact(latestCheckTimestamp(election, profile, signal))]
    ].forEach(([label, value]) => {
      metrics.appendChild(renderQuickCompareMetric(label, value));
    });
    card.appendChild(metrics);
    card.appendChild(renderQuickCompareLinkChips(profile));

    const footer = createEl("div", "quick-compare-card__footer");
    appendLink(footer, `#profile-card-${slug}`, "プロフィールへ", "inline-link");
    card.appendChild(footer);
    return card;
  }

  function renderQuickCompareSection(election) {
    const profiles = getPrimaryCandidateProfiles(election);
    if (!profiles.length) {
      return null;
    }
    const copy = getPresentationCopy(election);
    const section = createEl("section", "section");
    section.id = "quick-compare";

    const header = createEl("div", "section__header");
    header.appendChild(createEl("p", "eyebrow", "候補者比較"));
    header.appendChild(createEl("h3", null, `${copy.primaryLabel}のひと目比較`));
    header.appendChild(createEl("p", "section__lead", "年齢、立場、導線、推薦・支持、最終確認を上で見比べられます。"));
    header.appendChild(createEl("p", "quick-compare__note", "導線欄は公式サイト、SNS、プロフィール、政策の確認状況です。未掲載は未確認を示します。"));

    const grid = createEl("div", "quick-compare-grid");
    profiles.forEach((profile) => {
      grid.appendChild(renderQuickCompareCard(profile, election));
    });

    section.append(header, grid);
    return section;
  }

  function normalizeStatusEntry(value) {
    if (!value) {
      return null;
    }
    if (typeof value === "string") {
      return { title: value };
    }
    if (typeof value !== "object") {
      return null;
    }
    const statusItems = toArray(value.items || value.points || value.lines || value.entries || value.highlights || value.notes)
      .map((item) => normalizeText(item))
      .filter(Boolean);
    const listStatusKey = normalizeText(value.officialCandidateListStatus || value.official_candidate_list_status);
    const officialListStatus = officialCandidateListStatusLabel(listStatusKey);
    if (officialListStatus) {
      statusItems.unshift(officialListStatus);
    }
    const transitionNote = firstText(value.transitionNote, value.transition);
    if (transitionNote) {
      statusItems.push(transitionNote);
    }
    const statusLinks = flattenValues(
      value.officialCandidateList,
      value.official_candidate_list,
      value.links,
      value.urls,
      value.link,
      value.url
    );
    return {
      title: firstText(value.title, value.label, value.name, value.status, "現在の扱い"),
      summary: firstText(value.summary, value.description, value.text, value.note),
      updatedAt: firstText(value.updatedAt, value.lastCheckedAt, value.checkedAt, value.date, value.asOf),
      basis: firstText(value.basis, value.source, value.sourceLabel, value.reason, (listStatusKey === "published" || listStatusKey === "included") ? "公式候補者一覧ベース" : "報道・本人発信ベース"),
      items: statusItems,
      links: statusLinks
    };
  }

  function officialCandidateListStatusLabel(value) {
    const status = normalizeText(value);
    if (status === "published" || status === "included") {
      return "公式候補者一覧を掲載済み";
    }
    if (status === "partial") {
      return "公式候補者一覧は一部確認";
    }
    if (status === "not_included") {
      return "公式候補者一覧は未掲載";
    }
    if (status === "unknown") {
      return "公式候補者一覧は確認待ち";
    }
    return "";
  }

  function getOfficialCandidateListStatusKey(election) {
    const pageStatus = (election && election.pageStatus) || {};
    return normalizeText(pageStatus.officialCandidateListStatus || pageStatus.official_candidate_list_status).toLowerCase();
  }

  function isOfficialCandidateListPublished(election) {
    const status = getOfficialCandidateListStatusKey(election);
    return status === "published" || status === "included";
  }

  function getPresentationCopy(election) {
    if (isOfficialCandidateListPublished(election)) {
      return {
        mode: "official",
        heroEyebrow: "official information + candidate updates",
        signalsEyebrow: "candidate updates",
        primaryLabel: "公式候補者",
        profileNavLabel: "公式候補者プロフィール",
        primaryActionText: "公式候補者へ",
        noticeStrong: "このページは公式候補者一覧ベースです。",
        noticeText: "",
        statusLead: "掲載基準と反映状況を整理しています。",
        heroLead: "選管公表の公式候補者プロフィールと公式導線を、確認日時つきで整理しています。",
        heroNoteLabel: "読み方",
        heroNoteText: "上から、ひと目比較、公式情報、プロフィール、更新履歴の順に見られます。関連動向は別枠です。",
        comparisonTitle: "公式導線比較（公式候補者）",
        comparisonLead: "公式候補者を対象に、選管公表情報と本人公式発信を照合した導線を比較します。",
        comparisonNote: "導線欄の未掲載は未確認を示します。",
        profilesTitle: "公式候補者プロフィール",
        profilesLead: "選管公表の候補者を掲載しています。年齢は投票日時点、肩書は公示日時点を基準に整理します。",
        relatedNote: "この欄は公式候補者プロフィール・公式導線比較とは別枠です。公式候補者一覧に含まれない関連動向として扱います。",
        signalsTitle: "出馬動向（公示後更新）",
        signalsLead: "届け出・推薦・辞退・訂正など、公式候補者に関する更新を時系列で記録します。関連動向は別枠で扱います。",
        primarySignalTitle: "公式候補者に関する更新",
        primarySignalLead: "届け出後の動きや確認できた更新を時系列で記録します。"
      };
    }

    return {
      mode: "reported",
      heroEyebrow: "official information + reported movement",
      signalsEyebrow: "reported movement",
      primaryLabel: "候補予定者",
      profileNavLabel: "候補予定者プロフィール",
      primaryActionText: "候補予定者へ",
      noticeStrong: "このページは報道・本人発信ベースです。",
      noticeText: "",
      statusLead: "掲載基準と切替予定を整理しています。",
      heroLead: "報道で確認できた候補予定者のプロフィールと公式導線を、1ページに集約しています。",
      heroNoteLabel: "読み方",
      heroNoteText: "上から、ひと目比較、公式情報、プロフィール、出馬動向の順に見られます。関連動向は別枠です。",
      comparisonTitle: "公式導線比較（報道確認ベース）",
      comparisonLead: "候補予定者として扱う人物のみを対象に、公式・本人サイト、SNS、プロフィール、政策への導線を比較します。",
      comparisonNote: "導線欄の未掲載は未確認を示します。",
      profilesTitle: "候補予定者プロフィール（報道ベース）",
      profilesLead: "出馬表明や出馬意向が報道等で確認できた人物を掲載し、最終確認日時を明記します。",
      relatedNote: "この欄は候補予定者プロフィール・公式導線比較とは別枠です。公式候補者一覧で確認できるまで、候補予定者としては扱いません。",
      signalsTitle: "出馬動向（報道ベース）",
      signalsLead: "表明・意向・撤回などの動きを時系列で記録します。候補予定者と関連動向は分けて表示します。",
      primarySignalTitle: "候補予定者として扱う出馬動向",
      primarySignalLead: "公式候補者一覧ではなく、報道や本人発表で確認した出馬表明です。"
    };
  }

  function collectPageStatus(election) {
    const explicit = normalizeStatusEntry(election.pageStatus);
    if (explicit) {
      return explicit;
    }

    const copy = getPresentationCopy(election);

    return {
      title: "現在の扱い",
      summary: "",
      updatedAt: data.generatedAt,
      basis: copy.mode === "official" ? "公式候補者一覧ベース" : "報道・本人発信ベース",
      items: [
        copy.mode === "official" ? "候補者プロフィールは公式候補者ベースで整理" : "候補者プロフィールは報道ベースで整理",
        copy.mode === "official" ? "更新履歴で公示後の差分を追記" : "公式候補者一覧が公開されたら切り替え"
      ],
      links: []
    };
  }

  function normalizePageUpdate(value) {
    if (!value) {
      return null;
    }
    if (typeof value === "string") {
      return {
        date: data.generatedAt,
        title: value,
        summary: ""
      };
    }
    if (typeof value !== "object") {
      return null;
    }

    const url = firstText(value.url, value.href, value.link, value.sourceUrl);
    return {
      date: firstText(value.date, value.updatedAt, value.publishedAt, value.checkedAt, data.generatedAt),
      title: firstText(value.title, value.label, value.name, "更新"),
      summary: firstText(value.summary, value.description, value.note, value.text),
      sourceName: firstText(value.sourceName, value.sourceTitle, value.source, value.sourceLabel),
      url
    };
  }

  function collectPageUpdates(election) {
    const explicit = toArray(election.pageUpdates).map(normalizePageUpdate).filter(Boolean);
    if (explicit.length) {
      return explicit.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    }

    const copy = getPresentationCopy(election);

    return [
      {
        date: data.generatedAt,
        title: "ページを更新",
        summary: copy.statusLead,
        sourceName: "site/data/site-data.js",
        url: ""
      }
    ];
  }

  function normalizeSourceType(sourceType) {
    const type = normalizeText(sourceType).toLowerCase();
    if (type === "official") {
      return "公式・公的情報";
    }
    if (type === "person_statement" || type === "party_statement" || type === "organization_statement") {
      return "本人発信";
    }
    return "報道";
  }

  function normalizeSourceRecord(source, context, sourceType, sourceKind) {
    if (!source) {
      return null;
    }
    const url = source.url || source.sourceUrl;
    const key = sourceKey({ url, title: source.title || source.sourceName, sourceName: source.sourceName });
    return {
      key,
      title: source.title || source.sourceName || "情報",
      sourceName: source.sourceName || source.source_name || "情報源",
      url,
      publishedAt: source.publishedAt || source.published_at || "",
      sourceType: sourceType || source.sourceType || source.source_type || "media_report",
      sourceKind,
      context
    };
  }

  function collectSourceRecords(election, officialResources) {
    const records = [];
    const seen = new Set();
    const push = (record) => {
      if (!record || !record.url || seen.has(record.url)) {
        return;
      }
      seen.add(record.url);
      records.push(record);
    };

    const pageStatus = election.pageStatus || {};
    const officialCandidateList = pageStatus.officialCandidateList || pageStatus.official_candidate_list;
    if (officialCandidateList) {
      push(normalizeSourceRecord({
        title: officialCandidateList.label || "公式候補者一覧",
        sourceName: officialCandidateList.sourceName || officialCandidateList.source_name || officialCandidateList.label || "公式候補者一覧",
        url: officialCandidateList.url,
        publishedAt: officialCandidateList.publishedAt || officialCandidateList.published_at || officialCandidateList.lastCheckedAt || officialCandidateList.last_checked_at || "",
        sourceType: "official"
      }, "公式候補者一覧", "official", "official"));
    }

    (officialResources || []).forEach((resource) => {
      push(normalizeSourceRecord({
        title: resource.title,
        sourceName: resource.title,
        url: resource.url,
        publishedAt: resource.publishedAt || resource.updatedAt || "",
        sourceType: "official"
      }, "公式導線", "official", "official"));
    });

    (election.candidateProfiles || []).forEach((profile) => {
      (profile.evidence || []).forEach((source) => {
        push(normalizeSourceRecord(source, profile.personName, source.sourceType || source.source_type, "profile"));
      });
    });

    (election.candidateSignals || []).forEach((signal) => {
      (signal.evidence || []).forEach((source) => {
        push(normalizeSourceRecord(source, signal.personName, source.sourceType || source.source_type, "signal"));
      });
    });

    (election.candidateEndorsements || []).forEach((item) => {
      (item.evidence || []).forEach((source) => {
        push(normalizeSourceRecord(source, `${item.personName} / ${item.endorserName}`, source.sourceType || source.source_type, "endorsement"));
      });
    });

    return records.sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  }

  function sourceTypeMeta(sourceType, sourceKind) {
    const type = normalizeText(sourceType).toLowerCase();
    if (type === "party_statement") {
      return "党";
    }
    if (type === "organization_statement") {
      return "団体";
    }
    if (type === "official") {
      return "公式";
    }
    if (type === "person_statement") {
      return "本人";
    }
    if (type === "media_report") {
      return "報道";
    }
    if (sourceKind === "official") {
      return "公式";
    }
    return "";
  }

  function groupSourceRecords(records) {
    const grouped = new Map([
      ["公式・公的情報", []],
      ["本人発信", []],
      ["報道", []]
    ]);

    records.forEach((record) => {
      const group = normalizeSourceType(record.sourceType);
      if (!grouped.has(group)) {
        grouped.set(group, []);
      }
      grouped.get(group).push(record);
    });

    return grouped;
  }

  function renderIdentityLabels(labels) {
    const list = toArray(labels).map((label) => normalizeText(label)).filter(Boolean);
    if (!list.length) {
      return null;
    }
    const row = createEl("div", "profile-card__identity-line");
    list.slice(0, 5).forEach((label) => {
      row.appendChild(createEl("span", "profile-card__identity-chip", label));
    });
    return row;
  }

  function renderProfileCard(profile, election, options = {}) {
    const isRelatedInterest = options.variant === "related";
    const card = createEl("article", `profile-card${isRelatedInterest ? " profile-card--related" : ""}`);
    card.id = `profile-card-${firstText(profile.personSlug, profile.slug, profile.id, "profile").replace(/[^a-z0-9_-]/gi, "-")}`;
    const details = createEl("details", "profile-card__details");
    const bodyId = `profile-details-${firstText(profile.personSlug, profile.slug, profile.id, "profile").replace(/[^a-z0-9_-]/gi, "-")}`;
    const summaryToggle = createEl("summary", "profile-card__summary-toggle");
    summaryToggle.setAttribute("aria-controls", bodyId);

    const head = createEl("div", "profile-card__head");
    const titleWrap = createEl("div", "profile-card__title-wrap");
    const titleRow = createEl("div", "profile-card__title-row");
    titleRow.appendChild(createEl("h4", "profile-card__title", formatCandidateDisplayName(firstText(profile.personName, profile.name, "候補予定者"))));
    const ageLabel = profileAgeLabel(profile, election);
    if (ageLabel) {
      titleRow.appendChild(createEl("span", "profile-card__age", ageLabel));
    }
    titleWrap.appendChild(titleRow);
    const subtitle = normalizeText(profile.personKana)
      ? formatCandidateDisplayKana(profile.personKana)
      : firstText(profile.personSlug, profile.slug);
    if (subtitle) {
      titleWrap.appendChild(createEl("p", "profile-card__subtitle", subtitle));
    }
    const identityLine = renderIdentityLabels(collectProfileIdentityLabels(profile));
    if (identityLine) {
      titleWrap.appendChild(identityLine);
    }
    head.appendChild(titleWrap);
    head.appendChild(createBadge(profileStatusLabel(profile.status || profile.profileStatus), isRelatedInterest ? "related" : "motion"));
    summaryToggle.appendChild(head);

    const summary = firstText(profile.summary, profile.description, profile.note);
    if (summary) {
      summaryToggle.appendChild(createEl("p", "profile-card__summary", summary));
    }

    const summaryLinks = collectProfileSummaryLinks(profile);
    if (summaryLinks.length) {
      const summaryLinkRow = createEl("div", "profile-card__summary-links");
      summaryLinks.forEach((link) => {
        const chip = createSummaryLinkChip(link);
        if (chip) {
          summaryLinkRow.appendChild(chip);
        }
      });
      if (summaryLinkRow.children.length) {
        summaryToggle.appendChild(summaryLinkRow);
      }
    }

    const meta = createEl("div", "profile-card__meta");
    const role = firstText(profile.currentOrRecentRole, profile.currentTitle, profile.role, profile.title, profile.position, profile.office);
    if (role) {
      const item = createEl("div", "profile-card__meta-item");
      item.appendChild(createEl("span", "profile-card__meta-label", "肩書き"));
      item.appendChild(createEl("strong", "profile-card__meta-value", role));
      meta.appendChild(item);
    }
    const updated = firstText(profile.lastCheckedAt, profile.updatedAt, profile.checkedAt);
    if (updated) {
      const item = createEl("div", "profile-card__meta-item");
      item.appendChild(createEl("span", "profile-card__meta-label", "最終確認"));
      item.appendChild(createEl("strong", "profile-card__meta-value", formatDateTime(updated)));
      meta.appendChild(item);
    }
    if (meta.children.length) {
      const summaryFooter = createEl("div", "profile-card__summary-footer");
      summaryFooter.appendChild(meta);
      summaryFooter.appendChild(createEl("span", "profile-card__toggle-text", "詳細を見る"));
      summaryToggle.appendChild(summaryFooter);
    } else {
      summaryToggle.appendChild(createEl("span", "profile-card__toggle-text", "詳細を見る"));
    }

    details.appendChild(summaryToggle);

    const body = createEl("div", "profile-card__body");
    body.id = bodyId;

    const sections = createEl("div", "profile-card__sections");
    const sectionItems = [
      ["公式・プロフィール導線", toArray(profile.officialSiteUrls || profile.officialSites || profile.officialSiteUrl || profile.website || profile.websites), (item) => renderProfileLinkItem(item, "公式サイト")],
      ["公式SNS・本人SNS", toArray(profile.officialSocials || profile.socials || profile.officialSocialLinks), (item) => renderProfileLinkItem(item)],
      ["本人発信", toArray(profile.personStatements || profile.selfStatements || profile.officialStatements || profile.messages || profile.officialPosts || profile.posts), (item) => renderProfileLinkItem(item)],
      ["政策リンク", toArray(profile.policyLinks || profile.policies), (item) => renderProfileLinkItem(item)],
      ["経歴項目", toArray(profile.careerItems || profile.career || profile.biography || profile.history), renderProfileFactItem],
      ["選挙歴", toArray(profile.electionHistory || profile.elections || profile.electionItems), renderProfileFactItem],
      ["出典", toArray(profile.evidence || profile.sources || profile.references), renderProfileLinkItem]
    ];

    sectionItems.forEach(([title, items, renderItem]) => {
      const block = renderProfileBlock(title, items, renderItem);
      if (block) {
        sections.appendChild(block);
      }
    });

    if (sections.children.length) {
      body.appendChild(sections);
      details.appendChild(body);
    }

    card.appendChild(details);
    return card;
  }

  function initializeProfileAccordions(container) {
    const accordions = Array.from(container.querySelectorAll(".profile-card__details"));
    accordions.forEach((details) => {
      const toggleText = details.querySelector(".profile-card__toggle-text");
      const updateToggleText = () => {
        if (toggleText) {
          toggleText.textContent = details.open ? "閉じる" : "詳細を見る";
        }
      };

      details.addEventListener("toggle", () => {
        updateToggleText();
        if (!details.open) {
          return;
        }
        accordions.forEach((other) => {
          if (other !== details) {
            other.open = false;
          }
        });
      });

      updateToggleText();
    });
  }

  function renderComparisonSlot(slot) {
    const cell = createEl("div", "comparison-slot");
    cell.appendChild(createEl("span", "comparison-slot__label", slot.label));
    if (slot.link) {
      appendLink(cell, slot.link.url, slot.link.label, "comparison-slot__link");
    } else {
      cell.appendChild(createEl("span", "comparison-slot__missing", "未掲載"));
    }
    return cell;
  }

  function renderComparisonSection(election) {
    const profiles = getPrimaryCandidateProfiles(election);
    if (!profiles.length) {
      return null;
    }
    const copy = getPresentationCopy(election);

    const section = createEl("section", "section");
    section.id = "official-links";

    const header = createEl("div", "section__header");
    header.appendChild(createEl("p", "eyebrow", "official links"));
    header.appendChild(createEl("h3", null, copy.comparisonTitle));
    header.appendChild(createEl("p", "section__lead", copy.comparisonLead));

    const note = createEl(
      "p",
      "comparison-note",
      copy.comparisonNote
    );

    const list = createEl("div", "comparison-list");
    profiles.forEach((profile) => {
      const row = createEl("article", "comparison-row");
      const head = createEl("div", "comparison-row__head");
      const titleWrap = createEl("div", "comparison-row__title-wrap");
      titleWrap.appendChild(createEl("h4", "comparison-row__title", formatCandidateDisplayName(firstText(profile.personName, profile.name))));
      const subtitle = normalizeText(profile.personKana)
        ? formatCandidateDisplayKana(profile.personKana)
        : firstText(profile.personSlug, profile.slug);
      if (subtitle) {
        titleWrap.appendChild(createEl("p", "comparison-row__subtitle", subtitle));
      }
      const identityLine = renderIdentityLabels(collectProfileIdentityLabels(profile));
      if (identityLine) {
        titleWrap.appendChild(identityLine);
      }
      head.appendChild(titleWrap);
      head.appendChild(createBadge(profileStatusLabel(profile.status || profile.profileStatus), "motion"));
      row.appendChild(head);

      const slots = createEl("div", "comparison-row__slots");
      collectComparisonLinks(profile).forEach((slot) => {
        slots.appendChild(renderComparisonSlot(slot));
      });
      row.appendChild(slots);
      list.appendChild(row);
    });

    section.append(header, note, list);
    return section;
  }

function renderStatusSection(election) {
    const status = collectPageStatus(election);
    const copy = getPresentationCopy(election);
    const section = createEl("section", "section");
    section.id = "current-status";

    const header = createEl("div", "section__header");
    header.appendChild(createEl("p", "eyebrow", "current status"));
    header.appendChild(createEl("h3", null, status.title || "現在の扱い"));
    header.appendChild(createEl("p", "section__lead", "このページの基準と更新方針です。"));

    const panel = createEl("article", "status-panel");
    const noticeText = [copy.noticeStrong, copy.noticeText].map((item) => normalizeText(item)).filter(Boolean).join(" ");
    const statusSummary = normalizeText(status.summary);
    if (statusSummary && statusSummary !== normalizeText(copy.statusLead) && statusSummary !== noticeText) {
      panel.appendChild(createEl("p", "status-panel__summary", status.summary));
    }

    const meta = createEl("div", "status-panel__meta");
    [
      ["更新", status.updatedAt ? formatDateTime(status.updatedAt) : "未確認"],
      ["基準", status.basis || "未確認"]
    ].forEach(([label, value]) => {
      const item = createEl("div", "status-panel__meta-item");
      item.appendChild(createEl("span", "status-panel__meta-label", label));
      item.appendChild(createEl("strong", "status-panel__meta-value", value));
      meta.appendChild(item);
    });
    panel.appendChild(meta);

    const details = toArray(status.items);
    if (details.length) {
      const list = createEl("div", "status-panel__list");
      details.forEach((item) => {
        list.appendChild(createEl("div", "status-panel__item", normalizeText(item)));
      });
      panel.appendChild(list);
    }

    const links = toArray(status.links);
    if (links.length) {
      const linkRow = createEl("div", "status-panel__links");
      links.forEach((link) => {
        const normalized = normalizeLinkItem(link, "更新");
        if (normalized && normalized.url) {
          linkRow.appendChild(createSummaryLinkChip(normalized));
        }
      });
      if (linkRow.children.length) {
        panel.appendChild(linkRow);
      }
    }

    section.append(header, panel);
    return section;
  }

  function renderUpdatesSection(election) {
    const updates = collectPageUpdates(election);
    const section = createEl("section", "section");
    section.id = "updates";

    const header = createEl("div", "section__header");
    header.appendChild(createEl("p", "eyebrow", "updates"));
    header.appendChild(createEl("h3", null, "更新履歴"));
    header.appendChild(createEl("p", "section__lead", "最新の差分を簡潔に並べています。"));

    const list = createEl("div", "updates-list");
    updates.forEach((update) => {
      const item = createEl("article", "update-item");
      const top = createEl("div", "update-item__top");
      top.appendChild(createEl("strong", "update-item__title", update.title));
      top.appendChild(createEl("span", "update-item__date", formatDateTime(update.date)));
      item.appendChild(top);
      if (update.summary) {
        item.appendChild(createEl("p", "update-item__summary", update.summary));
      }
      const footer = createEl("div", "update-item__footer");
      if (update.sourceName) {
        footer.appendChild(createEl("span", "update-item__source", update.sourceName));
      }
      if (update.url) {
        appendLink(footer, update.url, "開く", "inline-link");
      }
      item.appendChild(footer);
      list.appendChild(item);
    });

    section.append(header, list);
    return section;
  }

  function renderProfilesSection(election) {
    const profiles = getPrimaryCandidateProfiles(election);
    if (!profiles.length) {
      return null;
    }
    const copy = getPresentationCopy(election);

    const section = createEl("section", "section");
    section.id = "profiles";

    const header = createEl("div", "section__header");
    header.appendChild(createEl("p", "eyebrow", "candidate profiles"));
    header.appendChild(createEl("h3", null, copy.profilesTitle));
    header.appendChild(createEl("p", "section__lead", copy.profilesLead));

    const cards = createEl("div", "profile-grid");
    profiles.forEach((profile) => cards.appendChild(renderProfileCard(profile, election)));

    section.append(header, cards);
    return section;
  }

  function renderRelatedInterestSection(election) {
    const profiles = getRelatedInterestProfiles(election);
    if (!profiles.length) {
      return null;
    }
    const copy = getPresentationCopy(election);

    const section = createEl("section", "section section--related");
    section.id = "related";

    const header = createEl("div", "section__header");
    header.appendChild(createEl("p", "eyebrow", "related interest"));
    header.appendChild(createEl("h3", null, "関連動向"));
    header.appendChild(createEl("p", "section__lead", "候補予定者ではなく、報道や本人発信で参入可能性などが言及された情報をまとめています。"));

    const note = createEl(
      "p",
      "comparison-note",
      copy.relatedNote
    );

    const cards = createEl("div", "profile-grid");
    profiles.forEach((profile) => cards.appendChild(renderProfileCard(profile, election, { variant: "related" })));

    section.append(header, note, cards);
    return section;
  }

  function renderMissing(message) {
    root.innerHTML = "";
    const box = createEl("section", "empty-state");
    const title = createEl("h2", null, "データが見つかりません");
    const body = createEl("p", null, message);
    box.append(title, body);
    root.appendChild(box);
  }

function renderNotice(election) {
    const copy = getPresentationCopy(election);
    const notice = createEl("section", "notice");
    notice.setAttribute("aria-label", "注意文");
    if (copy.noticeStrong) {
      notice.appendChild(createEl("strong", null, copy.noticeStrong));
    }
    if (copy.noticeText) {
      notice.appendChild(document.createTextNode(copy.noticeStrong ? ` ${copy.noticeText}` : copy.noticeText));
    }
    return notice;
  }

function renderHero(election, officialResources, signals, endorsements) {
    const hero = createEl("section", "hero");
    const presentation = getPresentationCopy(election);
    const primaryProfiles = getPrimaryCandidateProfiles(election);
    const primarySignals = signals.filter((signal) => !isRelatedInterestSignal(signal));

    const copy = createEl("div", "hero__copy");
    copy.appendChild(createEl("p", "eyebrow", presentation.heroEyebrow));
    copy.appendChild(createEl("p", "hero__lead", presentation.heroLead));

    const meta = createEl("div", "hero__meta");
    const dateItems = [
      ["投票日", formatDateWithWeekday(election.voteDate)],
      ["告示日", formatDateWithWeekday(election.noticeDate)],
      ["公式リンク", `${officialResources.length}件`],
      [presentation.primaryLabel, `${primaryProfiles.length || primarySignals.length}件`]
    ];
    dateItems.forEach(([label, value]) => {
      const item = createEl("article", "meta-card");
      item.appendChild(createEl("span", "meta-card__label", label));
      item.appendChild(createEl("strong", "meta-card__value", value));
      meta.appendChild(item);
    });

    const actions = createEl("div", "hero__actions");
    if (primaryProfiles.length) {
      appendLink(actions, "#quick-compare", "ひと目比較へ", "button button--primary");
    } else {
      appendLink(actions, "#signals", "出馬動向へ", "button button--primary");
    }
    appendLink(actions, "#official", "公式情報へ", "button button--secondary");

    copy.append(meta, actions);

    const note = createEl("aside", "hero__note");
    note.appendChild(createEl("p", "hero__note-label", presentation.heroNoteLabel || "読み方"));
    note.appendChild(createEl("p", null, presentation.heroNoteText));
    const noteList = createEl("div", "hero__note-list");
    [
      ["推薦・支持", `${endorsements.length}件`],
      ["最終更新", formatDateTime(data.generatedAt)]
    ].forEach(([label, value]) => {
      const row = createEl("div", "mini-row");
      row.appendChild(createEl("span", "mini-row__label", label));
      row.appendChild(createEl("strong", "mini-row__value", value));
      noteList.appendChild(row);
    });
    note.appendChild(noteList);

    hero.append(copy, note);
    return hero;
  }

  function renderOfficialSection(election, officialResources) {
    const section = createEl("section", "section");
    section.id = "official";

    const header = createEl("div", "section__header");
    header.appendChild(createEl("p", "eyebrow", "official information"));
    header.appendChild(createEl("h3", null, "公式情報"));
    header.appendChild(createEl("p", "section__lead", "投票日・告示日と、県公式の案内ページだけをまとめています。"));

    const grid = createEl("div", "date-grid");
    [
      ["投票日", formatDateWithWeekday(election.voteDate)],
      ["告示日", formatDateWithWeekday(election.noticeDate)],
      ["対象", election.primaryRegionName || "滋賀県"]
    ].forEach(([label, value]) => {
      const card = createEl("article", "date-card");
      card.appendChild(createEl("span", "date-card__label", label));
      card.appendChild(createEl("strong", "date-card__value", value));
      grid.appendChild(card);
    });

    const linksGrid = createEl("div", "link-grid");
    officialResources.forEach((resource) => {
      const card = createEl("article", "link-card");
      const badgeWrap = createEl("div", "link-card__badges");
      badgeWrap.appendChild(createBadge(resourceKindLabels[resource.kind] || resource.kind, "official"));
      badgeWrap.appendChild(createBadge("公式", "official-alt"));
      card.appendChild(badgeWrap);
      card.appendChild(createEl("h4", "link-card__title", resource.title));
      card.appendChild(createEl("p", "link-card__summary", resource.summary));
      const footer = createEl("div", "link-card__footer");
      appendLink(footer, resource.url, "開く", "inline-link");
      card.appendChild(footer);
      linksGrid.appendChild(card);
    });

    section.append(header, grid, linksGrid);
    return section;
  }

  function renderSignalCard(signal) {
    const isRelated = isRelatedInterestSignal(signal);
    const isOfficial = normalizeText(signal && signal.status).toLowerCase() === "official_candidate";
    const card = createEl("article", `signal-card${isRelated ? " signal-card--related" : ""}`);
    const head = createEl("div", "signal-card__head");
    const titleWrap = createEl("div", "signal-card__title-wrap");
    titleWrap.appendChild(createEl("h4", "signal-card__title", signal.personName));
    titleWrap.appendChild(createEl("p", "signal-card__subtitle", signal.personSlug));
    head.appendChild(titleWrap);
    head.appendChild(createBadge(
      isRelated ? "関連動向" : (isOfficial ? "公式候補者" : "出馬動向"),
      isRelated ? "related" : (isOfficial ? "official" : "motion")
    ));
    card.appendChild(head);

    const meta = createEl("div", "signal-card__meta");
    meta.appendChild(createEl("span", null, `状態: ${isRelated ? "関連動向" : (isOfficial ? "公式候補者" : "出馬表明済み")}`));
    meta.appendChild(createEl("span", null, `信頼度: ${signal.confidence}`));
    meta.appendChild(createEl("span", null, `最終確認: ${formatDateTime(signal.lastCheckedAt)}`));
    card.appendChild(meta);

    card.appendChild(createEl("p", "signal-card__summary", signal.summary));

    const evidenceList = createEl("div", "evidence-list");
    (signal.evidence || []).forEach((evidence) => {
      const row = createEl("article", "evidence-item");
      row.appendChild(createEl("span", "evidence-item__source", evidence.sourceName));
      row.appendChild(createEl("strong", "evidence-item__title", evidence.title));
      row.appendChild(createEl("span", "evidence-item__date", formatDate(evidence.publishedAt)));
      appendLink(row, evidence.url, "出典を開く", "inline-link");
      evidenceList.appendChild(row);
    });
    card.appendChild(evidenceList);
    return card;
  }

  function renderSignalGroup(title, lead, signals) {
    const group = createEl("div", "signal-group");
    group.appendChild(createEl("h4", "signal-group__title", title));
    if (lead) {
      group.appendChild(createEl("p", "signal-group__lead", lead));
    }

    const cards = createEl("div", "card-grid");
    signals.forEach((signal) => cards.appendChild(renderSignalCard(signal)));
    group.appendChild(cards);
    return group;
  }

  function renderSignalsSection(election) {
    const signals = [...(election.candidateSignals || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    if (!signals.length) {
      return null;
    }

    const copy = getPresentationCopy(election);
    const primarySignals = signals.filter((signal) => !isRelatedInterestSignal(signal));
    const relatedSignals = signals.filter(isRelatedInterestSignal);
    const section = createEl("section", "section");
    section.id = "signals";

    const header = createEl("div", "section__header");
    header.appendChild(createEl("p", "eyebrow", copy.signalsEyebrow));
    header.appendChild(createEl("h3", null, copy.signalsTitle));
    header.appendChild(createEl("p", "section__lead", copy.signalsLead));

    section.appendChild(header);
    if (primarySignals.length) {
      section.appendChild(renderSignalGroup(
        copy.primarySignalTitle,
        copy.primarySignalLead,
        primarySignals
      ));
    }
    if (relatedSignals.length) {
      section.appendChild(renderSignalGroup(
        "関連動向",
        "候補予定者ではありません。参入可能性などが言及された情報として分けています。",
        relatedSignals
      ));
    }

    return section;
  }

  function renderEndorsementCard(item) {
    const card = createEl("article", "endorsement-card");
    const head = createEl("div", "endorsement-card__head");
    const left = createEl("div", "endorsement-card__title-wrap");
    left.appendChild(createEl("h4", "endorsement-card__title", item.personName));
    left.appendChild(createEl("p", "endorsement-card__subtitle", item.endorserName));
    head.append(left, createBadge(item.relationType === "support" ? "支持" : "推薦", item.relationType === "support" ? "support" : "recommend"));
    card.appendChild(head);
    card.appendChild(createEl("p", "endorsement-card__summary", item.summary));

    const meta = createEl("div", "signal-card__meta");
    meta.appendChild(createEl("span", null, `信頼度: ${item.confidence}`));
    meta.appendChild(createEl("span", null, `最終確認: ${formatDateTime(item.lastCheckedAt)}`));
    card.appendChild(meta);

    const evidenceList = createEl("div", "evidence-list");
    (item.evidence || []).forEach((evidence) => {
      const row = createEl("article", "evidence-item");
      row.appendChild(createEl("span", "evidence-item__source", evidence.sourceName));
      row.appendChild(createEl("strong", "evidence-item__title", evidence.title));
      row.appendChild(createEl("span", "evidence-item__date", formatDate(evidence.publishedAt)));
      appendLink(row, evidence.url, "出典を開く", "inline-link");
      evidenceList.appendChild(row);
    });
    card.appendChild(evidenceList);
    return card;
  }

  function renderEndorsementsSection(election) {
    const endorsements = [...(election.candidateEndorsements || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const section = createEl("section", "section");
    section.id = "endorsements";

    const header = createEl("div", "section__header");
    header.appendChild(createEl("p", "eyebrow", "recommendations and support"));
    header.appendChild(createEl("h3", null, "推薦・支持"));
    header.appendChild(createEl("p", "section__lead", "出馬動向とは別レイヤーで、推薦や支持の報道だけを集めています。"));

    const cards = createEl("div", "card-grid");
    endorsements.forEach((item) => cards.appendChild(renderEndorsementCard(item)));

    section.append(header, cards);
    return section;
  }

  function renderTimelineSection(election, officialResources) {
    const officialSource = officialResources[0] || null;
    const timelineItems = [];

    if (election.noticeDate) {
      timelineItems.push({
        date: election.noticeDate,
        category: "公式",
        title: "告示日",
        summary: `${election.name} の告示日です。`,
        sourceName: officialSource ? officialSource.title : `${election.primaryRegionName || "滋賀県"}公式`,
        url: officialSource ? officialSource.url : election.sourceUrl
      });
    }

    if (election.voteDate) {
      timelineItems.push({
        date: election.voteDate,
        category: "公式",
        title: "投票日",
        summary: `${election.name} の投票日です。`,
        sourceName: officialSource ? officialSource.title : `${election.primaryRegionName || "滋賀県"}公式`,
        url: officialSource ? officialSource.url : election.sourceUrl
      });
    }

    (election.candidateSignals || []).forEach((signal) => {
      (signal.evidence || []).forEach((source) => {
        timelineItems.push({
          date: source.publishedAt,
          category: signal.status === "interested" ? "関連動向" : "出馬動向",
          title: `${signal.personName} - ${source.title}`,
          summary: signal.summary,
          sourceName: source.sourceName,
          url: source.url
        });
      });
    });

    (election.candidateEndorsements || []).forEach((item) => {
      (item.evidence || []).forEach((source) => {
        timelineItems.push({
          date: source.publishedAt,
          category: item.relationType === "support" ? "支持" : "推薦",
          title: `${item.endorserName} - ${item.personName}`,
          summary: item.summary,
          sourceName: source.sourceName,
          url: source.url
        });
      });
    });

    timelineItems.sort((a, b) => String(b.date).localeCompare(String(a.date)));

    const section = createEl("section", "section");
    section.id = "timeline";
    const header = createEl("div", "section__header");
    header.appendChild(createEl("p", "eyebrow", "timeline"));
    header.appendChild(createEl("h3", null, "時系列"));
    header.appendChild(createEl("p", "section__lead", "公式日程と、報道で確認できた動きをひと続きで見られるようにしています。"));

    const list = createEl("div", "timeline-list");
    timelineItems.forEach((item) => {
      const row = createEl("article", "timeline-item");
      const top = createEl("div", "timeline-item__top");
      top.appendChild(createBadge(item.category, item.category === "公式" ? "official" : "motion"));
      top.appendChild(createEl("span", "timeline-item__date", formatDate(item.date)));
      row.appendChild(top);
      row.appendChild(createEl("strong", "timeline-item__title", item.title));
      row.appendChild(createEl("p", "timeline-item__summary", item.summary));
      const footer = createEl("div", "timeline-item__footer");
      footer.appendChild(createEl("span", "timeline-item__source", item.sourceName));
      appendLink(footer, item.url, "出典", "inline-link");
      row.appendChild(footer);
      list.appendChild(row);
    });

    section.append(header, list);
    return section;
  }

  function renderSourcesSection(election, officialResources) {
    const sources = collectSourceRecords(election, officialResources);
    const grouped = groupSourceRecords(sources);

    const section = createEl("section", "section");
    section.id = "sources";
    const header = createEl("div", "section__header");
    header.appendChild(createEl("p", "eyebrow", "sources"));
    header.appendChild(createEl("h3", null, "出典一覧"));
    header.appendChild(createEl("p", "section__lead", "公式・公的情報、本人発信、報道を分けて並べています。"));

    const wrapper = createEl("div", "source-groups");
    ["公式・公的情報", "本人発信", "報道"].forEach((groupName) => {
      const group = grouped.get(groupName) || [];
      const card = createEl("article", "source-group");
      card.appendChild(createEl("h4", "source-group__title", groupName));
      const list = createEl("div", "source-list");
      if (group.length) {
        group.forEach((item) => {
          const row = createEl("div", "source-row");
          const top = createEl("div", "source-row__top");
          top.appendChild(createEl("strong", "source-row__title", item.title));
          const kind = sourceTypeMeta(item.sourceType, item.sourceKind);
          if (kind) {
            top.appendChild(createEl("span", "source-row__kind", kind));
          }
          row.appendChild(top);
          row.appendChild(createEl("span", "source-row__meta", [item.sourceName, formatDate(item.publishedAt), item.context].filter(Boolean).join(" / ")));
          if (item.url) {
            appendLink(row, item.url, "開く", "inline-link");
          }
          list.appendChild(row);
        });
      } else {
        list.appendChild(createEl("p", "section__empty", "未確認"));
      }
      card.appendChild(list);
      wrapper.appendChild(card);
    });

    section.append(header, wrapper);
    return section;
  }

  function renderPage(election) {
    const officialResources = [...(election.resources || [])]
      .filter((resource) => resource.isOfficial)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const signals = election.candidateSignals || [];
    const endorsements = election.candidateEndorsements || [];

    root.innerHTML = "";
    const nodes = [
      renderNotice(election),
      renderHero(election, officialResources, signals, endorsements),
      renderQuickCompareSection(election),
      renderStatusSection(election),
      renderUpdatesSection(election),
      renderOfficialSection(election, officialResources),
      renderComparisonSection(election),
      renderProfilesSection(election),
      renderRelatedInterestSection(election),
      renderSignalsSection(election),
      renderEndorsementsSection(election),
      renderTimelineSection(election, officialResources),
      renderSourcesSection(election, officialResources)
    ].filter(Boolean);

    root.append(...nodes);
    initializeProfileAccordions(root);
  }

  const election = getElection();
  if (!election) {
    renderMissing("window.ELECTION_SITE_DATA から el-pref-25-governor-2026 を取得できませんでした。");
    return;
  }

  renderPage(election);
})();
