# トップページ更新フロー

最終更新: 2026-04-27
ステータス: Draft v1
関連:
- [トップページ](/home/shimo/election/site/index.html)
- [トップページ用生成データ](/home/shimo/election/site/data/site-data.js)
- [選挙データ](/home/shimo/election/data/v1/elections.json)
- [公式リンクデータ](/home/shimo/election/data/v1/election_resource_links)
- [月別市長選チェックフロー](/home/shimo/election/docs/runbooks/MAYOR_ELECTION_MONTH_CHECK_FLOW.md)
- [市長選 公式リンク右欄チェックフロー](/home/shimo/election/docs/runbooks/MAYOR_RESOURCE_LINK_PANEL_CHECK_FLOW.md)

## 1. 目的

この文書は、トップページの「選挙を探す」一覧を更新するときに、どのファイルを正本として直すかを毎回迷わないようにするための runbook である。

## 2. トップページの構造

```text
site/index.html
  トップページの HTML 構造。
  選挙一覧の実データは直書きしない。

site/assets/app.js
  検索、フィルター、カード表示、詳細表示のロジック。
  通常の選挙追加では編集しない。

site/data/site-data.js
  トップページが読むブラウザ用データ。
  AUTO-GENERATED なので直接編集しない。

data/v1/elections.json
  選挙一覧の canonical source。
  投票日、告示日、選挙名、地域、確認元はここを直す。

data/v1/election_resource_links/*.json
  選挙ごとの公式リンク。
  候補者一覧、選挙公報、期日前投票、投票所、公式ページはここに追加する。

data/v1/regions.json
  選挙が紐づく都道府県・市区町村。
  primary_region_id が存在しない場合は先にここを補う。

scripts/generate-site-data.mjs
  data/v1 から site/data/site-data.js を再生成する入口。

scripts/current/validate-data-v1.mjs
  data/v1 の整合性を検証する。
```

## 3. 基本方針

- トップページの選挙一覧を直すときは、`site/index.html` を直接編集しない
- `site/data/site-data.js` も生成物なので直接編集しない
- 選挙そのものは `data/v1/elections.json` を直す
- 公式リンクは `data/v1/election_resource_links/{election_id}.json` に追加する
- 変更後に `scripts/generate-site-data.mjs` を実行して公開側データへ反映する
- 公式情報は、都道府県日程より市区町村の選挙管理委員会ページが具体的なら市区町村ページを優先する

## 4. 毎回の軽い確認

構造はこの runbook を前提にしてよい。ただし、作業前に次の軽い確認だけ行う。

```bash
head -n 5 site/data/site-data.js
rg -n "site-data.js|assets/app.js|electionList" site/index.html
rg -n "AUTO-GENERATED|generate-site-data" site/data/site-data.js scripts/generate-site-data.mjs scripts/current/generate-site-data.mjs
```

確認すること:

- `site/index.html` が `site/data/site-data.js` と `site/assets/app.js` を読み込んでいる
- `site/data/site-data.js` の冒頭に `AUTO-GENERATED` がある
- `scripts/generate-site-data.mjs` が `scripts/current/generate-site-data.mjs` への薄い入口である

## 5. 選挙一覧を更新する手順

1. 公式ソースを確認する
2. `data/v1/elections.json` の該当選挙を、対象IDを固定して追加または修正する
3. 公式リンクがある場合は `data/v1/election_resource_links/{election_id}.json` を追加または修正する
4. `primary_region_id` が存在するか `data/v1/regions.json` で確認する
5. `node scripts/current/validate-data-v1.mjs` を実行する
6. `node scripts/generate-site-data.mjs` を実行する
7. 生成後の `site/data/site-data.js` で対象選挙が出ることを確認する

編集時の注意:

- 選挙名や日付だけを目印にした広い置換は避ける
- 複数の選挙を同時に直す場合は、先に `election_id`、選挙名、修正前日付、修正後日付、公式URLを一覧化する
- 編集直後に対象IDを指定して `phase`、`notice_date`、`vote_date`、`verification.source_url` を抜き出す
- もともと正しいと判定した近接レコードが、巻き込まれて変わっていないか確認する

標準コマンド:

```bash
node scripts/current/validate-data-v1.mjs
node scripts/generate-site-data.mjs
node scripts/current/validate-data-v1.mjs
```

対象選挙の表示確認例:

```bash
node -e 'global.window={}; require("./site/data/site-data.js"); const d=window.ELECTION_SITE_DATA; console.log(d.elections.filter(e=>e.voteDate>="2026-05-01"&&e.voteDate<="2026-05-31").map(e=>`${e.voteDate} ${e.name}`).join("\n"));'
```

## 6. 更新判断

`data/v1/elections.json` を直すケース:

- 投票日や告示日が違う
- 選挙が未登録
- phase が違う
- 確認元をより具体的な公式ページに差し替える

`data/v1/election_resource_links/*.json` を直すケース:

- 公式の選挙特設ページがある
- 候補者一覧が出た
- 選挙公報が出た
- 期日前投票、投票所、不在者投票などの案内が出た

`site/assets/app.js` を直すケース:

- カード表示や詳細表示の仕様を変える
- 検索やフィルターの挙動を変える
- 同時選挙のまとめ方を変える

`site/index.html` を直すケース:

- セクション構成、導線、文言、読み込む JS/CSS を変える
- 選挙データそのものの追加・修正では通常触らない

## 7. 注意点

- `site/data/site-data.js` は差分が大きくなりやすいが、生成物として扱う
- 生成後に `generatedAt` が変わるのは正常
- 選挙日程が都道府県一覧と市区町村ページで違う場合は、まず市区町村の選挙管理委員会ページを確認する
- 投票日が近い選挙は、候補者一覧や選挙公報の追加有無も確認する
- 公式ページが PDF の場合も、`source_url` と `resource_links` に残して追跡できるようにする
