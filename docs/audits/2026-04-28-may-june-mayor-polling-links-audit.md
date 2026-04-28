# 2026年5月・6月市長選 投票所リンク監査

作成日: 2026-04-28
対象: メインページに表示される2026年5月・6月投票の市長選

## 結論

- 対象市長選: 15件
- 投票所リンク登録済み: 13件
- 未登録: 2件

## 今回追加した投票所リンク

| 選挙 | 投票日 | 追加した公式リンク |
| --- | --- | --- |
| 岩沼市長選挙 | 2026-06-07 | https://www.city.iwanuma.miyagi.jp/kurashi/senkyo/tohyojo.html |
| 大野市長選挙 | 2026-06-14 | https://www.city.ono.fukui.jp/shisei/senkyo/senkyo-shikumi/touhyousho-kuiki.html |
| 南島原市長選挙 | 2026-06-14 | https://www.city.minamishimabara.lg.jp/kiji00311615/3_11615_78754_up_gl6s78x6.pdf |
| 五所川原市長選挙 | 2026-06-21 | https://www.city.goshogawara.lg.jp/kurashi/senkyo/touhyoujokuiki.html |
| 加古川市長選挙 | 2026-06-28 | https://www.city.kakogawa.lg.jp/soshikikarasagasu/senkyokanriiinkaijimukyoku/tohyojonogoannai/index.html |
| 黒石市長選挙 | 2026-06-28 | https://www.city.kuroishi.aomori.jp/shisei/keikaku/senkyo-tohyoujo_20220126.html |
| 狛江市長選挙 | 2026-06-28 | https://www.city.komae.tokyo.jp/index.cfm/41%2C141021%2C602%2Chtml |

## 見送り

| 選挙 | 理由 |
| --- | --- |
| 珠洲市長選挙 | 珠洲市長選挙の期日ページには投票所情報が未掲載。検索で見つかった投票所表は別選挙ページ内の情報で、対象選挙向けの投票所リンクとしては登録しない。 |
| 大竹市長選挙 | 大竹市長選挙ページには日程のみ掲載。検索で見つかった投票所表は過去の別選挙ページ内の情報で、対象選挙向けの投票所リンクとしては登録しない。 |

## 検証

```bash
node scripts/current/validate-data-v1.mjs
node scripts/generate-site-data.mjs
node scripts/current/generate-current-mayors-page.mjs --check
node --check site/data/site-data.js
node --check site/assets/app.js
git diff --check
```

生成後の確認では、2026年5月・6月の市長選15件中13件で `polling_place` が表示対象になった。
