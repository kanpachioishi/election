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
- ローカルの正規ワークスペースは `/home/shimo/election`
- push 前に source データと生成データが整っていること
- 日常運用は `WSL` の bash から行う

## 運用方針

- 基本はローカルで編集し、ローカルで確認し、変更がまとまってからまとめてデプロイする
- 小さな修正でも、原則として `validate` と生成処理を通してから公開反映する

## 公開前チェック

push 前に最低限これを実行する。

```bash
node scripts/validate-data-v1.mjs
node scripts/generate-site-data.mjs
```

今回の Pages 配信は `site/` をそのまま出しているので、`site/data/site-data.js` の再生成忘れに注意する。

## 固定デプロイコマンド

固定 PowerShell スクリプトは legacy 互換として残している。
日常運用はまず bash から validate / generate / git push を行う。

通常の流れ:

```bash
node scripts/validate-data-v1.mjs
node scripts/generate-site-data.mjs
git status --short
git add .
git commit -m "fix: ..."
git push origin main
```

PowerShell ラッパーを使う場合:

- status:
  `pwsh -File ./scripts/deploy-election.ps1 -Mode status`
- deploy:
  `pwsh -File ./scripts/deploy-election.ps1 -Mode deploy -CommitMessage "fix: ..."`

`-Mode deploy` は次を一気に行う。

1. `node scripts/validate-data-v1.mjs`
2. `node scripts/generate-site-data.mjs`
3. `git add .`
4. `git commit -m ...`
5. `git push origin main`

変更がないときは `No deployable changes found.` を返して止まる。

## GitHub リポジトリ作成

GitHub では空の public repository を作る。

- Repository name: `election`
- README: 追加しない
- `.gitignore`: 追加しない
- License: 追加しない

ローカルでは以下を実施した。

```bash
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
2. `node scripts/validate-data-v1.mjs` と `node scripts/generate-site-data.mjs` を実行
3. `git status --short` で差分を確認
4. `git add . && git commit -m "..." && git push origin main`
5. Cloudflare Pages の自動デプロイを待つ

## LINE Worker / D1 追加時

LINE の地域通知は、静的な Pages とは別に Cloudflare Worker + D1 で持つ。

### 構成

- 公開サイト: Cloudflare Pages で `site/` を配信
- LINE 登録画面: `https://senkyoannai.com/line/register.html`
- LINE バックエンド: `workers/line-bot`
- DB: Cloudflare D1

### 1. D1 作成

`workers/line-bot` で作業する。

```bash
cd workers/line-bot
npx wrangler d1 create election-line
```

作成結果の `database_id` を `workers/line-bot/wrangler.toml` の `database_id` に反映する。

### 2. マイグレーション適用

```bash
cd workers/line-bot
npx wrangler d1 migrations apply election-line --remote
```

### 3. secret 設定

最低限これを設定する。

```bash
cd workers/line-bot
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put LINE_LOGIN_CHANNEL_ID
```

### 4. vars 設定

`workers/line-bot/wrangler.toml` の `ALLOWED_ORIGINS` には少なくとも以下を含める。

- `https://senkyoannai.com`
- `https://www.senkyoannai.com`
- `https://election-2s9.pages.dev`
- ローカル確認に使う origin

`LINE_REQUIRE_FRIENDSHIP = "true"` のまま始める。

### 5. Worker デプロイ

```bash
cd workers/line-bot
npx wrangler deploy
```

デプロイ後、Worker URL の `/health` が 200 を返すことを確認する。

### 6. LINE Developers 設定

- webhook URL: `https://<worker-domain>/line/webhook`
- LIFF から使う API base URL: `https://<worker-domain>`
- `site/notifications/register.html` の `window.NOTIFICATION_REGISTER_CONFIG` に `liffId` と `apiBaseUrl` を入れる

### 7. 確認

最低限以下を確認する。

- `https://senkyoannai.com/notifications/register.html` が開く
- Worker `/health` が 200
- LIFF ログイン後に `/notifications/api/session` が返る
- 市区町村登録の保存と一時停止 / 再開ができる
- Messaging API の webhook 検証が通る

## 今回ハマった点

- `Create application` の先で自動的に Workers 作成画面へ入った
- その画面で `wrangler deploy` が出るが、静的サイトなので使わない
- Pages 側へ入るには `Looking to deploy Pages? Get started` を押す必要があった
- `www -> apex` は DNS ではなくリダイレクトルールで統一する
