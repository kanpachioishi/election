# データ形式仕様

最終更新: 2026-04-08
ステータス: Draft v1 / T02 の正本
関連: [PRD](C:/Users/shimo/Desktop/election/docs/PRD.md), [データモデル](C:/Users/shimo/Desktop/election/docs/DATA_MODEL.md), [公式ソース一覧とカバー方針](C:/Users/shimo/Desktop/election/docs/OFFICIAL_SOURCE_COVERAGE.md), [MVPタスク分解](C:/Users/shimo/Desktop/election/docs/MVP_TASK_BREAKDOWN.md)

## 1. この文書の目的

この文書は、MVP で使う `Region`, `PostalCodeMapping`, `Election`, `ElectionResourceLink` の実データ形式を固定する。

この文書で決めること:

- どのファイルに何を保存するか
- フィールド名、型、ID、slug の規則
- 参照関係と整合性チェック
- 既存の `data/elections.js`, `data/regions.js` からどう移行するか

## 2. 固定する方針

1. 正本データは JSON で持つ
2. 正本のキー命名は `snake_case` に統一する
3. 画面都合の JS 定数は正本ではなく派生物として扱う
4. 文字列で持つべきコードは数値にしない
5. 日付は `YYYY-MM-DD`、日時は RFC 3339 形式で持つ
6. optional は空文字ではなく `null` を使う
7. 既存草稿との互換のため、当面は `data/*.js` を派生ファイルとして残してよい
8. `id` は機械参照向け、`slug` は URL / SEO 向けとして役割を分ける

## 3. ファイル分割方針

MVP の正本データは `data/v1/` 配下に置く。

- `data/v1/regions.json`
  `Region` の正本
- `data/v1/postal_code_mappings/{prefix3}.json`
  `PostalCodeMapping` の正本。3 桁プレフィックス単位で分割する
- `data/v1/elections.json`
  `Election` の正本
- `data/v1/election_resource_links/{election_id}.json`
  `ElectionResourceLink` の正本。選挙単位で分割する

分割理由:

- `Region` は件数が比較的少なく、単一ファイルでよい
- `PostalCodeMapping` は全国分を 1 ファイルにすると重いので、検索導線に合わせて 3 桁単位で分ける
- `Election` は MVP 時点の件数なら単一ファイルで十分
- `ElectionResourceLink` は選挙ごとの更新・再確認が多いため、選挙単位の分割が扱いやすい

## 4. 共通ルール

### 4.1 エンコーディングと改行

- UTF-8
- LF
- ファイル末尾改行あり

### 4.2 トップレベル構造

各 JSON ファイルは、原則として次の形に揃える。

```json
{
  "schema_version": 1,
  "generated_at": "2026-04-08T23:20:00+09:00",
  "records": []
}
```

例外:

- `postal_code_mappings/{prefix3}.json` は `prefix` を持ってよい
- `election_resource_links/{election_id}.json` は `election_id` を持ってよい

### 4.3 日付と時刻

- 日付項目:
  `YYYY-MM-DD`
- 日時項目:
  `2026-04-08T23:20:00+09:00` のような RFC 3339

### 4.4 共通メタデータ

公開データはすべて `verification` を持つ。

```json
{
  "verification": {
    "source_url": "https://example.jp/",
    "source_type": "official",
    "confirmed_at": "2026-04-08T23:20:00+09:00",
    "last_checked_at": "2026-04-08T23:20:00+09:00",
    "status": "verified",
    "note": null
  }
}
```

### 4.5 命名規則

- キー名は `snake_case`
- enum は小文字の `snake_case`
- `id` は ASCII の `kebab-case`
- `slug` は ASCII の `kebab-case`
- `pref_code`, `municipality_code`, `postal_code` は文字列で持つ
- 公開 URL は `slug` 単体ではなく、ルートテンプレートと親子関係から組み立てる

## 5. `Region`

### 5.1 ファイル

- `data/v1/regions.json`

### 5.2 必須フィールド

| フィールド | 型 | 必須 | ルール |
| --- | --- | --- | --- |
| `id` | string | 必須 | `pref-13`, `mun-13113` のような安定 ID |
| `level` | string | 必須 | `prefecture` または `municipality` |
| `pref_code` | string | 必須 | 2 桁ゼロ埋め |
| `municipality_code` | string or null | 条件付き | `municipality` のとき 5 桁、`prefecture` のとき `null` |
| `name` | string | 必須 | 公式名称 |
| `slug` | string | 必須 | URL 用セグメント。都道府県は `tokyo`、市区町村は `shibuya-ku` のように持つ |
| `parent_region_id` | string or null | 条件付き | `municipality` のとき親都道府県の `id` |
| `display_name` | string | 必須 | UI 用表示名 |
| `verification` | object | 必須 | 共通メタデータ |

### 5.3 例

```json
{
  "id": "mun-13113",
  "level": "municipality",
  "pref_code": "13",
  "municipality_code": "13113",
  "name": "渋谷区",
  "slug": "shibuya-ku",
  "parent_region_id": "pref-13",
  "display_name": "東京都渋谷区",
  "verification": {
    "source_url": "https://example.jp/regions/13113",
    "source_type": "official",
    "confirmed_at": "2026-04-08T23:20:00+09:00",
    "last_checked_at": "2026-04-08T23:20:00+09:00",
    "status": "verified",
    "note": null
  }
}
```

### 5.4 整合性ルール

- `id` は一意
- 都道府県の `slug` は一意
- 市区町村の `slug` は `parent_region_id` と組み合わせて一意
- `municipality_code` は `level = municipality` のとき必須
- `pref_code` は `municipality_code` の先頭 2 桁と一致する
- `parent_region_id` は `level = municipality` のとき既存の `prefecture` を参照する

## 6. `PostalCodeMapping`

### 6.1 ファイル

- `data/v1/postal_code_mappings/{prefix3}.json`

例:

- `data/v1/postal_code_mappings/150.json`
- `data/v1/postal_code_mappings/901.json`

### 6.2 必須フィールド

| フィールド | 型 | 必須 | ルール |
| --- | --- | --- | --- |
| `postal_code` | string | 必須 | 7 桁数字、ハイフンなし |
| `region_id` | string | 必須 | `regions.json` の `id` を参照 |
| `match_kind` | string | 必須 | `exact` または `candidate` |
| `confidence` | string | 必須 | `high`, `medium`, `low` |
| `verification` | object | 必須 | 共通メタデータ |
| `note` | string or null | 任意 | 例外メモ |

### 6.3 ファイル例

```json
{
  "schema_version": 1,
  "generated_at": "2026-04-08T23:20:00+09:00",
  "prefix": "150",
  "records": [
    {
      "postal_code": "1500001",
      "region_id": "mun-13113",
      "match_kind": "exact",
      "confidence": "high",
      "verification": {
        "source_url": "https://example.jp/postal/1500001",
        "source_type": "official",
        "confirmed_at": "2026-04-08T23:20:00+09:00",
        "last_checked_at": "2026-04-08T23:20:00+09:00",
        "status": "verified",
        "note": null
      },
      "note": null
    }
  ]
}
```

### 6.4 整合性ルール

- ファイル名の `prefix3` と各 `postal_code` の先頭 3 桁が一致する
- `postal_code + region_id` の組み合わせは一意
- `region_id` は `regions.json` に存在する
- `match_kind = exact` でも複数件あり得るが、自動で 1 件に決め打ちしない
- `confidence = low` は UI の自動確定に使わない

## 7. `Election`

### 7.1 ファイル

- `data/v1/elections.json`

### 7.2 必須フィールド

| フィールド | 型 | 必須 | ルール |
| --- | --- | --- | --- |
| `id` | string | 必須 | `el-national-upper-house-2025`, `el-pref-13-governor-2028` など |
| `slug` | string | 必須 | URL / SEO 用。`tokyo-governor-2028` など |
| `name` | string | 必須 | 公式名称 |
| `type` | string | 必須 | `national`, `prefectural`, `municipal`, `by_election` |
| `subtype` | string or null | 条件付き | `upper_house`, `lower_house`, `governor`, `mayor`, `assembly` など |
| `phase` | string | 必須 | `upcoming`, `ongoing`, `ended`, `archived`。保存はするが、手入力の正本ではなく T04 ルールで導出・更新する |
| `vote_date` | string | 必須 | `YYYY-MM-DD` |
| `notice_date` | string or null | 任意 | `YYYY-MM-DD` |
| `description` | string or null | 任意 | UI 表示用説明 |
| `page_status` | object or null | 任意 | 専用ページの状態メタ。告示前の報道ベース、公式候補者一覧の未掲載などを表す |
| `page_updates` | array | 任意 | 専用ページの更新履歴 |
| `scope_type` | string | 必須 | `all`, `region`, `multi_region` |
| `primary_region_id` | string or null | 条件付き | `national` は `null`、それ以外は原則必須 |
| `included_region_ids` | array or null | 任意 | `multi_region` のとき参照先地域 ID の配列 |
| `verification` | object | 必須 | 共通メタデータ |

### 7.3 例

```json
{
  "id": "el-pref-13-governor-2028",
  "slug": "tokyo-governor-2028",
  "name": "東京都知事選挙",
  "type": "prefectural",
  "subtype": "governor",
  "phase": "upcoming",
  "vote_date": "2028-07-09",
  "notice_date": null,
  "description": "任期満了に伴う東京都知事選挙。",
  "page_status": {
    "label": "告示前の報道ベース",
    "summary": "このデータでは公式候補者一覧は未掲載で、報道・本人発信ベースの候補予定者情報をまとめています。",
    "official_candidate_list_status": "not_included",
    "official_candidate_list": null,
    "transition_note": "公式候補者一覧が公開されたら、公式情報ベースに切り替える前提です。",
    "as_of": "2026-04-12"
  },
  "page_updates": [
    {
      "date": "2026-04-11",
      "title": "新潟県知事選専用ページを追加",
      "summary": "候補予定者プロフィール、公式導線、出典をまとめた専用ページを公開対象に追加しました。"
    }
  ],
  "scope_type": "region",
  "primary_region_id": "pref-13",
  "included_region_ids": null,
  "verification": {
    "source_url": "https://example.jp/elections/tokyo-governor-2028",
    "source_type": "official",
    "confirmed_at": "2026-04-08T23:20:00+09:00",
    "last_checked_at": "2026-04-08T23:20:00+09:00",
    "status": "verified",
    "note": null
  }
}
```

### 7.4 ID と slug の規則

- 国政:
  `el-national-{subtype}-{year}`
- 都道府県:
  `el-pref-{pref_code}-{subtype}-{year}`
- 市区町村:
  `el-mun-{municipality_code}-{subtype}-{year}`
- 補欠選挙:
  `el-by-{scope_key}-{subtype}-{year}-{sequence2}`

`scope_key` は `pref-13` または `mun-13113` のように、対象地域を表す既存キーを使う。

補足:

- `id` には変動しやすい `vote_date` を入れない
- 同一年・同地域・同種別で複数選挙がある場合だけ `sequence2` を付ける
- `slug` は人間が読める URL 用文字列とし、`id` と独立してよい

### 7.5 整合性ルール

- `id` は一意
- `slug` は一意
- `type = national` のとき `scope_type = all`、`primary_region_id = null`
- `type != national` のとき `primary_region_id` は原則必須
- `primary_region_id` は `regions.json` に存在する
- `scope_type = multi_region` のとき `included_region_ids` は 2 件以上必要
- `vote_date` は必須
- `notice_date` がある場合は `vote_date` より後にならない

### 7.6 ページ状態メタ

- `page_status` は専用ページの表示状態を表す補助メタデータ
- `official_candidate_list_status` は `not_included` または `published`
- `official_candidate_list_status = published` のときは `official_candidate_list` を必ず object にし、`label`, `url`, `source_name`, `last_checked_at` を記録する。公式ページの公開日が分かる場合は `published_at` も記録する
- `official_candidate_list.url` は選挙管理委員会などの公式候補者一覧への絶対 URL にする
- `page_status` は事実の断定ではなく、データセット上の表示状態を記録する
- `page_updates` は日付付きの更新履歴で、`date`, `title`, `summary` を持つ
- 公式候補者一覧が公開されたら、`label`, `summary`, `official_candidate_list_status`, `official_candidate_list`, `transition_note`, `as_of`, `page_updates` を同時に更新する
- UI 見出しは `official_candidate_list_status` に連動させる。`not_included` では `候補予定者プロフィール（報道ベース）` / `公式導線比較（報道確認ベース）` / `出馬動向（報道ベース）`、`published` では `公式候補者プロフィール` / `公式導線比較（公式候補者）` / `出馬動向（公示後更新）` を使う

## 8. `ElectionResourceLink`

### 8.1 ファイル

- `data/v1/election_resource_links/{election_id}.json`

例:

- `data/v1/election_resource_links/el-pref-13-governor-2028.json`

### 8.2 必須フィールド

| フィールド | 型 | 必須 | ルール |
| --- | --- | --- | --- |
| `id` | string | 必須 | `{election_id}-{kind}-{nn}` |
| `election_id` | string | 必須 | `elections.json` の `id` を参照 |
| `kind` | string | 必須 | `candidate_list`, `bulletin`, `early_voting`, `polling_place`, `other` |
| `title` | string | 必須 | リンク表示名 |
| `url` | string | 必須 | 絶対 URL |
| `summary` | string or null | 任意 | 補足説明 |
| `is_official` | boolean | 必須 | 公開対象は `true` のみ |
| `display_order` | integer | 必須 | 1 以上の整数 |
| `verification` | object | 必須 | 共通メタデータ |

### 8.3 ファイル例

```json
{
  "schema_version": 1,
  "generated_at": "2026-04-08T23:20:00+09:00",
  "election_id": "el-pref-13-governor-2028",
  "records": [
    {
      "id": "el-pref-13-governor-2028-bulletin-01",
      "election_id": "el-pref-13-governor-2028",
      "kind": "bulletin",
      "title": "選挙公報",
      "url": "https://example.jp/elections/tokyo-governor-2028/bulletin.pdf",
      "summary": null,
      "is_official": true,
      "display_order": 1,
      "verification": {
        "source_url": "https://example.jp/elections/tokyo-governor-2028",
        "source_type": "official",
        "confirmed_at": "2026-04-08T23:20:00+09:00",
        "last_checked_at": "2026-04-08T23:20:00+09:00",
        "status": "verified",
        "note": null
      }
    }
  ]
}
```

### 8.4 整合性ルール

- ファイル名の `election_id` と各レコードの `election_id` が一致する
- `id` はファイル内で一意
- `display_order` は 1 以上
- `url` は絶対 URL
- 公開に使うレコードは `is_official = true` かつ `verification.status = verified`

## 9. MVP で今は入れないキー

MVP では次のキーをあえて持たない。

### 9.1 `Region`

- `aliases`
- `kana`
- `lat`
- `lng`
- `district_code`

### 9.2 `PostalCodeMapping`

- `postal_office_name`
- `town_name`
- `lat`
- `lng`
- 旧 3 桁プレフィックス専用キー

### 9.3 `Election`

- `candidate_count`
- `seat_count`
- `result_url`
- `hero_image`
- `tags`
- `election_regions`

### 9.4 `ElectionResourceLink`

- `mime_type`
- `file_size`
- `checksum`
- `snapshot_path`
- `excerpt`

理由:

- 正本に入れると更新コストだけ先に増える
- MVP の価値は、次の選挙に正しく到達できることにある
- 将来必要なら別モデルや派生データとして足せる

## 10. 移行方針

### 10.1 `data/regions.js` からの移行

現在の `data/regions.js` は、上 3 桁郵便番号から `prefecture`, `city`, `prefCode` を返す MVP 草稿であり、正本にはしない。

移行方針:

1. `Region` は T01 で固定した公式ソースから新規作成する
2. `data/regions.js` の地名文字列は、初期の照合補助にだけ使う
3. 既存草稿の `札幌市北区` のような区レベル表現は、MVP 正本では原則として対応する市区町村レベルへ寄せる
4. 必要であれば、正本 JSON から既存 UI 向けの `REGIONS` 定数を生成する

### 10.2 `data/elections.js` からの移行

現在の `data/elections.js` の `ELECTIONS` 配列は、次のように移せる。

- `id` は新規規則へ寄せる
- `date` は `vote_date`
- `type` はそのまま近い
- `regions: ['all']` は `scope_type = all`, `primary_region_id = null`
- `regions: ['13']` のような都道府県コードは `primary_region_id = pref-13`
- `description` はそのまま `description` へ移す

注意:

- `TURNOUT_SHUGIN`, `TURNOUT_SANGIN`, `TURNOUT_BY_AGE` は T02 の対象外とし、当面は現行のままでもよい
- 既存のページを壊さないため、移行初期は `data/elections.js` を正本 JSON から生成してよい

## 11. バリデーション観点

### 11.1 参照整合

- すべての `primary_region_id` が `regions.json` に存在する
- すべての `region_id` が `regions.json` に存在する
- すべての `election_id` が `elections.json` に存在する

### 11.2 値の整合

- `pref_code` は 2 桁
- `municipality_code` は 5 桁
- `postal_code` は 7 桁
- `vote_date`, `notice_date` は日付形式
- `confirmed_at`, `last_checked_at` は日時形式
- enum は定義済み値だけを許可する
- 都道府県の `Region.slug` は重複しない
- 市区町村の `Region.slug` は `parent_region_id` と組み合わせて重複しない
- `Election.slug` は重複しない
- `phase` は `vote_date` と T04 ルールに反する手入力更新をしない

### 11.3 公開ブロック

次のものは公開しない。

- `verification` が欠けているレコード
- `source_url` が空のレコード
- `confirmed_at` が空のレコード
- `status != verified` の `ElectionResourceLink`
- `primary_region_id` がない地方選挙
- 地域参照が解決しない `PostalCodeMapping`

## 12. T02 の完了条件

T02 は、次の状態になったら完了とみなす。

- `data/v1/` 配下のファイル分割方針が固定されている
- 4 モデルの必須フィールドと型が固定されている
- ID, slug, コード文字列の規則が固定されている
- 既存 `data/*.js` からの移行方針が説明できる
- 参照整合と公開ブロックのバリデーション観点が揃っている
## 13. `candidate_signals`

### 13.1 ファイル

- `data/v1/candidate_signals/{election_id}.json`

### 13.2 役割

報道や本人発表をもとに、選挙ごとの候補予定者・出馬動向を分けて記録する。

このレイヤーは公式候補者一覧ではない。告示前は特に、`official_candidate` ではなく `announced` / `interested` / `considering` などの報道ベース状態で扱う。
`interested` は関連動向寄りの状態で、候補予定者一覧や比較表に混ぜない。

`candidate_signals` / `candidate_endorsements` / `candidate_profiles` の `evidence[].source_type` は出典の性質を表す。`official` は公式サイトや公的資料、`person_statement` は本人発信、`media_report` は報道、`party_statement` は党・会派発表、`organization_statement` は団体発表として読む。

### 13.3 形式

```json
{
  "schema_version": 1,
  "generated_at": "2026-04-11T16:00:00+09:00",
  "election_id": "el-pref-15-governor-2026",
  "records": [
    {
      "id": "el-pref-15-governor-2026-example-01",
      "election_id": "el-pref-15-governor-2026",
      "person_name": "候補者名",
      "person_slug": "candidate-name",
      "status": "announced",
      "incumbency": "newcomer",
      "summary": "報道ベースの要約",
      "confidence": "high",
      "display_order": 1,
      "last_checked_at": "2026-04-11T16:00:00+09:00",
      "evidence": [
        {
          "source_name": "媒体名",
          "source_type": "media_report",
          "title": "記事タイトル",
          "url": "https://example.com/",
          "published_at": "2026-04-11"
        }
      ]
    }
  ]
}
```

### 13.4 フィールド

| フィールド | 型 | 必須 | ルール |
| --- | --- | --- | --- |
| `id` | string | 必須 | ASCII の `kebab-case` |
| `election_id` | string | 必須 | `elections.json` に存在すること |
| `person_name` | string | 必須 | 表示名 |
| `person_slug` | string | 必須 | ASCII の `kebab-case` |
| `status` | string | 必須 | `official_candidate`, `announced`, `interested`, `draft`, `considering`, `withdrawn` |
| `incumbency` | string | 必須 | `incumbent`, `newcomer`, `former_governor`, `former_official`, `unknown` |
| `summary` | string | 必須 | 公式候補者一覧ではないことが分かる文章を含める |
| `confidence` | string | 必須 | `high`, `medium`, `low` |
| `display_order` | integer | 必須 | 1 以上 |
| `last_checked_at` | string | 必須 | RFC 3339 |
| `evidence` | array | 必須 | 1 件以上 |

`evidence[]` の各要素:

| フィールド | 型 | 必須 | ルール |
| --- | --- | --- | --- |
| `source_name` | string | 必須 | 媒体名、発表主体名など |
| `source_type` | string | 必須 | `official`, `person_statement`, `media_report`, `party_statement` |
| `title` | string | 必須 | 根拠記事タイトル |
| `url` | string | 必須 | HTTPS URL |
| `published_at` | string | 必須 | `YYYY-MM-DD` |

### 13.5 ルール

- 公式候補者一覧ではないため、`summary` でそれが分かる表現にする
- 1 レコード 1 人物を原則とする
- 確度の高いものは複数出典を持たせる
- `interested` は出馬意向や関連動向の報道に使う
- `official_candidate` は告示後の公式候補者一覧確認時のみ使う

## 14. `candidate_endorsements`

### 14.1 ファイル

- `data/v1/candidate_endorsements/{election_id}.json`

### 14.2 役割

候補予定者の動向と、推薦・支持・擁立を分離して持つ。

`candidate_signals` には入れず、推薦主体ごとに別レコードで記録する。

### 14.3 形式

```json
{
  "schema_version": 1,
  "generated_at": "2026-04-11T16:00:00+09:00",
  "election_id": "el-pref-15-governor-2026",
  "records": [
    {
      "id": "el-pref-15-governor-2026-hanazumi-hideyo-jimin-01",
      "election_id": "el-pref-15-governor-2026",
      "person_slug": "hanazumi-hideyo",
      "endorser_name": "自民党新潟県連",
      "relation_type": "recommend",
      "source_type": "media_report",
      "source_name": "NST新潟総合テレビ",
      "title": "記事タイトル",
      "url": "https://example.com/",
      "published_at": "2026-04-11",
      "confidence": "high",
      "last_checked_at": "2026-04-11T16:00:00+09:00",
      "note": "報道ベースの推薦・支持"
    }
  ]
}
```

### 14.4 フィールド

| フィールド | 型 | 必須 | ルール |
| --- | --- | --- | --- |
| `id` | string | 必須 | ASCII の `kebab-case` |
| `election_id` | string | 必須 | `elections.json` に存在すること |
| `person_slug` | string | 必須 | `candidate_signals` と同じ slug |
| `endorser_name` | string | 必須 | 政党、団体、後援会などの名称 |
| `relation_type` | string | 必須 | `recommend`, `support`, `nominate` |
| `source_type` | string | 必須 | `official`, `person_statement`, `media_report`, `party_statement` |
| `source_name` | string | 必須 | 出典主体の表示名 |
| `title` | string | 必須 | 根拠記事タイトル |
| `url` | string | 必須 | HTTPS URL |
| `published_at` | string | 必須 | `YYYY-MM-DD` |
| `confidence` | string | 必須 | `high`, `medium`, `low` |
| `last_checked_at` | string | 必須 | RFC 3339 |
| `note` | string or null | 任意 | 補足説明 |

### 14.5 ルール

- 推薦・支持・擁立は `candidate_signals` と混在させない
- 非公式情報であることが分かるように、公開文言では断定を避ける
- 公式候補者一覧に移った後も、告示前の推薦・支持履歴は残してよい

## 15. `candidate_profiles`

### 15.1 ファイル

- `data/v1/candidate_profiles/{election_id}.json`

### 15.2 役割

候補予定者のプロフィールを、公式サイト・公式SNS・本人発信・所属機関プロフィール・政策リンク・中立的な経歴情報に分けて記録する。

このレイヤーも公式候補者一覧ではない。告示前は特に、報道ベースの候補予定者や関連動向として扱う。
`profile_status = related_interest` は候補予定者扱いにしない。UI では `関連動向` として別枠に置く。
`identity_labels` は候補者を中立的な事実ベースで見分けるための短い補助ラベルで、思想・評価・推薦を表さない。

`evidence[].source_type` は出典の性質を表す。`official` は公式サイトや公的資料、`person_statement` は本人発信、`media_report` は報道、`party_statement` は党・会派発表、`organization_statement` は団体発表として読む。

### 15.3 形式

```json
{
  "schema_version": 1,
  "generated_at": "2026-04-11T19:30:00+09:00",
  "election_id": "el-pref-15-governor-2026",
  "records": [
    {
      "id": "el-pref-15-governor-2026-example-01",
      "election_id": "el-pref-15-governor-2026",
      "person_name": "候補者名",
      "person_kana": "こうほしゃ めい",
      "birth_date": "1970-01-01",
      "identity_labels": ["現職知事", "公式サイトあり"],
      "person_slug": "candidate-name",
      "profile_status": "reported_candidate",
      "summary": "報道ベースのプロフィール要約",
      "official_site_url": "https://example.jp/",
      "official_sns": [
        {
          "platform": "x",
          "label": "公式X",
          "url": "https://x.com/example"
        }
      ],
      "profile_pages": [
        {
          "label": "プロフィール",
          "url": "https://example.jp/profile",
          "kind": "official_profile"
        }
      ],
      "policy_links": [
        {
          "label": "政策ページ",
          "url": "https://example.jp/policy",
          "kind": "policy"
        }
      ],
      "career_items": [
        {
          "label": "1980年 生まれ",
          "summary": "中立的な経歴項目。"
        }
      ],
      "election_history": [
        {
          "label": "2018年 選挙名",
          "summary": "結果や役職の要約。"
        }
      ],
      "display_order": 1,
      "last_checked_at": "2026-04-11T19:30:00+09:00",
      "evidence": [
        {
          "source_name": "媒体名",
          "source_type": "media_report",
          "title": "記事タイトル",
          "url": "https://example.com/",
          "published_at": "2026-04-11"
        }
      ]
    }
  ]
}
```

### 15.4 フィールド

| フィールド | 型 | 必須 | ルール |
| --- | --- | --- | --- |
| `id` | string | 必須 | ASCII の `kebab-case` |
| `election_id` | string | 必須 | `elections.json` に存在すること |
| `person_name` | string | 必須 | 表示名 |
| `person_kana` | string or null | 任意 | 表示名のひらがな表記 |
| `birth_date` | string or null | 任意 | 生年月日。確実な出典がある場合だけ `YYYY-MM-DD` で記録 |
| `identity_labels` | array | 任意 | 中立的な事実ベースの短い識別ラベル |
| `person_slug` | string | 必須 | ASCII の `kebab-case` |
| `profile_status` | string | 必須 | `official_candidate`, `reported_candidate`, `related_interest` |
| `summary` | string | 必須 | 公式候補者一覧ではないことが分かる文章を含める |
| `official_site_url` | string or null | 任意 | 確認できた公式サイトのみ |
| `official_sns` | array | 任意 | 確認できた公式SNSのみ |
| `profile_pages` | array | 任意 | 本人・所属機関プロフィールや本人発信ページ |
| `policy_links` | array | 任意 | 政策ページ、主張ページなど |
| `career_items` | array | 任意 | 中立的な経歴項目 |
| `election_history` | array | 任意 | 過去の選挙歴 |
| `display_order` | integer | 必須 | 1 以上 |
| `last_checked_at` | string | 必須 | RFC 3339 |
| `evidence` | array | 必須 | 1 件以上 |

`official_sns[]` の各要素:

| フィールド | 型 | 必須 | ルール |
| --- | --- | --- | --- |
| `platform` | string | 必須 | `x`, `facebook`, `instagram`, `line`, `youtube` など |
| `label` | string | 必須 | 表示ラベル |
| `url` | string | 必須 | HTTPS URL |

`profile_pages[]` / `policy_links[]` の各要素:

| フィールド | 型 | 必須 | ルール |
| --- | --- | --- | --- |
| `label` | string | 必須 | 表示ラベル |
| `url` | string | 必須 | HTTPS URL |
| `kind` | string or null | 任意 | `official_profile`, `institution_profile`, `personal_profile`, `policy` |

`career_items[]` / `election_history[]` の各要素:

| フィールド | 型 | 必須 | ルール |
| --- | --- | --- | --- |
| `label` | string | 必須 | 短い見出し |
| `summary` | string or null | 任意 | 中立的な補足 |

### 15.5 ルール

- `summary` は評価語を避け、中立的に書く
- `person_kana` は任意だが、あると一覧での識別がしやすい
- `birth_date` は年齢表示の計算元に使う。年齢だけを手入力せず、公式・本人・公的資料・信頼できる報道などで生年月日を確認できた場合だけ入れる
- `identity_labels` は短く、中立的な事実だけにする
- `identity_labels` で `現職`, `知事`, `衆院議員`, `県議`, `市議` など現在の地位を示す場合は、プロフィールページだけを根拠にしない
- 現職性は、直近の選挙結果、議会・自治体などの現職名簿、本人または党の最新プロフィール、報道の順に確認する
- 直近選挙後の情報と古いプロフィールが矛盾する場合は、直近選挙結果や現職名簿を優先する
- 現職か断定できない場合、または直近選挙で落選・退任を確認した場合は `前衆院議員`, `元知事`, `元市議`, `2026年衆院選落選` のように、現在形ではない表現にする
- `official_site_url` と `official_sns` は確認できたものだけ入れる
- 公式候補者一覧ではないため、`reported_candidate` や `related_interest` を基本に使う
- `election_history` は結果や役職を事実ベースで書く
- `career_items` は実績評価ではなく、経歴や役職の記録として書く
