# Local Government Sites Spec

Last updated: 2026-04-20
Status: Draft

## Purpose

Store canonical official entry URLs for municipalities and prefectures as base infrastructure separate from election records.

This file is not a link directory.
It is the source of truth for "which official site should we start from for this region and purpose".

## File

- `data/v1/local_government_sites.json`

## Root Shape

```json
{
  "schema_version": 1,
  "generated_at": "2026-04-20T12:00:00+09:00",
  "records": []
}
```

## Record Shape

```json
{
  "id": "mun-41208-municipality-home",
  "region_id": "mun-41208",
  "site_kind": "municipality_home",
  "label": "鹿島市公式ホームページ",
  "url": "https://www.city.saga-kashima.lg.jp/",
  "verification": {
    "source_url": "https://www.city.saga-kashima.lg.jp/",
    "source_type": "official",
    "confirmed_at": "2026-04-20T12:00:00+09:00",
    "last_checked_at": "2026-04-20T12:00:00+09:00",
    "status": "verified",
    "note": null
  },
  "note": null
}
```

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | kebab-case. `{region_id}-{site_kind}` recommended |
| `region_id` | string | yes | references `data/v1/regions.json` |
| `site_kind` | string | yes | one of the allowed enums below |
| `label` | string | yes | UI-facing label |
| `url` | string | yes | absolute URL |
| `verification` | object | yes | existing shared verification model |
| `note` | string or null | no | optional memo |

## Allowed `site_kind`

- `municipality_home`
- `prefecture_home`
- `election_commission`
- `assembly`
- `mayor`
- `governor`

## Validation Rules

- `region_id` must exist in `regions.json`
- `site_kind = municipality_home` and `mayor` must point to `level = municipality`
- `site_kind = prefecture_home` and `governor` must point to `level = prefecture`
- `verification.status = verified` is required before public use
- one canonical record per `region_id + site_kind`

## Why This Is Separate From `Region`

- `Region` is an identity registry
- site URLs are operational data and can change independently
- one region can need multiple official entry points over time
- future `election_commission` / `assembly` / `mayor` / `governor` URLs fit naturally here

## Design Decision For Ordinance-Designated Cities

This first version does not add `coverage_region_ids`.

Rule:
- city hall URLs belong to the owning city-level `region_id`
- ward records should not be used as a substitute for city-level ownership
- if a city-level `Region` is missing, add that `Region` first

This keeps the first version small and predictable.
If ward-to-city fallback becomes necessary later, add an explicit coverage field in v2.
