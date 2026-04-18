# Mayor Link Source Inventory

最終更新: 2026-04-17 JST

このメモは、市長選の `election_resource_links` を追加するときに、
「どこから探し始めればよいか」
「どの公式ページで何が見つかったか」
を次回のために残す作業メモです。

目的は 2 つです。

- 数年後の同じ自治体の市長選で、リンク探索をゼロからやり直さない
- `候補者一覧 / 選挙公報 / 期日前投票 / 投票所` のどれが、どの公式ページから出やすいかを記録する

## 基本ルール

- まずは市選挙管理委員会か市公式の「選挙」ページを探す
- 見出しが `市長選挙` 単独ページなら最優先で確認する
- 総合案内ページしかない場合は、その中に `候補者一覧 / 公報 / 期日前投票 / 投票所` の child link があるかを見る
- PDF の直 URL だけで終わらず、必ず親の公式案内ページも記録する
- 次回のために、入口クエリと「何が取れたか」をこのファイルへ残す

## 4/19 投票の市長選で見た入口

### 近江八幡市長選挙

- 入口:
  - `近江八幡市長選挙 2026`
  - `近江八幡市長選挙 市公式`
- 使った source:
  - https://www.city.omihachiman.lg.jp/gyosei/senkyo/20309.html
- この source で拾えたもの:
  - `other`
- メモ:
  - 市長選と市議補選をまとめた公式案内ページ
  - まずはここを起点にすればよく、個別 child link は後日増える可能性がある

### 市川市長選挙

- 入口:
  - `市川市長選挙 令和8`
  - `市川市長選挙 市公式`
- 使った source:
  - https://www.city.ichikawa.lg.jp/ele01/0000385396.html
- この source で拾えたもの:
  - `other`
  - `candidate_list`
  - `bulletin`
  - `early_voting`
  - `polling_place`
- メモ:
  - 1 枚の総合ページから主要導線がかなりそろう
  - 市長選と市議補選の情報がまとまっているので、リンク title は対象を見失わないように書く

### 久喜市長選挙

- 入口:
  - `久喜市長選挙 令和8`
  - `久喜市長選挙 市公式`
- 使った source:
  - https://www.city.kuki.lg.jp/shisei/senkyo/shicho-shigi/1011224.html
  - https://www.city.kuki.lg.jp/shisei/senkyo/shicho-shigi/1012715.html
  - https://www.city.kuki.lg.jp/shisei/senkyo/shicho-shigi/1012578.html
- この source で拾えたもの:
  - `other`
  - `candidate_list`
  - `bulletin`
  - `early_voting`
  - `polling_place`
- メモ:
  - 総合案内から `立候補届出状況` `選挙公報について` `期日前投票所について` `市内投票所` へ child page が分かれる型
  - 市長選と市議会議員一般選挙の同時実施なので、議会選 record 追加の起点にもそのまま使える

### 久留米市長選挙

- 入口:
  - `久留米市長選挙 令和8`
  - `久留米市長選挙 無投票 市公式`
- 使った source:
  - https://www.city.kurume.fukuoka.jp/1050kurashi/2150senkyo/3040nittei/2025-1208-1448-178.html
- この source で拾えたもの:
  - `other`
- メモ:
  - 久留米は `2026-04-19` ではなく、`2026-01-25` の市長選で無投票
  - ページ本文に候補者、告示日、投票日、期日前投票を行わない旨があるので、この HTML 自体を実体ページとして採用してよい
  - 県 PDF より市側公式が新しく具体的な場合は、市側公式で `vote_date` と `phase` を補正する

### 4/19 まわりのイレギュラー記録

- 大洲市長選挙
  - 使った source:
    - https://www.city.ozu.ehime.jp/soshiki/senkyo/26575.html
  - メモ:
    - `2026-04-19` は投票日ではなく告示日
    - 正しい日程は `2026-04-19 告示 / 2026-04-26 投票`

- 鹿島市長選挙
  - 使った source:
    - https://www.city.saga-kashima.lg.jp/main/38185.html
  - メモ:
    - `2026-04-19` は投票日ではなく告示日
    - 正しい日程は `2026-04-19 告示 / 2026-04-26 投票`

- 妙高市長選挙
  - 使った source:
    - https://www.city.myoko.niigata.jp/docs/1719.html
    - https://www.city.myoko.niigata.jp/group-navi/soumu/soumu-housei/
    - https://www.city.myoko.niigata.jp/docs/78553.html
  - メモ:
    - `主な選挙の種類と概要` では任期満了日 `令和8年11月24日` を確認
    - `妙高市長選挙等の期日等について` 本文で `2026-11-08 告示 / 2026-11-15 投票` を確認
    - 市長選と同日に `妙高市議会議員補欠選挙` を実施予定
    - 新潟県 source の `2026-04-19 投票` は誤認だったので、市公式本文を優先して補正した

### 能代市長選挙

- 入口:
  - `能代市長選挙 2026`
  - `能代市長選挙 市公式`
- 使った source:
  - https://www.city.noshiro.lg.jp/section/office/senkyo-office/senkyo/27187
  - https://www.city.noshiro.lg.jp/section/office/senkyo-office/senkyo/27115
- この source で拾えたもの:
  - `other`
  - `candidate_list`
  - `bulletin`
  - `early_voting`
- メモ:
  - 市の選挙セクション配下に選挙別ページが出る型
  - `候補者届出状況` ページから市長選と市議選の候補者一覧 PDF を直リンクで取れた
  - 選挙特集号 PDF は市長選と市議選の共通導線として使える
  - 期日前投票は総合ページ本文に載っているので、HTML 自体をそのまま採用してよい

### 栃木市長選挙

- 入口:
  - `栃木市長選挙 令和8`
  - `栃木市長選挙 市公式`
- 使った source:
  - https://www.city.tochigi.lg.jp/soshiki/58/87417.html
  - https://www.city.tochigi.lg.jp/soshiki/58/2581.html
  - https://www.city.tochigi.lg.jp/soshiki/58/1420.html
- この source で拾えたもの:
  - `other`
  - `bulletin`
  - `polling_place`
- メモ:
  - 日程確認は `87417.html`、総合案内は `2581.html`、投票所は別ページ `1420.html` で分かれていた
  - 市長選と市議選の選挙公報 PDF は総合案内ページから直リンクで取れた
  - URL だけでは対象選挙が分かりにくいので、ページ見出しを必ず確認する

### 坂井市長選挙

- 入口:
  - `坂井市長選挙 令和8`
  - `坂井市長選挙 市公式`
- 使った source:
  - https://www.city.fukui-sakai.lg.jp/somu/shisei/senkyo/shikumi/shicho-senkyo-nittei.html
  - https://www.city.fukui-sakai.lg.jp/somu/event/20260419kizitumae.html
- この source で拾えたもの:
  - `other`
  - `early_voting`
  - `polling_place`
- メモ:
  - 日程確認ページと期日前投票ページが分かれていた
  - 投票所一覧は親ページ内の PDF 導線ではなく、PDF の直リンクまで切った
  - 候補者一覧や公報は今回確認できなかったので、次回も親ページから再確認する

### 北名古屋市長選挙

- 入口:
  - `北名古屋市長選挙 令和8`
  - `北名古屋市長選挙 市公式`
- 使った source:
  - https://www.city.kitanagoya.lg.jp/shisei/senkyo/1006115/1005573.html
  - https://www.city.kitanagoya.lg.jp/shisei/senkyo/1006116/1005557.html
  - https://www.city.kitanagoya.lg.jp/shisei/senkyo/1006114/1005554.html
- この source で拾えたもの:
  - `other`
  - `early_voting`
  - `polling_place`
- メモ:
  - 市の選挙カテゴリ配下に市長選ページがある
  - `期日前投票` と `投票所一覧` は市長選専用ページではなく、恒常的な案内ページを採用した
  - 本文に必要情報がある HTML なので、中継ページではなく実体ページとして扱ってよい
  - 候補者一覧や公報の追加掲載は今回確認できなかった

### 姶良市長選挙

- 入口:
  - `姶良市長選挙 令和8`
  - `姶良市長選挙 市公式`
- 使った source:
  - https://www.city.aira.lg.jp/senkan/senkyo_2026sityosigi.html
- この source で拾えたもの:
  - `other`
  - `candidate_list`
  - `bulletin`
  - `early_voting`
  - `polling_place`
- メモ:
  - 総合ページ 1 本から、候補者一覧 PDF、公報 PDF、`期日前投票` ページ、`一般選挙投票所` ページへ降りられる
  - 市長選と市議選の併記ページなので、市長選向けの direct link を切って使う
  - 同じ source から `姶良市議会議員選挙における候補者について` の PDF も取れるので、議会選 record 追加時の起点にも使える

### 大崎市長選挙

- 入口:
  - `大崎市長選挙 令和8`
  - `大崎市長選挙 市公式`
- 使った source:
  - https://www.city.osaki.miyagi.jp/shisei/soshikikarasagasu/senkyokanriiinkaijimukyoku/1/21254.html
  - https://www.city.osaki.miyagi.jp/shisei/shiseijoho/senkyo/5619.html
- この source で拾えたもの:
  - `other`
  - `candidate_list`
  - `bulletin`
  - `early_voting`
  - `polling_place`
- メモ:
  - 市の組織別ページ配下に選挙案内が出る型
  - 総合ページから市長選と市議選の候補者一覧 PDF、公報 PDF を直リンクで取れた
  - 投票所一覧は別ページ `5619.html` に分かれていた
  - 期日前投票は総合ページ本文に載っているので、HTML 自体をそのまま採用してよい

### 小林市長選挙

- 入口:
  - `小林市長選挙 令和8`
  - `小林市長選挙 市公式`
- 使った source:
  - https://www.city.kobayashi.lg.jp/soshikikarasagasu/senkyokanriiinkaijimukyoku/oshirase/5008.html
- この source で拾えたもの:
  - `other`
  - `bulletin`
  - `early_voting`
  - `polling_place`
- メモ:
  - 市の選管お知らせページが主導線
  - 候補者一覧はこの時点では未確認で、公報・期日前・投票所の方が早く出ていた

## 4/19 調査で見えた再利用ルール

- `市長選挙 市公式` のような単純クエリで、市選管か市公式選挙ページに当たることが多い
- 強い自治体は、総合ページ 1 本で `候補者一覧 / 公報 / 期日前投票 / 投票所` がそろう
- 弱い自治体は、まず `other` 相当の総合案内だけ確保して、child link は後日増やす方が安全
- `市長選 + 市議補選` の同居ページはよくあるので、summary で対象を明示する
- URL 文字列だけでは内容が分からないページが多いので、ページ見出しと本文の対象選挙を必ず見る

## 未整理メモ

- `2026-04-17` 時点で 4/19 扱いの一部 record は、別日程の可能性があるため再点検余地がある
- 次回は `久留米 / 大洲 / 鹿島 / 妙高` から再確認すると効率がよい

## 運用メモ

- 市長選の `election_resource_links` を追加したら、このファイルに
  - 入口クエリ
  - 実際に見た公式ページ
  - そこで拾えた `kind`
  - 次回の注意点
  を追記する
- child link だけ追加した場合でも、親ページがどこだったかは必ず残す
- 似た構造の自治体が多いので、「どの課の配下に出るか」まで書くと次回の探索が速い
