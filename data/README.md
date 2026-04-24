# Data Layout

`data/` は、正本データと browser 互換用の派生データを同居させているディレクトリです。

## Canonical Source

- `v1/` が正本です
- 編集対象は原則として `data/v1/` 配下です

主な正本:

- `data/v1/regions.json`
- `data/v1/elections.json`
- `data/v1/local_government_sites.json`

## Transitional Compatibility Files

ルート直下の次のファイルは、旧ページや互換用途のために残している派生物です。

- `data/elections.js`
- `data/regions.js`
- `data/governor-term-inventory.js`

これらは browser から相対参照されるため、現時点では `data/` 直下に残しています。

## Operating Rule

- `data/*.js` を手編集しない
- 正本を直したいときは `data/v1/` を編集する
- `data/elections.js` と `data/regions.js` は `node scripts/generate-legacy-data.mjs` で再生成する
- `data/governor-term-inventory.js` は `node scripts/generate-governor-term-inventory.mjs --format js --write data/governor-term-inventory.js` で再生成する

## Why Files Stay At Root

`pages/` や一部の legacy ページは `../data/*.js` を直接読む構成です。移行途中で参照パスを増やして複雑化させないため、互換ファイルは root-level のまま維持します。
