# 現職市長情報 更新フロー

最終更新: 2026-04-23
ステータス: Draft v1
関連:
- [現職市長検証タスク テンプレート](/home/shimo/election/research/current-mayors/queue/TEMPLATE.md)
- [現職市長検証ルール](/home/shimo/election/skills/current-mayors-audit/references/verification-rules.md)
- [現職市長検証 Skill 出力フォーマット案](/home/shimo/election/docs/plans/CURRENT_MAYORS_SKILL_OUTPUT_FORMAT.md)

## 1. 目的

この文書は、現職市長一覧ページの情報を、どの順番で調べ、どの時点で公開へ反映するかを1枚で確認できるようにするための runbook である。

## 2. 基本方針

- 県単位で調査する
- 母集団は、県または自治体の公式一覧で固定する
- 公開 HTML を直接正本にしない
- まず `findings` を出し、`confirmed` まで持っていってから公開へ反映する
- 改選直後はプロフィールより選挙結果を優先する

## 3. 使う場所

```text
research/current-mayors/
  queue/
    {pref_code}-{pref_slug}.md
  findings/
    {pref_code}-{pref_slug}/
      YYYY-MM-DD-roundN.md
      YYYY-MM-DD-roundN.sources.json
      YYYY-MM-DD-roundN.diff.json

site/pages/
  current-mayors.html
```

## 4. 更新の全体フロー

1. 県タスクを作る
2. 対象市の母集団を公式一覧で固定する
3. 公式ソースを優先順位どおりに確認する
4. `roundN.md` / `roundN.sources.json` / `roundN.diff.json` を出す
5. `needs_review` / `conflict` があれば `round2`, `round3` と再調査する
6. その県の全市が `confirmed` になったら公開ページを更新する

## 5. Source Priority

1. 県選管の市町村長名簿、任期満了日一覧、選挙日程
2. 選挙結果、開票結果、当選人一覧、選管資料
3. 就任日を示す市長日程、登庁式、訓示、フォトレポート
4. 市長プロフィール、市長の部屋、組織案内
5. 自治体公式 PDF

補足:
- 県ごとの調査は、最初に県選管ページを開いてベースラインを作る
- `mayor_name` は選挙結果を優先する
- `term_end` は任期満了日一覧を優先する
- `term_start` は就任日明示ページを優先する
- プロフィールは補助資料として使う

## 6. 県タスク開始時のチェック

- その県の「全市」一覧を県公式または自治体公式で固定したか
- 県選管ページを最初に開き、`市町村長名簿` `任期満了日一覧` `選挙日程` を確保したか
- 直近3〜6か月で改選があった市がないか
- 任期満了日がすでに過ぎている市がないか
- 任期満了日が今後30日以内の市がないか
- 県選管だけでなく、市選管ページや選挙管理委員会情報一覧も開いたか
- `term_start` を補完する前に、就任訓示、登庁式、フォトレポートを確認したか

## 7. findings の作り方

各県ごとに次の3点を出す。

- `roundN.md`
  人が読む要約
- `roundN.sources.json`
  見た公式ソース一覧
- `roundN.diff.json`
  現行公開ページとの差分候補

## 8. status の考え方

- `confirmed`
  公式情報で採用値を支えられる
- `needs_review`
  かなり近いが、重要項目がまだ1つ不足している
- `conflict`
  公式ページ同士が食い違っている
- `missing_source`
  重要な一次情報をまだ見つけられていない

## 9. 確認時の注意

- 古いプロフィールと新しい選挙結果が食い違う場合は、新しい選挙結果を優先する
- 改選直後はプロフィール更新が遅れる前提で見る
- 旧プロフィールと新しい選挙結果の両方を `sources.json` に残す
- `term_start` を補完した場合は、`note` に理由を書く
- `confirmed` に上げた理由は `roundN.md` に短く書く
- `term_end` が調査日より前なら、選挙執行済みかを確認してその日付を `note` に書く
- `term_end` が調査日から30日以内なら、次回市長選の投票日を `note` に書く

## 10. 公開反映の条件

その県の全市が `confirmed` になったら、[current-mayors.html](/home/shimo/election/site/pages/current-mayors.html) を更新してよい。

公開反映時は次を行う。

1. `roundN.diff.json` を見る
2. HTML の該当県の行を更新する
3. 非公式リンクが残っていれば公式ソースに差し替える
4. `checked_at` は反映日にそろえる

## 11. 再調査の入り口

同じ県を再度チェックするときは、まず前回の `sources.json` を開く。

推奨順:

1. 前回の `sources.json`
2. 前回の `roundN.md`
3. 前回の `diff.json`

これで、
- 前回どの URL を見たか
- どこが未確定だったか
- 何を公開に反映していないか

をそのまま引き継げる。

## 12. 群馬で確定した実務ルール

- 群馬では、前橋市の再選、富岡市の市長交代、安中市とみどり市の改選後任期がボトルネックになった
- 原因は、古いプロフィールが残りやすく、選挙結果や任期満了日一覧の方が先に更新されるため
- 今後は「プロフィールを見る前に選挙結果を見る」を標準手順にする

## 13. Learned Loop

県ごとの調査が終わったら、そこで学んだことを必ず共通ルールへ反映する。

更新対象:

- 県固有の知見
  - `research/current-mayors/findings/{pref}/roundN.*`
- 全県共通で効く確認ルール
  - [verification-rules.md](/home/shimo/election/skills/current-mayors-audit/references/verification-rules.md)
- 次の県タスク開始時に必要な観点
  - [TEMPLATE.md](/home/shimo/election/research/current-mayors/queue/TEMPLATE.md)
- 運用全体のやり方
  - この runbook

実施ルール:

1. `roundN.md` を書いた時点で、今回苦労した点を短く整理する
2. それが他県でも再発しそうなら、`verification-rules.md` に昇格する
3. 着手時に最初から見るべき観点なら、`queue/TEMPLATE.md` に追加する
4. 運用順序や公開判断に関わるなら、この runbook に追加する

判断の目安:

- その県だけの事情なら `findings` に残す
- 複数県で起こりうるなら `rules` や `template` に上げる
- 次回の自分が最初から使うべき知見は、必ず共通文書に移す
