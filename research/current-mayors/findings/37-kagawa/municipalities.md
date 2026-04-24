# 香川県 検証対象市一覧

- pref_code: `37`
- prefecture: `香川県`
- city_count: `8`
- generated_at: `2026-04-23`
- source: [大規模小売店舗立地法に係る市町担当課一覧](https://www.pref.kagawa.lg.jp/keiei/kouriten/daiten/sityou.html)
- source_checked_at: `2026-04-23`

## Cities

1. 高松市
2. 丸亀市
3. 坂出市
4. 善通寺市
5. 観音寺市
6. さぬき市
7. 東かがわ市
8. 三豊市

## Rule

- 香川県の現職市長検証は、この8市を母集団として扱う
- 町はこのタスクに含めない
- `findings` の件数集計はこの一覧を基準にする
- 母集団は `regions.json` ではなく、県公式一覧を優先する
