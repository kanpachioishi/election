# 香川県 現職市長検証タスク

- pref_code: `37`
- pref_slug: `kagawa`
- created_at: `2026-04-23`
- status: `completed`
- priority: `high`

## Scope

- 対象は `香川県` の市のみ
- 現職市長名、任期開始、任期満了、確認元 URL、確認日を確認する
- 検証対象の母集団は [municipalities.json](/home/shimo/election/research/current-mayors/findings/37-kagawa/municipalities.json) を基準にする
- 対象市数は `8`

対象市:

- 高松市
- 丸亀市
- 坂出市
- 善通寺市
- 観音寺市
- さぬき市
- 東かがわ市
- 三豊市

## Required Outputs

- `research/current-mayors/findings/37-kagawa/municipalities.json`
- `research/current-mayors/findings/37-kagawa/municipalities.md`
- `research/current-mayors/findings/37-kagawa/2026-04-23-round1.md`
- `research/current-mayors/findings/37-kagawa/2026-04-23-round1.sources.json`
- `research/current-mayors/findings/37-kagawa/2026-04-23-round1.diff.json`

## Source Priority

1. 選挙結果、開票結果、当選人一覧、選管資料
2. 香川県や各市の任期満了日一覧、選挙日程
3. 就任日を示す市長日程、登庁式、訓示、フォトレポート
4. 各市公式の市長プロフィール、市長室、組織案内
5. 自治体公式 PDF

## Checks

- その県の「全市」一覧が公式情報で固定されているか
- 8市すべてに対して結果があるか
- 現職市長名が取れているか
- 任期満了日が一次情報で取れているか
- 任期開始日が一次情報か、補完か
- 情報源ごとに `checked_at` を残しているか
- `conflict` と `missing_source` を分けているか
- 任期満了日が調査日以前の市について、選挙実施済みかを確認したか
- 任期満了日が調査日から30日以内の市について、次回市長選の日程を確認したか
- 市長プロフィールが古いまま、選挙ページだけ更新されていないか
- 県選管ページだけでなく、市選管ページや選挙管理委員会情報一覧も見たか
- `term_start` を補完する前に、就任訓示、登庁式、フォトレポートを確認したか

## Review Notes

- 補完した値は `note` に理由を書く
- `confirmed` にする場合、`sources` は空にしない
- `善通寺市` は `2026-04-19` 執行の市長選が無投票となっているため、旧任期のまま残さない
- `さぬき市` は `2026-05-11` 任期満了で、`2026-04-26` の次回市長選日程を `note` に残す
- `三豊市` は現行ページに非公式ソースが残っているため、公式選挙ページへ差し替える
- `高松市` を含む再選市は、旧任期満了日の翌日を現任期始期として整理する
