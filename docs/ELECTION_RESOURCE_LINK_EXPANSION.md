# Election Resource Link Expansion

最終更新日: 2026-04-11  
ステータス: Draft v1  
関連文書: [DATA_MODEL.md](C:/Users/shimo/Desktop/election/docs/DATA_MODEL.md), [DATA_FILE_FORMAT_SPEC.md](C:/Users/shimo/Desktop/election/docs/DATA_FILE_FORMAT_SPEC.md), [OFFICIAL_SOURCES_POLICY.md](C:/Users/shimo/Desktop/election/docs/OFFICIAL_SOURCES_POLICY.md), [OPERATIONS_FLOW.md](C:/Users/shimo/Desktop/election/docs/OPERATIONS_FLOW.md), [COVERAGE_AUDIT.md](C:/Users/shimo/Desktop/election/docs/COVERAGE_AUDIT.md)

## 1. 目的

この文書は、`ElectionResourceLink` を使って `candidate_list / early_voting / polling_place` を安全に拡張するための仕様と作業順を定義する。

狙いは 2 つある。

- ユーザーが投票前に必要な導線へ最短で辿り着けるようにする
- 将来 `Candidate` や `PollingPlace` を独立モデル化しても壊れない形で、今すぐ増やせる運用にする

## 2. 現在地

[COVERAGE_AUDIT.md](C:/Users/shimo/Desktop/election/docs/COVERAGE_AUDIT.md) 時点の canonical では、`election_resource_links` は 65 ファイル / 188 レコードあり、内訳は以下の通り。

- `candidate_list`: 42
- `bulletin`: 45
- `early_voting`: 28
- `polling_place`: 15
- `other`: 58

つまり、`候補者 / 公報 / 期日前 / 投票所` はかなり増えたが、なお `other` と未整備選挙が残っている状態である。

## 3. この拡張で達成したい状態

MVP では、少なくとも `upcoming` の選挙について、以下を順に目指す。

1. `candidate_list` がある
2. `bulletin` がある
3. `early_voting` がある
4. `polling_place` がある

ただし、無理に空欄を埋めない。`verified` な公式根拠が確認できない場合は未掲載のままにする。

## 4. スコープ

この文書の対象は以下。

- `ElectionResourceLink.kind = candidate_list`
- `ElectionResourceLink.kind = early_voting`
- `ElectionResourceLink.kind = polling_place`
- 既存 `other` の再分類
- 追加時の確認ルール
- 選挙ページでの表示ルール
- coverage の追い方

この文書の対象外は以下。

- 候補者の完全構造化
- 投票所の完全正規化
- 地図表示
- 候補者比較表の生成
- 自治体横断の自動クロール設計全体

## 5. `kind` ごとの定義

### 5.1 `candidate_list`

意味:
当該選挙の立候補者一覧、候補者届出一覧、候補者情報ページ、候補者一覧 PDF への公式導線。

採用してよいもの:

- 選挙管理委員会の候補者一覧ページ
- 選挙管理委員会の候補者一覧 PDF
- 当該選挙の候補者情報がまとまった公式特設ページ

採用してはいけないもの:

- 候補者本人サイト
- 政党サイト
- 報道記事
- SNS
- 当該選挙との紐づきが弱い一般的な選挙説明ページ

最低条件:

- 当該選挙との紐づきがページ上で確認できる
- URL が生きている
- `verification.status = verified`
- タイトルだけでは選挙との関係が曖昧な場合、`summary` に補足を書く

### 5.2 `early_voting`

意味:
当該選挙の期日前投票の期間、会場、時間、案内ページへの公式導線。

採用してよいもの:

- 当該選挙の期日前投票案内ページ
- 当該選挙の期日前投票 PDF
- 自治体選管の公式ページで、対象選挙が明記されているもの

採用してはいけないもの:

- 恒常的な「期日前投票とは」説明だけのページ
- 過去選挙の期日前投票案内
- 当該選挙か不明な総合ページ

最低条件:

- 対象選挙が明記されている
- 期間または会場情報のどちらかが確認できる
- URL が生きている
- `verification.status = verified`

補足:

- 県選挙でも会場案内が自治体別に分かれることがある。この場合は複数リンクを許容する
- 自治体別リンクを追加する場合は、`summary` に対象自治体名を必ず書く

### 5.3 `polling_place`

意味:
当日の投票所案内、投票区一覧、投票所検索、投票所 PDF への公式導線。

採用してよいもの:

- 当該選挙の投票所案内ページ
- 当該選挙の投票所 PDF
- 公式の投票区・投票所一覧で、選挙または地域との関係が明確なもの

採用してはいけないもの:

- 当該選挙と無関係な一般ページ
- 過去選挙の投票所案内
- 民間サイトの投票所まとめ

最低条件:

- 対象選挙または対象地域との紐づきが説明できる
- URL が生きている
- `verification.status = verified`

補足:

- 投票所は自治体別に分かれることが多いので、複数リンクを許容する
- 複数リンク時は `summary` に対象自治体か対象エリアを書く

## 6. 共通ルール

### 6.1 ソース優先順位

同じ `kind` に複数候補がある場合は、次の順で優先する。

1. 当該選挙の公式特設ページ
2. 当該選挙の公式 PDF
3. 選挙管理委員会の公式一覧ページ
4. 自治体の公式ページで当該選挙との紐づきが明確なもの

結果ページ、速報ページ、過去選挙一覧ページは、より適切な導線があるなら primary にしない。

### 6.2 `summary` の書き方

`summary` は次のとき必須とする。

- タイトルだけで中身が分からない
- 自治体別リンクで対象範囲を補足したい
- PDF の中身を一言で説明したい

短く、事実だけを書く。

良い例:

- `渋谷区の期日前投票会場一覧`
- `候補者届出一覧 PDF`
- `八王子市の当日投票所案内`

### 6.3 `display_order`

選挙ページでは、原則として次の順で表示する。

1. `candidate_list`
2. `bulletin`
3. `early_voting`
4. `polling_place`
5. `other`

同じ `kind` の中で複数リンクがある場合は、`display_order` の小さい順に表示する。

### 6.4 primary の考え方

MVP では専用の `is_primary` は持たず、`display_order = 1` をその `kind` の primary とみなす。

推奨ルール:

- 各選挙・各 `kind` で `display_order = 1` は 1 件まで
- `display_order = 2` 以降は自治体別、PDF別、補助導線として扱う

## 7. 登録単位

登録単位は `election_resource_links/{election_id}.json` のままとする。

1 選挙につき複数レコードを許容する。  
1 選挙 1 リンクの前提を捨てて、`kind` ごとの verified 導線を積み上げる。

## 8. 最低限の掲載条件

`candidate_list / early_voting / polling_place` を掲載してよいのは、次の条件を満たすものだけ。

- 公式ページまたは公式 PDF
- 当該選挙との紐づきが説明できる
- URL が有効
- `source_url`, `confirmed_at`, `last_checked_at`, `status` が埋まっている
- `status = verified`

逆に、以下は掲載しない。

- 根拠ページが曖昧
- 失効 URL
- `needs_update` のまま放置
- 候補者本人や民間記事へのリンク

## 9. バリデーション方針

今後 validator では、少なくとも次を見たい。

- `kind` が許可 enum に入っている
- `title` が空でない
- `url` が空でない
- `display_order` が整数
- 同一 `election_id` 内で `kind + url` が重複していない
- 同一 `election_id` / 同一 `kind` の `display_order = 1` が複数ない

これは実装時に [validate-data-v1.mjs](C:/Users/shimo/Desktop/election/scripts/validate-data-v1.mjs) へ段階追加する。

## 10. coverage 指標

件数だけではなく、次の率で追う。

- `upcoming election のうち candidate_list がある率`
- `upcoming election のうち bulletin がある率`
- `upcoming election のうち early_voting がある率`
- `upcoming election のうち polling_place がある率`
- `other から構造化 kind へ再分類できた率`
- `needs_update のまま残っている resource link 件数`

## 11. 作業順

### Step 1. 既存 47 選挙の `other` を棚卸しする

やること:

- 各 `election_resource_links/{election_id}.json` を見て、今の `other` が何のリンクか判定する
- `candidate_list / bulletin / early_voting / polling_place` に再分類できるものを洗い出す
- 再分類できないものだけ `other` に残す

成果物:

- `other` の再分類候補一覧
- 再分類できない理由メモ

### Step 2. `upcoming` 選挙から 4 kind を優先投入する

やること:

- `upcoming` の選挙に対して `candidate_list`
- `bulletin`
- `early_voting`
- `polling_place`

をこの順で verified 収集する。

理由:

- いま必要なのは過去結果より投票前導線
- `upcoming` の整備がそのままユーザー価値になる

### Step 3. `archived` でも SEO 価値が高いものを深くする

対象:

- 直近の知事選
- 都道府県庁所在地や大都市を含む選挙
- 公報や候補者一覧が残っている選挙

やること:

- `candidate_list`
- `bulletin`

を優先して増やす。`early_voting` と `polling_place` は残存性が低いので優先度を下げてよい。

### Step 4. `municipal / by_election` seed 追加と同時にリンクを増やす

このステップは着手済みで、`national 2件 / municipal 11件 / by_election 5件` を追加済み。今後も `Election` を増やすときは、選挙本体だけ先に追加して終わらせない。

最低ライン:

- `candidate_list` か `bulletin` のどちらか 1 件

理想ライン:

- `candidate_list`
- `bulletin`
- `early_voting`
- `polling_place`

### Step 5. validator と coverage report を強化する

やること:

- `kind` 別件数を validator 出力に含める
- `upcoming election` に対する `kind` 整備率を出す
- `other` の比率を見える化する

## 12. Done 条件

この拡張タスクは最低条件をすでに満たしており、次の焦点は `new seed を otherOnly にしないこと` に移っている。

- `candidate_list / early_voting / polling_place` は 0 を脱している
- `municipal / by_election` seed 追加時にも structured link を同時投入する
- `other` 比率が継続的に下がる
- `upcoming` 選挙では 4 kind の整備率を追える

## 13. この仕様のスタンス

この仕様は、最初から完全正規化を目指さない。  
先に `verified な公式導線` を揃え、ユーザー価値と coverage を上げる。  
その後、必要になったところから `Candidate`、`PollingPlace`、`EarlyVotingSite` の独立モデルへ進む。
