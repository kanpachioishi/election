# 西条市長選挙 個別ページ試作

作成日: 2026-04-28
対象: `el-mun-38206-mayor-2026` / `site/elections/saijo-mayor-2026.html`

## 目的

生成済み個別ページを、公式リンク集から一段進めて、公式情報を読者の行動順に整理した「投票前チェック」ページとして試作した。

## 対応内容

- `data/v1/election_page_details/el-mun-38206-mayor-2026.json` を追加した。
- `scripts/current/generate-election-pages.mjs` が `election_page_details` を読み、対象選挙だけ投票前チェックを表示するようにした。
- `site/assets/election-page.css` に投票前チェック、詳細項目、告示後再確認カードの表示を追加した。
- 投票日、期日前投票、投票所、開票、候補者一覧、選挙公報などの区分を判別しやすいように、投票前チェック周辺に小さな装飾アイコンを追加した。
- `scripts/current/validate-data-v1.mjs` に `election_page_details` の検証を追加した。

## 表示した情報

- 当日の投票時間
- 期日前投票期間、時間、場所、手続
- 投票所の確認方法、投票所数、第52投票区の注意
- 開票予定
- 選挙管理委員会事務局の問い合わせ先
- 候補者一覧、選挙公報、期日前投票状況の次回確認予定

## 掲載しなかった情報

- 候補者一覧と選挙公報は、2026-04-28時点で当該選挙の公式公開を確認できないため未登録。
- 投票時間繰上げ対象の具体的投票所は、公式ページが対象明細を示していないため未掲載。
- 投票所65件の個別正規化は今回の試作対象外。

## レビュー反映

2エージェントレビューの結果を反映した。

- 公式リンクカードの `summary` に本文情報を詰め込まない。
- 生成HTMLを手編集せず、生成元データから出す。
- 候補者一覧・公報は未公開リンクとして登録しない。
- 期日前投票期間のような導出値は `derived: true` で明示する。

## 検証

実行済み:

```bash
node scripts/current/validate-data-v1.mjs
node --check scripts/current/generate-election-pages.mjs
node scripts/generate-election-pages.mjs --check --as-of 2026-04-28
git diff --check
```

追加 smoke:

- `site/elections/saijo-mayor-2026.html` に `投票前チェック`、期日前投票期間、告示後再確認、候補者一覧、選挙公報、第52投票区の注意が出ることを確認。
