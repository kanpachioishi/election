# 現職市長検証 Skill 出力フォーマット案

最終更新: 2026-04-23
ステータス: Draft v0
関連: [現職市長台帳スキーマ案](/home/shimo/election/docs/specs/CURRENT_MAYORS_SCHEMA_DRAFT.md)

## 1. 目的

この文書は、県ごとに現職市長情報を調べる skill が、どこへ何を出力するかを固定するための案である。

## 2. 出力先

```text
research/current-mayors/
  findings/
    10-gunma/
      2026-04-23-round1.md
      2026-04-23-round1.sources.json
      2026-04-23-round1.diff.json
```

## 3. 3つの成果物

### 3.1 findings markdown

人が読む要約。

例:

```markdown
# 群馬県 現職市長検証

- investigated_at: 2026-04-23
- prefecture: 群馬県
- cities_checked: 12
- confirmed: 9
- conflict: 2
- missing_source: 1

## 藤岡市
- status: confirmed
- mayor_name: 新井 雅博
- term_end: 2026-05-09
- note: term_start は4年任期で補完

Sources:
1. 任期満了一覧表
2. 市長プロフィール
```

### 3.2 sources json

見た情報源を市ごとに残す機械読取用ファイル。

```json
{
  "pref_code": "10",
  "investigated_at": "2026-04-23",
  "records": [
    {
      "municipality_code": "10209",
      "city_name": "藤岡市",
      "sources": [
        {
          "kind": "term_expiry_list",
          "title": "任期満了一覧表",
          "url": "https://example.jp/term-expiry.pdf",
          "checked_at": "2026-04-23",
          "used_for": ["term_end"]
        }
      ]
    }
  ]
}
```

### 3.3 diff json

現行台帳との差分候補だけを抜き出す。

```json
{
  "pref_code": "10",
  "compared_at": "2026-04-23",
  "changes": [
    {
      "municipality_code": "10209",
      "city_name": "藤岡市",
      "field": "term_end",
      "current_value": "2026-05-08",
      "proposed_value": "2026-05-09",
      "reason": "県の任期満了一覧表に基づく修正"
    }
  ]
}
```

## 4. skill の出力ルール

- skill は `data/v1/current_mayors/` を直接更新しない
- まず `findings` と `sources` と `diff` の 3 点を出す
- `status = conflict` や `missing_source` は markdown にも必ず見出し付きで出す
- 補完した日付は `reason` または `note` に明記する

## 5. 1県1フォルダにする理由

- 再調査しやすい
- 差分レビューしやすい
- 県単位で parallel に回しやすい
- 後で採用済みデータと比較しやすい

## 6. 採用フロー案

1. skill が `findings` を出す
2. 人が `diff.json` をレビューする
3. 問題なければ `data/v1/current_mayors/by_prefecture/*.json` に反映する
4. validator を通す
5. 公開ページへ反映する
