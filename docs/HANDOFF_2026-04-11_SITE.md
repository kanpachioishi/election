# Handoff Memo: Site MVP

最新の引継ぎは [docs/HANDOFF_2026-04-15_SITE.md](C:/Users/shimo/Desktop/election/docs/HANDOFF_2026-04-15_SITE.md) を参照。

最終更新: 2026-04-11 10:05 JST
目的: 新しい Windows 側フロントの作業を、次セッションでそのまま再開できるようにする

## 1. 現況

Windows 側 workspace:
- [C:/Users/shimo/Desktop/election](C:/Users/shimo/Desktop/election)

新規サイト:
- [site/index.html](C:/Users/shimo/Desktop/election/site/index.html)
- [site/assets/app.js](C:/Users/shimo/Desktop/election/site/assets/app.js)
- [site/assets/styles.css](C:/Users/shimo/Desktop/election/site/assets/styles.css)
- [site/data/site-data.js](C:/Users/shimo/Desktop/election/site/data/site-data.js)
- [site/README.md](C:/Users/shimo/Desktop/election/site/README.md)

生成スクリプト:
- [scripts/generate-site-data.mjs](C:/Users/shimo/Desktop/election/scripts/generate-site-data.mjs)

旧サイト相当の root files は残している:
- [index.html](C:/Users/shimo/Desktop/election/index.html)
- [common](C:/Users/shimo/Desktop/election/common)
- [pages](C:/Users/shimo/Desktop/election/pages)
- [data/elections.js](C:/Users/shimo/Desktop/election/data/elections.js)
- [data/regions.js](C:/Users/shimo/Desktop/election/data/regions.js)

今回の新実装では、旧 root files は編集していない。新しい画面は [site](C:/Users/shimo/Desktop/election/site) 配下で進める。

## 2. 作ったもの

### 2.1 新しい静的フロント

[site/index.html](C:/Users/shimo/Desktop/election/site/index.html) に、一覧と詳細を同一ページで見る MVP を作った。

主な機能:
- hero / coverage snapshot
- 選挙一覧
- キーワード検索
- 郵便番号 seed prefix 検索
- 種別フィルタ
- phase フィルタ
- resource kind フィルタ
- 地域フィルタ
- 選挙詳細パネル
- 公式ソースリンク
- `candidate_list / bulletin / early_voting / polling_place / other` の grouped links 表示

### 2.2 `data/v1` から画面用データを生成

[scripts/generate-site-data.mjs](C:/Users/shimo/Desktop/election/scripts/generate-site-data.mjs) を追加した。

入力:
- [data/v1/regions.json](C:/Users/shimo/Desktop/election/data/v1/regions.json)
- [data/v1/elections.json](C:/Users/shimo/Desktop/election/data/v1/elections.json)
- [data/v1/election_resource_links](C:/Users/shimo/Desktop/election/data/v1/election_resource_links)
- [data/v1/postal_code_mappings](C:/Users/shimo/Desktop/election/data/v1/postal_code_mappings)

出力:
- [site/data/site-data.js](C:/Users/shimo/Desktop/election/site/data/site-data.js)

方針:
- `site/data/site-data.js` は自動生成。手編集しない。
- `data/v1` を更新したら `node .\scripts\generate-site-data.mjs` を再実行する。

### 2.3 ダーク基調に変更

[site/assets/styles.css](C:/Users/shimo/Desktop/election/site/assets/styles.css) を dark default にした。

現在の方針:
- dark default
- 後で light mode を足す場合は `:root[data-theme="light"]` で CSS variables を上書きする
- そのため色はできるだけ variables 経由で管理している

## 3. 現在の counts

[site/data/site-data.js](C:/Users/shimo/Desktop/election/site/data/site-data.js) 生成時点の stats:

- `regions = 94`
- `elections = 65`
- `resourceLinks = 188`
- `postalPrefixes = 47`

Election type:
- `prefectural = 47`
- `municipal = 11`
- `by_election = 5`
- `national = 2`

Phase:
- `archived = 64`
- `upcoming = 1`

Resource kind:
- `candidate_list = 42`
- `bulletin = 45`
- `early_voting = 28`
- `polling_place = 15`
- `other = 58`

## 4. 実行コマンド

画面を開く:

```powershell
Start-Process .\site\index.html
```

site data 再生成:

```powershell
node .\scripts\generate-site-data.mjs
```

検証:

```powershell
node --check .\scripts\generate-site-data.mjs
node --check .\site\assets\app.js
node .\scripts\validate-data-v1.mjs
```

直近の検証結果:

```text
generated site/data/site-data.js
elections=65 resource_links=188

data/v1 validation passed
regions=94 elections=65 postal_code_mappings=47 election_resource_links=188
```

## 5. 重要な表現ルール

今のデータは seed coverage であり、全国網羅ではない。

避ける表現:
- `全国対応`
- `郵便番号を入れるだけで全選挙がわかる`
- `すべての選挙情報を網羅`
- `全国の郵便番号検索に対応`

使ってよい表現:
- `確認済みの公式情報への入口`
- `seed coverage を画面で検証中`
- `対応地域を順次拡張中`
- `公式ページまたは公式PDFとして確認できたリンクを掲載`

## 6. 次にやるとよいこと

優先度高:
- 実画面をブラウザで見て、dark theme の視認性を確認する
- hero が大きすぎる場合は、初回表示で検索フォームが見える高さに詰める
- 詳細パネルの official links をユーザー価値順にさらに見やすくする
- `upcoming` が 1 件しかないため、一覧初期表示を `upcoming + recent archived` の説明付きにする

次の画面作業候補:
- election detail を `?id=` でも開けるようにする
- region page または region grouping を追加する
- resource kind ごとの CTA 文言を整える
- light mode toggle を追加する
- data coverage warning を画面下部ではなく検索付近にも置く
- `other` の表示名を、場合により `公式ページ` / `関連情報` に寄せる

データ側の候補:
- 長野市長選 / 長野市議補選は有力候補だったが、主日程 URL が直取得で 404 になったため保留している
- 追加する場合は、公式 source URL の生存確認を先にやる

## 7. 次回そのまま使える依頼文

画面改善から再開する場合:

`docs/HANDOFF_2026-04-11_SITE.md を読んで、site/index.html のローカルMVPをブラウザ想定で改善して。まず hero と一覧/詳細の見やすさを整えて。`

light mode を追加する場合:

`docs/HANDOFF_2026-04-11_SITE.md を読んで、dark default は維持したまま light mode toggle を追加して。CSS variables の上書きで実装して。`

データを増やして画面に反映する場合:

`data/v1 に選挙データを追加したあと、scripts/generate-site-data.mjs を再実行して site に反映して。validate も通して。`

## 8. 2026-04-11 夜の追加作業メモ

知事選ページを新しく作るときの運用ルールは、[docs/GOVERNOR_PAGE_RUNBOOK.md](C:/Users/shimo/Desktop/election/docs/GOVERNOR_PAGE_RUNBOOK.md) を先に読む。

最終更新: 2026-04-11 20:45 JST

### 8.1 今回やったこと

メインページは「公式情報だけ」を基本に戻し、新潟県知事選の報道ベース情報は専用ページへ分離した。

主な追加・変更ファイル:
- [site/elections/niigata-governor-2026.html](C:/Users/shimo/Desktop/election/site/elections/niigata-governor-2026.html)
- [site/assets/niigata-governor-2026.js](C:/Users/shimo/Desktop/election/site/assets/niigata-governor-2026.js)
- [site/assets/niigata-governor-2026.css](C:/Users/shimo/Desktop/election/site/assets/niigata-governor-2026.css)
- [data/v1/candidate_signals/el-pref-15-governor-2026.json](C:/Users/shimo/Desktop/election/data/v1/candidate_signals/el-pref-15-governor-2026.json)
- [data/v1/candidate_endorsements/el-pref-15-governor-2026.json](C:/Users/shimo/Desktop/election/data/v1/candidate_endorsements/el-pref-15-governor-2026.json)
- [data/v1/candidate_profiles/el-pref-15-governor-2026.json](C:/Users/shimo/Desktop/election/data/v1/candidate_profiles/el-pref-15-governor-2026.json)
- [scripts/generate-site-data.mjs](C:/Users/shimo/Desktop/election/scripts/generate-site-data.mjs)
- [scripts/validate-data-v1.mjs](C:/Users/shimo/Desktop/election/scripts/validate-data-v1.mjs)
- [docs/DATA_FILE_FORMAT_SPEC.md](C:/Users/shimo/Desktop/election/docs/DATA_FILE_FORMAT_SPEC.md)
- [data/v1/README.md](C:/Users/shimo/Desktop/election/data/v1/README.md)

実装した内容:
- 新潟県知事選専用ページを追加した
- 専用ページは dark default にした
- メインページは公式リンク中心にし、報道ベースの候補動向は専用ページへ誘導する設計にした
- coverage warning とゼロ件時の案内を改善した
- `candidate_signals` に花角英世、土田竜吾、安中聡、米山隆一を整理した
- 米山隆一は候補予定者ではなく `related_interest` / 関連動向として扱う
- `candidate_endorsements` を追加し、推薦・支持を候補動向とは別レイヤーにした
- `candidate_profiles` を追加し、公式サイト、公式SNS・本人SNS、プロフィール導線、政策リンク、経歴、選挙歴、出典を表示できるようにした
- 専用ページに「公式情報」「候補予定者プロフィール」「出馬動向」「推薦・支持」「時系列」「出典一覧」を出した
- `profile_status = related_interest` / `interested` は候補予定者一覧や比較表に混ぜず、UI では `関連動向` セクションに分ける
- 公式候補者一覧に載るまでは、関連動向の人を候補予定者として読める文言を置かない
- validator / generator / docs / README を `candidate_signals`、`candidate_endorsements`、`candidate_profiles` に同期した
- `site/data/site-data.js` は generator で再生成した

### 8.2 現在のデータ件数

最終検証時点:

```text
data/v1 validation passed
regions=94 elections=65 postal_code_mappings=47 election_resource_links=195 candidate_signals=4 candidate_endorsements=6 candidate_profiles=4
```

`site/data/site-data.js` 内の新潟県知事選:

```text
candidateProfiles=4
花角英世: reported_candidate
土田竜吾: reported_candidate
安中聡: reported_candidate
米山隆一: related_interest
```

### 8.3 重要な設計判断

- 告示前なので「公式候補者一覧」とは言わない
- 新潟県公式の候補者一覧が出るまでは、候補者名は「報道ベースの候補予定者」として扱う
- メインページは公式情報に寄せる
- 報道、本人発信、推薦・支持、時系列、出典集約は新潟県知事選専用ページに置く
- 推薦・支持は candidate signal と混ぜず、`candidate_endorsements` で別管理する
- 候補者プロフィールは実績評価ではなく、公式導線・経歴・選挙歴・出典を中立に並べる
- 安中聡は確認できた公式サイトを入れていない。本人ブログ、本人X、過去選挙・経歴記事ベース
- 米山隆一は候補予定者ではなく関連動向。表示でも候補予定者と同じ扱いにしない
- 米山隆一のような人物は、個人評価ではなく「関連動向として扱う」という整理に留める
- `identity_labels` などで現職肩書きを出す場合、プロフィールページだけを根拠にしない。直近の選挙結果、議会・自治体などの現職名簿、本人または党の最新プロフィール、報道の順に確認する
- 直近選挙後の情報と古いプロフィールが矛盾する場合は、直近選挙結果や現職名簿を優先する。現職か断定できない場合や落選・退任を確認した場合は `前衆院議員`, `元知事`, `元市議` のように現在形ではない表現にする

### 8.4 実画面確認

Chrome headless で確認済み:

- [artifacts/site-visibility/niigata-profiles-tall-desktop.png](C:/Users/shimo/Desktop/election/artifacts/site-visibility/niigata-profiles-tall-desktop.png)
- [artifacts/site-visibility/niigata-profiles-taller-mobile-minwidth.png](C:/Users/shimo/Desktop/election/artifacts/site-visibility/niigata-profiles-taller-mobile-minwidth.png)
- [artifacts/site-visibility/niigata-profiles-desktop-link-wrap.png](C:/Users/shimo/Desktop/election/artifacts/site-visibility/niigata-profiles-desktop-link-wrap.png)

最後に、PC表示でプロフィールカード内の出典リンクがはみ出していたため、[site/assets/niigata-governor-2026.css](C:/Users/shimo/Desktop/election/site/assets/niigata-governor-2026.css) に `.profile-card .inline-link` の折り返し指定を追加した。

### 8.5 最終確認コマンド

次セッション開始時もまずこれを通すとよい。

```powershell
node .\scripts\validate-data-v1.mjs
node .\scripts\generate-site-data.mjs
node --check .\scripts\generate-site-data.mjs
node --check .\scripts\validate-data-v1.mjs
node --check .\site\assets\niigata-governor-2026.js
node --check .\site\data\site-data.js
```

最後に通った結果:

```text
data/v1 validation passed
regions=94 elections=65 postal_code_mappings=47 election_resource_links=195 candidate_signals=4 candidate_endorsements=6 candidate_profiles=4

generated site/data/site-data.js
elections=65 resource_links=195
```

### 8.6 これからやること

優先度高:
- 新潟県知事選専用ページの候補プロフィールを accordion / details 化する。PCでも情報量が多く、モバイルではかなり長い
- 「政策リンク」を候補別カード内だけでなく、候補横断の比較ビューにする
- 「公式候補者一覧が公開されたらここに切り替える」という導線を専用ページ上部に明示する
- 出典一覧に公式出典と報道出典の両方を見やすく分けて出す。現状は報道出典中心
- 安中聡の本人導線は再確認する。公式サイトと断定できないものは `profile_pages` / 本人発信として扱う
- 土田竜吾、花角英世、米山隆一の公式SNS URL は、公式サイトからリンクされているか再確認するとさらに堅い

次の改善候補:
- light mode 対応。ただし dark default は維持する
- 専用ページの header navigation を sticky 化するか検討する
- `candidate_profiles` の `summary` を短くし、詳細は accordion 内に逃がす
- 候補ごとに「公式導線」「政策」「経歴」「選挙歴」「出典」をタブまたは折りたたみにする
- `candidate_profiles` に `source_confidence` や `officiality` のような軽い分類を足すか検討する
- 更新日が古い公式サイト情報と、2026年選挙向け情報を視覚的に分ける

データ更新の次の一手:
- 新潟県公式の候補者一覧ページが出たら `election_resource_links` に `candidate_list` として追加する
- 同時に `data/v1/elections.json` の `page_status.official_candidate_list_status` を `published` にし、`page_status.official_candidate_list` に公式候補者一覧の `label`, `url`, `source_name`, `last_checked_at` を入れる。公式ページの公開日が分かる場合は `published_at` も入れる
- `official_candidate_list_status = published` なのに `official_candidate_list.url`, `source_name`, `last_checked_at` が未入力なら validator が落ちる
- `page_status.label`, `summary`, `transition_note`, `as_of`, `page_updates` も同時に更新し、ページ上部を「公式候補者一覧ベース」へ切り替える
- UI 見出しは `official_candidate_list_status` で切り替わる前提にした。`not_included` では `候補予定者プロフィール（報道ベース）` / `公式導線比較（報道確認ベース）` / `出馬動向（報道ベース）`、`published` では `公式候補者プロフィール` / `公式導線比較（公式候補者）` / `出馬動向（公示後更新）` を使う
- 公式候補者一覧が出たら `candidate_signals.status` を `official_candidate` に切り替える
- 候補者の政策ページ・声明ページが増えたら `candidate_profiles.policy_links` / `person_statements` に追加する
- 推薦・支持の追加報道が出たら `candidate_endorsements` に追加する

### 8.7 次回そのまま使える依頼文

専用ページの見やすさ改善:

`docs/HANDOFF_2026-04-11_SITE.md を読んで、新潟県知事選専用ページの候補プロフィールを accordion 化して。PCとモバイルで実画面確認までして。`

政策比較ビュー:

`docs/HANDOFF_2026-04-11_SITE.md を読んで、新潟県知事選専用ページに候補別の政策リンク比較ビューを追加して。candidate_profiles の policy_links を使って。`

light mode:

`docs/HANDOFF_2026-04-11_SITE.md を読んで、新潟県知事選専用ページを dark default のまま light mode にも対応させて。CSS variables で切り替えて。`

公式候補者一覧の追加:

`docs/HANDOFF_2026-04-11_SITE.md を読んで、新潟県公式の候補者一覧ページが公開されているか確認し、あれば data/v1 に追加して generator/validator を通して。`

## 9. 公式候補者一覧公開時の更新チェックリスト

公式候補者一覧が公開されたら、次の順で更新する。

1. `data/v1/elections.json` の `page_status.official_candidate_list_status` を `published` にする
2. `page_status.official_candidate_list` に `label`, `url`, `source_name`, `last_checked_at` を入れる
3. 公開日が確認できる場合だけ `published_at` を入れる
4. `page_status.label`, `summary`, `transition_note`, `as_of` を公式候補者一覧ベースに合わせて更新する
5. `page_updates` に切替履歴を1件追加する
6. `page_status` / `page_updates` の貼り付け用テンプレは `data/v1/README.md` の「追記: 新潟県知事選の補助データ」を参照する
7. 公式候補者一覧で確認できた人だけ `candidate_signals.status` を `official_candidate` に切り替える
8. 公式候補者一覧に載るまでは、関連動向の人を候補者扱いにしない
9. `candidate_profiles` の `policy_links` や `person_statements` が増える場合は、公式候補者一覧確認後に追記する
10. `candidate_endorsements` に新しい推薦・支持情報が出た場合は別レコードで追加する
11. 最後に `node .\scripts\validate-data-v1.mjs` と `node .\scripts\generate-site-data.mjs` を順に通す

運用文言は、候補者への評価や推測に見えないようにする。  
`official_candidate` は公式候補者一覧で確認できた場合のみ使い、未確認のものは `reported_candidate` / `related_interest` のまま維持する。
