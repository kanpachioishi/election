# 大分県 検証対象市一覧

- pref_code: `44`
- prefecture: `大分県`
- city_count: `14`
- generated_at: `2026-04-24`
- source: [大分県の市町村](https://www.pref.oita.jp/site/kids/sichoson.html)
- source_checked_at: `2026-04-24`

## Cities

1. 大分市
2. 別府市
3. 中津市
4. 日田市
5. 佐伯市
6. 臼杵市
7. 津久見市
8. 竹田市
9. 豊後高田市
10. 杵築市
11. 宇佐市
12. 豊後大野市
13. 由布市
14. 国東市

## Rule

- 大分県の現職市長検証は、この14市を母集団として扱う
- 町・村はこのタスクに含めない
- `findings` の件数集計はこの一覧を基準にする
- 母集団は `regions.json` の登録済み件数ではなく、県公式一覧を優先する
