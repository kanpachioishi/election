# 宮崎県 検証対象市一覧

- pref_code: `45`
- prefecture: `宮崎県`
- city_count: `9`
- generated_at: `2026-04-24`
- source: [県内市町村一覧](https://www.pref.miyazaki.lg.jp/kohosenryaku/kense/shichoson/shichosonmap.html)
- source_checked_at: `2026-04-24`

## Cities

1. 小林市
2. 宮崎市
3. 都城市
4. 延岡市
5. 日南市
6. 日向市
7. 串間市
8. 西都市
9. えびの市

## Rule

- 宮崎県の現職市長検証は、この9市を母集団として扱う
- 町・村はこのタスクに含めない
- `findings` の件数集計はこの一覧を基準にする
- 母集団は `regions.json` の登録済み件数ではなく、県公式一覧を優先する
