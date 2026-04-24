# 佐賀県 検証対象市一覧

- pref_code: `41`
- prefecture: `佐賀県`
- city_count: `10`
- generated_at: `2026-04-24`
- source: [県内市町リンク](https://www.pref.saga.lg.jp/kiji0034791/index.html)
- source_checked_at: `2026-04-24`

## Cities

1. 鹿島市
2. 佐賀市
3. 唐津市
4. 鳥栖市
5. 多久市
6. 伊万里市
7. 武雄市
8. 小城市
9. 嬉野市
10. 神埼市

## Rule

- 佐賀県の現職市長検証は、この10市を母集団として扱う
- 町・村はこのタスクに含めない
- `findings` の件数集計はこの一覧を基準にする
- 母集団は `regions.json` の登録済み件数ではなく、県公式一覧を優先する
