# 2026年メインページ市長選監査

作成日: 2026-04-28
対象: メインページに表示される、2026-04-28以降投票日の2026年市長選
コミット: `346e632 Audit 2026 homepage mayor elections`

## 結論

- 修正前の対象市長選: 40件
- 修正後の対象市長選: 35件
- 公開反映先:
  - https://election-2s9.pages.dev/
  - https://senkyoannai.com/
- 公開後確認:
  - 両ドメインの `data/site-data.js` で対象市長選35件を確認
  - 泉南、貝塚、嘉麻、朝倉は archived 化
  - 交野は `2026-08-30 告示 / 2026-09-06 投票`
  - 新発田は `2026-11-15 告示 / 2026-11-22 投票`
  - 氷見は市長選ではなく市議選として修正

## 修正内容

| 対象 | 修正前 | 修正後 | 公式ソース |
| --- | --- | --- | --- |
| 泉南市長選挙 | `2026-10-11 告示 / 2026-10-25 投票` upcoming | `2026-04-19 告示 / 2026-04-26 投票` archived | 泉南市公式ページ、大阪府PDF |
| 交野市長選挙 | `2026-10-25 告示 / 2026-11-08 投票` | `2026-08-30 告示 / 2026-09-06 投票` | 大阪府PDF |
| 貝塚市長選挙 | `2026-12-06 告示 / 2026-12-20 投票` upcoming | `2026-01-18 告示 / 2026-01-25 投票` archived | 大阪府PDF |
| 嘉麻市長選挙 | `2026-10-25 告示 / 2026-11-01 投票` upcoming | `2026-04-12 告示 / 2026-04-19 投票` archived | 福岡県PDF、嘉麻市公式結果 |
| 朝倉市長選挙 | `2026-12-06 告示 / 2026-12-13 投票` upcoming | `2026-04-12 告示 / 2026-04-19 投票` archived | 福岡県PDF、朝倉市公式結果 |
| 新発田市長選挙 | `2026-10-18 告示 / 2026-10-25 投票` | `2026-11-15 告示 / 2026-11-22 投票` | 新潟県公式ページ |
| 氷見市 | 市長選として `2026-10-18 告示 / 2026-10-25 投票` | 氷見市議会議員選挙として登録 | 富山県公式ページ |

## 追加した同日選挙

- 草加市議会議員選挙
- 栗東市議会議員補欠選挙
- 君津市議会議員補欠選挙
- 八街市議会議員補欠選挙
- 嘉麻市議会議員補欠選挙

## 主な公式ソース

- 大阪府 令和8年府内の選挙: https://www.pref.osaka.lg.jp/documents/15148/r080408funair8.pdf
- 福岡県 令和8年市町村選挙執行一覧: https://www.pref.fukuoka.lg.jp/uploaded/attachment/282718.pdf
- 新潟県 令和8年選挙執行一覧: https://www.pref.niigata.lg.jp/site/senkyo/r8-senkyoichiran.html
- 富山県 選挙日程: https://www.pref.toyama.jp/500/kensei/kenseiunei/senkyo/iinkai/gs_nittei.html
- 埼玉県 県内の市町村選挙の日程: https://www.pref.saitama.lg.jp/e1701/election-schedule.html
- 千葉県 令和8年中に予定される選挙: https://www.pref.chiba.lg.jp/senkan/chiba-senkyo/r08.html
- 滋賀県 今後の選挙執行予定一覧表: https://www.pref.shiga.lg.jp/file/attachment/5601690.pdf
- 泉南市長選挙は4月26日が投票日です: https://www.city.sennan.lg.jp/kakuka/gyousei/senkyokanri/11384.html
- 泉南市長選挙は無投票となりました: https://www.city.sennan.lg.jp/kakuka/gyousei/senkyokanri/12115.html
- 嘉麻市長選挙・嘉麻市議会議員補欠選挙速報: https://www.city.kama.lg.jp/site/senkyo/42627.html
- 朝倉市長選挙 開票速報: https://www.city.asakura.lg.jp/soshiki/40/12961.html

## 実行した検証

```bash
node scripts/current/validate-data-v1.mjs
node scripts/generate-site-data.mjs
node scripts/current/generate-current-mayors-page.mjs --check
node --check site/data/site-data.js
node --check site/assets/app.js
git diff --check
```

公開後は以下を取得して、公開中データの件数と修正対象IDを確認した。

```text
https://election-2s9.pages.dev/data/site-data.js
https://senkyoannai.com/data/site-data.js
```

## 残課題

- 5月以降の告示日到来に合わせて、候補者一覧、選挙公報、期日前投票、投票所の公式リンクを追加する。
- 千葉県の議員便乗補欠選挙は県ページ上で「更新時点の見込み」と注記されているため、告示前に再確認する。
