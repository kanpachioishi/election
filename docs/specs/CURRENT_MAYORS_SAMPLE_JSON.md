# 現職市長台帳 サンプル JSON

最終更新: 2026-04-23
ステータス: Draft v0
関連: [現職市長台帳スキーマ案](/home/shimo/election/docs/specs/CURRENT_MAYORS_SCHEMA_DRAFT.md)

## 1. 県別ファイルの最小サンプル

```json
{
  "schema_version": 1,
  "generated_at": "2026-04-23T18:00:00+09:00",
  "pref_code": "10",
  "pref_slug": "gunma",
  "pref_name": "群馬県",
  "records": [
    {
      "id": "mayor-mun-10209",
      "region_id": "mun-10209",
      "pref_code": "10",
      "municipality_code": "10209",
      "city_name": "藤岡市",
      "city_slug": "fujioka",
      "mayor_name": "新井 雅博",
      "mayor_name_kana": "あらい まさひろ",
      "term_start": "2022-05-10",
      "term_end": "2026-05-09",
      "term_note": "令和4年4月24日無投票当選で2期目。任期満了日は令和8年5月9日。",
      "status": "confirmed",
      "investigated_at": "2026-04-23",
      "sources": [
        {
          "kind": "term_expiry_list",
          "title": "任期満了一覧表",
          "url": "https://example.jp/gunma/term-expiry.pdf",
          "checked_at": "2026-04-23",
          "used_for": ["term_end"],
          "publisher": "群馬県",
          "note": null
        },
        {
          "kind": "official_profile",
          "title": "市長プロフィール",
          "url": "https://example.jp/fujioka/mayor/profile",
          "checked_at": "2026-04-23",
          "used_for": ["mayor_name", "mayor_name_kana", "term_note"],
          "publisher": "藤岡市",
          "note": "2期目を確認"
        }
      ],
      "note": "term_start は term_end から4年任期で補完"
    }
  ]
}
```

## 2. `status = conflict` のサンプル

```json
{
  "id": "mayor-mun-02202",
  "region_id": "mun-02202",
  "pref_code": "02",
  "municipality_code": "02202",
  "city_name": "弘前市",
  "city_slug": "hirosaki",
  "mayor_name": "谷川 政人",
  "mayor_name_kana": null,
  "term_start": null,
  "term_end": "2030-04-15",
  "term_note": null,
  "status": "conflict",
  "investigated_at": "2026-04-23",
  "sources": [
    {
      "kind": "official_profile",
      "title": "市長プロフィール",
      "url": "https://example.jp/hirosaki/mayor",
      "checked_at": "2026-04-23",
      "used_for": ["mayor_name"],
      "publisher": "弘前市",
      "note": null
    },
    {
      "kind": "term_expiry_list",
      "title": "任期満了日一覧",
      "url": "https://example.jp/aomori/term-expiry.pdf",
      "checked_at": "2026-04-23",
      "used_for": ["term_end"],
      "publisher": "青森県",
      "note": null
    }
  ],
  "note": "任期開始日の一次情報が見つからず、4年逆算と就任記事の日付が食い違ったため要再確認"
}
```

## 3. `status = missing_source` のサンプル

```json
{
  "id": "mayor-mun-99999",
  "region_id": "mun-99999",
  "pref_code": "99",
  "municipality_code": "99999",
  "city_name": "サンプル市",
  "city_slug": "sample-city",
  "mayor_name": "確認中",
  "mayor_name_kana": null,
  "term_start": null,
  "term_end": null,
  "term_note": null,
  "status": "missing_source",
  "investigated_at": "2026-04-23",
  "sources": [],
  "note": "自治体公式の現職市長確認ページと県の任期満了資料をまだ特定できていない"
}
```

## 4. 初期実装で避けること

- `sources` を文字列だけで持つこと
- `investigated_at` を省略すること
- 補完理由を `note` なしで済ませること
- `status = confirmed` なのに `sources` が空であること
