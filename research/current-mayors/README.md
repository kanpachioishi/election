# Current Mayors Research

現職市長台帳の県別検証作業は、このディレクトリで管理する。

## Structure

- `queue/`: 県別の作業指示テンプレートと未着手タスク
- `findings/`: 調査結果の markdown / sources / diff 出力
- `diffs/`: 集約差分を置きたい場合の予備領域

## Rule

- `data/v1/current_mayors/` を直接更新する前に、まずここへ調査結果を出す
- 1県ごとに独立して調査する
- 調査日と情報源 URL を必ず残す
