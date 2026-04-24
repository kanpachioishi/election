# 東京都 現職市長検証タスク

- pref_code: `13`
- pref_slug: `tokyo`
- created_at: `2026-04-23`
- status: `completed`
- priority: `high`

## Scope

- 対象は `東京都` の市のみ
- 現職市長名、任期開始、任期満了、確認元 URL、確認日を確認する
- 対象市数は `26`

対象市:

- 八王子市
- 立川市
- 武蔵野市
- 三鷹市
- 青梅市
- 府中市
- 昭島市
- 調布市
- 町田市
- 小金井市
- 小平市
- 日野市
- 東村山市
- 国分寺市
- 国立市
- 福生市
- 狛江市
- 東大和市
- 清瀬市
- 東久留米市
- 武蔵村山市
- 多摩市
- 稲城市
- 羽村市
- あきる野市
- 西東京市

## Required Outputs

- `research/current-mayors/findings/13-tokyo/2026-04-23-round1.md`
- `research/current-mayors/findings/13-tokyo/2026-04-23-round1.sources.json`
- `research/current-mayors/findings/13-tokyo/2026-04-23-round1.diff.json`

## Source Priority

1. 東京都選管の任期満了日一覧
2. 各市公式の市長プロフィール、市長室、組織案内
3. 選挙結果、選挙日程、選管資料
4. 自治体公式 PDF

## Checks

- 現職市長名が取れているか
- 任期満了日が一次情報で取れているか
- 任期開始日が一次情報か、補完か
- 情報源ごとに `checked_at` を残しているか
- `conflict` と `missing_source` を分けているか

## Review Notes

- 補完した値は `note` に理由を書く
- `confirmed` にする場合、`sources` は空にしない
- 区は対象外。市のみを扱う
- `府中市` は今回追加したので、既存HTMLとの差分確認対象に含める
