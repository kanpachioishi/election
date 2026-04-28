# 2026年7月市長選 投票所リンク監査

作成日: 2026-04-28
対象: メインページに表示される2026年7月投票の市長選

## 結論

- 対象市長選: 8件
- 投票所リンク登録済み: 6件
- 未登録: 2件

## 今回追加した投票所リンク

| 選挙 | 投票日 | 追加した公式リンク |
| --- | --- | --- |
| 調布市長選挙 | 2026-07-05 | https://www.city.chofu.lg.jp/110010/p074106.html |
| 下野市長選挙 | 2026-07-12 | https://www.city.shimotsuke.lg.jp/viewer/info.html?id=3406 |
| 東松山市長選挙 | 2026-07-12 | https://www.city.higashimatsuyama.lg.jp/soshiki/60/3036.html |
| 南陽市長選挙 | 2026-07-12 | https://www.city.nanyo.yamagata.jp/touhyouzyo/471 |
| かすみがうら市長選挙 | 2026-07-19 | https://www.city.kasumigaura.lg.jp/page/page000675.html |
| 尾花沢市長選挙 | 2026-07-26 | https://www.city.obanazawa.yamagata.jp/shisei/senkyo/1002 |

## 見送り

| 選挙 | 理由 |
| --- | --- |
| 鴻巣市長選挙 | 鴻巣市長選挙の公式ページでは選挙期日、告示日、投票時間、開票日時は確認できるが、投票所一覧は未掲載。過去・別選挙ページの投票所案内は対象選挙向けリンクとして登録しない。 |
| あきる野市長選挙 | あきる野市長選挙・市議会議員選挙の公式ページでは選挙期日、告示日、開票日は確認できるが、当日投票所一覧は未掲載。投票方法ページは期日前投票等の一般説明であり、当日投票所一覧としては登録しない。 |

## 検証

```bash
node scripts/current/validate-data-v1.mjs
node scripts/generate-site-data.mjs
node scripts/current/generate-current-mayors-page.mjs --check
node --check site/data/site-data.js
node --check site/assets/app.js
git diff --check
```

生成後の確認では、2026年7月の市長選8件中6件で `polling_place` が表示対象になった。未登録は鴻巣市長選挙とあきる野市長選挙。
