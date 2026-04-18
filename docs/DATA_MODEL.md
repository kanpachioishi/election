# わたしの選挙 データモデル

最終更新: 2026-04-08
ステータス: Draft v2 / MVP向けに整理
前提: [PRD](C:/Users/shimo/Desktop/election/docs/PRD.md), [画面一覧](C:/Users/shimo/Desktop/election/docs/SCREEN_LIST.md), [公式ソース一覧とカバー方針](C:/Users/shimo/Desktop/election/docs/OFFICIAL_SOURCE_COVERAGE.md), [データ形式仕様](C:/Users/shimo/Desktop/election/docs/DATA_FILE_FORMAT_SPEC.md)

## 1. この文書の目的

この文書は、MVPで必要な最小限のデータモデルを定義する。

狙いは、機能を増やすことではなく、次の4点を破綻なく扱えるようにすること。

- 地域特定の曖昧さ
- 情報鮮度
- 確認状態
- 画面に対して本当に必要な属性

## 2. モデリング原則

1. 候補者、公報、投票所、期日前投票は、MVPでは独立エンティティにしない
2. まずは `Region` と `Election` を中心にする
3. `source_url`, `confirmed_at`, `status` は全公開データの共通メタデータとして扱う
4. 曖昧な地域特定は、推測で1件に決め打ちしない
5. 終了済み情報は、現役情報と同じ状態で持たない
6. 画面状態はできるだけ既存データから導出し、専用テーブルを増やしすぎない
7. 共通メタデータは先に埋め込みで持ち、重複が問題になってから正規化する

## 3. 共通メタデータ

全ての公開レコードに共通で持たせるメタデータを定義する。

### 3.1 VerificationMetadata

- `source_url`
  参照元URL。公式ページまたは根拠ページ。
- `source_type`
  `official`, `official_aggregated`, `manual_summary`, `statistical_source` などの種別。
- `confirmed_at`
  最終確認日時。
- `status`
  `verified`, `needs_update`, `unverified` のいずれか。
- `last_checked_at`
  実際に最後に確認した日時。更新SLA管理に使う。
- `note`
  例外や補足のメモ。

このメタデータはエンティティではなく、各モデルに埋め込む共通ブロックとして扱う。

### 3.2 MVPで採用しない共通モデル

MVPでは、以下は独立モデルにしない。

- `Source`
- `PageState`

理由:

- `Source` はまず `source_url`, `source_type`, `confirmed_at`, `status` の埋め込みで十分だから
- `PageState` は `PostalCodeMapping` の件数、`Election.phase`、`VerificationMetadata.status` から導出できるから

## 4. MVP の主要モデル

### 4.1 Region

地域を表す最小単位。

MVPでは、`prefecture` と `municipality` を基本にする。

- `id`
- `level`
  `prefecture` / `municipality`
- `pref_code`
- `municipality_code`
  都道府県のみの場合は `null`
- `name`
- `slug`
- `parent_region_id`
  自治体なら都道府県を指す
- `display_name`
  画面表示用の名称
- `verification`
  共通メタデータ

用途:
- 地域ページ
- 個別選挙ページの対象地域
- 郵便番号検索の解決先

### 4.2 PostalCodeMapping

郵便番号から地域へつなぐマッピング。

MVPでは、郵便番号の曖昧さはこのマッピングの件数から判定する。

- `postal_code`
  7桁の郵便番号
- `region_id`
- `match_kind`
  `exact` / `candidate`
- `confidence`
  `high` / `medium` / `low`
- `verification`
- `note`

扱い:
- 1件だけあれば一意解決
- 複数件あれば候補地域
- 0件なら未解決

補足:
- `0件` は「現時点で確認済みのマッピングがない」という意味で扱う
- したがって UI 上は `未解決` だけでなく `未確認` の余地も残す
- インポートの取りこぼしを、地域が存在しないことと同義にしない

この方式により、`郵便番号未解決 / 候補地域選択` を別テーブルで持たずに済む。

補足:
- 旧草稿のような上3桁マッチは UI 上の暫定挙動としてはあり得るが、正本データモデルは7桁を基本にする
- カバレッジ不足は `0件` と見た目上は同じになるため、別途 KPI で監視する

### 4.3 Election

選挙の本体。

- `id`
- `slug`
- `name`
- `type`
  `national` / `prefectural` / `municipal` / `by_election`
- `subtype`
  `governor`, `mayor`, `assembly`, `upper_house`, `lower_house` など。未確定なら `null`
- `phase`
  `upcoming` / `ongoing` / `ended` / `archived`
- `vote_date`
- `notice_date`
  公示日または告示日
- `description`
- `scope_type`
  `all` / `region` / `multi_region`
- `primary_region_id`
  国政以外の主要対象地域
- `verification`

用途:
- 地域ページの一覧
- 個別選挙ページ
- 全国スケジュール一覧

補足:
- 国政選挙は `scope_type = all`
- 都道府県選挙や市区町村選挙は、原則 `primary_region_id` を持つ
- 複数地域にまたがるケースだけ `multi_region` に拡張する

### 4.4 ElectionRegion

複数地域にまたがる選挙のための補助モデル。

MVPでは必須ではないが、将来の拡張余地として定義しておく。

- `election_id`
- `region_id`
- `relation_type`
  `primary` / `included`
- `verification`

MVPでの扱い:
- 原則は `Election.primary_region_id` で足りる
- 複数地域が必要な選挙だけこのモデルを使う

注意:
- 将来 `multi_region` な選挙が増えても、`primary_region_id` を安易な代替として使い続けない
- 地域ページの正しさは、このモデルの扱いに強く依存する

### 4.5 ElectionResourceLink

候補者、公報、期日前投票、投票所などの外部リンクをまとめるモデル。

MVPでは、候補者や投票所を独立モデル化せず、まずここにぶら下げる。

- `id`
- `election_id`
- `kind`
  `candidate_list` / `bulletin` / `early_voting` / `polling_place` / `other`
- `title`
- `url`
- `summary`
  任意。リンク先の説明や表示用メモ
- `is_official`
  `true` / `false`
- `display_order`
- `verification`

用途:
- 個別選挙ページ内の確認済みリンク

理由:
- 各種データの正規化コストを抑えられる
- 確認済みのものだけ表示する運用に向く
- 専用ページ化の前段として十分

### 4.6 TurnoutSeriesPoint

国政選挙の投票率推移を表す系列データ。

- `id`
- `series_type`
  `shugin` / `sangiin`
- `election_no`
- `election_year`
- `turnout_rate`
- `verification`

用途:
- 投票率データページの折れ線グラフ

### 4.7 TurnoutAgeBandPoint

年代別投票率を表す系列データ。

- `id`
- `base_election_year`
- `age_band`
- `turnout_rate`
- `verification`

用途:
- 投票率データページの年代表示

## 5. ステータス設計

MVPでは、状態を混ぜないことが重要。

この文書では、状態を独立テーブルにせず、既存モデルから導出する。

### 5.1 地域解決状態

これは `PostalCodeMapping` の件数から導出する。

- `resolved`
  1件のみ
- `ambiguous`
  複数件
- `unresolved`
  0件

### 5.2 選挙フェーズ

これは `Election.phase` で持つ。

- `upcoming`
- `ongoing`
- `ended`
- `archived`

### 5.3 更新状態

これは `VerificationMetadata.status` で持つ。

- `verified`
- `needs_update`
- `unverified`

この3層を分けることで、

- 地域が決まるか
- 選挙が今使えるか
- 情報が新しいか

を混同せずに扱える。

### 5.4 画面状態へのマッピング

- `郵便番号未解決 / 候補地域選択状態`
  `PostalCodeMapping` の件数から導出する
- `終了済み / アーカイブ状態`
  `Election.phase` から導出する
- `未掲載 / 未確認`
  `ElectionResourceLink` の有無と `verification.status` から導出する

## 6. MVPで持たないモデル

以下は将来価値はあるが、MVPでは独立モデルにしない。

- `Candidate`
- `CandidateProfile`
- `PollingPlace`
- `EarlyVotingSite`
- `BulletinDocument`
- `ElectionResult`
- `Source`
- `PageState`
- `User`
- `FavoriteRegion`
- `Notification`

理由:
- 更新コストが高い
- 公式情報の分散が激しい
- MVPの主価値は「次の選挙に最短で到達すること」だから

## 7. データ関係

```
Region 1 --- * PostalCodeMapping
Region 1 --- * Election (primary_region_id)
Election 1 --- * ElectionResourceLink
Election 1 --- * ElectionRegion (optional)
```

投票率は選挙本体とは分離し、独立した系列データとして持つ。

設計意図:

- `Region` と `Election` を中核にする
- `PostalCodeMapping` は入口の曖昧さを安全に扱う
- `ElectionResourceLink` は正規化前の確認済み外部情報を安全に載せるための逃げ道とする

## 8. 画面との対応

### トップページ

- 郵便番号検索
- 候補地域の選択
- 未解決案内

必要なモデル:
- `PostalCodeMapping`
- `Region`

### 地域ページ

- 地域名
- 関係する選挙の一覧

必要なモデル:
- `Region`
- `Election`

### 個別選挙ページ

- 選挙の基本情報
- 出典
- 確認日時
- 確認済みリンク

必要なモデル:
- `Election`
- `ElectionResourceLink`

### 全国スケジュール一覧

- 選挙名
- 地域
- 種別
- 投票日
- ステータス

必要なモデル:
- `Election`
- `Region`

### 投票率データページ

- 国政選挙の推移
- 年代別投票率

必要なモデル:
- `TurnoutSeriesPoint`
- `TurnoutAgeBandPoint`

## 9. MVPの固定した判断

このデータモデルでは、以下を固定する。

1. 地域特定の正本は `PostalCodeMapping` と `Region` で扱う
2. 郵便番号が曖昧でも、自治体を推測で決め打ちしない
3. 選挙の本体は `Election` に集約する
4. 複数地域対応は `ElectionRegion` を必要時のみ使う
5. 候補者、公報、投票所、期日前投票は MVPでは `ElectionResourceLink` で扱う
6. `source_url`, `source_type`, `confirmed_at`, `status` は共通メタデータとして必須にする
7. `PageState` や `Source` のような補助モデルはMVPでは独立させない
8. 投票率データは `Election` から切り離した系列データとして持つ

## 10. 先送りした論点

以下はMVP後に扱う。

- 候補者を独立モデルにするか
- 投票所・期日前投票所を正規化するか
- 選挙公報をPDFとして保存するか
- `Source` を独立モデルに正規化するか
- `ElectionResult` を別系列として持つか
- ユーザー保存機能を持つか
- 通知を持つか

## 11. 結論

MVPのデータモデルは、次の5系統に絞るのが最も安全。

1. `Region`
2. `PostalCodeMapping`
3. `Election`
4. `ElectionResourceLink`
5. `TurnoutSeriesPoint` / `TurnoutAgeBandPoint`

これ以上の正規化は、MVPでは運用負荷の方が先に立つ。
