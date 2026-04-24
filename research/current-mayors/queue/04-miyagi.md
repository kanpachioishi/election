# 宮城県 現職市長検証タスク

- pref_code: `04`
- pref_slug: `miyagi`
- created_at: `2026-04-23`
- status: `completed`
- priority: `high`

## Scope

- 対象は `宮城県` の市のみ
- 現職市長名、任期開始、任期満了、確認元 URL、確認日を確認する
- 検証対象の母集団は [municipalities.json](/home/shimo/election/research/current-mayors/findings/04-miyagi/municipalities.json) を基準にする
- 対象市数は `14`

対象市:

- 仙台市
- 石巻市
- 塩竈市
- 気仙沼市
- 白石市
- 名取市
- 角田市
- 多賀城市
- 岩沼市
- 登米市
- 栗原市
- 東松島市
- 大崎市
- 富谷市

## Required Outputs

- `research/current-mayors/findings/04-miyagi/2026-04-23-round1.md`
- `research/current-mayors/findings/04-miyagi/2026-04-23-round1.sources.json`
- `research/current-mayors/findings/04-miyagi/2026-04-23-round1.diff.json`

## Source Priority

1. 宮城県の `県内市町村長名簿` `任期満了一覧` `選挙執行予定`
2. 市選管の選挙結果、開票結果、選挙日程
3. 市長プロフィール、市長の部屋
4. 自治体公式 PDF

## Notes

- `大崎市` は `2026-04-19` 執行の市長選結果を優先した
- `気仙沼市` は `2026-04-26` 執行予定の次回市長選日程を `note` に残した
- `仙台市` `白石市` `名取市` `角田市` `多賀城市` `登米市` `栗原市` `東松島市` `富谷市` は、県資料の任期満了日から現任期始期を整理した
