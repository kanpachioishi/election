# Work Request Template

作成日: YYYY-MM-DD  
work_id: work-YYYYMMDD-slug  
status: draft  
priority: P0 / P1 / P2  
manager:  
owner:  
reviewer:  
target_release:  

## 1. 目的

この作業で何を達成するかを書く。

## 2. 背景

なぜ今この作業が必要かを書く。

## 3. スコープ

含めるもの:

- 

含めないもの:

- 

## 4. 対象ファイル

編集予定:

- 

生成または確認対象:

- 

## 5. 公式ソース

| 種別 | ラベル | URL | 公開日 | 確認日 | メモ |
| --- | --- | --- | --- | --- | --- |
| official |  |  |  |  |  |

## 6. 完了条件

- 

## 7. 作業手順

1. 
2. 
3. 

## 8. 検証コマンド

```bash
node scripts/current/validate-data-v1.mjs
node scripts/generate-site-data.mjs
node scripts/current/validate-data-v1.mjs
```

追加で必要な確認:

```bash

```

## 9. レビュー観点

- 公式ソースに基づいている
- 出典 URL と確認日が残っている
- 未確認情報を確定情報として表示していない
- 生成物を正本として編集していない
- 表示上の誤認リスクがない

## 10. リリース判断

公開する:

- yes / no

公開前に残っている確認:

- 

## 11. メモ

- 
