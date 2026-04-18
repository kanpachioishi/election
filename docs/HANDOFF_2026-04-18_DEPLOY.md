# Handoff Memo: 2026-04-18 Deploy / Public Launch

最終更新: 2026-04-18 JST  
目的: 新しいセッションで、公開済み状態と今後の運用をすぐ再開できるようにする

## 1. 現況

workspace:
- [C:/Users/shimo/Desktop/election](C:/Users/shimo/Desktop/election)

公開状態:
- 本番 URL: [https://senkyoannai.com](https://senkyoannai.com)
- `www`: [https://www.senkyoannai.com](https://www.senkyoannai.com)
- Pages preview: [https://election-2s9.pages.dev](https://election-2s9.pages.dev)

GitHub:
- repo: [https://github.com/kanpachioishi/election](https://github.com/kanpachioishi/election)
- branch: `main`

Cloudflare:
- Pages project: `election`
- custom domains:
  - `senkyoannai.com` Active
  - `www.senkyoannai.com` Active

## 2. 今回完了したこと

### 2.1 GitHub 公開基盤

- `election` はローカル Git repo として初期化済み
- `.gitignore` を追加済み
  - `.edge-headless/`
  - `artifacts/`
- 初回コミット作成済み
- `origin` を `https://github.com/kanpachioishi/election.git` に接続済み
- `main` を GitHub へ push 済み

### 2.2 Cloudflare Pages 公開

Pages 設定:
- Production branch: `main`
- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `site`
- Root directory: 空欄

重要:
- この project は `site/` をそのまま配信している
- `site/data/site-data.js` は push 前に必ず再生成する

### 2.3 独自ドメイン

- `senkyoannai.com` を Cloudflare Registrar で取得
- `senkyoannai.com` を Pages に接続
- `www.senkyoannai.com` も接続
- 両方とも `Active`

### 2.4 正本 URL の統一

正本 URL:
- `https://senkyoannai.com`

`www` 側は Cloudflare の `Page Rules` で 301 redirect:

- URL pattern: `www.senkyoannai.com/*`
- Setting: `Forwarding URL`
- Status code: `301 - Permanent Redirect`
- Destination URL: `https://senkyoannai.com/$1`

意味:
- `www` 付きで来たアクセスも path を保ったまま apex に寄る

## 3. 今回ハマった点

- `Workers & Pages` から `Create application` を押すと、Workers 作成画面へ入る UI だった
- `wrangler deploy` が見える画面は Workers なので進めない
- Pages 側へ入るには、下部の `Looking to deploy Pages? Get started` を使う必要があった
- この Cloudflare UI では `Redirect Rules` が見えず、`www -> apex` は `Page Rules` で対応した

## 4. 重要ファイル

公開手順のメモ:
- [docs/DEPLOY.md](C:/Users/shimo/Desktop/election/docs/DEPLOY.md)

生成コマンド:
- [scripts/validate-data-v1.mjs](C:/Users/shimo/Desktop/election/scripts/validate-data-v1.mjs)
- [scripts/generate-site-data.mjs](C:/Users/shimo/Desktop/election/scripts/generate-site-data.mjs)

配信対象:
- [site/index.html](C:/Users/shimo/Desktop/election/site/index.html)
- [site/data/site-data.js](C:/Users/shimo/Desktop/election/site/data/site-data.js)

## 5. いま未反映のローカル変更

`docs/DEPLOY.md` は commit / push 済み。  
この handoff メモも commit / push されていれば、deploy 関連で未反映のローカル変更はない想定。

もし次回このファイルが未追跡で残っていたら、

- [docs/HANDOFF_2026-04-18_DEPLOY.md](C:/Users/shimo/Desktop/election/docs/HANDOFF_2026-04-18_DEPLOY.md)

を add / commit / push すれば引き継ぎ状態は揃う。

## 6. 日常運用ルール

更新時の流れ:

1. `data/v1` や `site/assets` を更新
2. `node .\scripts\validate-data-v1.mjs`
3. `node .\scripts\generate-site-data.mjs`
4. git commit
5. `git push`
6. Cloudflare Pages の自動デプロイを待つ

公開品質の中心は GUI 操作よりデータ整合性。  
このサイトは静的サイトなので、まず

- source データ
- 生成物
- URL

が一致しているかを重視する。

## 7. 次にやる候補

1. 本番 URL と Pages preview を軽く目視確認する  
2. 必要なら `robots.txt`、favicon、OGP、Analytics を整える  
3. 次のデータ更新作業へ戻る

## 8. 次回そのまま使える依頼文

`docs/HANDOFF_2026-04-18_DEPLOY.md を読んで現況を把握して。公開状態と docs/DEPLOY.md の反映状況を踏まえて、次の作業に進んで。`
