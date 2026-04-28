# 2026年5月・6月選挙 告示後リソース再確認予定

作成日: 2026-04-28
対象: 投票日が 2026-05-01 から 2026-06-30 までの選挙
対象リンク: `candidate_list`, `bulletin`

## 結論

2026-04-28時点では、対象24件すべてが告示前のため `scheduled`。候補者一覧と選挙公報は未登録だが、現時点では欠落ではなく告示後再確認対象として扱う。

次の初回確認は、新潟県知事選挙の告示翌営業日である **2026-05-15**。市長選・市議補選では **2026-05-11** の西条市長選挙が最初の確認日になる。

## 実行コマンド

```bash
node scripts/list-election-resource-followups.mjs --from 2026-05-01 --to 2026-06-30 --as-of 2026-04-28
```

## 集計

- rows: 24
- status:
  - `scheduled`: 24
- priority:
  - `P2`: 24
- 対象リンク:
  - `candidate_list`: 全24件で未登録
  - `bulletin`: 全24件で未登録

## 再確認予定

| priority | status | recheck_date | vote_date | notice_date | election_id | election | type | missing | present | source |
|---|---|---:|---:|---:|---|---|---|---|---|---|
| P2 | scheduled | 2026-05-11 | 2026-05-17 | 2026-05-10 | `el-mun-38206-mayor-2026` | 西条市長選挙 | municipal/mayor | candidate_list, bulletin | early_voting, other, polling_place | [source](https://www.city.saijo.ehime.jp/soshiki/senkan/shityousen-senkyokijitu.html) |
| P2 | scheduled | 2026-05-15 | 2026-05-31 | 2026-05-14 | `el-pref-15-governor-2026` | 新潟県知事選挙 | prefectural/governor | candidate_list, bulletin | early_voting, other, polling_place | [source](https://www.pref.niigata.lg.jp/site/senkyo/r8chijisenkijitsu.html) |
| P2 | scheduled | 2026-05-18 | 2026-05-24 | 2026-05-17 | `el-by-mun-11216-assembly-2026-01` | 羽生市議会議員補欠選挙 | by_election/assembly | candidate_list, bulletin | early_voting, other, polling_place | [source](https://www.city.hanyu.lg.jp/docs/2017022200033/) |
| P2 | scheduled | 2026-05-18 | 2026-05-24 | 2026-05-17 | `el-mun-11216-mayor-2026` | 羽生市長選挙 | municipal/mayor | candidate_list, bulletin | early_voting, other, polling_place | [source](https://www.city.hanyu.lg.jp/docs/2017022200033/) |
| P2 | scheduled | 2026-05-18 | 2026-05-24 | 2026-05-17 | `el-mun-11238-mayor-2026` | 蓮田市長選挙 | municipal/mayor | candidate_list, bulletin | early_voting, other, polling_place | [source](https://www.city.hasuda.saitama.jp/senkyo/r8sityousensennkyokijitu.html) |
| P2 | scheduled | 2026-05-18 | 2026-05-24 | 2026-05-17 | `el-mun-17205-mayor-2026` | 珠洲市長選挙 | municipal/mayor | candidate_list, bulletin | other | [source](https://www.city.suzu.lg.jp/soshiki/1/24822.html) |
| P2 | scheduled | 2026-05-18 | 2026-05-24 | 2026-05-17 | `el-by-mun-23206-assembly-2026-01` | 春日井市議会議員補欠選挙 | by_election/assembly | candidate_list, bulletin | early_voting, other, polling_place | [source](https://www.city.kasugai.lg.jp/shisei/senkan/1012166.html) |
| P2 | scheduled | 2026-05-18 | 2026-05-24 | 2026-05-17 | `el-mun-23206-mayor-2026` | 春日井市長選挙 | municipal/mayor | candidate_list, bulletin | early_voting, other, polling_place | [source](https://www.city.kasugai.lg.jp/shisei/senkan/1012166.html) |
| P2 | scheduled | 2026-05-18 | 2026-05-24 | 2026-05-17 | `el-mun-35206-mayor-2026` | 防府市長選挙 | municipal/mayor | candidate_list, bulletin | early_voting, other, polling_place | [source](https://www.city.hofu.yamaguchi.jp/soshiki/52/shichousen-shikkoubi.html) |
| P2 | scheduled | 2026-05-25 | 2026-05-31 | 2026-05-24 | `el-mun-32207-assembly-2026` | 江津市議会議員一般選挙 | municipal/assembly | candidate_list, bulletin | early_voting, other, polling_place | [source](https://www.city.gotsu.lg.jp/soshiki/27/7363.html) |
| P2 | scheduled | 2026-05-25 | 2026-05-31 | 2026-05-24 | `el-mun-32207-mayor-2026` | 江津市長選挙 | municipal/mayor | candidate_list, bulletin | early_voting, other, polling_place | [source](https://www.city.gotsu.lg.jp/soshiki/27/7363.html) |
| P2 | scheduled | 2026-06-01 | 2026-06-07 | 2026-05-31 | `el-by-mun-04211-assembly-2026-01` | 岩沼市議会議員補欠選挙 | by_election/assembly | candidate_list, bulletin | other | [source](https://www.city.iwanuma.miyagi.jp/kurashi/senkyo/R8_shichoshigiho.html) |
| P2 | scheduled | 2026-06-01 | 2026-06-07 | 2026-05-31 | `el-mun-04211-mayor-2026` | 岩沼市長選挙 | municipal/mayor | candidate_list, bulletin | other, polling_place | [source](https://www.city.iwanuma.miyagi.jp/kurashi/senkyo/R8_shichoshigiho.html) |
| P2 | scheduled | 2026-06-08 | 2026-06-14 | 2026-06-07 | `el-by-mun-34211-assembly-2026-01` | 大竹市議会議員再選挙 | by_election/assembly | candidate_list, bulletin | other | [source](https://www.city.otake.hiroshima.jp/i/soshiki/senkyo/senkyo/5_1/8956.html) |
| P2 | scheduled | 2026-06-08 | 2026-06-14 | 2026-06-07 | `el-mun-18205-mayor-2026` | 大野市長選挙 | municipal/mayor | candidate_list, bulletin | other, polling_place | [source](https://www.pref.fukui.lg.jp/doc/senkan/nittei/senkyo-nittei_d/fil/109.pdf) |
| P2 | scheduled | 2026-06-08 | 2026-06-14 | 2026-06-07 | `el-mun-34211-mayor-2026` | 大竹市長選挙 | municipal/mayor | candidate_list, bulletin | other | [source](https://www.city.otake.hiroshima.jp/soshiki/senkyo/senkyo/5_1/8955.html) |
| P2 | scheduled | 2026-06-08 | 2026-06-14 | 2026-06-07 | `el-mun-42214-assembly-2026` | 南島原市議会議員一般選挙 | municipal/assembly | candidate_list, bulletin | other | [source](https://www.city.minamishimabara.lg.jp/kiji00312469/index.html) |
| P2 | scheduled | 2026-06-08 | 2026-06-14 | 2026-06-07 | `el-mun-42214-mayor-2026` | 南島原市長選挙 | municipal/mayor | candidate_list, bulletin | other, polling_place | [source](https://www.city.minamishimabara.lg.jp/kiji00312469/index.html) |
| P2 | scheduled | 2026-06-15 | 2026-06-21 | 2026-06-14 | `el-by-mun-02205-assembly-2026-01` | 五所川原市議会議員補欠選挙 | by_election/assembly | candidate_list, bulletin | other | [source](https://www.city.goshogawara.lg.jp/kurashi/senkyo/20260621sityousn-osirase.html) |
| P2 | scheduled | 2026-06-15 | 2026-06-21 | 2026-06-14 | `el-mun-02205-mayor-2026` | 五所川原市長選挙 | municipal/mayor | candidate_list, bulletin | other, polling_place | [source](https://www.city.goshogawara.lg.jp/kurashi/senkyo/20260621sityousn-osirase.html) |
| P2 | scheduled | 2026-06-22 | 2026-06-28 | 2026-06-21 | `el-mun-02204-mayor-2026` | 黒石市長選挙 | municipal/mayor | candidate_list, bulletin | other, polling_place | [source](https://www.pref.aomori.lg.jp/soshiki/senkan/files2/R080402_tyou.pdf) |
| P2 | scheduled | 2026-06-22 | 2026-06-28 | 2026-06-21 | `el-mun-13219-mayor-2026` | 狛江市長選挙 | municipal/mayor | candidate_list, bulletin | other, polling_place | [source](https://www.city.komae.tokyo.jp/index.cfm/41%2C141476%2C602%2Chtml) |
| P2 | scheduled | 2026-06-22 | 2026-06-28 | 2026-06-21 | `el-mun-28210-assembly-2026` | 加古川市議会議員選挙 | municipal/assembly | candidate_list, bulletin | other | [source](https://www.city.kakogawa.lg.jp/soshikikarasagasu/senkyokanriiinkaijimukyoku/senkyonikansuruoshirase/48628.html) |
| P2 | scheduled | 2026-06-22 | 2026-06-28 | 2026-06-21 | `el-mun-28210-mayor-2026` | 加古川市長選挙 | municipal/mayor | candidate_list, bulletin | other, polling_place | [source](https://www.city.kakogawa.lg.jp/soshikikarasagasu/senkyokanriiinkaijimukyoku/senkyonikansuruoshirase/48628.html) |

## 次に実行する確認日

| 確認日 | 主な対象 |
|---:|---|
| 2026-05-11 | 西条市長選挙 |
| 2026-05-15 | 新潟県知事選挙 |
| 2026-05-18 | 羽生市長選挙、羽生市議補選、蓮田市長選挙、珠洲市長選挙、春日井市長選挙、春日井市議補選、防府市長選挙 |
| 2026-05-25 | 江津市長選挙、江津市議選 |
| 2026-06-01 | 岩沼市長選挙、岩沼市議補選 |
| 2026-06-08 | 大野市長選挙、大竹市長選挙、大竹市議再選挙、南島原市長選挙、南島原市議選 |
| 2026-06-15 | 五所川原市長選挙、五所川原市議補選 |
| 2026-06-22 | 黒石市長選挙、狛江市長選挙、加古川市長選挙、加古川市議選 |

## 運用メモ

- `candidate_list` は公式の立候補届出状況・候補者一覧・選挙長告示が公開されてから登録する。
- `bulletin` は公式の選挙公報ページまたはPDFが公開されてから登録する。
- 告示後の確認時に公式未掲載なら、データには追加せず、監査記録に「公式未掲載」と残す。
- 再確認フローは [ELECTION_RESOURCE_FOLLOWUP_FLOW.md](/home/shimo/election/docs/runbooks/ELECTION_RESOURCE_FOLLOWUP_FLOW.md) に従う。
