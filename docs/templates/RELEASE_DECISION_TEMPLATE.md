# Release Decision Template

作成日: YYYY-MM-DD  
release_id: release-YYYYMMDD-slug  
work_id: work-YYYYMMDD-slug  
status: draft / approved / blocked / shipped  
release_manager:  

## 1. 公開対象

対象コミットまたは差分:

対象ページ:

- 

対象データ:

- 

## 2. 公開理由

- 

## 3. 公開前チェック

- [ ] 作業依頼票がある
- [ ] レビュー記録がある
- [ ] 公式ソースが確認済み
- [ ] `node scripts/current/validate-data-v1.mjs` が通る
- [ ] 必要な生成処理が完了している
- [ ] `git diff --stat` で意図しない差分がない
- [ ] 未確認情報を確定情報として公開していない
- [ ] 公開後に確認する URL が決まっている

## 4. 実行コマンド

```bash
node scripts/current/validate-data-v1.mjs
node scripts/generate-site-data.mjs
node scripts/current/validate-data-v1.mjs
git status --short
git diff --stat
```

## 5. 公開後確認 URL

- 

## 6. 判定

判定:

- approved / blocked

理由:

- 

## 7. 公開後メモ

- 
