# 青森県 検証対象市一覧

- pref_code: `02`
- prefecture: `青森県`
- city_count: `10`
- generated_at: `2026-04-23`
- source: [市町村ホームページ](https://www.pref.aomori.lg.jp/soshiki/zaimu/shichoson/shichoson.html)
- source_checked_at: `2026-04-23`

## Cities

1. 青森市
2. 弘前市
3. 黒石市
4. 五所川原市
5. 八戸市
6. 十和田市
7. 三沢市
8. むつ市
9. つがる市
10. 平川市

## Rule

- 青森県の現職市長検証は、この10市を母集団として扱う
- 町・村はこのタスクに含めない
- `findings` の件数集計はこの一覧を基準にする
- 母集団は `regions.json` の登録済み件数ではなく、県公式一覧を優先する
