# 岩手県 現職市長検証タスク

- pref_code: `03`
- pref_slug: `iwate`
- created_at: `2026-04-23`
- status: `completed`
- priority: `high`

## Scope

- 対象は `岩手県` の市のみ
- 現職市長名、任期開始、任期満了、確認元 URL、確認日を確認する
- 検証対象の母集団は [municipalities.json](/home/shimo/election/research/current-mayors/findings/03-iwate/municipalities.json) を基準にする
- 対象市数は `14`

対象市:

- 盛岡市
- 宮古市
- 大船渡市
- 花巻市
- 北上市
- 久慈市
- 遠野市
- 一関市
- 陸前高田市
- 釜石市
- 二戸市
- 八幡平市
- 奥州市
- 滝沢市

## Required Outputs

- `research/current-mayors/findings/03-iwate/municipalities.json`
- `research/current-mayors/findings/03-iwate/municipalities.md`
- `research/current-mayors/findings/03-iwate/2026-04-23-round1.md`
- `research/current-mayors/findings/03-iwate/2026-04-23-round1.sources.json`
- `research/current-mayors/findings/03-iwate/2026-04-23-round1.diff.json`

## Source Priority

1. 県または市の選管資料、選挙結果、当選人一覧
2. 県や市の任期満了日一覧、選挙日程
3. 市公式の就任告知、市長プロフィール、市長室
4. 県公式の市町村長名簿
5. 自治体公式 PDF

## Checks

- 岩手県の「全市」一覧が県公式情報で固定されているか
- 14市すべてに対して結果があるか
- 現職市長名が取れているか
- 任期満了日が一次情報で取れているか
- 任期開始日が一次情報で取れているか
- `sources.json` に `checked_at` を残しているか
- `conflict` と `missing_source` を分けているか
- 任期満了日が調査日以前の市について、選挙実施済みかを確認したか
- 任期満了日が調査日から30日以内の市について、次回市長選の日程を確認したか
- `site/pages/current-mayors.html` は参照のみとし、このタスクでは編集しない

## Review Notes

- 母集団は岩手県公式「県内各市町村のふるさと納税受付窓口」の市一覧で固定した
- 現職名、期数、任期開始、任期満了は岩手県公式「市町村長・副市町村長・議長名簿」で統一確認した
- `2026-04-23` 時点で、任期満了日が同日以前の市はなく、30日以内に任期満了を迎える市もない
- 主要差分は `奥州市` の現職市長名更新、`盛岡市` の任期開始日精緻化、複数市の `term_start` / `term_note` 補完
