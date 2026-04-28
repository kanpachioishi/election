# Review Record Template

作成日: YYYY-MM-DD  
review_id: review-YYYYMMDD-slug  
work_id: work-YYYYMMDD-slug  
status: draft / changes_requested / approved  
reviewer:  
self_review: false  

## 1. レビュー対象

対象ブランチまたはコミット:

対象ファイル:

- 

## 2. 変更概要

- 

## 3. 出典レビュー

確認項目:

- [ ] 公式ソースが使われている
- [ ] `source_url` が確認できる
- [ ] `confirmed_at` または確認日がある
- [ ] 非公式情報を公式リンクとして扱っていない
- [ ] 選挙名、地域、日付の対応が説明できる

指摘:

- 

## 4. データレビュー

確認項目:

- [ ] `data/v1` の正本が更新されている
- [ ] 生成物を正本として編集していない
- [ ] ID、地域、種別、日付が整合している
- [ ] `verification.status` が妥当
- [ ] validator が通っている

指摘:

- 

## 5. 表示レビュー

確認項目:

- [ ] 出典、確認日、公式リンクが表示される
- [ ] 未確認情報を確定情報として見せていない
- [ ] 中立性を損なう表現がない
- [ ] スマホで読める構成になっている
- [ ] 関連ページへの導線がある

指摘:

- 

## 6. 検証結果

実行したコマンド:

```bash

```

結果:

- 

## 7. 判定

判定:

- approved / changes_requested / blocked

公開前に必要な対応:

- 

残リスク:

- 
