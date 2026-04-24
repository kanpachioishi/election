# Coverage Audit

最終更新日: 2026-04-11

## 目的

この文書は、`data/v1` の coverage を「今どこまで埋まっているか」「何がまだ未カバーか」「どこまでを coverage 完了と呼んでよいか」を明確にするための棚卸しです。

ここでいう coverage は、単なる投入件数ではなく、`対象母数に対して何が確認済みか` を基準に評価します。

## 結論

2026-04-11 時点で、`data/v1` は `47都道府県ぶんの代表 seed` に加えて、`national / municipal / by_election` seed の横展開が進んだ状態です。ただし、これは `全国 coverage 完了` ではありません。

現状を正確に言うなら、以下です。

- `都道府県 seed coverage` は揃った
- `全国地域マスタ coverage` は未完
- `全国郵便番号 coverage` は未完
- `全国の個別選挙 coverage` は未完
- `候補者 / 公報 / 期日前 / 投票所` の導線 coverage は未完

つまり、今あるのは `全国を見渡せる最初の土台` であって、`日本中の選挙情報が揃った状態` ではありません。

## スナップショット

2026-04-11 時点の canonical 実数です。

| 項目 | 件数 | 評価 |
| --- | ---: | --- |
| `Region` 総数 | 94 | seed としては揃っている |
| `Region` 都道府県 | 47 | 47/47 で投入済み |
| `Region` 市区町村 | 47 | 各都道府県 1 件の代表投入に留まる |
| `Election` 総数 | 65 | 都道府県 seed に加えて全国 / 市区町村 / 補欠選挙 seed を投入 |
| `Election` `prefectural` | 47 | 都道府県単位のみ |
| `Election` `governor` | 46 | 47/47 ではない |
| `Election` `assembly` | 7 | 東京都議会議員選挙、市議選、市議補選 seed |
| `Election` `national` | 2 | 初期 seed を投入済み |
| `Election` `municipal` | 11 | 既存 municipality region から横展開中 |
| `Election` `by_election` | 5 | 既存 municipality region から横展開中 |
| `Election` `mayor` | 9 | 市長選 seed を拡張中 |
| `Election` `upcoming` | 1 | 1 件のみ |
| `Election` `archived` | 64 | 過去選挙が中心 |
| `postal_code_mappings` ファイル | 47 | 各都道府県 1 prefix3 seed |
| `postal_code_mappings` レコード | 47 | 全国郵便番号 coverage ではない |
| `election_resource_links` ファイル | 65 | 各選挙 1 ファイル |
| `election_resource_links` レコード | 188 | child link 拡張が進行中 |
| `ElectionResourceLink.kind=candidate_list` | 42 | かなり拡張済み |
| `ElectionResourceLink.kind=bulletin` | 45 | かなり拡張済み |
| `ElectionResourceLink.kind=early_voting` | 28 | 一部は拡張済み |
| `ElectionResourceLink.kind=polling_place` | 15 | まだ少ないが改善中 |
| `ElectionResourceLink.kind=other` | 58 | 親ハブと未整理分が残る |

## いまカバーできているもの

### 1. 都道府県の基本骨格

- 47 都道府県が `Region` に入っている
- 各都道府県に 1 つずつ郵便番号解決用の代表 `municipality` がある
- 都道府県単位の seed URL と slug が一通り存在する

### 2. 都道府県選挙の代表 seed

- 47 都道府県ぶんの `Election` seed がある
- そこに加えて `national 2件 / municipal 11件 / by_election 5件` の seed が入った
- 大半は `知事選` だが、`都議会議員選挙` と `市長選` と `国政選挙` が入り始めた
- `verification.source_url / source_type / confirmed_at / last_checked_at / status` は全レコードに入っている

### 3. 旧フロントへの派生経路

- `data/v1` から旧 `data/regions.js` と旧 `data/elections.js` への派生生成が動く
- canonical と legacy の変換パスが成立している

## まだカバーできていないもの

### 1. 全国地域マスタ

- `Region` の市区町村は 47 件しかなく、全国自治体マスタではない
- 郵便番号から任意の自治体へ解決できる状態ではない

### 2. 全国郵便番号マッピング

- `postal_code_mappings` は 47 prefix3 / 47 レコードの seed に留まる
- 1 都道府県につき代表 1 件という粒度であり、全国郵便番号 coverage ではない

### 3. 国政選挙

- `Election.type = national` は 2 件まで入った
- ただし全国の通常選挙・総選挙を網羅した状態ではなく、初期 seed に留まる
- PRD で重要な `upcoming` 国政選挙を常時持てる運用はまだ未確立

### 4. 市区町村選挙と補欠選挙

- `Election.type = municipal` は 11 件、`Election.type = by_election` は 5 件まで入った
- ただし市区町村選挙・補欠選挙の coverage と呼べる母数にはまだ遠い
- このサイトの差別化の核である `地方選挙 / 補欠選挙` は、canonical に入り始めた段階

### 5. 選挙ごとの実用リンク

- `candidate_list` は 42 件
- `bulletin` は 45 件
- `early_voting` は 28 件
- `polling_place` は 15 件
- `other` は 58 件で、このうち `otherOnly` は 7 ファイル
- 残り 7 ファイルは、現行ルールでは `keep_other` 前提で一旦閉じている
- つまり、実用リンク coverage はかなり前進したが、まだ全選挙で必要導線が揃った状態ではない

### 6. 投票率の canonical 化

- turnout 系データは `data/v1` にまだない
- 旧 `data/elections.js` の `TURNOUT_*` を暫定維持している段階

## coverage complete と表現できない理由

### 1. 母数が seed だから

`47件ある` こと自体は大事ですが、それは `全国対象の母数を満たした` ことを意味しません。今の 47 件は、都道府県ごとに 1 件ずつ置いた代表 seed です。

### 2. verified は universe 完了を意味しないから

今の `verified` は、`投入済みレコードに対して確認済み` という意味です。`本来入れるべき全対象に対して確認済み` という意味ではありません。

### 3. 各選挙1リンクは導線完備を意味しないから

今の `election_resource_links` は `candidate_list / bulletin / early_voting / polling_place` がかなり増えましたが、なお `other` が 58 件残っています。これは `候補者一覧`、`選挙公報`、`期日前投票`、`投票所案内` が全選挙で揃っていることとは別です。

### 4. 全国利用品質はまだ測れないから

郵便番号解決も地域マスタも代表 seed 段階なので、`全国どこでも自分の選挙に辿り着ける` 品質はまだ評価できません。

## 品質メモ

### 欠損がある項目

現時点で、`notice_date` の既知欠損は解消済みです。

### 表現上の注意

外部向けには、以下の言い方は避けます。

- `全国 coverage 完了`
- `郵便番号検索対応済み`
- `各選挙の必要情報を網羅`
- `official source coverage 完了`

現時点で許容される表現は、以下に留めます。

- `47都道府県の seed を投入済み`
- `都道府県単位の代表選挙データを整備済み`
- `canonical data model と legacy 変換層を整備済み`

## 次に埋めるべきギャップ

優先順位は以下です。

### P0

- coverage 表現を `seed` ベースに固定する
- `coverage 完了` と誤認される文言を避ける

### P1

- `Region` の全国自治体マスタ化
- `PostalCodeMapping` の全国実投入
- `ElectionResourceLink.kind` を `candidate_list / bulletin / early_voting / polling_place` 単位で拡張する

### P2

- `Election.type = national` を初期 seed から広げる
- `Election.type = municipal` を初期 seed から広げる
- `Election.type = by_election` を初期 seed から広げる
- turnout 系データの canonical 化

## いまの到達点の言い方

このプロジェクトの現状は、`47都道府県 seed の全国展開が完了し、canonical data model と legacy 変換経路が成立し、national / municipal / by_election seed の横展開が始まった段階` です。

まだ `日本の選挙情報 coverage が完成した段階` ではありません。次の本丸は、`全国自治体 / 郵便番号 / 地方選挙 / 補欠選挙 / 実用リンク` を、seed ではなく coverage と呼べる粒度まで引き上げることです。
