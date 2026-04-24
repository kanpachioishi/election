# わたしの選挙 LINE実装タスク分解

最終更新: 2026-04-18
ステータス: Draft v1 / 実装前の着手順を固定
前提: [LINE通知仕様](/home/shimo/election/docs/specs/LINE_NOTIFICATION_SPEC.md), [LINE画面仕様](/home/shimo/election/docs/specs/LINE_SCREEN_SPEC.md), [LINE Official Account Plan](/home/shimo/election/docs/plans/LINE_OFFICIAL_ACCOUNT_PLAN.md), [LINEデプロイ手順](/home/shimo/election/docs/runbooks/LINE_DEPLOY.md)

> Deprecated: 現在の公開通知導線は LINE ではなく PWA / Web Push です。この文書は旧構想の記録として保持しています。

## 1. この文書の目的

この文書は、LINE通知機能を安全に実装するための着手順を固定する。

この文書で決めること:

- 何から着手するか
- どのタスクが何に依存するか
- どの状態になれば次へ進めるか

## 2. タスク分解の原則

- 配信より先に誤配信防止を作る
- UI より先に Webhook と保存基盤を作る
- `broadcast` を前提にしない
- 初期は `自動候補生成 + 人手承認 + 送信` を守る
- `1ユーザー1市区町村登録` を崩さない
- 運用ログが追えない状態で送信しない

## 3. LINE実装の着手順

LINE通知MVPは次の順で進める。

1. チャネルと秘密情報の基盤を作る
2. Webhook の安全受信を作る
3. ユーザーと地域登録の保存基盤を作る
4. LIFF 登録導線を通す
5. 配信候補と承認フローを作る
6. 送信ログと結果監査を作る
7. 通知候補自動生成を足す
8. リリース判定を行う

## 4. 優先度の定義

- `P0`: これがないと安全に送れない
- `P1`: MVP 公開時に必要
- `P2`: 初期公開後でもよい改善

## 5. タスク一覧

| ID | 優先度 | タスク | 主な成果物 | 依存 | Done 条件 |
| --- | --- | --- | --- | --- | --- |
| LT01 | P0 | LINE公式アカウントとMessaging APIを有効化する | チャネル、Webhook URL、チャネル情報 | なし | LINE公式アカウントが作成され、Messaging API が有効で、Webhook URL 設定先と LIFF ID の置き場所が決まっている |
| LT02 | P0 | 秘密情報の管理方式を固定する | 環境変数名、secret 配置、再発行手順 | LT01 | channel secret と access token をリポジトリ外で安全に扱え、Cloudflare secret への投入手順が固定されている |
| LT03 | P0 | Webhook受信の署名検証を実装する | Webhook エンドポイント、署名検証、200 応答 | LT01, LT02 | 署名不正を拒否し、正しい Webhook に 200 を返せ、Worker の `/health` でも疎通確認できる |
| LT04 | P0 | Webhook監査ログを実装する | `line_webhook_event` 保存、冪等処理 | LT03 | `webhook_event_id` 単位で重複処理せず、受信履歴が残り、失敗時は `retry_wait` / `dead_letter` に残せる |
| LT05 | P0 | `line_user` を実装する | ユーザー保存、follow/unfollow 更新 | LT03, LT04 | follow で upsert、unfollow で blocked 更新ができる |
| LT06 | P0 | 地域登録テーブルを実装する | `line_user_region_subscription`, history | LT05 | active な地域登録を 1 ユーザー 1 件だけ持てる |
| LT07 | P0 | LIFF 認証とユーザー識別を実装する | LIFF 起動、ログイン状態、line_uid 解決 | LT01, LT02, LT05 | LIFF 画面から対象ユーザーを安全に特定できる |
| LT08 | P0 | LIFF地域登録画面を実装する | `L01`, `L02`, `L03` | LT06, LT07 | 登録、変更、一時停止、再開が UI から通る |
| LT09 | P0 | follow 時の初回導線を実装する | 返信メッセージ、LIFF 導線 | LT05, LT08 | 友だち追加後に登録開始まで迷わず進める |
| LT10 | P0 | 配信対象抽出関数を実装する | prefecture / municipality 別抽出関数、整合制約 | LT05, LT06 | 県向けと市向けで別関数があり、抽出結果を誤用しない |
| LT11 | P0 | campaign と delivery の保存基盤を実装する | `line_notification_campaign`, `line_notification_delivery` | LT10 | 配信単位とユーザー単位の結果を保存できる |
| LT12 | P0 | 送信前プレビューを実装する | recipient preview、地域一致チェック | LT10, LT11 | 対象地域、対象件数、除外件数、送信例を表示できる |
| LT13 | P0 | 承認時スナップショット固定を実装する | locked recipients、snapshot hash | LT11, LT12 | 承認後に送信対象が勝手に変わらない |
| LT14 | P0 | 手動承認フローを実装する | draft/approved/sending/sent 遷移、四眼原則 | LT11, LT12, LT13 | 承認なしで送信できず、本番では作成者と承認者を分ける |
| LT15 | P1 | push / multicast 送信を実装する | 送信処理、失敗記録、skip 処理 | LT11, LT14 | active な対象だけに送れて、失敗と skip が記録される |
| LT16 | P1 | 送信停止と打ち切りを実装する | cancel_requested、未送信打ち切り | LT11, LT15 | 送信途中でも未送信分だけ安全に止められる |
| LT17 | P1 | 配信管理画面を実装する | `L10` | LT11, LT12, LT14, LT15, LT16 | 候補確認、承認、送信、履歴確認が1画面でできる |
| LT18 | P1 | 通知候補生成を実装する | `line_notification_candidate`、日次ジョブ | LT11 | upcoming election から通知候補を作れる |
| LT19 | P1 | 固定テンプレート生成を実装する | notification_type ごとの payload 生成 | LT11, LT18 | campaign 作成時に payload を凍結保存できる |
| LT20 | P1 | 誤配信防止チェックを追加する | scope 一致チェック、0件ブロック、地域一致検証 | LT10, LT12, LT14 | 不整合 campaign を送信前に止められる |
| LT21 | P1 | Webhook回復設計を実装する | retry, dead-letter, 再実行手順 | LT04, LT05 | follow/unfollow 処理失敗から状態を回復できる |
| LT22 | P1 | 運用ログと監査導線を整備する | created_by, approved_by, sent_at の表示 | LT11, LT17 | 誰が作成、承認、送信、停止したか追える |
| LT23 | P2 | 自動再送ポリシーを整備する | 再送条件、再送UIまたは手順 | LT15 | 失敗時の運用ルールが固定されている |

## 6. 実装順のまとまり

### Step 0. チャネルと秘密情報を作る

最初にチャネルと secret 管理を固める。

対応タスク:

- LT01
- LT02

### Step 1. 安全な Webhook 受信を作る

LINE連携の入口を安全にする。

対応タスク:

- LT03
- LT04
- LT05

### Step 2. 地域登録を通す

ユーザーが `自分の地域を登録できる` 状態を先に作る。

対応タスク:

- LT06
- LT07
- LT08
- LT09

### Step 3. 誤配信しない配信基盤を作る

送信より先に、対象抽出と preview と承認を固める。

対応タスク:

- LT10
- LT11
- LT12
- LT13
- LT14
- LT20

### Step 4. 送信と運用画面を作る

ここで初めて実送信を通す。

対応タスク:

- LT15
- LT16
- LT17
- LT21
- LT22

### Step 5. 自動候補生成を足す

最後に運用負荷を下げる。

対応タスク:

- LT18
- LT19
- LT23

## 7. 並列で進められるもの

次は依存を満たせば並列で進めやすい。

- LT06 と LIFF UI のモック作成
- LT11 と LT19
- LT17 と LT22

ただし、次は並列化しないほうが安全。

- LT10 より前に送信処理を作ること
- LT12 より前に本番送信に進むこと
- LT14 より前に本番送信へ進むこと

## 8. 最初の実装スプリント

最初のスプリントは次の 6 タスクに絞る。

1. LT01 LINE公式アカウントとMessaging APIを有効化する
2. LT02 秘密情報の管理方式を固定する
3. LT03 Webhook受信の署名検証を実装する
4. LT04 Webhook監査ログを実装する
5. LT05 `line_user` を実装する
6. LT06 地域登録テーブルを実装する

この 6 つが通ると、安全に `LIFF地域登録画面` に着手してよい状態になる。

## 9. 初期リリースの最低条件

次の条件が揃ったら初期リリース判定に入れる。

- 友だち追加から地域登録まで通る
- 1ユーザー1市区町村登録が守られている
- 県向けと市向けの配信抽出が別関数で実装されている
- 送信前プレビューで件数と地域を確認できる
- 承認なしで送信できない
- 承認時に固定した送信対象からずれない
- `broadcast` を使わずに送信できる
- campaign / delivery / webhook の監査ログが追える

## 10. 今やらないこと

初期は次をタスク化しない。

- 複数地域登録
- 通知種別ごとの細かい購読管理
- 自由入力住所の解釈
- 高度な配信分析ダッシュボード
- 完全自動送信

## 11. 結論

LINE通知MVPの実装では、

`Webhook安全化 -> ユーザー保存 -> 地域登録 -> 配信対象抽出 -> プレビュー -> 承認 -> 送信`

の順で積むのが最も安全である。

この順番を崩すと、

- 登録はできるが監査できない
- 送れるが誤配信を止められない
- 運用できるが根拠を追えない

という状態になりやすい。
