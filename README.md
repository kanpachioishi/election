# Election Workspace

このリポジトリは、選挙と地方自治に関するサイト運営のための正規ワークスペースです。

以前は Windows Desktop 上の `election` フォルダで運用していましたが、現在は `WSL` 上のこのリポジトリを正本として扱います。

## Current Structure

```text
/
  AGENTS.md
  README.md
  common/              # legacy static pages 用の共有CSS
  data/                # legacy互換データと canonical data/v1
    v1/                # canonical source of truth
  docs/                # 運用メモ、仕様、計画、引き継ぎ
  artifacts/           # 検証画像、一次成果物、作業用出力
  pages/               # legacy static pages
  scripts/             # generators / validators / deploy helpers
  site/                # 現行の公開用静的サイト
  workers/             # 周辺 worker / bot
```

## Canonical Rules

- 現行公開物は `site/`
- 正本データは `data/v1/`
- `data/elections.js` `data/regions.js` `data/governor-term-inventory.js` は legacy 互換用の派生ファイル
- `pages/` と `common/` は legacy 系の静的ページ資産
- `scripts/current/` は現行運用、`scripts/legacy/` は互換維持用
- `artifacts/` は公開物ではなく、確認画像や作業成果物の置き場
- `artifacts/private/` は非公開の調査補助データや一括更新素材の置き場

## Working Policy

- 基本方針は、ローカルの `WSL` ワークスペースで編集と確認を進め、変更がまとまった段階でまとめてデプロイすること
- 公開前に `validate` と生成処理を通し、差分を確認してから `git commit` と `git push` を行う

## Typical Commands

サイト表示:

```bash
python3 -m http.server 4173 --directory site
```

データ検証:

```bash
node scripts/validate-data-v1.mjs
```

公開用データ再生成:

```bash
node scripts/generate-site-data.mjs
```

legacy 互換データ再生成:

```bash
node scripts/generate-legacy-data.mjs
```

## Near-Term Direction

直近の方針は、現行系 (`site/`, `data/v1/`, `scripts/`) と legacy 系 (`pages/`, `common/`, `data/*.js`) を明示的に分けたまま、依存関係を把握しつつ段階的に整理することです。
