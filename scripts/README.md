# Scripts

このディレクトリは、データ生成、検証、配備補助のスクリプト置き場です。

## Current Files

- `current/`: 現行運用の本体スクリプト
- `legacy/`: 互換維持や旧運用のスクリプト
- ルート直下の同名ファイル: 後方互換のための薄いラッパー

主なラッパー:

- `generate-site-data.mjs`: `data/v1` から `site/data/site-data.js` を生成する
- `validate-data-v1.mjs`: `data/v1` の整合性を検証する
- `generate-legacy-data.mjs`: `data/v1` から legacy 互換の `data/*.js` を再生成する
- `generate-governor-term-inventory.mjs`: `data/governor-term-inventory.js` や棚卸し表を生成する
- `deploy-election.ps1`: PowerShell デプロイ補助

## Operating Rule

- 現行運用で優先するのは `generate-site-data.mjs` と `validate-data-v1.mjs`
- `generate-legacy-data.mjs` は legacy 互換維持が必要な場合だけ使う
- `deploy-election.ps1` は移行完了まで残すが、WSL 移行後の常用手順としては扱わない
- 新しいスクリプトを追加するときは、生成対象か検証対象かが分かる名前にする
