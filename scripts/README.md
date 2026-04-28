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
- `sync-current-mayor-regions.mjs`: 総務省コード表から現職市長台帳に必要な市レコードを `regions.json` へ補完する
- `generate-current-mayors-data.mjs`: 現職市長台帳の初期正本 JSON を生成する
- `generate-current-mayors-page.mjs`: `data/v1/current_mayors/canonical.json` から公開表を生成する
- `generate-prefectural-assembly-terms-page.mjs`: `data/v1/prefectural_assembly_terms.json` から県議会任期台帳ページを生成する
- `generate-prefectural-assembly-districts-page.mjs`: `data/v1/prefectural_assembly_districts.json` から県議選挙区・定数台帳ページを生成する
- `generate-prefectural-assembly-official-links-page.mjs`: `data/v1/prefectural_assembly_official_links.json` から県議会公式リンク台帳ページを生成する
- `list-election-resource-followups.mjs`: 告示後に再確認する候補者一覧・選挙公報などの不足リストを出す
- `deploy-election.ps1`: PowerShell デプロイ補助

## Operating Rule

- 現行運用で優先するのは `generate-site-data.mjs` と `validate-data-v1.mjs`
- `generate-legacy-data.mjs` は legacy 互換維持が必要な場合だけ使う
- `deploy-election.ps1` は移行完了まで残すが、WSL 移行後の常用手順としては扱わない
- 新しいスクリプトを追加するときは、生成対象か検証対象かが分かる名前にする
