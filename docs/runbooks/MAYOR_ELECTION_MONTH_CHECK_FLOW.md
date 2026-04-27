# 月別市長選チェックフロー

最終更新: 2026-04-27
ステータス: Draft v1
関連:
- [トップページ更新フロー](/home/shimo/election/docs/runbooks/SITE_TOP_PAGE_UPDATE_FLOW.md)
- [現職市長情報 更新フロー](/home/shimo/election/docs/runbooks/CURRENT_MAYORS_UPDATE_FLOW.md)
- [市長台帳 直近選挙アノマリ検出フロー](/home/shimo/election/docs/runbooks/MAYOR_LEDGER_UPCOMING_ELECTION_ANOMALY_FLOW.md)
- [選挙データ](/home/shimo/election/data/v1/elections.json)
- [トップページ用生成データ](/home/shimo/election/site/data/site-data.js)
- [市長選 公式リンク右欄チェックフロー](/home/shimo/election/docs/runbooks/MAYOR_RESOURCE_LINK_PANEL_CHECK_FLOW.md)
- [現職市長台帳](/home/shimo/election/data/v1/current_mayors/canonical.json)
- [市長台帳監査 skill](/home/shimo/election/skills/current-mayors-audit/SKILL.md)

## 1. 目的

この文書は、ユーザーから「メインページのX月の市長選情報が正しいかチェックして」と指示されたときに、トップページ表示、選挙データ、現職市長台帳、公式ソースを同じ順番で照合するための runbook である。

## 2. 適用範囲

対象にするもの:

- メインページの「選挙を探す」に出る市長選
- `data/v1/elections.json` の `subtype: mayor`
- `data/v1/current_mayors/canonical.json` の任期満了日から、対象月に市長選があり得る市
- 対象月の市長選に関する公式ページ、公式PDF、都道府県・市区町村選管の日程ページ

対象にしないもの:

- 知事選、議会選、補欠選だけの単独チェック
- 現職市長台帳の県単位フル監査
- 候補者プロフィール調査

補足:

- 「市長選の件数」は、トップページのカード件数ではなく、個別の `subtype: mayor` の選挙件数として数える
- 市長選と市議選が同時選挙カードとしてまとまる場合でも、市長選1件として数える
- トップページ全体の5月件数などを答えるときは、知事選などの混入を分けて説明する

## 3. 年月を確定する

ユーザーが「5月」のように月だけを指定した場合は、作業日の年を使い、最初に具体的な対象範囲を明記する。

例:

```text
対象範囲: 2026-05-01 から 2026-05-31 まで
```

年が文脈上あいまい、または過去月・翌年の可能性が高い場合は、作業前の説明または最終報告で必ず具体日付を出す。

## 4. 全体フロー

1. 対象年月を `YYYY-MM-01` から月末までに固定する
2. トップページ構造が変わっていないか軽く確認する
3. `site/data/site-data.js` から、メインページ表示上の対象月市長選を抽出する
4. `data/v1/elections.json` から、canonical 側の対象月市長選を抽出する
5. `data/v1/current_mayors/canonical.json` から、任期満了日起点の候補市を抽出する
6. 3つのリストを突き合わせる
7. 不足、誤日付、誤分類、公式リンク不足を公式ソースで確認する
8. 修正が必要なら対象IDを固定して canonical data を直し、局所確認してからトップページ用データを再生成する
9. 検証結果、件数、修正内容、残リスクを報告する

## 5. 軽い構造確認

作業前に、トップページが生成データを読む構造のままか確認する。

```bash
head -n 5 site/data/site-data.js
rg -n "site-data.js|assets/app.js|electionList" site/index.html
rg -n "AUTO-GENERATED|generate-site-data" site/data/site-data.js scripts/generate-site-data.mjs scripts/current/generate-site-data.mjs
```

期待する状態:

- `site/index.html` が `data/site-data.js` と `assets/app.js` を読み込んでいる
- `site/data/site-data.js` は `AUTO-GENERATED`
- 表示データは `data/v1` から `scripts/generate-site-data.mjs` で再生成する

## 6. メインページ表示データから抽出する

メインページが読む生成済みデータから、対象月の市長選を抽出する。

```bash
node -e 'global.window={}; require("./site/data/site-data.js"); const start=process.argv[1]; const end=process.argv[2]; const d=window.ELECTION_SITE_DATA; const rows=d.elections.filter(e=>e.subtype==="mayor"&&e.voteDate>=start&&e.voteDate<=end).sort((a,b)=>a.voteDate.localeCompare(b.voteDate)||a.name.localeCompare(b.name,"ja")); for (const e of rows) console.log([e.voteDate,e.noticeDate,e.id,e.name,e.primaryRegionName,e.sourceUrl].join("\t")); console.error("count="+rows.length);' YYYY-MM-01 YYYY-MM-DD
```

注意:

- これは `site/data/site-data.js` に反映済みの状態を見る
- トップページのデフォルト表示は `site/assets/app.js` の `isElectionUpcoming` により、投票日が作業日以後の選挙だけを表示する
- 過去月をチェックすると、データ上は存在してもメインページのデフォルト表示には出ないことがある

## 7. canonical election data から抽出する

正本側の `data/v1/elections.json` から、対象月の市長選を抽出する。

```bash
node -e 'const d=require("./data/v1/elections.json"); const start=process.argv[1]; const end=process.argv[2]; const rows=d.records.filter(e=>e.subtype==="mayor"&&e.vote_date>=start&&e.vote_date<=end).sort((a,b)=>a.vote_date.localeCompare(b.vote_date)||a.name.localeCompare(b.name,"ja")); for (const e of rows) console.log([e.vote_date,e.notice_date,e.id,e.name,e.primary_region_id,e.verification?.source_url].join("\t")); console.error("count="+rows.length);' YYYY-MM-01 YYYY-MM-DD
```

比較すること:

- `site/data/site-data.js` と件数が合うか
- 投票日、告示日、選挙名、地域が合うか
- `verification.source_url` が公式ソースか
- 県の一覧だけでなく、市区町村の具体的な選挙ページが出ていれば差し替え候補にする

## 8. 現職市長台帳から候補市を抽出する

市長選は通常、任期満了日前30日以内に執行される。対象月の市長選候補は、対象月初日から対象月末日の30日後までに任期満了する市を一次候補にする。

例: 2026年5月投票を探す場合は、`term_end` が `2026-05-01` から `2026-06-30` までの市を候補にする。

```bash
node -e 'const d=require("./data/v1/current_mayors/canonical.json"); const start=process.argv[1]; const endPlus30=process.argv[2]; const rows=d.records.filter(r=>r.term_end>=start&&r.term_end<=endPlus30).sort((a,b)=>a.term_end.localeCompare(b.term_end)||a.pref_name.localeCompare(b.pref_name,"ja")||a.city_name.localeCompare(b.city_name,"ja")); for (const r of rows) console.log([r.term_end,r.pref_name,r.city_name,r.region_id,r.mayor_name,r.status,r.display_source?.url||""].join("\t")); console.error("count="+rows.length);' YYYY-MM-01 YYYY-MM-DD_PLUS_30
```

分類すること:

- 対象月に投票する市長選
- 対象月の前月に投票済みの市長選
- 対象月の翌月以降に投票する市長選
- 台帳の任期満了日が誤っている可能性がある市
- 選挙データに未登録の市長選

## 9. 同時選挙を確認する

市長選を確認するときは、市長選単独と決め打ちしない。対象自治体で同日に行われる市議会議員一般選挙、市議会議員補欠選挙、その他の補欠選挙がないか必ず確認する。

確認する場所:

- 市区町村の選挙カテゴリトップ、選挙管理委員会トップ、選挙一覧ページ
- 対象市長選の専用ページのページタイトル、見出し、本文
- `data/v1/elections.json` の同じ `primary_region_id`、`vote_date`、`notice_date` のレコード
- 都道府県選管の日程一覧

確認する語句:

- `市議会議員一般選挙`
- `市議会議員補欠選挙`
- `市議補選`
- `補欠選挙`
- `同日に執行`
- `併せて行われます`
- `欠員`
- `選挙すべき議員の数`

判定:

- 市長選と同じ自治体、同じ投票日、同じ告示日で市議選・市議補選が公式に確認できたら、`data/v1/elections.json` に別レコードとして登録する。
- 市議会議員補欠選挙は `type: "by_election"`, `subtype: "assembly"` を標準にする。
- 市議会議員一般選挙は `type: "municipal"`, `subtype: "assembly"` を標準にする。
- 市長選の公式リンクが同時選挙ページの場合、リンクタイトルと summary に市議選・市議補選も含める。
- 同時選挙の公式リンクは、必要に応じて市長選側と議会選側の `data/v1/election_resource_links/{election_id}.json` の両方に登録する。
- トップページでは `site/assets/app.js` の同時選挙結合ロジックにより、同じ地域・投票日・告示日の市長選と議会選が1カードにまとまることを確認する。

失敗事例:

- 羽生市長選挙の公式ページは、ページタイトルから「羽生市長選挙・羽生市議会議員補欠選挙」だったが、当初は市長選レコードだけを登録していた。その結果、トップページで市長選単独のように見えた。
- 春日井市長選挙も、本文に「同日に春日井市議会議員補欠選挙も執行」とあったため、補欠選挙レコードが必要だった。

## 10. 公式ソース確認の優先順

1. 市区町村選挙管理委員会の対象選挙ページ
2. 市区町村の広報、報道発表、選挙特設ページ
3. 都道府県選管の選挙日程一覧
4. 都道府県の任期満了日一覧
5. 現職市長台帳の既存 source URL

確認する項目:

- 選挙名
- 投票日
- 告示日
- 任期満了日
- 市長選か、市議選・補選・知事選との同時選挙か
- 市議会議員一般選挙・市議会議員補欠選挙が同日実施される場合、選挙名と `data/v1/elections.json` の別レコードがあるか
- 期日前投票、投票所、候補者一覧、選挙公報の有無

公式ページを見つけたら、`data/v1/elections.json` の `verification.source_url` と、必要に応じて `data/v1/election_resource_links/{election_id}.json` に残す。

## 10. 差分の分類

調査結果は次の分類で整理する。

```text
confirmed_on_main_page
  メインページ、canonical data、公式ソースが一致している。

missing_from_main_page
  公式に対象月投票の市長選だが、メインページ用データに出ていない。

missing_from_elections_json
  現職市長台帳や公式ソースでは対象月投票だが、data/v1/elections.json に未登録。

missing_joint_assembly_election
  市長選と同日に市議会議員一般選挙・市議会議員補欠選挙が公式に確認できるが、data/v1/elections.json に未登録。

wrong_vote_date
  data/v1/elections.json または site/data/site-data.js の投票日が公式ソースと違う。

wrong_notice_date
  告示日が公式ソースと違う。

wrong_source
  公式ソースではあるが、より具体的な市区町村公式ページへ差し替えた方がよい。

not_target_month
  任期満了日から候補に出たが、投票日は対象月ではない。

not_mayor
  対象月の選挙だが、市長選ではない。

ledger_correction_candidate
  現職市長台帳の任期満了日や現職情報が公式情報と食い違う。
```

## 11. 修正する場合の編集先

投票日、告示日、選挙名、地域、確認元:

```text
data/v1/elections.json
```

公式リンク:

```text
data/v1/election_resource_links/{election_id}.json
```

市区町村 region がない場合:

```text
data/v1/regions.json
```

現職市長台帳に誤りがある場合:

```text
data/v1/current_mayors/canonical.json
data/v1/current_mayors/by_prefecture/{pref}.json
```

注意:

- `site/index.html` は通常編集しない
- `site/data/site-data.js` は直接編集しない
- `site/data/site-data.js` は最後に再生成する

## 12. 編集時の事故防止

今回の月別チェックでは、`data/v1/elections.json` の近接レコードを機械的に差し替えたことで、本来は正しかった別レコードに一時的に誤った日付が入る事故が起きた。

原因:

- 選挙名や日付だけを目印にして広めの patch を当てた
- 近い位置にある複数の市長選レコードを同時に編集した
- 編集直後に、修正対象IDだけでなく巻き込みやすい周辺IDを抜き出して確認する手順がなかった

対策:

- 修正対象は必ず `election_id` で固定する
- 複数件を直す場合も、対象ID、選挙名、修正前日付、修正後日付、公式URLを先に一覧化する
- patch は大きな範囲置換ではなく、IDごとの小さな変更にする
- 編集直後に対象IDを指定して `phase`、`notice_date`、`vote_date`、`verification.source_url` を抜き出す
- もともと正しいと判定したレコードは、修正後に「変更されていないこと」も確認する

確認コマンド例:

```bash
node -e 'const d=require("./data/v1/elections.json"); const ids=["el-mun-11238-mayor-2026","el-mun-11216-mayor-2026"]; for (const id of ids){ const e=d.records.find(e=>e.id===id); console.log([e.id,e.name,e.phase,e.notice_date,e.vote_date,e.verification?.source_url].join("\t")); }'
```

## 13. 再生成と検証

選挙データを修正したら、次を実行する。

```bash
node scripts/current/validate-data-v1.mjs
node scripts/generate-site-data.mjs
node scripts/current/validate-data-v1.mjs
```

現職市長台帳を修正した場合は、必要に応じて次も実行する。

```bash
node scripts/current/generate-current-mayors-data.mjs --write --generated-at YYYY-MM-DDT00:00:00+09:00
node scripts/current/generate-current-mayors-page.mjs --check
node scripts/current/validate-data-v1.mjs
```

生成後に、対象月の市長選件数を再確認する。

```bash
node -e 'global.window={}; require("./site/data/site-data.js"); const start=process.argv[1]; const end=process.argv[2]; const rows=window.ELECTION_SITE_DATA.elections.filter(e=>e.subtype==="mayor"&&e.voteDate>=start&&e.voteDate<=end).sort((a,b)=>a.voteDate.localeCompare(b.voteDate)||a.name.localeCompare(b.name,"ja")); console.log("mayor_elections="+rows.length); console.log(rows.map(e=>`${e.voteDate} ${e.name}`).join("\n"));' YYYY-MM-01 YYYY-MM-DD
```

## 14. 調査メモの保存先

月別チェックの根拠は、必要に応じて次に保存する。

```text
research/current-mayors/monthly-checks/YYYY-MM-mayor-elections.md
```

書く内容:

- 調査日
- 対象年月
- メインページ表示データの抽出結果
- canonical election data の抽出結果
- 現職市長台帳からの候補市
- 公式ソース確認結果
- 修正したファイル
- 未解決または再調査が必要な市

過去に別の場所へ作ったメモがある場合は、新規作業ではこの保存先へ寄せる。

## 14. 最終報告の形式

最終報告では、少なくとも次を明記する。

- 対象期間
- 市長選件数
- 市長選一覧
- メインページに反映済みか
- 修正したファイル
- 公式確認元
- 検証コマンドの結果
- 知事選や議会選など、市長選件数に含めなかったもの
- 台帳修正候補があればその市名

例:

```text
対象期間は 2026-05-01 から 2026-05-31 までです。
5月投票の市長選は11件です。
メインページ用データ site/data/site-data.js にも11件反映されています。
新潟県知事選は5月投票ですが、市長選件数には含めていません。
```
