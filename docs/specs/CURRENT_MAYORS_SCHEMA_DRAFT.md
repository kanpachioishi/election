# 現職市長台帳スキーマ案

最終更新: 2026-04-23
ステータス: Draft v0
関連: [データ形式仕様](/home/shimo/election/docs/specs/DATA_FILE_FORMAT_SPEC.md), [情報の確認基準](/home/shimo/election/docs/runbooks/OPERATIONS_FLOW.md)

## 1. 目的

この文書は、現職市長台帳を県ごとに調査・検証・更新するための JSON 形式のたたき台を定義する。

このスキーマで重視すること:

- 市ごとの現職市長情報を持つこと
- 調査した日を残すこと
- どの情報源を見て判断したかを残すこと
- すぐ公開せず、検証とレビューを挟めること

## 2. 配置案

正本候補は `data/v1/current_mayors/` 配下に置く。

```text
data/v1/current_mayors/
  canonical.json
  by_prefecture/
    01-hokkaido.json
    02-aomori.json
    03-iwate.json
```

- `canonical.json`
  全体集約が必要になったときの派生物
- `by_prefecture/{pref_code}-{slug}.json`
  作業単位・レビュー単位・再確認単位の正本候補

初期運用では、まず `by_prefecture/` を正本とし、`canonical.json` は後回しでもよい。

## 3. 共通ルール

- UTF-8
- LF
- ファイル末尾改行あり
- キー名は `snake_case`
- 日付は `YYYY-MM-DD`
- 日時は RFC 3339
- 不明値は空文字ではなく `null`
- 推測で補完した場合は `note` に理由を残す

## 4. トップレベル構造

県別ファイルは次の形を基本とする。

```json
{
  "schema_version": 1,
  "generated_at": "2026-04-23T18:00:00+09:00",
  "pref_code": "10",
  "pref_slug": "gunma",
  "pref_name": "群馬県",
  "records": []
}
```

## 5. 1市レコード案

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | 必須 | `mayor-mun-10209` のような安定 ID |
| `region_id` | string | 必須 | `regions.json` の市 `id` |
| `pref_code` | string | 必須 | 2 桁ゼロ埋め |
| `municipality_code` | string | 必須 | 5 桁 |
| `city_name` | string | 必須 | 公式名称 |
| `city_slug` | string | 必須 | URL/機械参照向け |
| `mayor_name` | string | 必須 | 現職市長名 |
| `mayor_name_kana` | string or null | 任意 | 読みが取れる場合 |
| `term_start` | string or null | 任意 | 任期開始日 |
| `term_end` | string or null | 任意 | 任期満了日 |
| `term_note` | string or null | 任意 | 期数や補足 |
| `status` | string | 必須 | `confirmed`, `needs_review`, `conflict`, `missing_source` |
| `investigated_at` | string | 必須 | その市レコード全体を最後に調査した日 |
| `sources` | array | 必須 | 採用した情報源一覧 |
| `note` | string or null | 任意 | 補完理由や注意点 |

## 6. `sources[]` 案

各市レコードの `sources` は、採用した情報源を並べる。

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `kind` | string | 必須 | 情報源の種類 |
| `title` | string | 必須 | ページ名・資料名 |
| `url` | string | 必須 | 実際に確認した URL |
| `checked_at` | string | 必須 | その URL を確認した日 |
| `used_for` | array of string | 必須 | 何の確認に使ったか |
| `publisher` | string or null | 任意 | 発信主体 |
| `note` | string or null | 任意 | その情報源単位の補足 |

### 6.1 `kind` の候補

- `official_profile`
- `municipality_home`
- `election_schedule`
- `election_result`
- `term_expiry_list`
- `press_release`
- `official_pdf`
- `other_official`

### 6.2 `used_for` の候補

- `mayor_name`
- `mayor_name_kana`
- `term_start`
- `term_end`
- `term_note`
- `status`

## 7. レコード例

```json
{
  "id": "mayor-mun-10209",
  "region_id": "mun-10209",
  "pref_code": "10",
  "municipality_code": "10209",
  "city_name": "藤岡市",
  "city_slug": "fujioka",
  "mayor_name": "新井 雅博",
  "mayor_name_kana": "あらい まさひろ",
  "term_start": "2022-05-10",
  "term_end": "2026-05-09",
  "term_note": "令和4年4月24日無投票当選で2期目。任期満了日は令和8年5月9日。",
  "status": "confirmed",
  "investigated_at": "2026-04-23",
  "sources": [
    {
      "kind": "term_expiry_list",
      "title": "任期満了一覧表",
      "url": "https://example.jp/term-expiry.pdf",
      "checked_at": "2026-04-23",
      "used_for": ["term_end"],
      "publisher": "群馬県",
      "note": null
    },
    {
      "kind": "official_profile",
      "title": "市長プロフィール",
      "url": "https://example.jp/mayor/profile",
      "checked_at": "2026-04-23",
      "used_for": ["mayor_name", "term_note"],
      "publisher": "藤岡市",
      "note": "2期目を確認"
    }
  ],
  "note": "term_start は term_end から4年任期で補完"
}
```

## 8. 整合性ルール案

- `pref_code` はファイルの `pref_code` と一致する
- `region_id` は `data/v1/regions.json` に存在する市 `id` を参照する
- `municipality_code` は `region_id` と対応していること
- `investigated_at` は `sources[].checked_at` 以上の日付でもよいが、通常は同日またはそれ以降
- `sources` は 1 件以上必須
- `status = confirmed` のとき、`sources` なしは禁止
- `status = conflict` のとき、`note` に衝突内容の要約を必須にする
- `term_start` や `term_end` を補完した場合、`note` に補完理由を残す

## 9. 運用ルール案

- エージェントは `data/v1/current_mayors/` を直接更新しない運用でもよい
- まず `research/current-mayors/findings/` に調査結果を出し、人がレビュー後に採用する
- `investigated_at` は「その市を最後に再確認した日」として使う
- `sources[].checked_at` は「その URL を実際に見た日」として使う
- 情報源は「採用した URL」だけでなく、衝突した主要 URL も findings 側へ残すとよい

## 10. 今後の拡張候補

- `term_start_precision`, `term_end_precision`
  日単位 / 月単位 / 年単位の精度を持たせる
- `mayor_status`
  現職確認済み、退任予定、選挙直前などの状態を持たせる
- `review`
  人手レビュー日時や承認者を持たせる
- `source_count`
  派生値として自動集計する

## 11. 最初の実装方針

初回は項目を増やしすぎず、次のセットで始めるのがよい。

- `id`
- `region_id`
- `pref_code`
- `municipality_code`
- `city_name`
- `mayor_name`
- `term_start`
- `term_end`
- `term_note`
- `status`
- `investigated_at`
- `sources`
- `note`

まずは「いつ調べたか」「何を見たか」「何が未確定か」が残ることを優先する。
