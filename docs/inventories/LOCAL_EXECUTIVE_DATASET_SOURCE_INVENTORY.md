# Local Executive Dataset Source Inventory

このメモは、`data/v1/elections.json` の首長選 dataset を広げるときに、
「県ごとにどこを見れば upcoming の知事選・市長選を見つけやすいか」を残すための作業メモです。

目的は 2 つです。

- 次回の dataset 拡張で、毎回ゼロから検索しないようにする
- 県ごとの source の癖を残して、どこまで信用して `elections.json` に入れたかを明確にする

## 基本ルール

- まずは都道府県の選挙管理委員会ページか、県の「選挙執行予定一覧」を見る
- `elections.json` 追加時点では、都道府県の公式日程ページだけでも可
- `subtype: "mayor"` に入らない区長・町長・村長は、現時点では別枠として保留する
- ページ化に進むときは、市区町村の公式ページや市選管ページまで掘る
- 日付は必ず `notice_date` と `vote_date` の両方を確認する

## 将来の機械化に向けた方針

- いまは完全に機械的に回すことを優先しない
- その代わり、毎回の作業で「どこを見たか」「どこで迷ったか」「どの source を採用したか」「どんな誤認が起きたか」を md に残す
- 県 source だけで十分だった例と、市 source で上書きが必要だった例を両方ためる
- 同じ種類のイレギュラーが複数回出たら、その時点で処理をルール化し、必要なら script や skill に落とす
- 実装は、記録が十分にたまってから行う。先に自動化を作って無理に現場を合わせない

### 記録しておく判断材料

- 入口検索語
- 最終的に採用した公式 URL
- 県 source と市 source のどちらを優先したか
- `vote_date` と `notice_date` をどのページから読んだか
- `4/19投票` のような誤認がなぜ起きたか
- `同時選挙` `無投票` `任期満了のみ判明` などの例外パターン

### 実装に進んでよい目安

- 同じ県 type の source パターンが複数県で再現している
- 同じ誤認パターンに対する修正手順が 2 回以上言語化できている
- `どの条件なら機械的に採用できるか` と `どの条件なら人手確認に落とすか` を短く書ける
- md の記録だけ見て、別の人でも同じ判断にかなり近づける

## 県別メモ

### 滋賀県

- 入口:
  - `滋賀県 選挙 執行予定 PDF`
  - 県の執行予定一覧 PDF
- 使った source:
  - https://www.pref.shiga.lg.jp/file/attachment/5601690.pdf
- この source で拾えたもの:
  - 滋賀県知事選挙
  - 近江八幡市長選挙
  - 栗東市長選挙
- メモ:
  - PDF 1 本で upcoming の日程確認まで進められる
  - `elections.json` へ入れる一次 source として十分強い
  - ページ化時は各市公式へ降りる

### 千葉県

- 入口:
  - `千葉県 令和8年中に予定される選挙`
- 使った source:
  - https://www.pref.chiba.lg.jp/senkan/chiba-senkyo/r08.html
- この source で拾えたもの:
  - 市川市長選挙
  - 香取市長選挙
  - 勝浦市長選挙
  - 君津市長選挙
  - 八街市長選挙
- メモ:
  - HTML で読みやすく、日程がそのまま取れる
  - `令和8年` など年度ページの URL が年ごとに変わる前提で扱う
  - 各市の公式トップも `regions.json` の verification source として使いやすい

### 東京都

- 入口:
  - `東京都 選挙執行一覧 2026`
  - 東京都選挙管理委員会の選挙執行一覧
- 使った source:
  - https://www.senkyo.metro.tokyo.lg.jp/election/schedule/senkyo2026
- この source で拾えたもの:
  - 狛江市長選挙
  - 調布市長選挙
  - あきる野市長選挙
- メモ:
  - 市長選のほかに区長選も混ざる
  - 現 schema では `subtype: "mayor"` に入る市長選だけ採用した
  - 小金井市長選のように、一覧時点で日程未確定のものは保留した

### 埼玉県

- 入口:
  - `埼玉県 県内の市町村選挙の日程`
- 使った source:
  - https://www.pref.saitama.lg.jp/e1701/election-schedule.html
- この source で拾えたもの:
  - 久喜市長選挙
  - 蓮田市長選挙
  - 羽生市長選挙
  - 鴻巣市長選挙
  - 東松山市長選挙
  - 草加市長選挙
  - 三郷市長選挙
- メモ:
  - 市長選と町長選、議員選が混在する
  - 行をそのまま読むとズレる箇所があるので、`選挙の種類 / 告示日 / 選挙期日` をセットで確認する
  - `久喜市長選挙` のように投票日が近いものも dataset には入れておく

### 群馬県

- 入口:
  - `群馬県 市町村 任期満了日・選挙執行予定一覧`
- 使った source:
  - https://www.pref.gunma.jp/page/618888.html
- この source で拾えたもの:
  - 藤岡市長選挙
  - 沼田市長選挙
  - 富岡市長選挙
  - 安中市長選挙
  - みどり市長選挙
- メモ:
  - `市町村選挙執行（予定）一覧` に `選挙の種類 / 告示日 / 投票日` がまとまっていて強い
  - 市長選だけでなく町村長選、議員選、便乗補選も混ざる
  - `2026-04-15` 時点では `富岡 / 安中 / みどり` は直近で終わっていたので archived、`沼田` は upcoming として扱った

### 神奈川県

- 入口:
  - `神奈川県 選挙日程 令和4年度`
- 使った source:
  - https://www.pref.kanagawa.jp/docs/em7/cnt/f5/2022senkyonittei.html
- この source で拾えたもの:
  - 茅ヶ崎市長選挙
  - 逗子市長選挙
  - 厚木市長選挙
- メモ:
  - 令和4年度ページに `告示日 / 選挙期日` が直接あるため archived の backfill に使える
  - 次回 2026 年度分は別 PDF で `任期満了` だけ見えており、exact date は今後の市側公式確認が必要
  - `2026-04-16` 時点で `茅ヶ崎 / 逗子 / 厚木` の次回 exact date を市側公式検索で再確認したが、まだ明示ページは見当たらなかった

### 秋田県

- 入口:
  - `秋田県 令和8年中の選挙日程`
- 使った source:
  - https://www.pref.akita.lg.jp/pages/archive/93007
- この source で拾えたもの:
  - 能代市長選挙
- メモ:
  - HTML ページに `告示日 / 投票日` がそのまま書かれていて強い
  - 市長選以外に市議選や町長選も同じ一覧に混ざる

### 栃木県

- 入口:
  - `栃木県 県内市町長・議会議員選挙`
- 使った source:
  - https://www.pref.tochigi.lg.jp/k05/pref/senkyo/jyouhou/sityoutyougikaigiin_senkyoyotei.html
- この source で拾えたもの:
  - 栃木市長選挙
  - 下野市長選挙
- メモ:
  - 県ページに `任期満了日 / 告示日 / 選挙期日` がまとまっている
  - 市長選と議会選、町長選が混在するので、`選挙別` 列を見て切り分ける

### 青森県

- 入口:
  - `青森県 市町村選挙日程等`
  - `青森県 市町村長 [101KB]`
- 使った source:
  - https://www.pref.aomori.lg.jp/soshiki/senkan/nittei.html
  - https://www.pref.aomori.lg.jp/soshiki/senkan/files2/R080402_tyou.pdf
- この source で拾えたもの:
  - 弘前市長選挙
  - 五所川原市長選挙
  - 黒石市長選挙
- メモ:
  - 県ページから直接 PDF に入れる
  - PDF 冒頭に「市町村からの報告があったものを掲載」と明記されていて使いやすい
  - `2026-04-15` 時点では `弘前` は archived、`五所川原 / 黒石` は upcoming として扱える

### 岩手県

- 入口:
  - `岩手県 市町村の選挙執行予定`
- 使った source:
  - https://www.pref.iwate.jp/iinkai/senkyo/1015586.html
  - https://www.pref.iwate.jp/_res/projects/default_project/_page_/001/015/586/080316yotei.pdf
- この source で拾えたもの:
  - 宮古市長選挙
  - 八幡平市長選挙
- メモ:
  - 県ページに PDF への導線があり、PDF 1 本で `告示日 / 執行日` を確認できる
  - 同じ表に町長選や議員選も載るので、市名で拾ってから `首長` 側を見る

### 福井県

- 入口:
  - `福井県 選挙日程`
- 使った source:
  - https://www.pref.fukui.lg.jp/doc/senkan/nittei/senkyo-nittei.html
  - https://www.pref.fukui.lg.jp/doc/senkan/nittei/senkyo-nittei_d/fil/109.pdf
- この source で拾えたもの:
  - あわら市長選挙
  - 越前市長選挙
  - 坂井市長選挙
  - 大野市長選挙
- メモ:
  - PDF が 1 ページで、`市町長選挙` の欄をそのまま読める
  - `越前市` のような辞職選挙も同じ欄に混ざる
  - `美浜町` は任期満了だけで exact date 未記載なので保留にした

### 岐阜県

- 入口:
  - `岐阜県 市町村選挙の執行予定`
- 使った source:
  - https://www.pref.gifu.lg.jp/uploaded/attachment/493446.pdf
- この source で拾えたもの:
  - 美濃加茂市長選挙
  - 岐阜市長選挙
- メモ:
  - PDF 冒頭に `市町村長選挙` がまとまっている
  - `2026-04-15` 時点では `美濃加茂 / 岐阜` はどちらも archived
  - `高山市 / 可児市` は任期満了だけで exact date 未記載だった

### 三重県

- 入口:
  - `三重県 市町選挙の期日 R8`
- 使った source:
  - https://www.pref.mie.lg.jp/SENKAN/HP/000230382_00008.htm
- この source で拾えたもの:
  - 名張市長選挙
- メモ:
  - HTML 本文に `市町長の選挙期日等` の表がそのまま出ていて読みやすい
  - 町長選も同じ表に入るので、市だけ拾う
  - `2026-04-15` 時点では `名張` は archived

### 島根県

- 入口:
  - `島根県 あなたのまちの選挙`
  - `島根県 選挙執行予定 PDF`
- 使った source:
  - https://www.pref.shimane.lg.jp/admin/commission/senkyo/shimane_senkyo/yotei.html
  - https://www.pref.shimane.lg.jp/admin/commission/senkyo/shimane_senkyo/anatano/shikkouyotei.data/R080202_senkyo_yotei.pdf
- この source で拾えたもの:
  - 江津市長選挙
- メモ:
  - HTML では入口だけで、exact date は PDF 側で確認する
  - `大田市` は市議選のみ、`江津市` が市長選として upcoming
  - `海士町 / 奥出雲町 / 美郷町` は町長で schema 外なので保留

### 愛知県

- 入口:
  - `愛知県 選挙執行予定`
- 使った source:
  - https://www.pref.aichi.jp/soshiki/gyousei-kansa/0000012260.html
- この source で拾えたもの:
  - 北名古屋市長選挙
  - あま市長選挙
  - 津島市長選挙
  - 春日井市長選挙
- メモ:
  - HTML 本文に `告示日 / 選挙期日 / 任期満了日` が並んでいて、そのまま使える
  - 市長選以外も混ざるので、`市長選挙` 行だけ切り出す

### 広島県

- 入口:
  - `広島県 選挙執行予定`
- 使った source:
  - https://www.pref.hiroshima.lg.jp/uploaded/attachment/650690.pdf
- この source で拾えたもの:
  - 府中市長選挙
  - 東広島市長選挙
- メモ:
  - PDF の市長選一覧に `告示日 / 選挙期日` がある
  - `2026-04-15` 時点では `府中` は archived、`東広島` は upcoming

### 愛媛県

- 入口:
  - `愛媛県 選挙執行予定`
- 使った source:
  - https://www.pref.ehime.jp/site/senkyo/48160.html
- この source で拾えたもの:
  - 大洲市長選挙
  - 西条市長選挙
- メモ:
  - HTML の一覧表で exact date まで確認できる
  - `市長 / 市議 / 町長 / 町議` が混ざるので種別の見分けが必要
  - 大洲市長選は県ページだけを急いで見ると `4/19` を投票日と取り違えやすいが、市公式では `4/19 告示 / 4/26 投票`

### 富山県

- 入口:
  - `富山県 選挙日程`
- 使った source:
  - https://www.pref.toyama.jp/500/kensei/kenseiunei/senkyo/iinkai/gs_nittei.html
- この source で拾えたもの:
  - 黒部市長選挙
  - 氷見市長選挙
- メモ:
  - 県の HTML に `告示日 / 投票日` がまとまっていて扱いやすい
  - `2026-04-15` 時点では `黒部` は archived、`氷見` は upcoming

### 大阪府

- 入口:
  - `大阪府 選挙日程`
- 使った source:
  - https://www.pref.osaka.lg.jp/o010130/senkan/senkan/senkyo_nittei.html
- この source で拾えたもの:
  - 大阪市長選挙
  - 豊中市長選挙
  - 泉南市長選挙
  - 交野市長選挙
  - 貝塚市長選挙
- メモ:
  - HTML の一覧に `告示日 / 選挙期日` があり exact date まで拾える
  - 既存 `regions.json` には大阪市本体が無かったので、`mun-27100` を追加して市長選 record を受けた

### 新潟県

- 入口:
  - `新潟県 市町村選挙日程`
- 使った source:
  - https://www.pref.niigata.lg.jp/site/senkyo/r8-shicyouson-senkyonittei.html
- この source で拾えたもの:
  - 五泉市長選挙
  - 妙高市長選挙
  - 小千谷市長選挙
  - 新発田市長選挙
- メモ:
  - HTML 一覧だけで `告示日 / 選挙期日` まで拾える
  - `2026-04-15` 時点では `五泉` は archived、ほか 3 件は upcoming
  - 妙高市長選は県 source と市側の `妙高市長選挙等の期日等について` に食い違いがあり、市側公式本文で `2026-11-08 告示 / 2026-11-15 投票` に補正した
  - 新潟県は県一覧を入口に使いつつ、市側本文で上書きが必要な例が実際にあった

### 兵庫県

- 入口:
  - `兵庫県 選挙日程`
- 使った source:
  - https://web.pref.hyogo.lg.jp/si01/pa25_000000003.html
- この source で拾えたもの:
  - 加東市長選挙
  - 加古川市長選挙
- メモ:
  - HTML で exact date まで確認できる
  - `2026-04-15` 時点では `加東` は archived、`加古川` は upcoming

### 福岡県

- 入口:
  - `福岡県 選挙一覧`
  - `福岡県 選挙日程 PDF`
- 使った source:
  - https://www.pref.fukuoka.lg.jp/contents/senkyo-ichiran.html
  - https://www.pref.fukuoka.lg.jp/uploaded/attachment/282718.pdf
- この source で拾えたもの:
  - 宗像市長選挙
  - 久留米市長選挙
  - 糸島市長選挙
  - 行橋市長選挙
  - 宮若市長選挙
  - 嘉麻市長選挙
  - 朝倉市長選挙
- メモ:
  - 県ページから PDF に入り、PDF 側で exact date を読む
  - 市長選の本数が多いので、`市` と `市長` の組み合わせで拾うと速い
  - ただし久留米市長選挙のように、市側公式で `2026-01-25` の無投票案内が出ているケースでは、市側公式を優先して date と phase を補正する

### 鹿児島県

- 入口:
  - `鹿児島県 令和8年執行予定選挙`
- 使った source:
  - https://www.pref.kagoshima.jp/ka01/kensei/senkyo/nittei/r8senkyokizitu.html
  - https://www.pref.kagoshima.jp/ka01/kensei/senkyo/nittei/documents/125009_20260306155900-1.pdf
- この source で拾えたもの:
  - 出水市長選挙
  - 姶良市長選挙
- メモ:
  - PDF 側に `告示日 / 投票日` がまとまっている
  - `2026-04-15` 時点では `出水` は archived、`姶良` は upcoming

### 沖縄県

- 入口:
  - `沖縄県 選挙日程`
- 使った source:
  - https://www.pref.okinawa.lg.jp/kensei/senkyo/1023172/1005019.html
  - https://www.pref.okinawa.lg.jp/_res/projects/default_project/_page_/001/005/019/20260324yotei.pdf
- この source で拾えたもの:
  - 名護市長選挙
- メモ:
  - 県ページから PDF に入る構成
  - 今回の PDF で safe に exact date を確認できた市長選は `名護` のみだった

### 岡山県

- 入口:
  - `瀬戸内市 選挙`
- 使った source:
  - https://www.city.setouchi.lg.jp/life/5/31/
- この source で拾えたもの:
  - 瀬戸内市長選挙
- メモ:
  - 県 PDF は引き続き見つけづらいので、市公式の選挙ページから backfill した
  - 結果ページと日程決定案内の導線が同じページにまとまっている

### 熊本県

- 入口:
  - `合志市長選挙`
- 使った source:
  - https://www.city.koshi.lg.jp/list00451.html
- この source で拾えたもの:
  - 合志市長選挙
- メモ:
  - 県の任期満了 PDF だけでは exact date が不足するため、市側公式を優先した
  - 投票日が明示された市長選カテゴリページから archived の backfill を行った

### 山口県

- 入口:
  - `山口県 任期満了年月日等一覧`
- 使った source:
  - https://www.pref.yamaguchi.lg.jp/site/senkyo/25858.html
  - https://www.pref.yamaguchi.lg.jp/uploaded/attachment/237065.pdf
- この source で拾えたもの:
  - 下松市長選挙
  - 山口市長選挙
  - 萩市長選挙
  - 防府市長選挙
- メモ:
  - PDF に `告示日 / 投票日` がそろっていて非常に使いやすい
  - `2026-04-16` 時点では `下松` は archived、`山口 / 萩 / 防府` は upcoming

### 長崎県

- 入口:
  - `長崎県 県内選挙の予定`
  - `平戸市長選挙 令和7`
- 使った source:
  - https://www.pref.nagasaki.jp/bunrui/kenseijoho/senkyojoho/senkyojouhou/257947.html
  - https://www.pref.nagasaki.jp/shared/uploads/2026/02/1771976702.pdf
  - https://www.city.hirado.nagasaki.jp/kurashi/gyosei/senkyo/snk01/2021-1011-0854-130.html
- この source で拾えたもの:
  - 南島原市長選挙
  - 平戸市長選挙
- メモ:
  - HTML と PDF の両方で同じ予定を確認できる
  - `2026-04-16` 時点では南島原は upcoming、平戸は archived

### 徳島県

- 入口:
  - `徳島市長選挙 結果調 PDF`
- 使った source:
  - https://www.city.tokushima.tokushima.jp/shisei/senkyo/kekka.files/R06.shityoukekkashirabe.pdf
- この source で拾えたもの:
  - 徳島市長選挙
- メモ:
  - 結果調 PDF に `執行日程` と `選挙期日の告示日` が含まれている
  - archived の backfill に向いた official source

### 和歌山県

- 入口:
  - `橋本市長選挙 令和8`
- 使った source:
  - https://www.city.hashimoto.lg.jp/guide/senkyo/news_2/index.html
  - https://www.city.hashimoto.lg.jp/guide/senkyo/news_2/22238.html
- この source で拾えたもの:
  - 橋本市長選挙
- メモ:
  - 市長選トップと案内ページが分かれており、案内ページ側に `告示日 / 投票日` がある
  - `2026-04-16` 時点では橋本は archived

### 北海道

- 入口:
  - `帯広市長選挙 令和8`
- 使った source:
  - https://www.city.obihiro.hokkaido.jp/shisei/senkyo/1018633.html
- この source で拾えたもの:
  - 帯広市長選挙
- メモ:
  - 市側公式の選挙案内に `告示日 / 投票日` がまとまっている
  - `2026-04-16` 時点では帯広市長選は archived

### 山形県

- 入口:
  - `山形県 令和7年度選挙予定・結果一覧`
- 使った source:
  - https://www.pref.yamagata.jp/documents/6177/senkyoyoteikekka_r080106.pdf
  - https://www.city.tsuruoka.lg.jp/shisei/senkyo/kiroku/index.html
- この source で拾えたもの:
  - 村山市長選挙
  - 鶴岡市長選挙
- メモ:
  - 県 PDF に `告示日 / 投票日` がまとまっている
  - 鶴岡市は市側公式の選挙記録ページで投票日も再確認できる

### 山梨県

- 入口:
  - `山梨県 選挙日程`
- 使った source:
  - https://www.pref.yamanashi.jp/senkyo/senkyonittei.html
  - https://www.pref.yamanashi.jp/documents/8170/senkyosikkouyotei.pdf
- この source で拾えたもの:
  - 中央市長選挙
- メモ:
  - 県 PDF に `告示日 / 投票日` が直接ある
  - `2026-04-16` 時点では中央市長選は archived

### 宮崎県

- 入口:
  - `宮崎市長選挙 令和8`
  - `小林市長選挙 令和8`
  - `延岡市長選挙 令和7`
- 使った source:
  - https://www.city.miyazaki.miyazaki.jp/city/public_relations/press_material/407901.html
  - https://www.city.kobayashi.lg.jp/soshikikarasagasu/senkyokanriiinkaijimukyoku/oshirase/5008.html
  - https://www.city.nobeoka.miyazaki.jp/soshiki/79/42555.html
- この source で拾えたもの:
  - 宮崎市長選挙
  - 小林市長選挙
  - 延岡市長選挙
- メモ:
  - 市側公式で `告示日 / 投票日` を安全に確認できる
  - `2026-04-16` 時点では `宮崎 / 延岡` は archived、`小林` は upcoming

### 大分県

- 入口:
  - `大分県 県内選挙執行状況一覧`
- 使った source:
  - https://www.pref.oita.jp/site/senkyo/shikkouyotei.html
  - https://www.pref.oita.jp/uploaded/life/2323258_4630163_misc.pdf
- この source で拾えたもの:
  - 杵築市長選挙
- メモ:
  - 県の一覧 PDF に `告示日 / 投票日` がそろっている
  - `2026-04-16` 時点では杵築市長選は archived

### 佐賀県

- 入口:
  - `佐賀県 市町村選挙日程`
- 使った source:
  - https://www.pref.saga.lg.jp/senkyo/kiji00378329/index.html
- この source で拾えたもの:
  - 伊万里市長選挙
  - 鹿島市長選挙
- メモ:
  - HTML に `告示日 / 投票日` が直接書かれていて使いやすい
  - 鹿島市長選は市公式で `4/19 告示 / 4/26 投票` を確認。`4/19投票` と誤読しない
  - `2026-04-16` 時点では伊万里は archived、鹿島は upcoming

### 京都府

- 入口:
  - `京都府 選挙管理委員会`
- 使った source:
  - https://www.city.ayabe.lg.jp/0000006080.html
  - https://www.city.nantan.kyoto.jp/www/gove/146/001/000/index_1013863.html
- この source で拾えたもの:
  - 綾部市長選挙
  - 南丹市長選挙
- メモ:
  - 市側公式で綾部と南丹の `告示日 / 投票日` を確認できる
  - `2026-04-16` 時点では綾部、南丹とも archived

### 香川県

- 入口:
  - `丸亀市長選挙 令和7`
- 使った source:
  - https://www.city.marugame.lg.jp/life/6/27/index-2.html
- この source で拾えたもの:
  - 丸亀市長選挙
- メモ:
  - 市の選挙結果ページに `告示日 / 投票日` がある
  - `2026-04-16` 時点では丸亀市長選は archived

### 奈良県

- 入口:
  - `奈良市長選挙 2025`
- 使った source:
  - https://www.city.nara.lg.jp/life/7/53/
  - https://www.city.nara.lg.jp/uploaded/attachment/203873.pdf
- この source で拾えたもの:
  - 奈良市長選挙
- メモ:
  - 市の選挙案内 PDF に `告示日 / 投票日` がまとまっている
  - `2026-04-16` 時点では奈良市長選は archived

### 茨城県

- 入口:
  - `笠間市長選挙 令和8`
  - `つくば市長選挙 2024`
  - `土浦市長選挙 2023`
  - `水戸市長選挙 2023`
  - `日立市長選挙 2023`
- 使った source:
  - https://www.city.kasama.lg.jp/sp/page/page016862.html
  - https://www.city.tsukuba.lg.jp/shisei/senkyo/kakonosenkyo/25087.html
  - https://www.city.tsuchiura.lg.jp/data/doc/1695618410_doc_159_0.pdf
  - https://www.city.mito.lg.jp/site/open-data/4314.html
  - https://www.city.hitachi.lg.jp/shisei/senkyo/1002413/1002415.html
- この source で拾えたもの:
  - 笠間市長選挙
  - つくば市長選挙
  - 土浦市長選挙
  - 水戸市長選挙
  - 日立市長選挙
- メモ:
  - 県の年別一覧は Excel だが、市側公式でも exact date を安全に確認できた
  - `水戸 / 日立` は official page の投票日と期日前投票・選挙運動期間の記載から notice_date を補っている
  - `2026-04-16` 時点では笠間、つくば、土浦、水戸、日立とも archived

### 宮城県

- 入口:
  - `宮城県 市町村等選挙執行予定一覧`
- 使った source:
  - https://www.pref.miyagi.jp/soshiki/senkyo/2_seido.html
  - https://www.pref.miyagi.jp/documents/44063/shikkou.pdf
- この source で拾えたもの:
  - 仙台市長選挙
  - 石巻市長選挙
  - 登米市長選挙
  - 東松島市長選挙
  - 大崎市長選挙
  - 気仙沼市長選挙
  - 岩沼市長選挙
- メモ:
  - 県 PDF に `告示日 / 投票日` がまとまっていて、市長選の upcoming と archived をまとめて拾いやすい
  - `2026-04-16` 時点では `大崎 / 気仙沼 / 岩沼` が upcoming

### 福島県

- 入口:
  - `福島県 市町村選挙の執行予定`
  - `福島市長選挙 2025`
  - `郡山市長選挙 2025`
  - `いわき市長選挙 2025`
- 使った source:
  - https://www.pref.fukushima.lg.jp/sec/62010a/sityousonsenkyoyotei.html
  - https://www.city.fukushima.fukushima.jp/shisei/senkyo/14667.html
  - https://www.city.koriyama.lg.jp/uploaded/attachment/98583.pdf
  - https://www.city.iwaki.lg.jp/www/contents/1491442932418/index.html
- この source で拾えたもの:
  - 福島市長選挙
  - 郡山市長選挙
  - いわき市長選挙
- メモ:
  - 県ページは当面の町村長選が中心で、市長選は市側公式の方が exact date を取りやすい
  - `2026-04-16` 時点では追加した 3 件はすべて archived

### 鳥取県

- 入口:
  - `鳥取市長選挙 2026`
  - `倉吉市長選挙 2026`
- 使った source:
  - https://www.city.tottori.lg.jp/page/6571.html
  - https://www.city.kurayoshi.lg.jp/gyosei/koho/19/10334.html
- この source で拾えたもの:
  - 鳥取市長選挙
  - 倉吉市長選挙
- メモ:
  - 倉吉市は市側公式に `告示日 / 投票日` が直接ある
  - 鳥取市は期日前投票の案内から投票日を確認し、市長選挙の告示期間 7 日から notice_date を補っている
  - `2026-04-16` 時点では両方 archived

### 石川県

- 入口:
  - `七尾市長選挙 令和6`
- 使った source:
  - https://www.city.nanao.lg.jp/senkyo/shise/senkyo/r6sichou-top.html
- この source で拾えたもの:
  - 七尾市長選挙
- メモ:
  - 市側公式の選挙案内で `告示日 / 投票日` を安全に確認できる
  - `2026-04-16` 時点では七尾市長選は archived

### 長野県

- 入口:
  - `上田市長選挙 令和8`
- 使った source:
  - https://www.city.ueda.nagano.jp/soshiki/senkan/116598.html
- この source で拾えたもの:
  - 上田市長選挙
- メモ:
  - 市側公式で `告示日 / 投票日` を確認できる
  - `2026-04-16` 時点では上田市長選は archived

### 静岡県

- 入口:
  - `伊東市長選挙 令和7`
- 使った source:
  - https://www.city.ito.shizuoka.jp/gyosei/shiseijoho/senkyo/senkyonitsuite/13770.html
- この source で拾えたもの:
  - 伊東市長選挙
- メモ:
  - 立候補予定者説明会の案内に `告示日 / 投票日` がまとまっている
  - `2026-04-16` 時点では伊東市長選は archived

### 高知県

- 入口:
  - `土佐清水市長選挙 令和5`
- 使った source:
  - https://www.city.tosashimizu.kochi.jp/kurashi/section/senkyo/008.html
- この source で拾えたもの:
  - 土佐清水市長選挙
- メモ:
  - 市の選挙執行履歴に `告示日 / 投票日` があり、backfill に向いている
  - `2026-04-16` 時点では土佐清水市長選は archived

## 次に掘るとよい県

- 全国47都道府県の初回 source 棚卸しは完了
- 次にやるなら:
  - 神奈川県の `茅ヶ崎 / 逗子 / 厚木` の次回 exact date を待って追加する
  - 既存県で `前回市長選の backfill` を増やす
  - 県PDFだけで入れたものを市側公式で厚くする

## 運用メモ

- 新しい県を追加したら、このファイルに
  - 入口クエリ
  - 実際に使った URL
  - そこで拾えた選挙
  - 注意点
  を追記する
- source が PDF の県は、`リンク切れ / 添付差し替え` が起きやすいので `last_checked_at` を意識する
- source が HTML の県は、年度 URL の切り替わりに注意する

## ミスの原因と対策

### 久留米市長選で起きたこと

- 県の PDF から拾った日付を、その後も確定値のように扱ってしまった
- その後に市側公式で、より具体的な `無投票案内` が出ていたのに、date と phase を上書きし損ねた
- 結果として、`2026-04-19 upcoming` として誤認したまま残っていた

### 妙高市長選で起きたこと

- 県の一覧をそのまま `2026-04-19 投票` と読んでしまった
- 市側公式の `妙高市長選挙等の期日等について` を本文まで開く前に判断してしまった
- 実際は `2026-11-08 告示 / 2026-11-15 投票` で、市議補選も同日実施だった

### 原因

- 県ソースを「入口」ではなく「最終確定 source」のように使ってしまった
- 市側公式の stronger source を後追い確認する運用が弱かった
- `無投票` のような phase を変える情報を、通常の日程確認と同じ重みで扱っていなかった

### 対策

- 県 PDF / 県一覧で入れた日付は provisional と考える
- 市側公式に、より具体的なページがあるかを必ず再確認する
- 記事一覧や組織一覧に当たり記事名だけ見つけた場合でも、本文を開いて exact date まで確認する
  - 候補者情報
  - 選挙公報
  - 無投票案内
  - 期日前投票
  - 投票所
- 市側公式が県ソースより新しく具体的なら、`vote_date` `notice_date` `phase` を市側公式で上書きする
- とくに `無投票` `投票を行わない` `期日前投票を行わない` の文言を見つけたら、phase を再点検する
- 「県で拾った upcoming」をそのままページ化候補とみなさず、市側公式で existence と phase を再確認してから進む

### 今後の一言ルール

- `県ソースで仮投入し、市側公式で確定する`
