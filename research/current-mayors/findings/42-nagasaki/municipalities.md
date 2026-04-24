# 長崎県 検証対象市一覧

- pref_code: `42`
- prefecture: `長崎県`
- city_count: `13`
- generated_at: `2026-04-24`
- source: [令和5年度財政状況資料集(県内市町)](https://www.pref.nagasaki.jp/doc/page-716169.html)
- source_checked_at: `2026-04-24`

## Cities

1. 南島原市
2. 長崎市
3. 佐世保市
4. 島原市
5. 諫早市
6. 大村市
7. 平戸市
8. 松浦市
9. 対馬市
10. 壱岐市
11. 五島市
12. 西海市
13. 雲仙市

## Rule

- 長崎県の現職市長検証は、この13市を母集団として扱う
- 町・村はこのタスクに含めない
- `findings` の件数集計はこの一覧を基準にする
- 母集団は `regions.json` の登録済み件数ではなく、県公式一覧を優先する
