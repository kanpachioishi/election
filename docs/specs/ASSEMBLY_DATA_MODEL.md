# Assembly Data Model

## Purpose
- `assembly_hub`: 自治体ごとの議会ハブページを表す
- `assembly_session_summary`: 各会期の要点まとめを表す

## assembly_hub
- `id`: 一意な識別子
- `slug`: 公開URL用の短い名前
- `title`: ページタイトル
- `page_path`: 公開ページのパス
- `jurisdiction_level`: `municipality` など
- `prefecture_code`
- `municipality_code`
- `prefecture_name`
- `municipality_name`
- `body_name`: 例 `福岡市議会`
- `body_type`: 例 `city_assembly`
- `summary`: トップ一覧に出す短い説明
- `coverage_scope`: `schedule`, `agenda_results`, `minutes`, `video`, `newsletter`
- `latest_session_id`
- `latest_session_label`
- `latest_checked_at`
- `session_count`
- `coverage_status`: `active`, `draft`, `archived`

## assembly_session_summary
- `id`
- `hub_id`
- `session_label`
- `session_kind`: `regular`, `temporary`
- `session_start_on`
- `session_end_on`
- `session_sort_key`
- `is_latest`
- `summary_3lines`
- `decisions_summary`
- `life_impact_summary`
- `schedule_url`
- `agenda_results_url`
- `minutes_url`
- `video_url`
- `newsletter_url`
- `checked_at`
- `status`

## Top Page Fields
- `title`
- `summary`
- `municipality_name`
- `body_name`
- `latest_session_label`
- `latest_checked_at`
- `coverage_scope`
- `session_count`
- `page_path`

## Coverage Metrics
- `assembly_hub_count`
- `published_session_count`
- `hubs_with_minutes_count`
- `hubs_with_video_count`
- `hubs_with_newsletter_count`
