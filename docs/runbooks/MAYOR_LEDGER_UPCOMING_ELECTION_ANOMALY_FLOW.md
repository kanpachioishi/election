# 市長台帳 直近選挙アノマリ検出フロー

最終更新: 2026-04-27
ステータス: Draft v1
関連:
- [現職市長情報 更新フロー](/home/shimo/election/docs/runbooks/CURRENT_MAYORS_UPDATE_FLOW.md)
- [月別市長選チェックフロー](/home/shimo/election/docs/runbooks/MAYOR_ELECTION_MONTH_CHECK_FLOW.md)
- [トップページ更新フロー](/home/shimo/election/docs/runbooks/SITE_TOP_PAGE_UPDATE_FLOW.md)
- [現職市長台帳](/home/shimo/election/data/v1/current_mayors/canonical.json)
- [選挙データ](/home/shimo/election/data/v1/elections.json)
- [公式リンクデータ](/home/shimo/election/data/v1/election_resource_links)

## 1. 目的

この文書は、現職市長台帳では任期満了日が先に見えるが、実際には直近で市長選がある市を見つけるための runbook である。

月別チェックは「メインページのX月市長選が正しいか」を見る。こちらは逆方向に、`elections.json` や公式選挙日程から現職市長台帳の任期ズレを検出する。

## 2. 使う場面

次のような指示や状況で使う。

- 台帳に隠れた直近市長選の見落としを探したい
- 任期満了日が先なのに、公式日程では近いうちに市長選がある市を洗いたい
- `elections.json` の upcoming 市長選と現職市長台帳の `term_end` を突き合わせたい
- 市長の辞職、死亡、失職、出直し選挙、無投票当選後の更新漏れを拾いたい

## 3. 基本方針

- `term_end` だけを起点にしない
- `elections.json` の upcoming 市長選を必ず台帳へ逆照合する
- 県選管・市選管の公式選挙日程も起点にする
- 台帳の `term_end` が投票日から不自然に遠いものを anomaly として扱う
- anomaly はすぐに台帳修正せず、まず公式ソースで理由を分類する

## 4. 入力データ

```text
data/v1/current_mayors/canonical.json
  現職市長台帳の正本。

data/v1/elections.json
  サイトが把握している選挙の正本。

data/v1/election_resource_links/*.json
  選挙ごとの公式リンク。

data/v1/regions.json
  region_id と市区町村名の対応。

site/data/site-data.js
  メインページ用の生成済み表示データ。必要に応じて確認する。

都道府県・市区町村の公式選挙日程
  elections.json 未登録の直近市長選を探すために使う。
```

## 5. 全体フロー

1. 検査対象期間を決める
2. `elections.json` から対象期間内の upcoming 市長選を抽出する
3. 抽出した市長選を `current_mayors/canonical.json` に region_id で突き合わせる
4. 投票日と台帳の `term_end` の差を計算する
5. 差が不自然なものを anomaly として分類する
6. 県選管・市選管の公式日程から、`elections.json` 未登録の直近市長選も探す
7. 公式ソースで、台帳誤り、通常の前倒し、辞職等による選挙、選挙データ誤りを判定する
8. 必要に応じて `elections.json`、`election_resource_links`、`current_mayors` を修正する
9. 検証と再生成を行い、検出結果と残課題を報告する

## 6. 検査対象期間

標準は、作業日から180日先までを見る。

用途に応じて変える。

```text
短期点検: 今日から90日先
標準点検: 今日から180日先
年次棚卸し: 今日から365日先
```

期間を報告するときは必ず具体日付で書く。

例:

```text
対象期間: 2026-04-27 から 2026-10-24 まで
```

## 7. elections.json 起点の突合

`elections.json` の upcoming 市長選を台帳へ逆照合する。

```bash
node -e 'const elections=require("./data/v1/elections.json").records; const mayors=require("./data/v1/current_mayors/canonical.json").records; const start=process.argv[1]; const end=process.argv[2]; const mayorByRegion=new Map(mayors.map(r=>[r.region_id,r])); const rows=elections.filter(e=>e.subtype==="mayor"&&e.phase==="upcoming"&&e.vote_date>=start&&e.vote_date<=end).map(e=>{ const m=mayorByRegion.get(e.primary_region_id); const vote=new Date(`${e.vote_date}T00:00:00+09:00`); const term=m?.term_end ? new Date(`${m.term_end}T00:00:00+09:00`) : null; const daysToTerm=term ? Math.round((term-vote)/86400000) : null; return {e,m,daysToTerm}; }).sort((a,b)=>a.e.vote_date.localeCompare(b.e.vote_date)||a.e.name.localeCompare(b.e.name,"ja")); for (const r of rows) console.log([r.e.vote_date,r.e.notice_date,r.e.id,r.e.name,r.e.primary_region_id,r.m?.pref_name||"",r.m?.city_name||"",r.m?.mayor_name||"",r.m?.term_end||"",r.daysToTerm??"",r.e.verification?.source_url||""].join("\t")); console.error("count="+rows.length);' YYYY-MM-DD YYYY-MM-DD
```

確認する列:

- `vote_date`
- `notice_date`
- `election_id`
- `primary_region_id`
- 台帳上の `pref_name`
- 台帳上の `city_name`
- 台帳上の `mayor_name`
- 台帳上の `term_end`
- `daysToTerm`
- 公式確認元

## 8. anomaly 判定基準

市長任期満了による通常選挙なら、投票日はおおむね任期満了日前30日以内に入る。

まず次を anomaly 候補にする。

```text
missing_ledger_record
  elections.json に市長選があるが、台帳に該当 region_id がない。

far_before_term_end
  投票日から任期満了日まで45日超ある。
  例: 投票日 2026-05-24、台帳 term_end 2027-06-30。

term_end_before_vote
  台帳の任期満了日が投票日より前。
  改選済みの反映漏れか、選挙データ側の日付誤りを疑う。

different_city_or_region
  election の primary_region_id と台帳の市名・県名が合わない。

stale_after_recent_result
  直近で市長選結果または無投票当選が出ているのに、台帳が旧任期のまま。

unexpected_special_election
  辞職、死亡、失職、出直し選挙などで通常任期サイクルから外れている。
```

しきい値の標準:

```text
daysToTerm が 0 から 45 まで: 通常範囲
daysToTerm が 46 以上: anomaly 候補
daysToTerm が負数: anomaly 候補
term_end が空: anomaly 候補
```

補足:

- 45日は機械抽出のための余裕値。法定の通常感覚は「任期満了日前30日以内」なので、最終判断は公式ソースで行う
- 繰上投票や離島投票は、選挙期日と別に扱う
- 市長選と市議補選の同時実施は anomaly ではない

## 9. 公式日程起点の探索

`elections.json` にまだない市長選を探すには、県選管・市選管の公式日程を確認する。

優先順:

1. 都道府県選管の市町村長選挙日程一覧
2. 都道府県選管の任期満了日一覧
3. 市区町村選管の選挙予定ページ
4. 市区町村の広報、報道発表、選挙特設ページ

見つけた市長選について、次を確認する。

- `data/v1/elections.json` に登録済みか
- `data/v1/current_mayors/canonical.json` の `term_end` と整合するか
- 市長選か、市議選・補選・知事選ではないか
- 告示日、投票日、任期満了日が明記されているか

`elections.json` 未登録なら `missing_from_elections_json` として扱う。

## 10. 分類と次アクション

```text
confirmed_normal
  投票日と台帳 term_end が通常範囲で整合している。
  修正不要。

ledger_correction_candidate
  公式ソースでは直近市長選があるのに、台帳 term_end が遠すぎる。
  current_mayors の修正候補に回す。

election_data_correction_candidate
  台帳と公式任期は整合しているが、elections.json の投票日や region が誤っている。
  elections.json を修正する。

missing_from_elections_json
  公式日程に市長選があるが、elections.json にない。
  elections.json へ追加する。

special_election_confirmed
  辞職、死亡、失職、出直し選挙など、任期満了によらない直近選挙。
  elections.json に理由を note で残し、台帳側は選挙結果確定後に更新する。

needs_more_source
  公式ソース不足で判断保留。
  調査メモに残す。
```

## 11. 修正先

選挙日程や確認元の誤り:

```text
data/v1/elections.json
data/v1/election_resource_links/{election_id}.json
```

現職市長台帳の任期満了日、現職名、任期開始日の誤り:

```text
data/v1/current_mayors/canonical.json
data/v1/current_mayors/by_prefecture/{pref}.json
```

region_id 不足:

```text
data/v1/regions.json
```

表示反映:

```text
site/data/site-data.js
```

注意:

- `site/data/site-data.js` は直接編集せず、再生成する
- `site/pages/current-mayors.html` も正本ではない
- 台帳修正は選挙結果確定前と確定後で扱いを分ける

## 12. 台帳修正の判断

選挙予定があるだけでは、現職市長名や次期任期を確定しない。

台帳の値を修正する目安:

- 公式任期満了日一覧で現任期の満了日が確認できた
- 公式選挙結果で当選人が確定した
- 無投票当選が公式に公表された
- 市長プロフィールや就任日ページで新任期が確認できた

選挙前にやる修正:

- 明らかに誤った `term_end` の修正
- `note` への「次回市長選は YYYY-MM-DD 投票」追記
- `sources` への公式日程追加

選挙後にやる修正:

- `mayor_name`
- `term_start`
- `term_end`
- `term_note`
- `status`
- `investigated_at`

## 13. 調査メモの保存先

anomaly 検出結果は次に保存する。

```text
research/current-mayors/anomalies/YYYY-MM-DD-upcoming-election-anomalies.md
```

書く内容:

- 調査日
- 対象期間
- 抽出コマンド
- anomaly 候補一覧
- 公式確認結果
- 分類
- 修正したファイル
- 未解決の市

## 14. 再生成と検証

選挙データを修正した場合:

```bash
node scripts/current/validate-data-v1.mjs
node scripts/generate-site-data.mjs
node scripts/current/validate-data-v1.mjs
```

現職市長台帳を修正した場合:

```bash
node scripts/current/generate-current-mayors-data.mjs --write --generated-at YYYY-MM-DDT00:00:00+09:00
node scripts/current/generate-current-mayors-page.mjs --check
node scripts/current/validate-data-v1.mjs
```

必要に応じて、トップページの対象期間内市長選も再確認する。

```bash
node -e 'global.window={}; require("./site/data/site-data.js"); const start=process.argv[1]; const end=process.argv[2]; const rows=window.ELECTION_SITE_DATA.elections.filter(e=>e.subtype==="mayor"&&e.voteDate>=start&&e.voteDate<=end).sort((a,b)=>a.voteDate.localeCompare(b.voteDate)||a.name.localeCompare(b.name,"ja")); console.log("mayor_elections="+rows.length); console.log(rows.map(e=>`${e.voteDate} ${e.name}`).join("\n"));' YYYY-MM-DD YYYY-MM-DD
```

## 15. 最終報告の形式

最終報告では次を明記する。

- 対象期間
- `elections.json` 起点で確認した upcoming 市長選件数
- anomaly 候補件数
- anomaly と判定した市名
- 公式確認元
- 分類
- 修正したファイル
- 修正しなかった理由
- 残課題
- 実行した検証コマンド

例:

```text
対象期間は 2026-04-27 から 2026-10-24 までです。
upcoming 市長選 23件を台帳へ突合し、daysToTerm が46日以上または負数の anomaly 候補を3件検出しました。
うち2件は台帳の任期満了日修正候補、1件は辞職に伴う特別選挙でした。
```
