# data/v1

このディレクトリは、このプロジェクトの正本データ置き場です。

前提:

- 仕様書は [docs/specs/DATA_FILE_FORMAT_SPEC.md](/home/shimo/election/docs/specs/DATA_FILE_FORMAT_SPEC.md)
- 公式ソース方針は [docs/audits/OFFICIAL_SOURCE_COVERAGE.md](/home/shimo/election/docs/audits/OFFICIAL_SOURCE_COVERAGE.md)
- 旧 [data/regions.js](/home/shimo/election/data/regions.js) と [data/elections.js](/home/shimo/election/data/elections.js) は互換用の派生ファイルであり、正本ではありません

## 配置

```text
data/v1/
  regions.json
  elections.json
  prefectural_assembly_terms.json
  prefectural_assembly_districts.json
  prefectural_assembly_official_links.json
  postal_code_mappings/
    .gitkeep
  election_resource_links/
    .gitkeep
  election_page_details/
    {election_id}.json
  current_mayors/
    canonical.json
    by_prefecture/
```

## 重要ルール

- キー名は `snake_case`
- コード値は文字列で持つ
- すべての公開データは `verification` を持つ
- live 雛形にサンプルレコードを入れない
- `postal_code_mappings/{prefix3}.json` や `election_resource_links/{election_id}.json` は、実データ投入時に初めて作る
- `sample.json`, `template.json`, `000.json` のようなダミーファイルは置かない

## 個別選挙ページの補助データ

- `election_page_details/{election_id}.json` は、公式ソースから読み取った投票前チェック情報を個別ページに出すための補助データ
- `ElectionResourceLink` は公式リンクカード、`ElectionPageDetail` はページ本文の整理情報として役割を分ける
- 候補者一覧・選挙公報は、公式公開を確認するまで `candidate_list` / `bulletin` として登録しない
- 告示日・投票日から期日前投票期間を整理するなど、原文そのものではない計算値は `derived: true` にする
- 投票所一覧の全件正規化は急がず、まずは公式ページへの導線、注意事項、確認方法を整理する

知事選の専用ページを作るときの実務ルールは [docs/runbooks/GOVERNOR_PAGE_RUNBOOK.md](/home/shimo/election/docs/runbooks/GOVERNOR_PAGE_RUNBOOK.md) を参照。

外部 URL は、登録前に必ず一度開いて確認する。開けない URL、ミラーの不安定な詳細 URL、存在確認できない URL は入れない。
URL を追加・修正したら `node scripts/generate-site-data.mjs` まで実行し、`site/data/site-data.js` 側に古い URL が残っていないことを確認する。

## 現職肩書きの確認ルール

- `現職`, `知事`, `衆院議員`, `県議`, `市議` など現在の地位を示すラベルは、プロフィールページだけで判断しない
- 確認順は、直近の選挙結果、議会・自治体などの現職名簿、本人または党の最新プロフィール、報道の順にする
- 直近選挙後の情報と古いプロフィールが矛盾する場合は、直近選挙結果や現職名簿を優先する
- 現職か断定できない場合、または直近選挙で落選・退任を確認した場合は、`前衆院議員`, `元知事`, `元市議`, `2026年衆院選落選` のように現在形ではない表現にする
- `identity_labels` は候補者の識別補助であり、思想・評価・推薦を表すために使わない

## 選挙ページの状態メタ

- `elections.json` には `page_status` と `page_updates` を置ける
- `page_status` は「告示前の報道ベース」「公式候補者一覧は未掲載」など、専用ページの表示状態を表す
- `page_status` は断定ではなく、データセット上の運用状態を記録する
- `page_updates` は日付付きの更新履歴で、`date`, `title`, `summary` を持つ
- 公式候補者一覧が公開されたら、`page_status.official_candidate_list_status` を `published` にし、`page_status.official_candidate_list` に公式 URL を入れる
- `official_candidate_list_status = published` のときは、validator が `official_candidate_list.url`, `source_name`, `last_checked_at` の未入力をエラーにする
- 切り替え時は `label`, `summary`, `transition_note`, `as_of`, `page_updates` も同時に更新する
- UI 見出しは `official_candidate_list_status` に連動させる。`not_included` では `候補予定者プロフィール（報道ベース）` / `公式導線比較（報道確認ベース）` / `出馬動向（報道ベース）`、`published` では `公式候補者プロフィール` / `公式導線比較（公式候補者）` / `出馬動向（公示後更新）` を使う
- `profile_status = related_interest` / `interested` は候補予定者一覧や比較表に混ぜず、UI では `関連動向` セクションに分ける
- 公式候補者一覧に載るまでは、関連動向の人を候補予定者として読める文言を置かない

## 空ディレクトリの意味

- `postal_code_mappings/` に対象ファイルがまだない
  まだ投入していないことを意味する
- `election_resource_links/` に対象ファイルがまだない
  まだ投入していないことを意味する

これは `0件確定` とは違います。

## 県議会任期台帳

`prefectural_assembly_terms.json` は、都道府県議会議員選挙の任期満了日と前回一般選挙日を確認するための台帳です。

- 知事選を確認するときに、同時期の県議選・県議補選を落とさないために使う
- 県議選の予定を見つけたときに、`elections.json` に県議選イベントが未登録かどうかを確認する
- 初版は都道府県選挙管理委員会連合会の集約表を `official_aggregated` として採用している
- 個別の都道府県選管ページで確認できた行は、出典を個別公式ページに差し替えてよい
- 補欠選挙はこの台帳ではなく `elections.json` の `type: "by_election"`, `subtype: "assembly"` に入れる
- 正本を更新したら `node scripts/validate-data-v1.mjs` を通す
- 公開用の一覧HTMLは `node scripts/generate-prefectural-assembly-terms-page.mjs --write` で生成する

`prefectural_assembly_districts.json` は、都道府県議会議員選挙の選挙区名、区域、定数を確認するための台帳です。

- 初版は、非統一または個別管理が必要な茨城県、岩手県、宮城県、福島県、東京都、沖縄県を詳細化している
- 県ごとの選挙区数と定数合計は `prefectural_assembly_terms.json` と一致することを validator で確認する
- 追加投入するときは、県単位で全選挙区を入れ、途中の選挙区だけを混ぜない
- 公式ページが地図画像だけの場合は、画像スナップショットを `source_snapshot_path` に残す
- 公開用の一覧HTMLは `node scripts/generate-prefectural-assembly-districts-page.mjs --write` で生成する

`prefectural_assembly_official_links.json` は、県議会議員選挙を確認するときに使う公式導線の台帳です。

- 初版は `prefectural_assembly_districts.json` で詳細化済みの6県都を対象にしている。拡張時は、任期台帳にある県なら公式リンク台帳を先行して追加してよい
- 選管入口、議会、議員名簿、選挙区・定数、直近一般選挙、候補者・選挙公報系リンクを種別ごとに分ける
- URL登録前に HTTP 200 と本文の対象語を確認し、`verification.note` に何を確認したかを書く
- 開けないURL、自治体トップなど対象情報まで遠すぎるURL、対象語を確認できないURLは入れない
- 専用ページがなく、同一ページ内の一部にだけ対象情報がある場合は、`#:~:text=...` のテキストフラグメントで該当箇所へ移動させる
- 47都道府県の網羅を先に作る場合、個別県ページ未確認分は都道府県選挙管理委員会連合会の公式集約ページを `source_type: official_aggregated` として暫定登録してよい。後続作業で個別県公式ページに置き換える
- 公開用の一覧HTMLは `node scripts/generate-prefectural-assembly-official-links-page.mjs --write` で生成する

## ルート構造

`regions.json` と `elections.json` は次の形で始めます。

```json
{
  "schema_version": 1,
  "generated_at": "2026-04-09T08:45:53+09:00",
  "records": []
}
```

分割ファイルは、実データ投入時に次の追加キーを持ちます。

- `postal_code_mappings/{prefix3}.json`
  `prefix`
- `election_resource_links/{election_id}.json`
  `election_id`

## Validation

正本データを更新したら、次のコマンドで最低限の整合チェックを通します。

```bash
node scripts/validate-data-v1.mjs
```

このバリデータは、ルート構造、必須フィールド、enum、参照整合、一意性、公開ブロック条件を確認します。

旧 `data/*.js` を互換用に更新するときは、次のコマンドを使います。

```bash
node scripts/generate-legacy-data.mjs
```

この生成では `data/v1` を正本として `data/regions.js` と `data/elections.js` を派生更新します。
順番は `validate-data-v1` のあとに `generate-legacy-data` です。
## 追記: 新潟県知事選の補助データ

公式候補者一覧が公開されたときの更新手順は、次の順でそろえる。

1. `data/v1/elections.json` の `page_status.official_candidate_list_status` を `published` にする
2. `page_status.official_candidate_list` に `label`, `url`, `source_name`, `last_checked_at` を入れる
3. 公開日が分かる場合だけ `published_at` を足す
4. `page_status.label`, `summary`, `transition_note`, `as_of`, `page_updates` を公式候補者一覧ベースに更新する
5. 公式候補者一覧で確認できた人だけ `candidate_signals.status` を `official_candidate` に切り替える
6. 公式候補者一覧に載るまでは、関連動向の人を候補者扱いにしない
7. `candidate_profiles` や `candidate_endorsements` の追記は、一覧確認後に行う
8. 最後に `node scripts/validate-data-v1.mjs` と `node scripts/generate-site-data.mjs` を順に通す

新潟県知事選を `published` に切り替えるときは、`page_status` と `page_updates` を次の形で更新する。

```json
"page_status": {
  "label": "公式候補者一覧公表済み",
  "summary": "本ページは、新潟県選挙管理委員会が公表した公式候補者一覧を基準に更新しています。",
  "official_candidate_list_status": "published",
  "official_candidate_list": {
    "label": "新潟県知事選挙 候補者一覧",
    "url": "https://example.jp/official-candidate-list",
    "source_name": "新潟県選挙管理委員会",
    "last_checked_at": "2026-05-14T10:00:00+09:00",
    "published_at": "2026-05-14"
  },
  "transition_note": "掲載基準を、報道ベースの候補予定者から、選管公表の公式候補者一覧ベースへ切り替えました。",
  "as_of": "2026-05-14"
},
"page_updates": [
  {
    "date": "2026-05-14",
    "title": "公式候補者一覧ベースへ切替",
    "summary": "新潟県選挙管理委員会の公式候補者一覧公表に合わせ、候補者情報の掲載基準を公式候補者ベースへ更新しました。"
  }
]
```

- `published_at` は公式ページの公開日が分かる場合だけ入れる
- `page_updates` は新しい更新を先頭に追加し、既存履歴は残す
- `url`, `source_name`, `last_checked_at` は validator の必須項目

運用文言は評価や推測に見えない形にそろえる。`official_candidate` は公式候補者一覧で確認できた場合だけ使う。

選挙ごとに次の補助ディレクトリを置ける。

- `candidate_signals/`
  - 報道や本人発表をもとにした候補予定者・出馬動向
  - 公式候補者一覧ではない
  - `interested` は関連動向として扱い、候補予定者一覧には混ぜない
- `candidate_endorsements/`
  - 推薦・支持・擁立を候補動向と分けて記録する
  - 公式候補者一覧ではない
- `candidate_profiles/`
    - 公式サイト、公式SNS、本人発信、所属機関プロフィール、政策リンク、経歴を分けて記録する
    - `person_kana` があると候補者一覧での識別がしやすい
    - `birth_date` は年齢表示の計算元。確実な出典がある場合だけ `YYYY-MM-DD` で入れ、年齢だけを手入力しない
    - `identity_labels` は「現職知事」「県議」「本人ブログ」「関連動向」など、中立的な事実ベースの短い識別に使う
    - `evidence[].source_type` は出典の性質を表す。`official` は公式サイトや公的資料、`person_statement` は本人発信、`media_report` は報道、`party_statement` は党・会派発表、`organization_statement` は団体発表として扱う
    - `profile_status = related_interest` は候補予定者扱いにしない。`related_interest` は `関連動向` として別枠で扱う
    - 公式候補者一覧ではない

どちらも `data/v1/{kind}/{election_id}.json` の形で置く。
更新時は必ず出典 URL と確認日時を残す。
