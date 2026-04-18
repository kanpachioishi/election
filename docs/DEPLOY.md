# Deploy

最終更新: 2026-04-18 JST

このドキュメントは、`election` を GitHub と Cloudflare Pages で公開したときの実手順メモです。  
今回の本番構成は以下です。

- GitHub: `https://github.com/kanpachioishi/election`
- Cloudflare Pages project: `election`
- 本番ドメイン: `https://senkyoannai.com`
- 正本 URL: `https://senkyoannai.com`
- `www`: `https://www.senkyoannai.com` から正本へ 301 リダイレクト

## 前提

- Cloudflare でドメインを取得済み、または Cloudflare にオンボード済み
- ローカルの作業ディレクトリは `C:\Users\shimo\Desktop\election`
- push 前に source データと生成データが整っていること

## 公開前チェック

push 前に最低限これを実行する。

```powershell
node .\scripts\validate-data-v1.mjs
node .\scripts\generate-site-data.mjs
```

今回の Pages 配信は `site/` をそのまま出しているので、`site/data/site-data.js` の再生成忘れに注意する。

## GitHub リポジトリ作成

GitHub では空の public repository を作る。

- Repository name: `election`
- README: 追加しない
- `.gitignore`: 追加しない
- License: 追加しない

ローカルでは以下を実施した。

```powershell
git init -b main
git add .
git commit -m "chore: initialize election site repository"
git remote add origin https://github.com/kanpachioishi/election.git
git push -u origin main
```

## `.gitignore`

ローカルの headless browser データや確認用 artifact は GitHub に上げない。

- `.edge-headless/`
- `artifacts/`

## Cloudflare Pages 作成

Cloudflare Dashboard では `Workers & Pages` から開始する。

### 重要

- `Create application` を押したあと、Workers の作成画面に入ることがある
- その場合は下部の `Looking to deploy Pages? Get started` から Pages 側へ入る
- `wrangler deploy` が出ている画面は Workers なので、そのまま進めない

### Pages 設定

GitHub 連携で `kanpachioishi/election` を選ぶ。

設定値は以下。

- Project name: `election`
- Production branch: `main`
- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `site`
- Root directory: 空欄

### 注意

- `Build output directory` を `/` のままにしない
- この repo は `site/` が配信対象

デプロイ後、Cloudflare 側の preview URL は以下になった。

- `https://election-2s9.pages.dev`

## 独自ドメイン接続

Pages の `Custom domains` から追加する。

### apex

- Domain: `senkyoannai.com`
- Cloudflare が `CNAME @ -> election-2s9.pages.dev` を自動追加

### www

- Domain: `www.senkyoannai.com`
- Cloudflare が `CNAME www -> election-2s9.pages.dev` を自動追加

どちらも `Active` になれば DNS 側は完了。

## 正本 URL の統一

正本は `senkyoannai.com` とする。

- 正本: `https://senkyoannai.com`
- `www`: `https://www.senkyoannai.com` から 301 で正本へ寄せる

Cloudflare UI では `Redirect Rules` が見えず、今回のアカウント UI では `Page Rules` を使った。

### Page Rule

- URL pattern: `www.senkyoannai.com/*`
- Setting: `Forwarding URL`
- Status code: `301 - Permanent Redirect`
- Destination URL: `https://senkyoannai.com/$1`

`$1` は `*` に一致した path 部分を引き継ぐために必要。

例:

- `https://www.senkyoannai.com/elections/fujioka-mayor-2026.html`
- `https://senkyoannai.com/elections/fujioka-mayor-2026.html`

## 公開後の確認

最低限この 3 つを確認する。

- `https://senkyoannai.com`
- `https://www.senkyoannai.com`
- `https://election-2s9.pages.dev`

確認ポイント:

- `senkyoannai.com` でサイトが開く
- `www.senkyoannai.com` で開くと `senkyoannai.com` に寄る
- Pages preview でも同じ内容が見える

## 日常運用

更新時は以下の流れ。

1. `data/v1` や `site/assets` を更新
2. `validate-data-v1`
3. `generate-site-data`
4. git commit
5. `main` に push
6. Cloudflare Pages の自動デプロイを待つ

## 今回ハマった点

- `Create application` の先で自動的に Workers 作成画面へ入った
- その画面で `wrangler deploy` が出るが、静的サイトなので使わない
- Pages 側へ入るには `Looking to deploy Pages? Get started` を押す必要があった
- `www -> apex` は DNS ではなくリダイレクトルールで統一する
