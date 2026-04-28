# AGENTS.md

## Purpose

This project manages a website focused on elections and local government.

The repository is being rebuilt in WSL after previous operations were handled from a Windows Desktop `election` folder with an unclear structure. One goal of this migration is to improve accuracy, maintainability, and reproducibility by keeping source materials, drafts, published content, and research notes clearly separated.

## Operating Principles

- Keep the repository structure explicit and stable.
- Separate raw sources, working drafts, and publishable outputs.
- Preserve traceability for political, legal, and administrative information.
- Prefer Japanese filenames only when they improve operational clarity; otherwise use simple ASCII names.
- Do not mix temporary notes with long-term reference materials.
- Treat this repository as the canonical workspace going forward.
- Make changes locally in the WSL workspace, verify them there, and deploy in batches after the changes are ready.

## Current Repository Layout

The repository currently contains both active site assets and transitional legacy assets.

```text
/
  common/    legacy shared CSS for root-level pages
  data/      canonical data in v1 plus legacy compatibility outputs
  docs/      internal operating documents
  artifacts/ generated previews, browser state, and private work outputs
  pages/     legacy root-level static pages
  scripts/   generators, validators, and deploy helpers
  site/      current published static site
  workers/   line bot and related worker code
```

## Canonical vs Transitional Areas

- `site/` is the current public site.
- `data/v1/` is the canonical source of truth for structured data.
- `scripts/current/` contains current generators and validators.
- `scripts/legacy/` contains compatibility or old-operation scripts.
- root-level files in `scripts/` are compatibility entrypoints and should stay thin.
- `data/elections.js`, `data/regions.js`, `data/governor-term-inventory.js`, and similar root-level generated files are transitional compatibility assets.
- `pages/` and `common/` are legacy static assets and should not be expanded casually.
- `artifacts/` is not publishable source content.

## Directory Rules

- `data/v1/`: canonical data records.
- `docs/`: structured internal documentation. Keep files inside the existing subdirectories such as `plans`, `specs`, `runbooks`, and `handoffs`.
- `artifacts/`: screenshots, browser state, private work files, and temporary outputs that support operations but are not site source.
- `artifacts/private/`: non-public work materials. Keep files categorized under `datasets`, `batches`, `scripts`, `sources`, or `snapshots`.
- `site/`: current publishable frontend assets.
- `scripts/`: code that validates, generates, or deploys project outputs.
- `workers/`: operational backend-side integrations such as the line bot.
- `pages/` and `common/`: maintain only for compatibility or migration needs.

## Migration Rules

- Do not continue storing active files in the old Windows Desktop workspace.
- When moving files from the legacy environment, place them into the correct directory before editing them.
- If the category of a legacy file is unclear, store it temporarily under `archive/` and classify it later.
- Preserve original filenames or source metadata when that helps with traceability.
- Avoid duplicated copies across Windows and WSL once a file is migrated.
- When possible, move new work into canonical areas instead of reviving legacy root-level patterns.

## Content and Research Standards

- Prefer official primary sources for election and local government facts.
- Record source URLs, publication dates, and retrieval dates for important claims.
- Distinguish verified facts from draft interpretation or editorial opinion.
- Keep region names, election names, and date formats consistent within each content set.
- For content that may change over time, note the reference date explicitly in the file or front matter.

## Site Display Rules

- 地方区分は、トップページの「選挙を探す」で使う区分に統一する。
- canonical な地方区分は `site/assets/app.js` の `MACRO_REGION_LABELS` と `PREFECTURE_TO_MACRO_REGION`。他ページや台帳ページで地方フィルターを作る場合もこの対応に合わせる。
- 表示ラベルは `北海道・東北`、`関東`、`北陸`、`甲信越`、`東海`、`関西`、`中国`、`四国`、`九州・沖縄` を使う。`中部` や `近畿` など別粒度の地域名をサイト内フィルターとして混在させない。

## Assembly Engagement Reports

- Use `docs/templates/ASSEMBLY_ENGAGEMENT_REPORT_TEMPLATE.md` and `docs/templates/assembly-engagement-report-a4.html` for city council engagement materials.
- Keep report plans and workflows in `docs/plans/` and `docs/runbooks/`.
- Store collected source materials under `artifacts/private/sources/assembly-reports/`.
- Store drafts and generated working files under `artifacts/private/batches/assembly-reports/`.
- Move completed materials into `site/` only after source, neutrality, date, and display checks are complete.

## Team Operating Model

- For manager-style work, role assignment, review gates, or release decisions, use `docs/runbooks/SITE_TEAM_OPERATING_MODEL.md`.
- Use `docs/templates/WORK_REQUEST_TEMPLATE.md` for scoped implementation or research tasks.
- Use `docs/templates/REVIEW_RECORD_TEMPLATE.md` before treating a change as reviewed.
- Use `docs/templates/RELEASE_DECISION_TEMPLATE.md` before publishing or batching a deploy.
- In one-person or agent-only operation, roles may be combined, but source, data, implementation, review, and release checks should still be recorded separately when the change is substantial.

## File Naming

- Use descriptive names.
- Prefer lowercase with hyphens for ASCII filenames.
- Include year and region when handling election-specific materials.
- Avoid vague names such as `memo.txt`, `new.docx`, or `draft-final.md`.

Examples:

- `content/elections/2026/tokyo-gubernatorial-overview.md`
- `docs/research/kawasaki-city-council-notes.md`
- `data/raw/soumu-ministry-election-turnout-2026.csv`

## Agent Working Rules

- Before adding new files, choose the appropriate directory instead of placing files at the repository root.
- If a needed directory does not exist yet, create it deliberately and keep naming aligned with this document.
- Prefer small, composable files over large mixed-purpose documents.
- When restructuring files, preserve meaning and source traceability.
- Do not delete legacy materials unless explicitly asked.
- Prefer editing `site/`, `data/v1/`, `scripts/`, and `docs/` over editing legacy root-level assets.
- Treat local editing and verification as the default workflow; batch deployment comes after local validation and review.
- For top-page mayor election official-link checks, use `docs/runbooks/MAYOR_RESOURCE_LINK_PANEL_CHECK_FLOW.md`.
- For post-notice candidate-list and bulletin follow-ups, use `docs/runbooks/ELECTION_RESOURCE_FOLLOWUP_FLOW.md` and `scripts/list-election-resource-followups.mjs`.
- For static upcoming election detail pages, use `scripts/generate-election-pages.mjs`; existing custom pages under `site/elections/` without the generated marker must not be overwritten.
- For governor/prefectural assembly election cross-checks and prefectural assembly official-link collection, use `docs/runbooks/PREFECTURAL_ASSEMBLY_TERMS_RUNBOOK.md`.
- Keep official election resource links limited to official published resources. Unofficial candidate signals, news reports, declared intentions to run, briefing-session attendees, and pre-screening submitters belong on a dedicated non-official/candidate-intel page or data flow, not in `data/v1/election_resource_links` as `candidate_list`.
- If a new workflow emerges, update this `AGENTS.md` so future work stays consistent.

## Initial Priority

The immediate priority is to rebuild this project with a clean structure in WSL and establish it as the main operating environment for the election and local government site.
