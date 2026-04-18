# Handoff Memo: 2026-04-15 Site / Dedicated Pages

最終更新: 2026-04-15 19:05 JST
目的: 次セッションで、専用ページ作業とデータ運用を安全に再開できるようにする

## 1. 現況

workspace:
- [C:/Users/shimo/Desktop/election](C:/Users/shimo/Desktop/election)

現在の専用ページ:
- [site/elections/niigata-governor-2026.html](C:/Users/shimo/Desktop/election/site/elections/niigata-governor-2026.html)
- [site/elections/shiga-governor-2026.html](C:/Users/shimo/Desktop/election/site/elections/shiga-governor-2026.html)
- [site/elections/fujioka-mayor-2026.html](C:/Users/shimo/Desktop/election/site/elections/fujioka-mayor-2026.html)

対応する専用アセット:
- [site/assets/niigata-governor-2026.js](C:/Users/shimo/Desktop/election/site/assets/niigata-governor-2026.js)
- [site/assets/niigata-governor-2026.css](C:/Users/shimo/Desktop/election/site/assets/niigata-governor-2026.css)
- [site/assets/shiga-governor-2026.js](C:/Users/shimo/Desktop/election/site/assets/shiga-governor-2026.js)
- [site/assets/shiga-governor-2026.css](C:/Users/shimo/Desktop/election/site/assets/shiga-governor-2026.css)
- [site/assets/fujioka-mayor-2026.js](C:/Users/shimo/Desktop/election/site/assets/fujioka-mayor-2026.js)
- [site/assets/fujioka-mayor-2026.css](C:/Users/shimo/Desktop/election/site/assets/fujioka-mayor-2026.css)

専用ページ導線:
- [site/assets/app.js](C:/Users/shimo/Desktop/election/site/assets/app.js)

生成ファイル:
- [site/data/site-data.js](C:/Users/shimo/Desktop/election/site/data/site-data.js)

重要:
- `site/data/site-data.js` は自動生成。手編集しない。
- `data/v1` を触ったら、`validate-data-v1` と `generate-site-data` を回す。

## 2. このセッションまでに固まったもの

### 2.1 新潟県知事選ページ

新潟ページはかなり仕上がっている。大きな追加開発より、今後は運用更新中心でよい。

現状の要点:
- 候補予定者と関連動向を構造で分離
- 比較帯あり
- 候補者名、ふりがな、年齢、立場、推薦・支持カテゴリが見える
- 公式候補者一覧が出たときの見出し切り替え文言を実装済み
- 米山隆一は `関連動向` 扱いで、候補予定者に混ぜない

### 2.2 滋賀県知事選ページ

滋賀ページを追加済み。現時点では報道ベースの候補予定者 1 人で整理している。

主なデータ:
- [data/v1/elections.json](C:/Users/shimo/Desktop/election/data/v1/elections.json)
- [data/v1/election_resource_links/el-pref-25-governor-2026.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-pref-25-governor-2026.json)
- [data/v1/candidate_signals/el-pref-25-governor-2026.json](C:/Users/shimo/Desktop/election/data/v1/candidate_signals/el-pref-25-governor-2026.json)
- [data/v1/candidate_profiles/el-pref-25-governor-2026.json](C:/Users/shimo/Desktop/election/data/v1/candidate_profiles/el-pref-25-governor-2026.json)

### 2.3 藤岡市長選ページ

藤岡ページを追加済み。現時点では報道ベースの候補予定者 1 人で整理している。

主なデータ:
- [data/v1/elections.json](C:/Users/shimo/Desktop/election/data/v1/elections.json)
- [data/v1/election_resource_links/el-mun-10209-mayor-2026.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-10209-mayor-2026.json)
- [data/v1/candidate_signals/el-mun-10209-mayor-2026.json](C:/Users/shimo/Desktop/election/data/v1/candidate_signals/el-mun-10209-mayor-2026.json)
- [data/v1/candidate_profiles/el-mun-10209-mayor-2026.json](C:/Users/shimo/Desktop/election/data/v1/candidate_profiles/el-mun-10209-mayor-2026.json)

今回の注意点:
- 出典リンクの 1 件が切れていたので修正済み
- これを受けて、外部リンク運用ルールを強化した

## 3. 重要な運用ルール

### 3.1 知事選ページを作るとき

知事選の専用ページを作るときは、先に [docs/GOVERNOR_PAGE_RUNBOOK.md](C:/Users/shimo/Desktop/election/docs/GOVERNOR_PAGE_RUNBOOK.md) を読む。

特に重要な点:
- 候補予定者と関連動向を混ぜない
- 公式候補者一覧が出る前は `報道ベース` と明示する
- 色や記号で思想や立場を想起させる見せ方は避ける
- 肩書は古いプロフィールだけで断定しない

### 3.2 外部リンク運用

今回の broken link 対応で、次を必須化した。

- 外部 URL は登録前に必ず一度開いて確認する
- `candidate_signals`, `candidate_profiles`, `candidate_endorsements`, `election_resource_links` の URL は、少なくとも一度はブラウザまたは同等手段で開く
- 404 / リダイレクトループ / 別記事化 / アクセス不能 URL は採用しない
- 可能なら元の発信元を使う
- 配信先を使う場合は、記事詳細 URL より安定したトピック URL や発信元ページを優先する
- URL を修正したら `last_checked_at` 更新と `generate-site-data` 実行までをセットにする
- 生成後は [site/data/site-data.js](C:/Users/shimo/Desktop/election/site/data/site-data.js) に古い URL が残っていないことを確認する

### 3.3 `site-data.js` の扱い

これは今回の事故の原因に直結した。

- 元データを直しても、`site/data/site-data.js` を再生成しないと画面側は古い URL を持ち続ける
- URL 修正の完了条件は「data/v1 修正」ではなく「生成物まで反映確認」

## 4. 今のデータ件数

最終確認時点:

```text
data/v1 validation passed
regions=95 elections=67 postal_code_mappings=47 election_resource_links=201 candidate_signals=6 candidate_endorsements=6 candidate_profiles=6

generated site/data/site-data.js
elections=67 resource_links=201
```

`upcoming` の主な専用ページ対象:
- 新潟県知事選
- 滋賀県知事選
- 藤岡市長選

## 5. 実行コマンド

validation:

```powershell
node .\scripts\validate-data-v1.mjs
```

site data 再生成:

```powershell
node .\scripts\generate-site-data.mjs
```

JS syntax check:

```powershell
node --check .\site\assets\app.js
node --check .\site\assets\niigata-governor-2026.js
node --check .\site\assets\shiga-governor-2026.js
node --check .\site\assets\fujioka-mayor-2026.js
```

## 6. ユーザーとの作業上の注意

- ユーザーは「どの候補者がいて、どんなプロフィールで、どこに公式サイトがあるか」を 1 ページで見たい、という目的をかなり重視している
- 候補者の区別のしやすさを大事にしている
- 色分けや記号で思想や立場を連想させる案には慎重
- 信頼に関わるミス、特にリンク切れにはかなり敏感
- ルール化を好むので、再発防止策はドキュメントに残す
- 実画面確認を重視する
- 大きめの作業では「2エージェントで進めて」と言われることが多い

補足:
- ユーザーはスクリーンショット確認のたびに許可を求められるのをかなり嫌がる。新セッションではツール制約に従う必要はあるが、必要な確認はまとめて行う方がよい。

## 7. 次にやる候補

1. 次の首長選ページを増やす  
   直近の首長選探しは、[$local-executive-election-finder](C:/Users/shimo/.codex/skills/local-executive-election-finder/SKILL.md) を使う。

2. 市長選ページ用の runbook を作る  
   現状は知事選 runbook が正本。市長選は藤岡ページを実例として横展開している。

3. 専用ページの共通化を進める  
   新潟・滋賀・藤岡で共通している処理は多い。もう 1 件くらい横展開したら共通化しやすい。

## 8. 次回そのまま使える依頼文

次の首長選ページ候補を調べる:

`$local-executive-election-finder を使って、次に作るべき首長選ページを公式ソース確認つきで教えて。`

知事選ページを増やす:

`docs/HANDOFF_2026-04-15_SITE.md と docs/GOVERNOR_PAGE_RUNBOOK.md を読んで、次の知事選専用ページを追加して。data/v1 更新、site data 再生成、実画面確認まで。`

市長選ページを増やす:

`docs/HANDOFF_2026-04-15_SITE.md を読んで、藤岡市長選ページの型を参考に次の市長選専用ページを追加して。リンク検証と generate-site-data まで必ずやって。`
