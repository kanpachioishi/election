# 高知県 現職市長検証タスク

- pref_code: `39`
- pref_slug: `kochi`
- created_at: `2026-04-23`
- status: `completed`
- priority: `high`

## Scope

- 対象は `高知県` の市のみ
- 現職市長名、任期開始、任期満了、確認元 URL、確認日を確認する
- 検証対象の母集団は [municipalities.json](/home/shimo/election/research/current-mayors/findings/39-kochi/municipalities.json) を基準にする
- 対象市数は `11`

対象市:

- 高知市
- 室戸市
- 安芸市
- 南国市
- 土佐市
- 須崎市
- 宿毛市
- 土佐清水市
- 四万十市
- 香南市
- 香美市

## Required Outputs

- `research/current-mayors/findings/39-kochi/2026-04-23-round1.md`
- `research/current-mayors/findings/39-kochi/2026-04-23-round1.sources.json`
- `research/current-mayors/findings/39-kochi/2026-04-23-round1.diff.json`

## Source Priority

1. 選挙結果、開票結果、当選人一覧、選管資料
2. 県や市の任期満了日一覧、選挙日程
3. 就任日を示す市長日程、登庁式、訓示、フォトレポート
4. 市公式の市長プロフィール、組織案内、市長室
5. 自治体公式 PDF

## Checks

- 高知県の「全市」一覧が県公式情報で固定されているか
- 現職市長名が取れているか
- 任期満了日が一次情報で取れているか
- 任期開始日が一次情報か、補完か
- 情報源ごとに `checked_at` を残しているか
- `conflict` と `missing_source` を分けているか
- 任期満了日が調査日以前の市について、選挙実施済みかを確認したか
- 任期満了日が調査日から30日以内の市について、次回市長選の日程を確認したか
- 11市すべてに対して結果があるか

## Review Notes

- 補完した値は `note` に理由を書く
- `confirmed` にする場合、`sources` は空にしない
- 直近改選の `土佐清水市` `香南市` `香美市` は、プロフィールより選挙結果と選挙日程を優先する
- `南国市` と `安芸市` は `令和7年` の県選管資料で改選を確認したうえで、市公式ページの現職名と突き合わせる
- `site/pages/current-mayors.html` は参照のみとし、このタスクでは編集しない
