# 県議会任期台帳・照合フロー

## 目的

県知事選を扱うときに、同時期の県議会議員一般選挙・県議補欠選挙を落とさないため、県議会側の任期満了日と前回選挙日を台帳で確認する。

## 正本

- 県議会任期台帳: `data/v1/prefectural_assembly_terms.json`
- 県議選挙区・定数台帳: `data/v1/prefectural_assembly_districts.json`
- 県議会公式リンク台帳: `data/v1/prefectural_assembly_official_links.json`
- 公開HTML: `site/pages/prefectural-assembly-terms.html`
- 公開HTML: `site/pages/prefectural-assembly-districts.html`
- 公開HTML: `site/pages/prefectural-assembly-official-links.html`
- 選挙イベント: `data/v1/elections.json`
- 公式リンク: `data/v1/election_resource_links/{election_id}.json`

## 台帳の位置づけ

- `prefectural_assembly_terms.json` は、任期満了日・前回一般選挙日・定数・選挙区数を持つ基礎台帳。
- `prefectural_assembly_districts.json` は、県単位の選挙区名・区域・定数を持つ詳細台帳。
- `prefectural_assembly_official_links.json` は、県議会議員選挙確認時に使う公式導線を種別ごとに持つリンク台帳。
- 選挙区・定数台帳は県単位で完結させ、途中の選挙区だけを投入しない。投入後は県ごとの選挙区数・定数合計が任期台帳と一致することを確認する。
- 公式リンク台帳は、原則として選挙区・定数台帳で詳細化済みの県から追加する。
- 県議会議員一般選挙をトップページや選挙一覧に出す場合は、別途 `elections.json` に選挙イベントを作る。
- 県議補欠選挙は任期台帳ではなく、`elections.json` に `type: "by_election"`, `subtype: "assembly"` で作る。
- 初版は都道府県選挙管理委員会連合会の集約表を `official_aggregated` として採用する。個別県公式で確認した行は、個別公式URLに差し替える。

## 知事選確認時の照合

ユーザーが「X月の県知事選を確認して」と指示したら、次も同時に確認する。

1. `elections.json` から対象月の `subtype: "governor"` を抽出する
2. 対象県の `prefectural_assembly_terms.json` 行を確認する
3. 県議会任期満了日が対象月または近接期間にある場合、県議会議員一般選挙の公式ページが出ていないか確認する
4. 県公式・県選管ページで、同日実施の県議補欠選挙がないか検索する
5. 公式ページのタイトル・本文で、知事選だけでなく「県議会議員一般選挙」「県議会議員補欠選挙」「同日に執行」「併せて行われます」などの語を確認する
6. 同時実施が確認できたら、トップページ表示名・公式リンク名にも県議選・県議補選を反映する

## 県議選確認時の照合

ユーザーが「X月の県議選を確認して」と指示したら、逆方向にも確認する。

1. `prefectural_assembly_terms.json` から、任期満了日が対象月または近接期間にある県を抽出する
2. `elections.json` に該当する県議会議員一般選挙が登録済みか確認する
3. 登録がなければ、県公式・県選管ページで投票日・告示日・選挙名を確認する
4. 同じ県の知事選が同日にないか `elections.json` と県公式ページで確認する
5. 補欠選挙が同日実施される場合は、一般選挙とは別イベントとして登録する

## 公式リンク台帳の作成・更新

ユーザーが「県議会選挙に備えて公式リンクを集めて」と指示したら、次の順で確認する。

1. 対象県が `prefectural_assembly_terms.json` に県単位で入っているか確認する
2. `prefectural_assembly_districts.json` が未整備でも、公式リンク台帳は先行してよい。ただし、選挙区・定数を確認できる公式リンクを必ず探す
3. 対象県の選管入口、県公式の選挙カテゴリ、県議会トップを探す
4. 議員名簿、選挙区・定数、直近一般選挙結果、候補者情報・選挙公報の公式ページを探す
5. 各URLは HTTP 200 とページ見出し・本文の対象語を確認する
6. 対象語を確認できない自治体トップ、組織トップだけのページ、404、403、検索結果URLは登録しない
7. 同じ情報が専用ページにある場合は、上位カテゴリではなく専用ページを優先する
8. 専用ページがなくカテゴリページや一覧ページの一部にしか情報がない場合は、そのページ内で対象語までたどれることを確認し、必要に応じて `#:~:text=...` のテキストフラグメントで該当見出しへ直接移動させる
9. 47都道府県の網羅を先に作る場合、個別県ページをまだ確認できていない府県は、都道府県選挙管理委員会連合会の `47都道府県選管一覧` と `都道府県議会議員選挙` 表を `source_type: official_aggregated` の暫定公式集約リンクとして登録してよい
10. 公式集約リンクを使った場合は、`verification.note` に「個別県ページ確認前」と明記し、後続作業で個別県公式ページへ置き換える
11. `prefectural_assembly_official_links.json` に `link_kind` を分けて登録し、`verification.note` に何を確認したかを書く

優先する `link_kind`:

- `election_commission`: 都道府県選挙管理委員会または選管事務局
- `election_hub`: 県公式の選挙カテゴリ・選挙情報入口
- `assembly_home`: 県議会トップ
- `member_roster`: 現職議員名簿
- `districts`: 選挙区・定数
- `recent_regular_election`: 直近の県議会議員一般選挙結果・特設
- `candidate_bulletin_archive`: 候補者情報・選挙公報のアーカイブ

## 選挙区・定数台帳の拡充順

1. 任期満了が最も近い非統一県を優先する
2. 知事選・県議補選との同時実施があり得る県を優先する
3. 統一地方選対象県は、2027年4月の前半戦に向けて県単位で順次追加する
4. 追加時は県単位で全選挙区を入れ、県ごとの選挙区数・定数合計が `prefectural_assembly_terms.json` と一致することを確認する

## 公式ソース確認

優先順位:

1. 都道府県選挙管理委員会の選挙専用ページ
2. 都道府県公式サイトの選管ページ
3. 都道府県が公表する任期満了日一覧・選挙予定一覧
4. 都道府県選挙管理委員会連合会などの公式集約表

集約表だけで作った行は、必要に応じて個別県公式ページで再確認する。

## 更新後の確認

```bash
node scripts/validate-data-v1.mjs
node scripts/generate-prefectural-assembly-terms-page.mjs --write
node scripts/generate-prefectural-assembly-terms-page.mjs --check
node scripts/generate-prefectural-assembly-districts-page.mjs --write
node scripts/generate-prefectural-assembly-districts-page.mjs --check
node scripts/generate-prefectural-assembly-official-links-page.mjs --write
node scripts/generate-prefectural-assembly-official-links-page.mjs --check
```

公開表示に反映する選挙イベントや公式リンクを追加した場合は、続けて次を実行する。

```bash
node scripts/generate-site-data.mjs
```
