# Output Format

## Findings Markdown

Include:

- prefecture
- investigated_at
- number of cities checked
- counts by status
- per-city summary blocks for non-trivial cases

## Sources JSON

Use:

```json
{
  "pref_code": "10",
  "investigated_at": "2026-04-23",
  "records": []
}
```

Each record should include:

- `municipality_code`
- `city_name`
- `sources`

## Diff JSON

Use:

```json
{
  "pref_code": "10",
  "compared_at": "2026-04-23",
  "changes": []
}
```

Each change should include:

- `municipality_code`
- `city_name`
- `field`
- `current_value`
- `proposed_value`
- `reason`
