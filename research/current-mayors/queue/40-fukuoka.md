# 福岡県 現職市長検証タスク

- pref_code: `40`
- pref_slug: `fukuoka`
- created_at: `2026-04-23`
- status: `pending`
- priority: `high`

## Scope

- 対象は `福岡県` の市のみ
- 現職市長名、任期開始、任期満了、確認元 URL、確認日を確認する
- 検証対象の母集団は [municipalities.json](/home/shimo/election/research/current-mayors/findings/40-fukuoka/municipalities.json) を基準にする
- 対象市数は `29`

対象市:

- 北九州市
- 福岡市
- 大牟田市
- 久留米市
- 直方市
- 飯塚市
- 田川市
- 柳川市
- 八女市
- 筑後市
- 大川市
- 行橋市
- 豊前市
- 中間市
- 小郡市
- 筑紫野市
- 春日市
- 大野城市
- 宗像市
- 太宰府市
- 古賀市
- 福津市
- うきは市
- 宮若市
- 嘉麻市
- 朝倉市
- みやま市
- 糸島市
- 那珂川市

## Required Outputs

- `research/current-mayors/findings/40-fukuoka/2026-04-23-round1.md`
- `research/current-mayors/findings/40-fukuoka/2026-04-23-round1.sources.json`
- `research/current-mayors/findings/40-fukuoka/2026-04-23-round1.diff.json`

## Source Priority

1. 選挙結果、開票結果、当選人一覧、選管資料
2. 福岡県や各市の任期満了日一覧、選挙日程
3. 就任日を示す市長日程、登庁式、訓示、フォトレポート
4. 各市公式の市長プロフィール、市長室、組織案内
5. 自治体公式 PDF

## Checks

- その県の「全市」一覧が公式情報で固定されているか
- 現職市長名が取れているか
- 任期満了日が一次情報で取れているか
- 任期開始日が一次情報か、補完か
- 情報源ごとに `checked_at` を残しているか
- `conflict` と `missing_source` を分けているか
- 29市すべてに対して結果があるか
- 改選直後の市がないか
- 市長プロフィールが古いまま、選挙ページだけ更新されていないか
- 県選管ページだけでなく、市選管ページや選挙管理委員会情報一覧も見たか
- `term_start` を補完する前に、就任訓示、登庁式、フォトレポートを確認したか

## Review Notes

- 補完した値は `note` に理由を書く
- `confirmed` にする場合、`sources` は空にしない
- 福岡市、北九州市、糸島市、行橋市など旧台帳に含まれる市は差分理由を明記する
- 県選管の `市町村長名簿` の `任期開始年月日` は、改選後の現任期始期ではなく、現職の初就任日になっている市がある
- 公開ページの `term_start` は現任期始期を使うため、再選市は `任期満了日一覧` と4年任期から現任期始期を補完する
- `市町村長名簿` に戸籍名が出る場合があるので、通称表記を使う市は市公式ページや選挙結果で再確認する
