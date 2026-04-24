# 現職市長台帳 Validator 要件案

最終更新: 2026-04-23
ステータス: Draft v0
関連: [現職市長台帳スキーマ案](/home/shimo/election/docs/specs/CURRENT_MAYORS_SCHEMA_DRAFT.md), [サンプル JSON](/home/shimo/election/docs/specs/CURRENT_MAYORS_SAMPLE_JSON.md)

## 1. 目的

この文書は、将来 `validate-data-v1` に現職市長台帳の検査を追加するとき、最低限どこを見るべきかを整理する。

## 2. トップレベル検査

- root は object
- `schema_version = 1`
- `generated_at` は RFC 3339
- `pref_code` は 2 桁数字
- `pref_slug` は kebab-case
- `pref_name` は空でない文字列
- `records` は array

## 3. 県別ファイル整合性

- ファイル名の `01-hokkaido.json` と `pref_code`, `pref_slug` が一致する
- すべての record の `pref_code` がファイルの `pref_code` と一致する
- 同一ファイル内の `id` は一意
- 同一ファイル内の `municipality_code` は一意
- 同一ファイル内の `region_id` は一意

## 4. 市レコード検査

- `id` は非空文字列
- `region_id` は `regions.json` の municipality を参照する
- `municipality_code` は 5 桁数字
- `city_name` は非空文字列
- `city_slug` は kebab-case
- `mayor_name` は非空文字列
- `mayor_name_kana` は string or null
- `term_start` は `YYYY-MM-DD` or null
- `term_end` は `YYYY-MM-DD` or null
- `term_note` は string or null
- `status` は enum 内
- `investigated_at` は `YYYY-MM-DD`
- `sources` は array
- `note` は string or null

### 4.1 `status` enum 案

- `confirmed`
- `needs_review`
- `conflict`
- `missing_source`

## 5. `sources[]` 検査

- `kind` は enum 内
- `title` は非空文字列
- `url` は絶対 URL
- `checked_at` は `YYYY-MM-DD`
- `used_for` は 1 件以上の array
- `publisher` は string or null
- `note` は string or null

### 5.1 `kind` enum 案

- `official_profile`
- `municipality_home`
- `election_schedule`
- `election_result`
- `term_expiry_list`
- `press_release`
- `official_pdf`
- `other_official`

### 5.2 `used_for` enum 案

- `mayor_name`
- `mayor_name_kana`
- `term_start`
- `term_end`
- `term_note`
- `status`

## 6. 条件付き検査

- `status = confirmed` のとき `sources.length >= 1`
- `status = conflict` のとき `note` 必須
- `status = missing_source` のとき `sources` は 0 件でもよい
- `term_start` または `term_end` を補完したなら、`note` に補完理由があることを推奨
- `investigated_at` は各 `sources[].checked_at` より前であってはならない

## 7. 参照整合性

- `region_id` と `municipality_code` が `regions.json` の同一 record に対応する
- `pref_code` が `region_id` の都道府県コードと一致する
- `city_name` が `regions.json` の名称と大きく矛盾しないこと

## 8. 初期実装の優先順位

初回の validator では、まず次だけ入れれば十分。

1. トップレベル構造
2. `region_id` / `municipality_code` / `pref_code` の整合
3. `status` enum
4. `investigated_at`
5. `sources[].url` と `sources[].checked_at`
6. `status = confirmed` 時の `sources` 必須

## 9. 後回しでよい検査

- `city_name` と `city_slug` の表記ゆれ検査
- `term_start < term_end` の厳密検査
- 補完文言の自然言語チェック
- `used_for` の過不足チェック
