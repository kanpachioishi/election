# Notification Worker

Cloudflare Worker + D1 を使った LINE バックエンドの最小実装です。

## 目的

- `POST /line/webhook` で Messaging API の webhook を受ける
- `POST /notifications/api/session` で LIFF の ID token を検証して現在の登録状態を返す
- `POST /notifications/api/subscriptions` で市区町村登録を更新する
- `POST /notifications/api/delivery-status` で通知停止 / 再開を行う
- `GET /push/api/config` で Web Push の公開鍵設定を返す
- `POST /push/api/subscriptions` で Web Push の購読を保存する
- `DELETE /push/api/subscriptions` で Web Push の購読を解除する

## 前提

- Cloudflare Worker を別プロジェクトで作成する
- D1 を 1 つ用意する
- LINE Login channel ID を secret として設定する
- LINE channel secret を secret として設定する

必要な secret:

- `LINE_CHANNEL_SECRET`
- `LINE_LOGIN_CHANNEL_ID`

推奨する vars:

- `ALLOWED_ORIGINS`
- `LINE_REQUIRE_FRIENDSHIP`
- `WEB_PUSH_VAPID_PUBLIC_KEY`

`ALLOWED_ORIGINS` はカンマ区切りです。少なくとも本番 URL、`www`、Pages preview、ローカル確認用 origin を入れます。

## ローカル開発

```powershell
cd .\workers\line-bot
npm install
npx wrangler d1 migrations apply election-line --local
npx wrangler dev
```

## D1 マイグレーション

```powershell
cd .\workers\line-bot
npx wrangler d1 migrations apply election-line --remote
```

## 初期セットアップ例

```powershell
cd .\workers\line-bot
npx wrangler d1 create election-line
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put LINE_LOGIN_CHANNEL_ID
npx wrangler deploy
```

作成した D1 の `database_id` は `wrangler.toml` に反映します。

## Pages / LIFF 側の接続

- `site/notifications/register.html` を Pages で配信する
- `window.NOTIFICATION_REGISTER_CONFIG.liffId` に LIFF ID を入れる
- `window.NOTIFICATION_REGISTER_CONFIG.apiBaseUrl` に Worker の URL を入れる
- LINE Developers の webhook URL は `https://<worker-domain>/line/webhook` にする

本番例:

- Pages: `https://senkyoannai.com/notifications/register.html`
- Worker: `https://election-line-bot.<your-subdomain>.workers.dev`

## エンドポイント

- `GET /health`
- `POST /line/webhook`
- `POST /notifications/api/session`
- `POST /notifications/api/subscriptions`
- `POST /notifications/api/delivery-status`
- `GET /push/api/config`
- `POST /push/api/subscriptions`
- `DELETE /push/api/subscriptions`

## 補足

- webhook は署名検証後、イベントを D1 に保存してから非同期処理します。
- LIFF API は `idToken` を LINE 公式の verify endpoint に送って `sub` を取得します。
- 友だち状態確認を有効にする場合は、LIFF 側から `accessToken` も送って `friendship/v1/status` を確認します。
