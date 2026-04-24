# わたしの選挙 LINE デプロイ手順

最終更新: 2026-04-18 JST
対象: `workers/line-bot`, `site/line/register.html`

> Deprecated: 公開の通知導線は PWA / Web Push に移行済みです。現在の正系は `site/notifications/register.html` と `/notifications/api/*` です。

## 1. この文書の目的

この文書は、LINE の地域通知機能を Cloudflare Worker + D1 + Pages で立ち上げる実行手順を固定する。

この文書で扱うもの:

- Worker 作成
- D1 作成
- migration 適用
- secret / vars 設定
- LINE Developers 側の接続
- 初回疎通確認

## 2. 構成

- 公開サイト本体: Cloudflare Pages
- LINE 登録画面: `https://senkyoannai.com/line/register.html`
- LINE webhook / API: Cloudflare Worker
- 永続化: Cloudflare D1

初期方針:

- Pages は静的サイトのまま維持する
- LINE webhook と LIFF API だけを Worker に分離する
- 地域登録は `site/line/register.html` を LIFF 画面として使う

## 3. 事前に用意するもの

- LINE公式アカウント
- Messaging API を有効化したチャネル
- LIFF ID
- Cloudflare アカウント
- `wrangler` が使えるローカル環境

必要な secret:

- `LINE_CHANNEL_SECRET`
- `LINE_LOGIN_CHANNEL_ID`

推奨 vars:

- `ALLOWED_ORIGINS`
- `LINE_REQUIRE_FRIENDSHIP`

## 4. D1 を作る

```powershell
cd .\workers\line-bot
npx wrangler d1 create election-line
```

作成後に返る `database_id` を `workers/line-bot/wrangler.toml` に反映する。

## 5. migration を適用する

ローカル確認:

```powershell
cd .\workers\line-bot
npx wrangler d1 migrations apply election-line --local
```

本番反映:

```powershell
cd .\workers\line-bot
npx wrangler d1 migrations apply election-line --remote
```

最低限、次のテーブルが作成されていることを確認する。

- `line_user`
- `line_user_region_subscription`
- `line_user_region_subscription_history`
- `line_user_delivery_status_history`
- `line_webhook_event`
- `line_notification_campaign`
- `line_notification_delivery`
- `line_notification_candidate`

## 6. secret を設定する

```powershell
cd .\workers\line-bot
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put LINE_LOGIN_CHANNEL_ID
```

運用ルール:

- secret は repo に置かない
- 再発行時は Cloudflare secret を更新してから Worker を再デプロイする
- LINE 管理権限者と配信運用者の役割は分ける

## 7. vars を設定する

`workers/line-bot/wrangler.toml` の `ALLOWED_ORIGINS` はカンマ区切りで設定する。

少なくとも含める origin:

- `https://senkyoannai.com`
- `https://www.senkyoannai.com`
- `https://election-2s9.pages.dev`
- ローカル確認用 origin

初期値:

- `LINE_REQUIRE_FRIENDSHIP = "true"`

## 8. Worker をデプロイする

```powershell
cd .\workers\line-bot
npx wrangler deploy
```

デプロイ後に確認すること:

- Worker URL が発行されている
- `GET /health` が 200 を返す

## 9. LINE Developers / Official Account Manager を設定する

設定値:

- webhook URL: `https://<worker-domain>/line/webhook`
- LIFF 画面 URL: `https://senkyoannai.com/line/register.html`
- LIFF から叩く API base URL: `https://<worker-domain>`

確認項目:

- Webhook を有効化した
- Webhook の疎通確認が通る
- 必要なら応答メッセージ設定を見直した
- リッチメニューから LIFF を開ける

## 10. Pages 側の接続

`site/line/register.html` の `window.LINE_REGISTER_CONFIG` に次を入れる。

- `liffId`
- `apiBaseUrl`
- `requireFriendship`

初期はハードコードでよいが、最終的にはデプロイフローで安全に差し込める形を検討する。

## 11. 初回疎通チェック

最低限この順で確認する。

1. `https://senkyoannai.com/line/register.html` が開く
2. Worker `/health` が 200 を返す
3. LIFF ログイン後に `/line/api/session` が成功する
4. 市区町村登録の保存ができる
5. 一時停止 / 再開ができる
6. `follow` webhook で `line_user` が作成または再有効化される
7. `unfollow` webhook で `blocked` になる
8. `line_webhook_event` に受信履歴が残る

## 12. 障害時の確認ポイント

- Worker logs に署名検証失敗が出ていないか
- `line_webhook_event` が `retry_wait` や `dead_letter` に偏っていないか
- `ALLOWED_ORIGINS` に現在の origin が入っているか
- LIFF ID と Worker URL の設定先がずれていないか
- D1 migration の未適用がないか

## 13. リリース順

本番へ出す順番は固定する。

1. D1 作成
2. migration 適用
3. secret / vars 設定
4. Worker deploy
5. LINE Developers で webhook URL 設定
6. LIFF と Pages を接続
7. follow / session / subscription を確認

この順番を崩すと、Webhook だけ先につながって DB 保存に失敗する、という事故が起きやすい。
