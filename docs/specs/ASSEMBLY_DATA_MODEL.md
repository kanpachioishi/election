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

## assembly_engagement_report
- `id`
- `hub_id`
- `status`: `draft`, `review`, `published`, `archived`
- `report_label`: 例 `札幌市議会を知るための市政レポート`
- `report_year`
- `reference_date`: 資料内の事実をどの日付時点で扱うか
- `checked_at`: 公式資料を最後に確認した日
- `target_audience`: 例 `初めて市議会を見る人`
- `primary_question`: 例 `なぜ地方政治は遠く感じるのか`
- `primary_message`: 資料全体で伝える短い文
- `featured_session_id`: 関連する `assembly_session_summary.id`
- `featured_topic`: 例 `令和8年度予算`, `使用料改定`, `公共施設整備`
- `featured_decision`
  - `title`
  - `decision_date`
  - `result_label`: `可決`, `否決`, `修正可決`, `同意` など
  - `yes_count`
  - `no_count`
  - `other_count`
  - `vote_basis`: `member_vote`, `group_vote`, `total_only`, `unknown`
- `group_composition`
  - `basis_date`
  - `basis_label`: `現在`, `議決当時` など
  - `groups`: `name`, `seat_count`, `source_id`
- `election_signal`
  - `election_name`
  - `election_date`
  - `turnout`
  - `seat_count`
  - `candidate_count`
  - `last_elected_votes`
  - `runner_up_votes`
  - `margin_votes`
  - `source_id`
- `life_impact_points`: 生活との関わりを示す短文配列
- `source_links`: `id`, `kind`, `title`, `url`, `published_on`, `retrieved_on`
- `caveats`: 原文優先、会派構成の時点、未確認事項など
- `publish_assets`: 完成版HTML、PDF、画像などを公開する場合のパス

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
