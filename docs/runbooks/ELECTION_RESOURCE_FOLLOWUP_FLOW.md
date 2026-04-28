# 告示後 公式リソース再確認フロー

最終更新: 2026-04-28
ステータス: Draft v1

関連:
- [選挙データ](/home/shimo/election/data/v1/elections.json)
- [公式リンクデータ](/home/shimo/election/data/v1/election_resource_links)
- [市長選 公式リンク右欄チェックフロー](/home/shimo/election/docs/runbooks/MAYOR_RESOURCE_LINK_PANEL_CHECK_FLOW.md)
- [再確認リスト生成スクリプト](/home/shimo/election/scripts/current/list-election-resource-followups.mjs)

## 1. 目的

告示日以後に公開されることが多い `candidate_list` と `bulletin` を取り逃がさないための再確認フロー。

告示前に候補者一覧や選挙公報が未掲載なのは自然なので、未掲載を欠落として扱わず、告示翌営業日以後に確認対象として機械的に出す。

## 2. 対象リンク

標準対象:

- `candidate_list`: 立候補者一覧、立候補届出状況、選挙長告示など、告示後の公式候補者情報
- `bulletin`: 選挙公報ページ、選挙公報PDF、公式に公開された候補者公報

対象外:

- 報道記事
- 出馬表明
- 立候補予定者説明会の参加者
- 事前審査の提出者
- 政党・団体の推薦発表
- 公式ページ内の「決まり次第掲載」だけの予告

対象外情報は `data/v1/election_resource_links` に `candidate_list` として入れない。必要な場合は、非公式・候補予定者情報の専用ページまたは別データフローで扱う。

## 3. 再確認日の基準

標準の初回再確認日は、告示日の翌営業日。

- 告示日が日曜日なら、翌日の月曜日
- 告示日が金曜日なら、翌週月曜日
- 祝日は今のスクリプトでは考慮しない。祝日をまたぐ場合は作業者が手動で調整する

初回再確認で未掲載だった場合:

- `candidate_list`: 翌営業日に再確認
- `bulletin`: 2営業日後を目安に再確認し、投票日前週は毎営業日確認
- 投票日前日まで未掲載なら、公式ページ上で未掲載・未発行・配布のみ等の説明がないか確認する

## 4. 再確認リストを出す

5月・6月選挙の候補者一覧・選挙公報を確認する例:

```bash
node scripts/list-election-resource-followups.mjs --from 2026-05-01 --to 2026-06-30 --as-of 2026-04-28
```

市長選だけに絞る場合:

```bash
node scripts/list-election-resource-followups.mjs --from 2026-05-01 --to 2026-06-30 --subtype mayor --as-of 2026-04-28
```

JSONで取り出す場合:

```bash
node scripts/list-election-resource-followups.mjs --from 2026-05-01 --to 2026-06-30 --format json
```

## 5. ステータスの読み方

| status | 意味 | 対応 |
|---|---|---|
| `scheduled` | 再確認日は未来 | 予定表に入れる |
| `due` | 再確認日を過ぎ、対象リンクが未登録 | その日の優先確認対象 |
| `past_vote_missing` | 投票日後も対象リンクが未登録 | 監査対象。公式記録として拾えるか確認 |
| `needs_notice_date` | 告示日がない | `data/v1/elections.json` の日程確認を先に行う |
| `complete` | 対象リンクが登録済み | 通常は出力しない。`--include-complete` で表示 |

優先度:

- `P0`: すぐ確認する
- `P1`: 7日以内に再確認日が来る、または日程情報が不足
- `P2`: 予定として保持

## 6. 作業手順

1. 再確認リストを出す。
2. `P0` を上から処理する。`P0` がなければ近日の `P1` を予定に入れる。
3. 既存の `source_url` と `other` リンクから、対象選挙の公式ページを開く。
4. 自治体・都道府県選管・総務省など公式ソースだけを見る。
5. `candidate_list` として使える公式候補者情報があるか確認する。
6. `bulletin` として使える選挙公報ページまたはPDFがあるか確認する。
7. 実体が公開されていれば `data/v1/election_resource_links/{election_id}.json` に追加する。
8. 予告だけなら追加しない。監査メモに「公式未掲載」と記録する。
9. `node scripts/current/validate-data-v1.mjs` を通す。
10. `node scripts/generate-site-data.mjs` で公開データを更新する。
11. `node --check site/data/site-data.js` と `node --check site/assets/app.js` を通す。

## 7. 登録時の注意

- 公式ページ内に候補者一覧と選挙公報が同じページで掲載されている場合、同じURLでも `candidate_list` と `bulletin` を別レコードにしてよい。
- 市長選と市議選・市議補選が同時選挙の場合、`title` と `summary` で同時選挙であることが分かるようにする。
- PDF直リンクを入れる場合、公式ページからリンクされていることを確認する。
- 候補者一覧や公報がPDFの場合、タイトルに `PDF` と書くか、summaryでPDFであることが分かるようにする。
- 公式候補者一覧が公開された後でも、報道ベースの候補者情報は `candidate_list` とは別扱いにする。

## 8. 監査記録

月単位・期間単位で `docs/audits/` に記録する。最低限、以下を残す。

- 実行日
- 対象期間
- 実行コマンド
- 件数
- `due` / `scheduled` / `complete` の内訳
- その日に確認した選挙
- 追加したリンク
- 公式未掲載だったリンク種別
- 次回再確認日
