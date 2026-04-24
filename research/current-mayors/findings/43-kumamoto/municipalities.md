# 熊本県 検証対象市一覧

- pref_code: `43`
- prefecture: `熊本県`
- city_count: `14`
- generated_at: `2026-04-24`
- source: [任期満了日について](https://www.pref.kumamoto.jp/soshiki/147/182198.html)
- source_checked_at: `2026-04-24`

## Cities

1. 熊本市
2. 八代市
3. 人吉市
4. 荒尾市
5. 水俣市
6. 玉名市
7. 山鹿市
8. 菊池市
9. 宇土市
10. 上天草市
11. 宇城市
12. 阿蘇市
13. 天草市
14. 合志市

## Rule

- 熊本県の現職市長検証は、この14市を母集団として扱う
- 町・村はこのタスクに含めない
- `findings` の件数集計はこの一覧を基準にする
- 母集団は `regions.json` の登録済み件数ではなく、県公式一覧を優先する
