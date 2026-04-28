# 自分の選挙入口 MVP 化

作成日: 2026-04-28

## 目的

サイト全体レビューで不足とした「生活者が自分の地域の次の選挙に到達する入口」を、まずトップページの実装で改善した。

## 対応内容

### トップページの順序変更

- `site/index.html` で「このサイトについて」より前に選挙検索を置いた。
- セクション見出しを「自分の地域の選挙を探す」に変更した。
- 検索欄を「地域・郵便番号3桁・選挙名」として明示した。

### 郵便番号3桁検索の透明化

- 郵便番号は7桁住所解決ではなく、先頭3桁の対応データで候補地域を絞る仕様であることを検索欄の近くに表示した。
- 結果サマリーにも、郵便番号3桁がどの地域に対応したか、または未対応かを表示するようにした。

### 自治体選択フローの改善

- 都道府県フィルターを、地方を選ばなくても使えるようにした。
- 市区町村フィルターは、都道府県を選んだ後に有効になることが分かる表示にした。
- 議会検索側の都道府県フィルターも同じ挙動にそろえた。

### 結果サマリーの追加

- デフォルト時は、掲載中の今後選挙件数を表示する。
- 絞り込み時は、表示件数、全体件数、検索語、地域条件を表示する。
- 郵便番号3桁検索時は、対応状況を補足する。

## 検証

実行済み:

```bash
node --check site/assets/app.js
node - <<'NODE'
const fs = require('fs');
const vm = require('vm');
const dataCode = fs.readFileSync('site/data/site-data.js', 'utf8');
const appCode = fs.readFileSync('site/assets/app.js', 'utf8');
const ids = [
  'heroMetrics','generatedNote','searchInput','macroRegionFilter','prefectureFilter','municipalityFilter','resetFilters','resultSummary','electionList','detail',
  'assemblySearchInput','assemblyMacroRegionFilter','assemblyPrefectureFilter','assemblyMunicipalityFilter','assemblyResetFilters','assemblyResultSummary','assemblyGrid','featuredAssemblyGrid','coverageGrid'
];
function el(id) {
  const listeners = {};
  return {
    id,
    value: '',
    hidden: false,
    disabled: false,
    innerHTML: '',
    textContent: '',
    dataset: {},
    listeners,
    addEventListener(name, fn) { listeners[name] = fn; },
    focus() {},
    click() {},
    scrollIntoView() {},
    querySelectorAll() { return []; },
    classList: { toggle() {}, add() {}, remove() {} },
  };
}
const elements = Object.fromEntries(ids.map((id) => [id, el(id)]));
const context = {
  window: {},
  document: {
    getElementById(id) { return elements[id] ?? el(id); },
    querySelectorAll() { return []; },
  },
  history: { replaceState() {} },
  location: { hash: '' },
  Intl,
  Date,
  URL,
  Math,
  String,
  Object,
  Set,
  Map,
  console,
};
vm.createContext(context);
vm.runInContext(dataCode, context);
vm.runInContext(appCode, context);
if (!elements.electionList.innerHTML.includes('election-card')) throw new Error('election cards did not render');
if (!elements.resultSummary.innerHTML.includes('掲載中の今後の選挙')) throw new Error('summary did not render');
if (elements.prefectureFilter.disabled) throw new Error('prefecture filter should be enabled by default');
elements.searchInput.value = '182';
elements.searchInput.listeners.input({ target: elements.searchInput });
if (!elements.resultSummary.innerHTML.includes('郵便番号3桁 182')) throw new Error('postal summary did not render');
console.log('homepage app smoke passed');
NODE
git diff --check
```

確認結果:

- `homepage app smoke passed`
- `182` 入力時に `郵便番号3桁 182` の結果サマリーが出ることを確認
- `site/assets/app.js` の構文確認は通過
- 空白差分チェックは通過

## 残課題

- 7桁郵便番号から自治体を確定する全国データは未導入。
- 都道府県ページ・市区町村ページの静的生成は未着手。
- 個別選挙ページの汎用テンプレート生成は未着手。
