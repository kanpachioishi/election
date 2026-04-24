---
name: current-mayors-audit
description: Use this skill when auditing the current-mayors ledger for one prefecture at a time, especially to verify incumbent mayor names, term dates, investigation dates, and source URLs, and to output findings, sources, and diffs without directly updating canonical data.
---

# Current Mayors Audit

Use this skill for prefecture-by-prefecture verification of the current mayors ledger.

## Goal

Verify one prefecture at a time and produce reviewable outputs before any canonical update.

## Do

- Work on exactly one prefecture per run
- Prefer official municipal and prefectural sources
- Record investigation date and per-source checked date
- Output findings markdown, sources json, and diff json
- Mark uncertain records as `conflict` or `missing_source`

## Do Not

- Do not directly update `data/v1/current_mayors/`
- Do not infer missing values without noting the reason
- Do not merge multiple prefectures into one report

## Output Paths

Write outputs under:

```text
research/current-mayors/findings/{pref_code}-{pref_slug}/
  YYYY-MM-DD-roundN.md
  YYYY-MM-DD-roundN.sources.json
  YYYY-MM-DD-roundN.diff.json
```

## Required Fields Per City

- `mayor_name`
- `investigated_at`
- `sources[].url`
- `sources[].checked_at`
- `status`

## Source Priority

1. Municipal official profile / mayor office pages
2. Prefectural or municipal term-expiry lists
3. Official election schedules or results
4. Other official PDFs or press releases

## Status Rules

- `confirmed`: enough official evidence to support the record
- `needs_review`: mostly identified but still weak or incomplete
- `conflict`: official sources disagree or the record cannot be reconciled cleanly
- `missing_source`: required official sources were not found

## References

- Read [references/verification-rules.md](references/verification-rules.md) for record judgment rules
- Read [references/output-format.md](references/output-format.md) for exact output structure
