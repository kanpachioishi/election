# 2026-04-24 Current Mayors Progress

## Summary

- 現職市長一覧の地域別更新を継続し、九州・沖縄を最後まで反映した。
- `research/current-mayors/findings/41-saga/` から `47-okinawa/` までの県別成果物を追加した。
- 公開ページ [site/pages/current-mayors.html](/home/shimo/election/site/pages/current-mayors.html) も九州・沖縄の内容で更新した。

## Added Or Finalized Today

- `41-saga`
- `42-nagasaki`
- `43-kumamoto`
- `44-oita`
- `45-miyazaki`
- `46-kagoshima`
- `47-okinawa`

各県で追加した基本ファイル:

- `municipalities.json`
- `municipalities.md`
- `2026-04-24-round1.md`
- `2026-04-24-round1.sources.json`
- `2026-04-24-round1.diff.json`
- `research/current-mayors/queue/{pref}.md`

## Public Page Updates

九州・沖縄の公開ページ更新では、主に次を反映した。

- `小林市`: `堀 研二郎` に更新
- `宇城市`: `2025-02-27` 開始、`2029-02-26` 満了に修正
- `伊万里市`: `深浦 弘信` 3期目として次期任期へ更新
- `宇土市`: `光井 正吾` 初当選として次期任期へ更新
- `出水市`: `椎木 伸一` 3期目として次期任期へ更新
- `姶良市`: `米丸 麻希子` 初当選として次期任期へ更新
- `鹿島市`, `宗像市` など近接選挙の注記を維持・整理

## Source Handling

- 原則は `県選管 -> 市選管・公式結果 -> 就任確認 -> プロフィール` の順で確認した。
- `伊万里市` と `出水市` は自治体公式の選挙結果ページで確定した。
- `宇土市` と `姶良市` は、自治体公式ページで日程や旧任期を押さえたうえで、自治体公式の最終結果掲載が遅れていたため報道で当選者を補完した。
- この2市は `sources.json` と `note` に、どこまでが自治体公式で、どこからが補助確認か分かるように残した。

## Needs Review Closure

九州・沖縄作業の途中で残っていた `needs_review` は次の4市だった。

- `伊万里市`
- `宇土市`
- `出水市`
- `姶良市`

2026-04-24 時点で、上記4市はすべて `confirmed` に更新した。

## Verification

- `41-saga`, `43-kumamoto`, `46-kagoshima` の `round1.md` は `needs_review: 0` を確認済み
- 更新した JSON は妥当性確認済み
- 九州・沖縄の市数は以下で一致
- `福岡29 / 佐賀10 / 長崎13 / 熊本14 / 大分14 / 宮崎9 / 鹿児島19 / 沖縄11`

## Follow-up

- `宇土市` と `姶良市` は、後日自治体公式の最終結果ページが公開されたら、報道ベースの補助ソースを公式結果へ差し替える
- ブラウザでの見た目確認は未実施
