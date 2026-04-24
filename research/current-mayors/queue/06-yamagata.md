# 山形県 現職市長検証タスク

- pref_code: `06`
- pref_slug: `yamagata`
- created_at: `2026-04-23`
- status: `completed`
- priority: `normal`

## Scope

- 対象は `山形県` の市のみ
- 現職市長名、任期開始、任期満了、確認元 URL、確認日を確認する
- 検証対象の母集団は [municipalities.json](/home/shimo/election/research/current-mayors/findings/06-yamagata/municipalities.json) を基準にする
- 対象市数は `13`

対象市:

- 山形市
- 米沢市
- 鶴岡市
- 酒田市
- 新庄市
- 寒河江市
- 上山市
- 村山市
- 長井市
- 天童市
- 尾花沢市
- 南陽市
- 東根市

## Required Outputs

- `research/current-mayors/findings/06-yamagata/2026-04-23-round1.md`
- `research/current-mayors/findings/06-yamagata/2026-04-23-round1.sources.json`
- `research/current-mayors/findings/06-yamagata/2026-04-23-round1.diff.json`

## Source Priority

1. 山形県の `山形県内の選挙予定・結果について` と市町村一覧
2. 市長プロフィール、市長の部屋
3. 自治体公式 PDF

## Notes

- 直近30日以内の任期満了市はなかった
- `米沢市` `上山市` など、始期が誤って満了日と同値になっていた行を整理した
- `鶴岡市` は `佐藤 聡` 市長就任後の市長ページに合わせて維持した
