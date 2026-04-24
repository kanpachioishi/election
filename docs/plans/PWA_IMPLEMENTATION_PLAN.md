# わたしの選挙 PWA実装計画

最終更新: 2026-04-18
ステータス: Draft v1 / PWA + Web Push 検討メモ
前提: [PRD](/home/shimo/election/docs/specs/PRD.md), [画面一覧](/home/shimo/election/docs/specs/SCREEN_LIST.md), [Deploy](/home/shimo/election/docs/runbooks/DEPLOY.md)

## 1. この文書の目的

この文書は、`わたしの選挙` を `PWA + Web Push` に進めるときの実装順を固定する。

この文書で決めること:

- PWA化をどの順番で進めるか
- ユーザー体験をどの順番で出すか
- Web Push をどこまでを MVP にするか
- 既存 Pages / Worker 構成をどう活かすか

## 2. 結論

PWA化は、次の順で進める。

1. まず `PWA土台` を入れる
2. 次に `地域登録導線` を PWA 前提に整える
3. そのあと `ホーム画面追加導線` を出す
4. 最後に `通知許可 + Web Push購読` を入れる

重要なのは、`通知を先に聞かない` こと。

このプロダクトでは、

- まず自分の地域を見つける
- 次に登録する
- その後で通知を受ける

という順が自然である。

## 3. ユーザー体験の進め方

### 3.1 初回体験

最初の訪問では、インストールや通知許可を前面に出さない。

最初にやること:

- トップで自分の地域や選挙を探す
- 一度 `このサイトは役に立つ` を感じてもらう

### 3.2 地域登録を先に通す

最初の強いCTAは `地域を登録する` に置く。

登録内容:

- 都道府県
- 市区町村

登録完了後に見せること:

- 登録地域
- 受け取る通知例
- 登録していない地域には通知しないこと

### 3.3 ホーム画面追加

通知許可より前に、PWAとして使う導線を作る。

iPhone:

1. Safari で開く
2. 共有メニュー
3. `ホーム画面に追加`
4. 追加後はホーム画面アイコンから再訪

Android:

- install prompt または `ホーム画面に追加` を案内する

### 3.4 通知許可

通知許可は、地域登録とホーム画面追加のあとに出す。

許可前に説明すること:

- 登録地域の選挙だけ通知する
- 全国ニュースは送らない
- いつでも止められる

### 3.5 初回完了後の設定画面

1画面で次を確認できる状態にする。

- 登録地域
- 通知ON / OFF
- 通知内容の例
- 変更導線

## 4. 技術実装の進め方

## 4.1 Step 1: PWA土台

まずは installable にする。

追加するもの:

- `site/manifest.webmanifest`
- `site/sw.js`
- `site/offline.html`
- `site/icons/`
- `site/assets/pwa.js`

反映対象:

- `site/index.html`
- `site/notifications/register.html`
- `site/pages/*.html`
- `site/elections/*.html`

この段階のゴール:

- ホーム画面追加できる
- アイコンが出る
- standalone で開ける

## 4.2 Step 2: Offline対応

初期は `読み取り専用` に寄せる。

Service Worker 方針:

- HTML navigation: `network-first`, 失敗時は `offline.html`
- CSS / JS / icons: `cache-first`
- `site/data/site-data.js`: `stale-while-revalidate`
- 外部の公式リンク先はキャッシュしない

初期の目的:

- 最後に見たトップや登録画面が開ける
- 一覧の骨組みがオフラインでも壊れない

## 4.3 Step 3: 通知購読保存

Web Push の購読保存は、既存の Worker + D1 に寄せる。

理由:

- すでに `workers/line-bot` が API / D1 の入口を持っている
- Cloudflare Worker + D1 の運用線ができている
- 新しいバックエンドを増やさずに済む

ただし、LINE 用テーブルとは分ける。

追加候補:

- `web_push_subscription`
- `web_push_subscription_region`
- `web_push_delivery_log`

追加 API 候補:

- `POST /push/api/subscriptions`
- `DELETE /push/api/subscriptions`
- `POST /push/api/test-send`

## 4.4 Step 4: 通知送信

最初は手動テスト送信から始める。

順番:

1. 単一購読へ test push
2. 地域一致の購読だけへ送信
3. 手動キャンペーン送信
4. 選挙データから自動候補生成

初期はまだやらない:

- 完全自動送信
- 高度な再送
- 複雑な購読分類

## 5. MVPの切り方

最小MVPは次で十分とする。

- PWAとしてインストール可能
- ホームと登録画面の offline 閲覧
- 地域を選んだブラウザだけ購読保存
- 手動の test push を1件送れる
- 通知の停止 / 再開ができる

MVPではまだやらないこと:

- 全国自動配信
- 通知種別ごとの詳細設定
- iOS / Android で完全同一の install UX
- 通知分析ダッシュボード

## 6. 既存資産の活かし方

流用できるもの:

- `site/` の静的 Pages 構成
- `site/data/site-data.js`
- `site/notifications/register.html`
- `site/assets/notification-register.js` の地域選択UI
- `workers/line-bot` の Worker + D1 基盤

新規で必要なもの:

- manifest
- service worker
- icons
- web push subscription API
- web push 用 D1 migration

## 7. リスク

- iPhone では `Safari + ホーム画面追加` 前提になる
- 通知許可を早く出しすぎると opt-in が落ちる
- 静的HTMLが複数あるため、manifest / SW 登録漏れが起きやすい
- `site-data.js` を強くキャッシュしすぎると古い情報が見える
- LINE 通知と Web Push 通知を同じ保存モデルで混ぜると複雑化しやすい

## 8. 次の実装タスク

最初のスプリントは次に絞る。

1. `manifest.webmanifest` を追加する
2. icons を追加する
3. `sw.js` と `offline.html` を追加する
4. `index.html` と `notifications/register.html` に manifest / SW 登録を入れる
5. `workers/line-bot` に Web Push subscription 用 migration と API を足す
6. 地域登録後にだけ通知案内を出す UI を設計する

## 9. この文書の結論

このプロダクトの PWA 化では、

`通知` を先に押し出すのではなく、

`役に立つ -> 地域登録 -> ホーム画面追加 -> 通知許可`

の順に積むのが最も自然である。

技術的には、既存の `Pages + Worker + D1` をそのまま土台にして、

`manifest -> service worker -> push subscription -> 地域別配信`

の順で広げるのが最も現実的である。
