# 群馬県 現職市長検証タスク

- pref_code: `10`
- pref_slug: `gunma`
- created_at: `2026-04-23`
- status: `completed`
- priority: `high`

## Scope

- 対象は `群馬県` の市のみ
- 現職市長名、任期開始、任期満了、確認元 URL、確認日を確認する
- 検証対象の母集団は [municipalities.json](/home/shimo/election/research/current-mayors/findings/10-gunma/municipalities.json) を基準にする
- 対象市数は `12`

対象市:

- 前橋市
- 高崎市
- 桐生市
- 伊勢崎市
- 太田市
- 沼田市
- 館林市
- 渋川市
- 藤岡市
- 富岡市
- 安中市
- みどり市

## Required Outputs

- `research/current-mayors/findings/10-gunma/2026-04-23-round1.md`
- `research/current-mayors/findings/10-gunma/2026-04-23-round1.sources.json`
- `research/current-mayors/findings/10-gunma/2026-04-23-round1.diff.json`

## Source Priority

1. 市公式の市長プロフィール、市長室、組織案内
2. 群馬県や各市の任期満了日一覧
3. 選挙結果、選挙日程、選管資料
4. 自治体公式 PDF

## Checks

- 現職市長名が取れているか
- 任期満了日が一次情報で取れているか
- 任期開始日が一次情報か、補完か
- 情報源ごとに `checked_at` を残しているか
- `conflict` と `missing_source` を分けているか
- 12市すべてに対して結果があるか

## Review Notes

- 補完した値は `note` に理由を書く
- `confirmed` にする場合、`sources` は空にしない
- 藤岡市、沼田市など旧台帳に入っている市は差分理由を明記する
- `regions.json` の登録済み件数を母集団にしない。県公式一覧を優先する
