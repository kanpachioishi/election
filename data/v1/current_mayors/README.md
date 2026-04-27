# Current Mayors Data

This directory is the source data for `site/pages/current-mayors.html`.

## Files

- `canonical.json`: aggregated records for all cities.
- `by_prefecture/*.json`: prefecture-sized records for review and editing.

## Migration Note

The first version was bootstrapped from the published table in
`site/pages/current-mayors.html` and enriched with the research artifacts under
`research/current-mayors/findings/`.

Going forward, edit these JSON files first and regenerate the public HTML table
instead of editing `site/pages/current-mayors.html` directly.

## Scripts

- `node scripts/current/sync-current-mayor-regions.mjs --write`
  fills missing city `region_id` / `municipality_code` dependencies in
  `data/v1/regions.json` from the Soumu municipality code table.
- `node scripts/current/generate-current-mayors-data.mjs --write`
  rebuilds this directory from the current migration inputs.
- `node scripts/current/generate-current-mayors-page.mjs --write`
  rewrites the public table from `canonical.json`.
