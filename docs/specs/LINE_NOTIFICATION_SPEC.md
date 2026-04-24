# わたしの選挙 LINE通知仕様

最終更新: 2026-04-18
ステータス: Draft v1 / 実装前提を固定
前提: [LINE Official Account Plan](/home/shimo/election/docs/plans/LINE_OFFICIAL_ACCOUNT_PLAN.md), [LINEデプロイ手順](/home/shimo/election/docs/runbooks/LINE_DEPLOY.md), [データモデル](/home/shimo/election/docs/specs/DATA_MODEL.md), [運用フロー](/home/shimo/election/docs/runbooks/OPERATIONS_FLOW.md), [PRD](/home/shimo/election/docs/specs/PRD.md)

> Deprecated: 現在の公開通知導線は LINE ではなく PWA / Web Push です。この文書は旧構想の記録として保持しています。

## 1. この文書の目的

この文書は、LINE通知機能を実装するための具体仕様を固定する。

この文書で決めること:

- ユーザー登録フロー
- 地域登録の単位
- 配信対象の決め方
- DB テーブル
- Webhook 処理
- 配信承認フロー
- 誤配信防止ルール

この文書で詳しく決めないこと:

- 配信文面の最終コピー
- 運用画面のUIデザイン詳細
- インフラ製品の最終選定

Cloudflare 上の deploy / secret / migration / webhook 接続手順は、[LINEデプロイ手順](/home/shimo/election/docs/runbooks/LINE_DEPLOY.md) を正本にする。

## 2. 今回固定する前提

### 2.1 配信の原則

この機能は `一斉配信` を前提にしない。

固定する原則:

- 各ユーザーは `1つの市区町村` を登録する
- 市区町村を登録すると、その親である `都道府県` も受信対象になる
- `登録していない地域` の通知は送らない
- 初期は `1ユーザー1登録` に固定する

例:

- `姶良市` を登録したユーザーは、`鹿児島県` 向け通知と `姶良市` 向け通知を受け取る
- 同じユーザーに `霧島市` や `宮崎県` の通知は送らない

### 2.2 初期スコープ

初期リリースでは、次を対象にする。

- 都道府県知事選
- 市長選
- 必要に応じて将来追加する首長選

初期リリースでは、次はやらない。

- 複数市区町村登録
- 自由入力住所の自然言語解釈
- 全国全友だち向け配信
- 候補者評価や投票先の推奨

## 3. UX 設計

### 3.1 採用する登録方式

地域登録の主経路は `LIFF の登録ページ` に固定する。

理由:

- 47都道府県と多数の市区町村を、チャット内ボタンだけで選ばせるのは重い
- 既存サイトの地域データや検索UIを流用しやすい
- 登録変更、確認、解除を同じ画面で扱いやすい

チャット側の役割:

- 友だち追加直後に登録導線を出す
- リッチメニューから `登録する` / `変更する` を開く
- 配信停止やヘルプ導線を見せる

LIFF 側で必須にすること:

- LINEログイン状態を確認する
- ID トークンまたは同等の安全な手段で `line_uid` を取得する
- サーバー側でトークン検証を行う
- LIFF で得た `line_uid` と保存先の `line_user` を安全に結びつける
- `line_user` が未作成なら保存前に作成する
- `follow_status = blocked` のユーザーは登録更新を受け付けない

### 3.2 初回登録フロー

1. ユーザーが LINE公式アカウントを友だち追加する
2. `follow` webhook を受信する
3. サーバーは `line_user` を作成または再有効化する
4. 返信メッセージで `地域を登録する` 導線を送る
5. ユーザーが LIFF ページを開く
6. LIFF ログインとサーバー側トークン検証で `line_uid` を確定する
7. LIFF ページで `都道府県 -> 市区町村` を選ぶ
8. サーバーが `line_uid` に対応する `line_user` を特定し、`line_user_region_subscription` を保存する
9. 完了メッセージで `登録地域` を確認させる

### 3.3 登録変更フロー

1. ユーザーがリッチメニューから `登録変更` を開く
2. LIFF ページで現在の登録内容を表示する
3. 新しい市区町村を選ぶ
4. 既存の active subscription を `inactive` にする
5. 新しい active subscription を 1 件挿入する
6. 変更履歴を保存する
7. 変更完了メッセージを送る

### 3.4 配信停止フロー

ユーザーに最低限、次の 2 つを用意する。

- `地域通知を止める`
- `LINE のブロックで完全停止する`

初期は次の状態だけを持つ。

- `active`
- `paused`
- `blocked`

`paused` はアカウントを友だちのまま残しつつ通知を止める状態とする。

状態の意味:

- `active`: 友だち状態かつ通知可
- `paused`: 友だち状態だが通知停止
- `blocked`: LINE 側でブロック済み

停止時に変更するもの:

- `line_user.delivery_status` を `paused` にする

停止時に変更しないもの:

- active subscription
- 登録済みの市区町村
- 履歴データ

### 3.5 リッチメニューの最小構成

初期のリッチメニューは 4 つに固定する。

- `地域を登録`
- `登録を変更`
- `通知を止める`
- `サイトを見る`

## 4. 地域モデルとの接続

### 4.1 既存 Region モデルを正本に使う

LINE通知で独自の地域マスタは作らない。

正本:

- `Region.level = prefecture`
- `Region.level = municipality`

登録時に保存するのは、原則として `region_id` である。

### 4.2 登録値

1ユーザーにつき、次を保存する。

- `pref_region_id`
- `municipality_region_id`

補足:

- `pref_region_id` は `municipality_region_id` の親から導出できる
- ただし、配信抽出と監査を簡単にするため、初期から両方保存する
- ユーザーが最終的に登録する正本は `municipality_region_id` である
- `pref_region_id` は `municipality_region_id` の親と一致しなければならない

### 4.3 整合制約

最低限、次を守る。

- `municipality_region_id` は `Region.level = municipality` のみ許可する
- `pref_region_id` は `Region.level = prefecture` のみ許可する
- `pref_region_id` は `municipality_region_id` の親地域と一致しなければならない
- `target_scope = prefecture` の campaign は `target_region_id` が `prefecture` でなければならない
- `target_scope = municipality` の campaign は `target_region_id` が `municipality` でなければならない

## 5. DB 仕様

## 5.1 line_user

LINE の相手ユーザーを表す。

用途:

- 友だち状態の保持
- 配信可能状態の判定
- 最終操作時刻の保持

推奨カラム:

- `id`
- `line_uid`
  LINE の userId。ユニーク。
- `follow_status`
  `active` / `blocked`
- `delivery_status`
  `active` / `paused`
- `friendship_confirmed_at`
- `blocked_at`
- `delivery_status_changed_at`
- `last_interaction_at`
- `created_at`
- `updated_at`

制約:

- `UNIQUE(line_uid)`

補足:

- 初期は表示名やプロフィール画像URLは保存しない
- 個人情報最小化のため、不要なプロフィール情報は持たない

## 5.2 line_user_region_subscription

現在有効な地域登録を表す。

用途:

- 県向け通知と市向け通知の抽出
- 現在の登録地域の表示

推奨カラム:

- `id`
- `line_user_pk`
- `pref_region_id`
- `municipality_region_id`
- `status`
  `active` / `inactive`
- `registration_source`
  `liff` / `admin`
- `confirmed_at`
- `created_at`
- `updated_at`

制約:

- `line_user_pk` ごとに `status = active` は 1 件だけにする
- active row の `pref_region_id` は `municipality_region_id` の親と一致しなければならない

推奨インデックス:

- `(pref_region_id, status)`
- `(municipality_region_id, status)`

## 5.3 line_user_region_subscription_history

登録変更履歴を残す。

用途:

- 問い合わせ時の監査
- 誤配信調査
- いつ誰が何を登録していたかの確認

推奨カラム:

- `id`
- `line_user_pk`
- `pref_region_id`
- `municipality_region_id`
- `change_type`
  `create` / `update` / `delete`
- `changed_by`
  `user` / `system` / `admin`
- `created_at`

## 5.4 line_user_delivery_status_history

通知停止や再開、ブロックの監査履歴を残す。

推奨カラム:

- `id`
- `line_user_pk`
- `from_status`
- `to_status`
- `change_reason`
  `user_pause` / `user_resume` / `webhook_follow` / `webhook_unfollow` / `admin_change`
- `changed_by`
  `user` / `system` / `admin`
- `created_at`

## 5.5 line_webhook_event

受信した Webhook の監査と冪等処理に使う。

推奨カラム:

- `id`
- `webhook_event_id`
- `event_type`
- `line_uid`
- `payload_json`
- `received_at`
- `processed_at`
- `processing_status`
  `received` / `processed` / `retry_wait` / `failed` / `dead_letter`
- `processing_attempts`
- `next_retry_at`
- `error_message`

制約:

- `UNIQUE(webhook_event_id)`

補足:

- Webhook 処理失敗時は即消さず、再試行対象として保持する
- LINE 側の redelivery と自前の retry を区別して扱う
- dead-letter 化したイベントは手動再実行手順を持つ

## 5.6 line_notification_campaign

1回の配信単位を表す。

用途:

- 下書き、承認、送信済みの状態管理
- どの選挙を、どの地域に、どの種類の通知として送ったかの固定

推奨カラム:

- `id`
- `election_id`
- `notification_type`
  `reminder_30d` / `notice_day` / `early_voting_start` / `day_before` / `election_day` / `resource_published`
- `target_scope`
  `prefecture` / `municipality`
- `target_region_id`
- `message_payload_json`
  実際に送る最終メッセージ
- `status`
  `draft` / `approved` / `sending` / `cancel_requested` / `sent` / `canceled` / `failed`
- `recipient_count_preview`
- `recipient_count_locked`
- `recipient_snapshot_hash`
- `created_by`
- `approved_by`
- `approved_at`
- `locked_at`
- `sent_at`
- `created_at`
- `updated_at`

推奨インデックス:

- `(status, sent_at)`
- `(target_scope, target_region_id, status)`

## 5.7 line_notification_delivery

配信対象ユーザーごとの送達結果を持つ。

用途:

- 誰に送ったかの監査
- 再送や除外の調査
- 誤配信時の影響範囲特定

推奨カラム:

- `id`
- `campaign_id`
- `line_user_pk`
- `delivery_status`
  `queued` / `sending` / `sent` / `failed` / `skipped`
- `skip_reason`
  `paused` / `blocked` / `no_subscription` / `deduplicated` / `invalid_user` / `canceled`
- `provider_request_id`
- `provider_error_code`
- `provider_error_message`
- `created_at`
- `updated_at`

制約:

- `UNIQUE(campaign_id, line_user_pk)`

## 5.8 line_notification_candidate

自動生成された通知候補を持つ。

用途:

- いきなり送信せず、人が確認する
- 運用者が候補からキャンペーンを起こせるようにする

推奨カラム:

- `id`
- `election_id`
- `notification_type`
- `target_scope`
- `target_region_id`
- `scheduled_for`
- `generation_reason`
- `status`
  `pending_review` / `approved` / `dismissed`
- `campaign_id`
- `created_at`
- `updated_at`

## 6. 配信対象の決め方

### 6.1 県向け通知

対象:

- `line_user.follow_status = active`
- `line_user.delivery_status = active`
- `line_user_region_subscription.status = active`
- `line_user_region_subscription.pref_region_id = target_region_id`

使う通知例:

- 知事選
- 県選管が出す県単位の首長選関連通知

### 6.2 市向け通知

対象:

- `line_user.follow_status = active`
- `line_user.delivery_status = active`
- `line_user_region_subscription.status = active`
- `line_user_region_subscription.municipality_region_id = target_region_id`

使う通知例:

- 市長選
- 当該市区町村の公報公開
- 当該市区町村の期日前投票開始

### 6.3 除外条件

以下に該当する場合は送らない。

- ブロック済み
- 一時停止中
- 地域未登録
- active な subscription がない
- 同一 campaign ですでに送達済み

## 7. メッセージ生成ルール

### 7.1 初期は固定テンプレート方式

初期は DB に複雑なテンプレートエンジンを持たない。

方針:

- 通知種別ごとにコード側で固定テンプレートを持つ
- 実送信前に `message_payload_json` を campaign に凍結保存する
- 送信後は文面を変えない

### 7.2 必須差し込み項目

- 選挙名
- 地域名
- 投票日または告示日
- 公式ページ URL
- 必要なら `候補者一覧`, `公報`, `期日前投票`, `投票所` の確認済みURL

### 7.3 文面ポリシー

- 中立
- 短い
- 公式情報への導線優先
- 煽らない
- 政治的評価を入れない

## 8. Webhook 仕様

### 8.1 共通ルール

- 署名検証に通るまで処理しない
- 受信後すぐに 200 を返せる構造にする
- 重い処理は非同期化する
- `webhook_event_id` で冪等処理する

### 8.2 follow

受信時の処理:

- `line_user` を upsert
- `follow_status = active`
- `blocked_at = null`
- `delivery_status` は以前の値を維持する
- 初回導線メッセージを送る

再友だち追加時の扱い:

- 過去の active subscription は自動復元してよい
- ただし、再友だち追加時も LIFF 登録確認導線を再表示する
- 本人が変更したい場合は再確認を促す

### 8.3 unfollow

受信時の処理:

- `line_user.follow_status = blocked`
- `blocked_at` を設定
- active subscription は残してよいが、配信対象からは除外する
- delivery status history に記録する

理由:

- 再友だち追加時に登録復元しやすい
- 削除ではなく停止として扱ったほうが監査しやすい

### 8.4 postback

初期は次の用途だけで使う。

- LIFF 起動導線
- 停止確認
- 再開確認

### 8.5 message

初期は自由入力を主要経路にしない。

やること:

- 定型ヘルプ文を返す
- `地域登録はメニューから` と案内する

やらないこと:

- 自由入力住所の本格解釈
- 自由入力からの自治体推定

## 9. 配信ジョブ仕様

### 9.1 通知候補生成

毎日1回以上、次を実行する。

- `Election.phase = upcoming` の対象を走査
- `notification_type` ごとのトリガー日に一致した候補を生成
- `line_notification_candidate` に保存

### 9.2 人手承認

初期は `自動送信しない`。

承認時に見る項目:

- 選挙名
- 対象地域
- 通知種別
- 文面プレビュー
- 公式リンク
- 配信対象件数

承認時に固定するもの:

- `message_payload_json`
- recipient preview の結果
- `line_notification_delivery` の queued rows
- `recipient_snapshot_hash`
- `recipient_count_locked`

承認後は、送信対象を再計算して差し替えない。

### 9.3 送信実行

送信時の流れ:

1. campaign を `approved` から `sending` に変更
2. 承認時に固定済みの queued deliveries を小さなチャンクで処理する
3. push または multicast を送る
4. 結果を delivery に反映する
5. `cancel_requested` なら未送信の queued rows を `skipped(canceled)` にする
6. 全件完了で campaign を `sent` または `canceled` にする

### 9.4 送信方法

初期方針:

- 基本は `push`
- 同一 payload をまとめやすいときだけ `multicast`
- `broadcast` は使わない

### 9.5 再送

初期は自動再送をしない。

失敗時の扱い:

- 原因をログに残す
- campaign 単位ではなく delivery 単位で再送可否を判断する
- API 冪等キーを使える箇所では使う

### 9.6 送信停止

配信開始後に問題が見つかった場合に備えて、次を持つ。

- `cancel_requested` 状態
- 小チャンク単位の送信
- 未送信 row の打ち切り

ルール:

- 送信中の delivery は取り消せない
- 未送信の queued delivery だけを打ち切る
- 停止後は `campaign`, `delivery`, `operator action` を監査ログに残す

## 10. 運用画面で必ず見えるべき項目

### 10.1 ユーザー一覧

- line_user_id
- follow_status
- delivery_status
- 登録都道府県
- 登録市区町村
- updated_at

### 10.2 配信前プレビュー

- election_id
- election_name
- notification_type
- target_scope
- target_region
- recipient_count_preview
- 文面
- 主要リンク

### 10.3 配信結果

- campaign_id
- sent_count
- failed_count
- skipped_count
- 主なエラー理由

## 11. 誤配信防止ルール

### 11.1 初期固定ルール

- 1 campaign は `1地域 + 1通知種別` に限定する
- `県向け` と `市向け` を同じ campaign に混ぜない
- preview 件数が 0 の場合は送信しない
- preview 時の地域名と election の対象地域が一致しなければ送信しない
- 本番では承認者と作成者を必ず分ける
- 開発環境のみ、同一人物承認を許可してよい

### 11.2 SQL レベルの防波堤

最低限、次を入れる。

- `municipality` campaign で `pref_region_id` 条件だけを使うコードを書かない
- `prefecture` campaign で `municipality_region_id` 条件を使わない
- 送信対象抽出関数を `scope` ごとに分ける

### 11.3 本番前チェック

毎回、次を表示する。

- 対象地域名
- 対象件数
- 送信例 3 件
- 対象外になる代表例

## 12. セキュリティ仕様

### 12.1 秘密情報

- `channel access token`
- `channel secret`
- LIFF や Webhook に関わる秘密情報

これらは:

- 環境変数
- シークレットマネージャ
- デプロイ環境の secret 設定

のいずれかで扱い、リポジトリへ置かない。

### 12.2 権限

- Developers コンソールの Admin は最小人数
- 配信運用者に、必ずしもチャネル秘密情報の閲覧権限を渡さない
- 退職、委託終了、役割変更時は即日見直す
- 配信承認権限と送信実行権限は分離できる構成を優先する

### 12.3 監査ログ

最低限、次を残す。

- 誰が campaign を作ったか
- 誰が承認したか
- いつ送ったか
- どの地域へ送ったか
- 何人へ送ったか
- 誰が停止したか
- どこまで送信済みだったか

### 12.4 個人情報最小化

保存する個人情報は最小限にする。

初期に保存するもの:

- `line_user_id`
- `pref_region_id`
- `municipality_region_id`
- 運用に必要な状態値

初期に保存しないもの:

- 住所全文
- 生年月日
- 性別
- 不要なプロフィール属性

## 13. API と画面の責務分離

### 13.1 LINE Bot サーバー

責務:

- Webhook 受信
- 署名検証
- raw body を検証前に加工しない
- reply / push / multicast 送信
- LIFF 起動導線

### 13.2 アプリ本体

責務:

- Region データ提供
- 選挙データ提供
- LIFF の地域登録画面
- 配信候補生成
- 管理画面

### 13.3 分離方針

初期は同じアプリで運用してもよいが、責務はコード上で分ける。

## 14. 初期実装の順番

1. LINE公式アカウント作成
2. Messaging API 有効化
3. Webhook エンドポイント作成
4. `line_user` と `line_webhook_event` 実装
5. `follow` / `unfollow` 処理実装
6. LIFF 地域登録画面実装
7. `line_user_region_subscription` 実装
8. 手動配信画面実装
9. campaign / delivery ログ実装
10. 通知候補自動生成

## 15. 初期リリース判定

初期リリースしてよい条件:

- 友だち追加から地域登録完了まで通せる
- 登録地域の確認と変更ができる
- 県向け通知と市向け通知を別々に抽出できる
- preview 件数を見てから送れる
- `broadcast` を使わずに運用できる
- 誰に送ったかを campaign / delivery で追える

初期リリースしてはいけない条件:

- 地域未登録者に誤って送る
- 市向け通知が県全体に飛ぶ
- 配信停止ユーザーに送る
- 承認なしで自動送信される

## 16. 固定した意思決定

この仕様では、以下を固定する。

1. 初期は `1ユーザー1市区町村登録`
2. 登録経路の主軸は `LIFF`
3. 都道府県は市区町村の親として同時に保持する
4. 配信は `push` を基本、必要時のみ `multicast`
5. `broadcast` は使わない
6. 初期は `自動候補生成 + 人手承認 + 送信`
7. 配信対象抽出は LINE 側の属性ではなく自前DBを正本にする
8. 監査ログと配信履歴を必須にする

## 17. 次に作るもの

この仕様の次に必要なのは、次の 3 つ。

1. `LIFF地域登録画面` の画面仕様
2. `配信管理画面` の画面仕様
3. `通知テンプレート一覧` の文面仕様

作成済み:

- [LINE画面仕様](/home/shimo/election/docs/specs/LINE_SCREEN_SPEC.md)
- [LINE実装タスク分解](/home/shimo/election/docs/plans/LINE_TASK_BREAKDOWN.md)
