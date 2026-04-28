# 2026年8月市長選 投票所リンク監査

作成日: 2026-04-28
対象: メインページに表示される2026年8月投票の市長選

## 結論

- 対象市長選: 3件
- 投票所リンク登録済み: 2件
- 未登録: 1件

## 今回追加した投票所リンク

| 選挙 | 投票日 | 追加した公式リンク |
| --- | --- | --- |
| 勝浦市長選挙 | 2026-08-02 | https://www.city.katsuura.lg.jp/page/1521.html |
| 小樽市長選挙 | 2026-08-09 | https://www.city.otaru.lg.jp/docs/2020121300221/ |

## 見送り

| 選挙 | 理由 |
| --- | --- |
| 和歌山市長選挙 | 和歌山市長選挙・和歌山市議会議員補欠選挙の公式ページでは投票日、告示日、立候補予定者説明会は確認できるが、当日投票所一覧は未掲載。検索で確認できる当日投票所一覧は第51回衆議院議員総選挙ページ配下の別選挙向けページであり、対象選挙向けリンクとしては登録しない。 |

## 検証

```bash
node scripts/current/validate-data-v1.mjs
node scripts/generate-site-data.mjs
node scripts/current/generate-current-mayors-page.mjs --check
node --check site/data/site-data.js
node --check site/assets/app.js
git diff --check
```

生成後の確認では、2026年8月の市長選3件中2件で `polling_place` が表示対象になった。未登録は和歌山市長選挙。
