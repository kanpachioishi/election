# 徳島県 検証対象市一覧

- pref_code: `36`
- prefecture: `徳島県`
- city_count: `8`
- generated_at: `2026-04-23`
- source: [徳島県の市町村一覧](https://www.pref.tokushima.lg.jp/kenseijoho/kanrennochiiki/shichouson/)
- source_checked_at: `2026-04-23`

## Cities

1. 徳島市
2. 鳴門市
3. 小松島市
4. 阿南市
5. 吉野川市
6. 阿波市
7. 美馬市
8. 三好市

## Rule

- 徳島県の現職市長検証は、この8市を母集団として扱う
- 町・村はこのタスクに含めない
- `findings` の件数集計はこの一覧を基準にする
- 母集団は `regions.json` の登録済み件数ではなく、県公式一覧を優先する
