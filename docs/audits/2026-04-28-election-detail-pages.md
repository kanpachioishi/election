# 今後選挙の個別ページ生成

作成日: 2026-04-28
基準日: 2026-04-28
対象: `vote_date >= 2026-04-28` の verified election

## 対応内容

トップページの検索結果や詳細パネルに閉じていた選挙情報を、共有しやすい個別URLとして出せるようにした。

- `scripts/current/generate-election-pages.mjs` を追加した。
- ルートラッパー `scripts/generate-election-pages.mjs` を追加した。
- `site/elections/index.html` に今後選挙の個別ページ一覧を生成した。
- 既存の専用ページを除く今後選挙52件の静的ページを生成した。
- 既存専用ページ2件は上書きせず、一覧には「専用ページ」として含めた。
- トップページのカードと詳細パネルから個別ページへ進めるようにした。

## 生成結果

実行コマンド:

```bash
node scripts/generate-election-pages.mjs --write --as-of 2026-04-28
```

結果:

```text
election_pages target=54 generated=52 custom=2 as_of=2026-04-28
results written=52 checked=0 unchanged=1 pending=0
```

補足:

- `custom=2` は `site/elections/niigata-governor-2026.html` と `site/elections/shiga-governor-2026.html`。
- `site/elections/fujioka-mayor-2026.html` は既存専用ページだが、投票日が基準日より前のため今回の「今後選挙」対象外。
- 9月以降の新規調査は行っていない。既存 verified data から静的ページを生成した。

## 表示内容

各生成ページには以下を表示する。

- 投票日
- 告示日
- 地域
- 確認日
- 確認元の公式ページ
- 自治体または都道府県の公式サイト
- 候補者一覧、選挙公報、期日前投票、投票所、その他の公式リンク
- 掲載基準と確認情報

## 検証

実行済み:

```bash
node --check scripts/current/generate-election-pages.mjs
node --check site/assets/app.js
node scripts/current/validate-data-v1.mjs
node scripts/generate-election-pages.mjs --check --as-of 2026-04-28
git diff --check
```

追加の smoke:

- `site/elections/saijo-mayor-2026.html` にタイトル、確認元リンク、生成マーカーがあることを確認。
- `site/elections/index.html` に生成ページと既存専用ページが両方含まれることを確認。
- トップページJSで検索結果カードの `card-page-link` と詳細パネルの `detail-page-links` が描画されることを確認。

ローカル配信:

- `http://127.0.0.1:4173/elections/index.html`
- `http://127.0.0.1:4173/elections/saijo-mayor-2026.html`

## 残課題

- 都道府県ページは未生成。
- sitemap は未生成。
- 告示後に候補者一覧・選挙公報が追加されたら、`site/data/site-data.js` と個別ページを再生成する必要がある。
