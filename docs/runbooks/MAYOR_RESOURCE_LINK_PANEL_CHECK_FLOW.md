# 市長選 公式リンク右欄チェックフロー

最終更新: 2026-04-27
ステータス: Draft v1
関連:
- [トップページ更新フロー](/home/shimo/election/docs/runbooks/SITE_TOP_PAGE_UPDATE_FLOW.md)
- [月別市長選チェックフロー](/home/shimo/election/docs/runbooks/MAYOR_ELECTION_MONTH_CHECK_FLOW.md)
- [選挙データ](/home/shimo/election/data/v1/elections.json)
- [公式リンクデータ](/home/shimo/election/data/v1/election_resource_links)
- [トップページ用生成データ](/home/shimo/election/site/data/site-data.js)
- [トップページ](/home/shimo/election/site/index.html)
- [トップページ表示ロジック](/home/shimo/election/site/assets/app.js)

## 1. 目的

この文書は、2026年5月の市長選挙について、読者が欲しい5種類の公式リンクがトップページ右欄に出るか確認するための runbook である。

右欄とは、`site/index.html` の `aside.detail-panel#detail` を指す。選挙カードを選択すると、`site/assets/app.js` の `renderDetail()` が `election.resources` を `公式リンク` として表示する。

## 2. 対象

標準対象は、投票日が `2026-05-01` から `2026-05-31` までの `subtype: mayor` である。知事選、議会選、補欠選だけの単独チェックは対象外にする。

2026年5月の対象ID:

| election_id | 選挙名 | 投票日 |
|---|---|---:|
| `el-mun-38206-mayor-2026` | 西条市長選挙 | 2026-05-17 |
| `el-mun-11216-mayor-2026` | 羽生市長選挙 | 2026-05-24 |
| `el-mun-17205-mayor-2026` | 珠洲市長選挙 | 2026-05-24 |
| `el-mun-23206-mayor-2026` | 春日井市長選挙 | 2026-05-24 |
| `el-mun-35206-mayor-2026` | 防府市長選挙 | 2026-05-24 |
| `el-mun-11238-mayor-2026` | 蓮田市長選挙 | 2026-05-24 |
| `el-mun-32207-mayor-2026` | 江津市長選挙 | 2026-05-31 |

## 3. 確認する5種類

`data/v1/election_resource_links/{election_id}.json` の `kind` で管理する。

| kind | 画面上の意味 | 典型的な公式ソース |
|---|---|---|
| `candidate_list` | 候補者 | 立候補者一覧、立候補届出状況、選挙長告示 |
| `bulletin` | 選挙公報 | 選挙公報ページ、選挙公報PDF |
| `early_voting` | 期日前投票 | 期日前投票所、期間、時間の案内 |
| `polling_place` | 投票所 | 当日投票所、投票区、投票所所在地一覧 |
| `other` | その他 | 選挙概要、日程、選挙特設ページ |

注意:

- `candidate_list` と `bulletin` は告示日以後に公開されることが多い。告示日前に未掲載なら、欠落ではなく `not_yet_published` として報告する。
- 公式ページ内に「決まり次第掲載」とあるだけの場合、そのページを `candidate_list` や `bulletin` として登録しない。実体が公開されてから登録する。
- 同じ公式ページに期日前投票と投票所の両方が載っている場合は、同じURLでも `early_voting` と `polling_place` の2レコードに分けてよい。
- 出馬表明、報道、立候補予定者説明会の参加者、事前審査提出者などは `candidate_list` ではない。非公式または候補予定者段階の情報は、公式リンク右欄ではなく専用ページ・専用データで扱う。
- 専用ページがなく、広報まとめページやお知らせ一覧ページの一部に対象情報が載っている場合は、読者がページ先頭に飛ばされないように `#:~:text=...` のテキストフラグメントで該当項目まで直接移動させる。

## 4. 告示前後で優先項目を分ける

ユーザーが「メインページのX月の市長選について公式リンクを集めて」と依頼した場合は、告示前か告示後かで優先項目を分ける。

告示前:

- 最優先: `other`, `early_voting`, `polling_place`
- 集める情報: 選挙概要、投票日、告示日、開票日時、投票できる人、投票所、投票時間、期日前投票、不在者投票、郵便投票、投票所入場券、選挙公報の配布予定や設置場所、問い合わせ先
- `candidate_list` は原則 `not_yet_published` として扱う
- 選挙公報PDFが未公開なら `bulletin` は登録しない。配布予定や設置場所だけなら、公式ページの `other` または該当する概要リンクの `summary` に含める
- 出馬表明、候補予定者説明会参加者、事前審査提出者は公式リンク右欄には入れない

告示日以後:

- 最優先: `candidate_list`, `bulletin`
- 次点: 告示前に未充足だった `early_voting`, `polling_place`, `other`
- 集める情報: 立候補届出状況、候補者一覧、選挙長告示、選挙公報PDF、候補者情報掲載ページ
- 公式ページ内に「決まり次第掲載」とあるだけなら登録しない。実際の候補者一覧や公報PDFが公開されてから登録する

投票日直前:

- `candidate_list` と `bulletin` の公開有無を再確認する
- 期日前投票所や投票所の変更、投票時間変更、繰上投票の有無を再確認する
- 既存リンクが広報まとめページの場合は、専用ページやPDFが新規公開されていないか確認し、より直接的な公式リンクに置き換える

未公開の扱い:

- 告示前の候補者一覧: `missing` ではなく `not_yet_published`
- 告示前の選挙公報PDF: `not_yet_published`
- 市が配布予定だけを告知している選挙公報: `bulletin` ではなく、概要リンクで説明する
- 公式に存在しない投票所一覧: `not_found` または `partial` として報告し、入場券案内など代替公式情報があれば `polling_place` として使えるか慎重に判断する

## 5. 画面表示の前提

公式リンクの流れ:

```text
data/v1/election_resource_links/{election_id}.json
  -> scripts/generate-site-data.mjs
  -> site/data/site-data.js の election.resources
  -> site/assets/app.js の renderDetail()
  -> site/index.html の aside.detail-panel#detail
```

画面右欄に出るかどうかは、基本的には生成後の `site/data/site-data.js` に対象選挙の `resources` が入っているかで確認できる。

構造確認:

```bash
rg -n "detail-panel|site-data.js|assets/app.js" site/index.html
rg -n "KIND_LABELS|RESOURCE_GROUPS|function renderDetail|resource-link" site/assets/app.js
head -n 5 site/data/site-data.js
```

期待する状態:

- `site/index.html` に `aside.detail-panel` がある
- `site/index.html` が `data/site-data.js` と `assets/app.js` を読み込んでいる
- `site/assets/app.js` に5種類の `KIND_LABELS` がある
- `renderDetail()` が `election.resources` を `.resource-link` として出している
- `site/data/site-data.js` は `AUTO-GENERATED`

## 6. 対象市長選を抽出する

トップページ用生成データから対象月の市長選を抜く。

```bash
node -e 'global.window={}; require("./site/data/site-data.js"); const start="2026-05-01"; const end="2026-05-31"; const rows=window.ELECTION_SITE_DATA.elections.filter(e=>e.subtype==="mayor"&&e.voteDate>=start&&e.voteDate<=end).sort((a,b)=>a.voteDate.localeCompare(b.voteDate)||a.name.localeCompare(b.name,"ja")); for (const e of rows) console.log([e.voteDate,e.noticeDate,e.id,e.name,(e.resourceKinds||[]).join(",")].join("\t")); console.error("count="+rows.length);'
```

canonical 側も確認する。

```bash
node -e 'const d=require("./data/v1/elections.json"); const start="2026-05-01"; const end="2026-05-31"; const rows=d.records.filter(e=>e.subtype==="mayor"&&e.vote_date>=start&&e.vote_date<=end).sort((a,b)=>a.vote_date.localeCompare(b.vote_date)||a.name.localeCompare(b.name,"ja")); for (const e of rows) console.log([e.vote_date,e.notice_date,e.id,e.name,e.primary_region_id,e.verification?.source_url].join("\t")); console.error("count="+rows.length);'
```

## 7. 5種類の不足を機械確認する

生成後のトップページ用データで、右欄に出るリンク種別が揃っているか確認する。

```bash
node -e 'global.window={}; require("./site/data/site-data.js"); const required=["candidate_list","bulletin","early_voting","polling_place","other"]; const start="2026-05-01"; const end="2026-05-31"; const rows=window.ELECTION_SITE_DATA.elections.filter(e=>e.subtype==="mayor"&&e.voteDate>=start&&e.voteDate<=end).sort((a,b)=>a.voteDate.localeCompare(b.voteDate)||a.name.localeCompare(b.name,"ja")); for (const e of rows){ const kinds=new Set((e.resources||[]).map(r=>r.kind)); const missing=required.filter(k=>!kinds.has(k)); const status=missing.length?"missing":"complete"; console.log([status,e.voteDate,e.id,e.name,"have="+[...kinds].sort().join(","),"missing="+missing.join(",")].join("\t")); }'
```

正本ファイル単位でも確認する。

```bash
node -e 'const fs=require("fs"); const path=require("path"); const elections=require("./data/v1/elections.json").records; const required=["candidate_list","bulletin","early_voting","polling_place","other"]; const dir="data/v1/election_resource_links"; const rows=elections.filter(e=>e.subtype==="mayor"&&e.vote_date>="2026-05-01"&&e.vote_date<="2026-05-31").sort((a,b)=>a.vote_date.localeCompare(b.vote_date)||a.name.localeCompare(b.name,"ja")); for (const e of rows){ const file=path.join(dir,e.id+".json"); if(!fs.existsSync(file)){ console.log(["no_file",e.vote_date,e.id,e.name,"missing="+required.join(",")].join("\t")); continue; } const data=JSON.parse(fs.readFileSync(file,"utf8")); const kinds=new Set(data.records.map(r=>r.kind)); const missing=required.filter(k=>!kinds.has(k)); console.log([missing.length?"missing":"complete",e.vote_date,e.id,e.name,"have="+[...kinds].sort().join(","),"missing="+missing.join(",")].join("\t")); }'
```

## 8. 公式ソースを探す順番

各選挙で、まず自治体の選挙カテゴリトップまたは選挙管理委員会トップを確認し、対象選挙の専用ページがないか探す。既存の `other` 公式ページや広報ページは、専用ページが見つからない場合の起点にする。

基本の探索順:

1. 市区町村の選挙カテゴリトップ、選挙管理委員会トップ、選挙一覧ページ
2. 1 の実 `href` から辿れる対象選挙の専用ページ
3. 対象選挙専用ページ内の候補者一覧、選挙公報、期日前投票、投票所セクション
4. 市区町村サイト内検索の対象選挙名
5. 告示前は「期日前投票」「投票所」「不在者投票」「投票所入場券」「選挙公報 配布」
6. 告示日以後は「立候補」「候補者」「立候補届出」「選挙公報」「選挙長告示」
7. 都道府県選管の日程ページや市町村選挙予定表
8. 広報まとめページやお知らせ一覧ページの一部に載った情報

確認すること:

- 選挙名が対象の市長選と一致する
- 投票日、告示日が `data/v1/elections.json` と矛盾しない
- 市議選、補欠選との同時選挙ページの場合、市長選にも使えるリンクか
- ページタイトルや本文に、市議会議員一般選挙、市議会議員補欠選挙、市議補選、補欠選挙、同日に執行、併せて行われます、欠員、選挙すべき議員の数、などの記載がないか
- 市長選と同日に市議選・市議補選が確認できた場合、公式リンクの `title` と `summary` が市長選単独に見えない表現になっているか
- 市長選と同日に市議選・市議補選が確認できた場合、月別市長選チェックフローに戻って `data/v1/elections.json` に議会選レコードを追加する必要がないか
- 広報まとめページを使う前に、自治体の選挙カテゴリトップから対象選挙専用ページが存在しないことを確認したか
- 専用ページが見つかった場合は、広報まとめページより専用ページを優先して `other` と `source_url` に使う
- PDF直リンクや下層ページの場合、公式の一覧ページまたは対象ページから実際の `href` としてリンクされているか
- 登録予定URLを直接開き、404ページ・エラーページ・移動済みページではないか
- 登録予定URLの本文またはタイトルに、対象選挙名、対象項目、または自治体の該当投票情報があるか
- 候補者一覧や選挙公報は、候補予定者や報道記事ではなく公式公開物か
- 告示前の候補予定者情報を見つけても、この runbook では登録対象にしない。必要なら別作業として、非公式・候補予定者情報の専用ページに回す。

## 9. データへ反映する

編集先は `data/v1/election_resource_links/{election_id}.json` に固定する。ファイルがなければ新規作成する。

レコードIDの例:

```text
{election_id}-candidate-list-01
{election_id}-bulletin-01
{election_id}-early-voting-01
{election_id}-polling-place-01
{election_id}-other-01
```

`display_order` の標準:

```text
10 candidate_list
20 bulletin
30 early_voting
40 polling_place
90 other
```

レコード例:

```json
{
  "id": "el-mun-00000-mayor-2026-polling-place-01",
  "election_id": "el-mun-00000-mayor-2026",
  "kind": "polling_place",
  "title": "投票所一覧",
  "url": "https://www.example.lg.jp/senkyo/polling-place.html",
  "summary": "市長選挙の当日投票所、投票区、対象区域を確認できる公式ページ。",
  "is_official": true,
  "display_order": 40,
  "verification": {
    "source_url": "https://www.example.lg.jp/senkyo/polling-place.html",
    "source_type": "official",
    "confirmed_at": "2026-04-27T00:00:00+09:00",
    "last_checked_at": "2026-04-27T00:00:00+09:00",
    "status": "verified",
    "note": null
  }
}
```

編集時の事故防止:

- 対象 `election_id` のファイルだけを編集する
- 同じURLを複数kindで使う場合も、各レコードの `kind` と `summary` を明確に分ける
- 公式にまだ未公開のものは、推測や報道リンクで埋めない
- 既存レコードを消すときは、そのURLが対象選挙に使えなくなった理由を確認する

### リンク切れ防止の必須確認

`validate-data-v1.mjs` はURL形式だけを検証する。HTTPステータス、404本文、対象選挙名の有無は検証しない。そのため、公式リンクを追加・差し替えする前に、登録予定URLそのものを直接取得して確認する。

必須確認:

- 自治体の一覧ページ、選挙トップ、または対象ページ内のリンクから実際の `href` を取得する
- 検索結果やブラウザ表示からURLを推測して手入力しない
- 登録予定URLを直接取得し、本文が404ページではないことを確認する
- `title` または本文に、対象選挙名、対象項目、自治体名の該当情報があることを確認する
- `verification.status: "verified"` にするのは、この直接確認が終わってからにする

確認コマンド例:

```bash
curl -L -s -o /tmp/resource-check.html 'https://www.example.lg.jp/senkyo/example.html'
rg -n 'ページは見つかりません|見つかりませんでした|404|Not Found|蓮田市長選挙|期日前投票|投票所' /tmp/resource-check.html
```

一覧ページから実 `href` を確認する例:

```bash
curl -L -s 'https://www.example.lg.jp/kurashi/senkyo/index.html' | rg -n '市長選挙|href='
```

禁止:

- URLのローマ字、ハイフン、重複文字を推測して登録する
- Web検索スニペットだけで `verified` にする
- `web.open` や検索キャッシュで本文が見えたことだけを根拠に、ローカル取得で404確認をせず登録する
- 404ページの中にサイト共通ナビの対象リンク名が残っているだけで、有効リンクとみなす
- 広報ページ内に対象情報があることだけで探索を止める

失敗事例: 蓮田市長選挙

- 起きたこと: 広報はすだ2026年4月号の一部に蓮田市長選挙情報が載っていたため、選挙カテゴリトップの確認前に広報ページを右欄リンクとして採用した。
- 見落としたこと: 蓮田市の選挙カテゴリトップには、対象選挙専用ページ「蓮田市長選挙のお知らせ」への実リンク `/senkyo/r8sityousensennkyokijitu.html` が存在していた。
- 追加で起きたこと: 専用ページらしきURLを推測して `/senkyo/r8sityousen-senkyokijitu.html` と登録したため、404ページへのリンクを `verified` として載せた。
- 対策: 広報ページは専用ページがない場合の代替に限定する。対象自治体の選挙カテゴリトップから実 `href` を取得し、そのURLを直接 `curl -L` で取得して、404本文でないことと対象選挙名があることを確認してから登録する。

### 専用ページがない場合のリンク指定

市区町村サイトに選挙専用ページがなく、広報まとめページやお知らせ一覧ページの途中にだけ対象情報がある場合は、可能な限りテキストフラグメント付きURLを使う。

目的:

- 右欄リンクをクリックした読者が、ページ先頭の一般広報や別記事を見て迷わないようにする
- 同じ公式ページを複数 `kind` で使う場合でも、それぞれ該当箇所へ直接移動させる

指定ルール:

- `url` には `https://example.jp/page.html#:~:text=...` を入れる
- `verification.source_url` にはフラグメントなしの公式ページURLを入れる
- `verification.note` に、どの見出し・語句へ移動させるためのフラグメントかを書く
- `text=` には、ページ内で実際に表示されている短い見出しや固有の語句を使う
- `text=` の語句は URL エンコードする
- 対応ブラウザでない場合は通常のページ表示になるため、`title` と `summary` でページ内の該当箇所を探せるようにする

例:

```json
{
  "id": "el-mun-11238-mayor-2026-early-voting-01",
  "election_id": "el-mun-11238-mayor-2026",
  "kind": "early_voting",
  "title": "広報はすだ2026年4月号・期日前投票",
  "url": "https://www.city.hasuda.saitama.jp/koho/shise/koho/hasuda/text/202604/0804jhosrs.html#:~:text=%E6%9C%9F%E6%97%A5%E5%89%8D%E6%8A%95%E7%A5%A8",
  "summary": "蓮田市長選挙の期日前投票期間、時間、投票場所を確認できる蓮田市公式の広報テキスト版。",
  "is_official": true,
  "display_order": 30,
  "verification": {
    "source_url": "https://www.city.hasuda.saitama.jp/koho/shise/koho/hasuda/text/202604/0804jhosrs.html",
    "source_type": "official",
    "confirmed_at": "2026-04-27T00:00:00+09:00",
    "last_checked_at": "2026-04-27T00:00:00+09:00",
    "status": "verified",
    "note": "表示URLには、期日前投票の見出しへ移動するテキストフラグメントを付与。"
  }
}
```

## 10. 再生成と検証

データを修正したら必ず実行する。

```bash
node scripts/current/validate-data-v1.mjs
node scripts/generate-site-data.mjs
node scripts/current/validate-data-v1.mjs
```

生成後に、5種類の不足を再確認する。

```bash
node -e 'global.window={}; require("./site/data/site-data.js"); const required=["candidate_list","bulletin","early_voting","polling_place","other"]; const rows=window.ELECTION_SITE_DATA.elections.filter(e=>e.subtype==="mayor"&&e.voteDate>="2026-05-01"&&e.voteDate<="2026-05-31").sort((a,b)=>a.voteDate.localeCompare(b.voteDate)||a.name.localeCompare(b.name,"ja")); for (const e of rows){ const kinds=new Set((e.resources||[]).map(r=>r.kind)); const missing=required.filter(k=>!kinds.has(k)); console.log([missing.length?"missing":"complete",e.id,e.name,"links="+(e.resources||[]).length,"missing="+missing.join(",")].join("\t")); }'
```

## 11. 画面右欄で確認する

データ確認だけでなく画面確認をする場合は、トップページで対象の選挙カードを選び、右欄の `公式リンク` に5種類が表示されるか確認する。

ブラウザの開発者コンソールで、選択中の右欄リンクを確認する例:

```js
[...document.querySelectorAll(".detail-panel .resources .resource-link")]
  .map((link) => [...link.classList].find((name) => ["candidate_list", "bulletin", "early_voting", "polling_place", "other"].includes(name)))
```

カード選択前に、対象カードが存在するか確認する例:

```js
document.querySelector('[data-election-id="el-mun-11216-mayor-2026"]')
```

画面確認で見ること:

- 右欄に `公式リンク` 見出しがある
- `.resource-link.candidate_list` がある
- `.resource-link.bulletin` がある
- `.resource-link.early_voting` がある
- `.resource-link.polling_place` がある
- `.resource-link.other` がある
- それぞれのリンクが公式URLを開く
- リンク名と説明文が読者に意味のある表現になっている

## 12. 報告形式

最終報告では、少なくとも次を出す。

```text
対象: 2026-05-01 から 2026-05-31 の市長選
市長選件数: 7件

complete:
- ...

not_yet_published:
- 候補者一覧: 告示日前のため未公開
- 選挙公報: 告示日前のため未公開

missing:
- ...

変更ファイル:
- data/v1/election_resource_links/...
- site/data/site-data.js

検証:
- validate-data-v1 passed
- generate-site-data passed
```

分類:

- `complete`: 5種類すべてが公式リンクとして右欄に出る
- `partial`: 一部の公式リンクだけ右欄に出る
- `not_yet_published`: 公式ページで未公開、または告示日前で公開待ち
- `not_found`: 調査時点で公式導線を見つけられない
- `not_applicable`: 無投票などで、そのリンク種別を出す意味が薄い
