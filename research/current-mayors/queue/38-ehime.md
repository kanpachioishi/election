# 愛媛県 現職市長検証タスク

- pref_code: `38`
- pref_slug: `ehime`
- created_at: `2026-04-23`
- status: `completed`
- priority: `high`

## Scope

- 対象は `愛媛県` の市のみ
- 現職市長名、任期開始、任期満了、確認元 URL、確認日を確認する
- 検証対象の母集団は [municipalities.json](/home/shimo/election/research/current-mayors/findings/38-ehime/municipalities.json) を基準にする
- 対象市数は `11`

対象市:

- 松山市
- 今治市
- 宇和島市
- 八幡浜市
- 新居浜市
- 西条市
- 大洲市
- 伊予市
- 四国中央市
- 西予市
- 東温市

## Required Outputs

- `research/current-mayors/findings/38-ehime/municipalities.json`
- `research/current-mayors/findings/38-ehime/municipalities.md`
- `research/current-mayors/findings/38-ehime/2026-04-23-round1.md`
- `research/current-mayors/findings/38-ehime/2026-04-23-round1.sources.json`
- `research/current-mayors/findings/38-ehime/2026-04-23-round1.diff.json`

## Source Priority

1. 選挙結果、開票速報、当選人一覧
2. 愛媛県選管の任期満了日一覧、年次選挙日程
3. 就任日明示ページ、市長就任あいさつ、市長不在告知
4. 市長プロフィール、市長の部屋

## Checks

- 現職市長名または市長不在の現況が取れているか
- 任期満了日が一次情報で取れているか
- 任期開始日が一次情報か、補完か
- 任期満了日が調査日以前の市は、選挙実施済みか確認しているか
- 任期満了日が調査日から30日以内の市は、次回市長選の日程を確認しているか
- 情報源ごとに `checked_at` を残しているか
- `confirmed` / `needs_review` / `conflict` を分けているか
- 11市すべてに対して結果があるか

## Review Notes

- `大洲市` は `2026-05-19` 任期満了のため、`2026-04-26` の市長選日程を note に残す
- `西条市` は通常の現職確認ではなく、`2026-03-29` 失職後の職務代理と `2026-05-17` 市長選日程を優先確認する
- 補完した値は `note` に理由を書く
- `confirmed` にする場合、`sources` は空にしない
- `site/pages/current-mayors.html` は参照のみとし、このタスクでは編集しない
