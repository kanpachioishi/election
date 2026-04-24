# 福島県 現職市長検証タスク

- pref_code: `07`
- pref_slug: `fukushima`
- created_at: `2026-04-23`
- status: `completed`
- priority: `normal`

## Scope

- 対象は `福島県` の市のみ
- 現職市長名、任期開始、任期満了、確認元 URL、確認日を確認する
- 検証対象の母集団は [municipalities.json](/home/shimo/election/research/current-mayors/findings/07-fukushima/municipalities.json) を基準にする
- 対象市数は `13`

対象市:

- 福島市
- 会津若松市
- 郡山市
- いわき市
- 白河市
- 須賀川市
- 喜多方市
- 相馬市
- 二本松市
- 田村市
- 南相馬市
- 伊達市
- 本宮市

## Required Outputs

- `research/current-mayors/findings/07-fukushima/2026-04-23-round1.md`
- `research/current-mayors/findings/07-fukushima/2026-04-23-round1.sources.json`
- `research/current-mayors/findings/07-fukushima/2026-04-23-round1.diff.json`

## Source Priority

1. 福島県の `市町村長任期一覧`
2. 市選管の選挙結果、今後の選挙予定
3. 市長プロフィール、市長の部屋
4. 自治体公式 PDF

## Notes

- 直近30日以内の任期満了市はなかった
- 行の大半は現職名・任期の再確認で、主要修正は `二本松市` の始期補完と `?????` のソース整理
