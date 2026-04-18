# Election Site MVP

`data/v1` の canonical JSON を使う新しい静的フロントです。

## 使い方

画面を開く:

```powershell
Start-Process .\site\index.html
```

PWA / Service Worker を確認するときは、`file://` ではなくローカルHTTPサーバーで開く:

```powershell
py -m http.server 4173 --directory .\site
```

その後、`http://localhost:4173` を開く。

画面用データを再生成:

```powershell
node .\scripts\generate-site-data.mjs
```

検証:

```powershell
node .\scripts\validate-data-v1.mjs
node --check .\site\assets\app.js
```

## 方針

- `site/data/site-data.js` は自動生成ファイルです。
- 元データは `data/v1` を更新し、`scripts/generate-site-data.mjs` を再実行します。
- 郵便番号検索は seed mapping 前提です。全国網羅としては表現しません。
- UI は dark default です。後で light mode を追加する場合は、`site/assets/styles.css` の CSS variables を `:root[data-theme="light"]` で上書きします。
- PWA / Service Worker / installability の確認は `file://` では行わず、必ず HTTP 経由で確認します。
