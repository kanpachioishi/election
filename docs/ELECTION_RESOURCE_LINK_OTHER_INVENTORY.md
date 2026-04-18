# Election Resource Link Other Inventory

最終更新日: 2026-04-11  
ステータス: Step 2 完了 / keep closure 済み  
関連文書: [ELECTION_RESOURCE_LINK_EXPANSION.md](C:/Users/shimo/Desktop/election/docs/ELECTION_RESOURCE_LINK_EXPANSION.md), [COVERAGE_AUDIT.md](C:/Users/shimo/Desktop/election/docs/COVERAGE_AUDIT.md)

## 1. 目的

この文書は、`kind = other` の既存 `ElectionResourceLink` を棚卸しし、

- 再分類候補
- 再分類してはいけないもの
- 人手確認が必要なもの

を分けるための inventory である。

Step 1 では候補整理を行い、Step 2 では低曖昧度の child link を canonical JSON に反映した。  
今回の判断で、残り `otherOnly` 7 件は `keep_other` 前提でいったん閉じている。

## 2. サマリー

2026-04-11 時点で `kind = other` は 58 件ある。

- `filesWithOtherOnly`: 7 件
- `filesWithOtherPlusStructured`: 51 件
- `candidate_list`: 42 件
- `bulletin`: 45 件
- `early_voting`: 28 件
- `polling_place`: 15 件
- `election_resource_links`: 188 件

Step 1 で `候補あり` としていた県の大半は、`manual_review` または `split_child_links` で既に structured 化済みである。  
直近では、埼玉に `bulletin / early_voting`、香川に `candidate_list / bulletin`、岐阜に `polling_place` を追加した。  
さらに、`national / municipal / by_election` seed 10 件に続けて、既存 municipality region から 8 件を横展開し、`otherOnly` を増やさずに structured link を付けた。  
そのうえで、残り 7 件は `keep_other` として固定した。

この棚卸しの結論は次の通り。

- `candidate_list / bulletin / early_voting / polling_place` に切れる direct PDF や明確な official child page は、かなり回収できてきた
- それでも `otherOnly` に残る 7 件は、`結果 / 速報 / 記録 / 執行一覧` 色が強く、無理に再分類しない方が安全
- 現行ルールのままなら、残件は `other` を残す前提で扱うのが自然

## 3. 判定ルール

今回の棚卸しでは、次のルールで判定した。

- `結果 / 投開票速報 / 記録` が主役の URL は `other` のままにする
- `期日前投票者数 / 中間投票状況` は `early_voting` とみなさない
- `投票結果 / 開票結果 / 得票数 PDF` は `polling_place` とみなさない
- `特設 / 総合 / トップ / 一覧` は多機能ハブとして扱い、機械的に 1 kind へ落とさない
- `候補者 / 立候補者` が title レベルで明確なものは優先レビュー対象にする

## 4. 直近の反映結果

直近の Step 2 では、以下を反映した。

- [el-pref-11-governor-2023.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-pref-11-governor-2023.json): `bulletin / early_voting` を追加
- [el-pref-37-governor-2022.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-pref-37-governor-2022.json): `candidate_list / bulletin` を追加
- [el-pref-21-governor-2025.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-pref-21-governor-2025.json): `polling_place` を追加
- [el-national-upper-house-2025.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-national-upper-house-2025.json): `candidate_list / bulletin / early_voting` を追加
- [el-national-lower-house-2026.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-national-lower-house-2026.json): `early_voting` を追加
- [el-by-pref-03-upper-house-2024-01.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-by-pref-03-upper-house-2024-01.json): `bulletin` を追加
- [el-mun-30201-mayor-2022.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-30201-mayor-2022.json): `bulletin` を追加
- [el-mun-31201-mayor-2026.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-31201-mayor-2026.json): `polling_place` を追加
- [el-mun-05201-mayor-2025.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-05201-mayor-2025.json): `candidate_list / bulletin / early_voting` を追加
- [el-mun-21201-mayor-2026.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-21201-mayor-2026.json): `candidate_list / bulletin / early_voting / polling_place` を追加
- [el-by-mun-21201-assembly-2026-01.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-by-mun-21201-assembly-2026-01.json): `candidate_list / bulletin / early_voting / polling_place` を追加
- [el-mun-10201-mayor-2026.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-10201-mayor-2026.json): `candidate_list / bulletin / early_voting / polling_place` を追加
- [el-by-mun-10201-assembly-2026-01.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-by-mun-10201-assembly-2026-01.json): `candidate_list / bulletin / early_voting / polling_place` を追加
- [el-mun-33204-mayor-2025.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-33204-mayor-2025.json): `candidate_list / early_voting / polling_place` を追加
- [el-mun-37202-assembly-2025.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-37202-assembly-2025.json): `bulletin` を追加
- [el-mun-41208-mayor-2025.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-41208-mayor-2025.json): `candidate_list / bulletin / early_voting / polling_place` を追加
- [el-mun-41208-assembly-2026.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-41208-assembly-2026.json): `candidate_list / bulletin / early_voting / polling_place` を追加
- [el-mun-46204-mayor-2026.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-46204-mayor-2026.json): `candidate_list / early_voting / polling_place` を追加
- [el-by-mun-46204-assembly-2026-01.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-by-mun-46204-assembly-2026-01.json): `candidate_list / early_voting / polling_place` を追加
- [el-mun-47214-mayor-2025.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-mun-47214-mayor-2025.json): `candidate_list / early_voting / polling_place` を追加
- [el-by-mun-47214-assembly-2025-01.json](C:/Users/shimo/Desktop/election/data/v1/election_resource_links/el-by-mun-47214-assembly-2025-01.json): `candidate_list / early_voting / polling_place` を追加
- 残り 7 件: `keep_other` として固定

それ以前の structured 化済み一覧は [HANDOFF_2026-04-10.md](C:/Users/shimo/Desktop/election/docs/HANDOFF_2026-04-10.md) を参照。

## 5. 現在の otherOnly 7 件

現時点で `otherOnly` に残っているのは次の 7 件である。

| election_id | 現在タイトル | page_role | action | 理由 |
| --- | --- | --- | --- | --- |
| `el-pref-15-governor-2026` | 令和8年選挙執行一覧 | schedule | `keep_other` | 執行一覧であり、単一の実用 kind に絞れない |
| `el-pref-20-governor-2022` | 過去の選挙結果メインページ | archive | `keep_other` | 過去結果の入口ページであり、知事選単独の child link としては弱い |
| `el-pref-29-governor-2023` | 奈良県知事選挙及び奈良県議会議員選挙 投開票速報 | result+hubs | `keep_other` | 速報ページと案内ページはあるが、安全な `candidate_list / bulletin` を確定できていない |
| `el-pref-35-governor-2026` | 令和8年2月8日執行 山口県知事選挙の投開票の状況 | result | `keep_other` | 投票結果・開票結果中心で、再利用可能な child link が弱い |
| `el-pref-41-governor-2022` | 佐賀県知事選挙（令和4年12月18日執行）関係情報 | result+hubs | `keep_other` | 関係情報ページは結果・投票状況中心で、独立した `candidate_list / bulletin` を安全に確認できない |
| `el-pref-43-governor-2024` | 熊本県知事選挙 開票結果 | result-pdf | `keep_other` | 開票結果 PDF であり、候補者一覧や公報ではない |
| `el-pref-46-governor-2024` | 鹿児島県知事選挙投開票速報 | result | `keep_other` | 投開票速報と期日前投票状況までは確認できるが、安全な child link を確定できていない |

## 6. 現時点の結論

1. `otherOnly` は 7 件まで減らしたまま、新規 seed 18 件を追加できたので、残件を `other` のまま維持する判断を明文化する段階に入っている
2. 現行ルールのまま `otherOnly = 0` を狙うより、残件 7 県を `keep_other` として固定する方が安全である
3. 追加確認を再開するのは、判断ルールを変える場合か、新しい公式 child link が見つかった場合に限る

## 7. 次の実行順

1. 現時点では、残り 7 件を `keep_other` として扱い、coverage は一旦閉じる
2. 次回再開時は、[HANDOFF_2026-04-10.md](C:/Users/shimo/Desktop/election/docs/HANDOFF_2026-04-10.md) の baseline 件数をそのまま使う
3. 再開する場合は、まずルール変更の有無を整理してから individual review に入る
