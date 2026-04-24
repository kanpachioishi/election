# 青森県 現職市長検証タスク

- pref_code: `02`
- pref_slug: `aomori`
- created_at: `2026-04-23`
- status: `pending`
- priority: `high`

## Scope

- 対象は `青森県` の市のみ
- 現職市長名、任期開始、任期満了、確認元 URL、確認日を確認する
- 母集団は、まず県公式の市町村一覧で固定する

対象市数: `10`

対象市:

- 青森市
- 弘前市
- 黒石市
- 五所川原市
- 八戸市
- 十和田市
- 三沢市
- むつ市
- つがる市
- 平川市

## Required Outputs

- `research/current-mayors/findings/02-aomori/2026-04-23-round1.md`
- `research/current-mayors/findings/02-aomori/2026-04-23-round1.sources.json`
- `research/current-mayors/findings/02-aomori/2026-04-23-round1.diff.json`
- `research/current-mayors/findings/02-aomori/2026-04-23-round2.md`
- `research/current-mayors/findings/02-aomori/2026-04-23-round2.sources.json`
- `research/current-mayors/findings/02-aomori/2026-04-23-round2.diff.json`

## Source Priority

1. 選挙結果、開票結果、当選人一覧、選管資料
2. 青森県や各市の任期満了日一覧
3. 就任日を明示する市公式ページ
4. 市公式の市長プロフィール、市長室、組織案内
5. 自治体公式 PDF

## Checks

- 現職市長名が取れているか
- 任期満了日が一次情報で取れているか
- 任期開始日が一次情報か、補完か
- 情報源ごとに `checked_at` を残しているか
- `conflict` と `missing_source` を分けているか

## Review Notes

- 補完した値は `note` に理由を書く
- `confirmed` にする場合、`sources` は空にしない
- 旧台帳で追加済みの市が多いため、差分確認を重視する
- 任期満了日が調査日以前なら、選挙実施済みかを必ず確認する
- 任期満了日が調査日から30日以内なら、次回市長選の日程を `note` に残す

## Recheck Notes

- `2026-04-23` 再点検では、`弘前市` について旧任期満了後の選挙実施確認を追加した
- `弘前市` は `2026-04-12` 執行の市長選結果で `谷川 政人` 氏当選、プロフィールで `2026-04-16` 就任を確認した
- `round2` の追加で根拠は補強されたが、`round1` の結論を変更するデータ差分はなかった
