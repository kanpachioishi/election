# 公開品質・信頼性クリーンアップ

作成日: 2026-04-28

## 対応範囲

`2026-04-28-site-completeness-review.md` で P0 とした公開品質上の問題のうち、外部調査を大きく増やさずに直せるものを先に処理した。

## 対応内容

### 現職市長台帳の不正リンク修正

- `site/pages/current-mayors.html` に残っていた `href="市長プロフィール"` を解消した。
- 元データの千葉市長レコードを、千葉市公式の市長プロフィールURLへ差し替えた。
- 更新対象:
  - `data/v1/current_mayors/canonical.json`
  - `data/v1/current_mayors/by_prefecture/12-chiba.json`
  - `research/current-mayors/findings/12-chiba/2026-04-23-round1.sources.json`
  - `site/pages/current-mayors.html`
- 再発防止として、`scripts/current/validate-data-v1.mjs` に現職市長台帳の source URL / display source URL 検証を追加した。

### スケジュールページの現行データ参照化

- `site/pages/schedule.html` の参照データを legacy `data/elections.js` から `site/data/site-data.js` へ変更した。
- 投票日が今日以降の選挙だけを表示するようにした。
- 補欠・再選挙フィルターを追加した。
- 各選挙に確認元リンクを表示するようにした。
- フッターの `href="#"` と古い説明文を、現行サイトの方針に合わせて修正した。

### 投票率ページの透明性改善

- `site/pages/turnout.html` に出典・確認状況の注記を追加した。
- 投票率データはまだ `site/data/elections.js` の暫定データであり、canonical data 移行前の参考表示であることを明記した。
- 総務省の選挙関連資料・年代別投票状況へのリンクを追加した。
- フッターの `href="#"` と古い説明文を修正した。

### ロゴレビューHTMLの公開対象外化

- `site/pages/logo-mark-review.html`
- `site/pages/logo-mark-soft-review.html`

上記2件を `docs/audits/logo-review-pages/` へ移動し、公開サイト配下から外した。画像参照は `site/icons/` を指すように調整した。

## 検証

実行済み:

```bash
node scripts/current/validate-data-v1.mjs
node scripts/current/generate-current-mayors-page.mjs --check
node --check site/assets/app.js
node - <<'NODE'
const fs = require('fs');
for (const file of ['site/pages/schedule.html', 'site/pages/turnout.html']) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)) {
    new Function(match[1]);
  }
  console.log(`${file}: inline scripts parse`);
}
NODE
node - <<'NODE'
const fs = require('fs');
const vm = require('vm');
const dataCode = fs.readFileSync('site/data/site-data.js', 'utf8');
const dataContext = { window: {} };
vm.createContext(dataContext);
vm.runInContext(dataCode, dataContext);
const html = fs.readFileSync('site/pages/schedule.html', 'utf8');
const inline = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)][0][1];
const elements = {
  scheduleList: { innerHTML: '' },
  filterBar: { addEventListener() {}, querySelectorAll() { return []; } },
  dataNote: { innerHTML: '' },
};
const context = {
  window: { ELECTION_SITE_DATA: dataContext.window.ELECTION_SITE_DATA },
  document: { getElementById(id) { return elements[id]; } },
  Date,
  Intl,
  URL,
  Math,
  String,
  Object,
};
vm.createContext(context);
vm.runInContext(inline, context);
if (!elements.scheduleList.innerHTML.includes('schedule-item')) {
  throw new Error('schedule did not render any items');
}
if (!elements.dataNote.innerHTML.includes('データ基準')) {
  throw new Error('schedule data note was not rendered');
}
console.log('schedule render smoke passed');
NODE
git diff --check
```

確認結果:

- `data/v1 validation passed`
- `current_mayors=792`
- schedule / turnout の inline script は構文確認済み
- schedule のレンダリング smoke は通過
- `site/pages` 内の `href="#"`、`href="市長プロフィール"`、公開ロゴレビューHTML名は検出されない

## 残課題

- 投票率データ自体はまだ canonical 化していない。
- 7桁郵便番号から自治体を確定する入口は未実装。
- 地域ページ・個別選挙ページの生成は未着手。
