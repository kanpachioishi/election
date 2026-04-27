const DATA = window.ELECTION_SITE_DATA;

const TYPE_LABELS = {
  national: "国政",
  prefectural: "都道府県",
  municipal: "市区町村",
  by_election: "補欠",
};

const SUBTYPE_LABELS = {
  governor: "知事",
  assembly: "議会",
  mayor: "首長",
  upper_house: "参院",
  lower_house: "衆院",
};

const MACRO_REGION_LABELS = {
  hokkaido_tohoku: "北海道・東北",
  kanto: "関東",
  hokuriku: "北陸",
  koshinetsu: "甲信越",
  tokai: "東海",
  kansai: "関西",
  chugoku: "中国",
  shikoku: "四国",
  kyushu_okinawa: "九州・沖縄",
};

const PREFECTURE_TO_MACRO_REGION = {
  "01": "hokkaido_tohoku",
  "02": "hokkaido_tohoku",
  "03": "hokkaido_tohoku",
  "04": "hokkaido_tohoku",
  "05": "hokkaido_tohoku",
  "06": "hokkaido_tohoku",
  "07": "hokkaido_tohoku",
  "08": "kanto",
  "09": "kanto",
  "10": "kanto",
  "11": "kanto",
  "12": "kanto",
  "13": "kanto",
  "14": "kanto",
  "15": "koshinetsu",
  "16": "hokuriku",
  "17": "hokuriku",
  "18": "hokuriku",
  "19": "koshinetsu",
  "20": "koshinetsu",
  "21": "tokai",
  "22": "tokai",
  "23": "tokai",
  "24": "kansai",
  "25": "kansai",
  "26": "kansai",
  "27": "kansai",
  "28": "kansai",
  "29": "kansai",
  "30": "kansai",
  "31": "chugoku",
  "32": "chugoku",
  "33": "chugoku",
  "34": "chugoku",
  "35": "chugoku",
  "36": "shikoku",
  "37": "shikoku",
  "38": "shikoku",
  "39": "shikoku",
  "40": "kyushu_okinawa",
  "41": "kyushu_okinawa",
  "42": "kyushu_okinawa",
  "43": "kyushu_okinawa",
  "44": "kyushu_okinawa",
  "45": "kyushu_okinawa",
  "46": "kyushu_okinawa",
  "47": "kyushu_okinawa",
};

const KIND_LABELS = {
  candidate_list: "候補者",
  bulletin: "選挙公報",
  early_voting: "期日前投票",
  polling_place: "投票所",
  other: "その他",
};

const ASSEMBLY_PAGES = [
  {
    slug: "fukuoka-city-assembly",
    title: "福岡市議会の日程・会議録・公式情報への入口",
    body: "定例会・臨時会ごとに、会期の流れ、決まったこと、暮らしとの関わり、公式リンクをまとめています。",
    prefCode: "40",
    prefectureName: "福岡県",
    municipalityName: "福岡市",
    scopeLabel: "福岡県・福岡市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年第1回定例会",
    latestSessionDateLabel: "2026年2月17日 - 3月27日",
    hasLatestSession: true,
    href: "pages/fukuoka-city-assembly.html",
    actionLabel: "福岡市議会を見る",
  },
  {
    slug: "sapporo-city-assembly",
    title: "札幌市議会の日程・会議録・公式情報への入口",
    body: "定例会ごとの日程、議案結果、会議録、録画、公式リンクをまとめて追えるようにしています。",
    prefCode: "01",
    prefectureName: "北海道",
    municipalityName: "札幌市",
    scopeLabel: "北海道・札幌市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年第1回定例会",
    latestSessionDateLabel: "2026年2月12日 - 3月26日",
    hasLatestSession: true,
    href: "pages/sapporo-city-assembly.html",
    actionLabel: "札幌市議会を見る",
  },
  {
    slug: "kobe-city-assembly",
    title: "神戸市会の日程・会議録・公式情報への入口",
    body: "市会日程、本会議結果、会議録、録画、市会だよりへの入口をそろえて、会期ごとの流れを追えるようにしています。",
    prefCode: "28",
    prefectureName: "兵庫県",
    municipalityName: "神戸市",
    scopeLabel: "兵庫県・神戸市",
    categoryLabel: "市会",
    latestSessionLabel: "2025年第2回定例市会11月議会",
    latestSessionDateLabel: "2025年11月27日 - 12月9日",
    hasLatestSession: true,
    href: "pages/kobe-city-assembly.html",
    actionLabel: "神戸市会を見る",
  },
  {
    slug: "sendai-city-assembly",
    title: "仙台市議会の日程・会議録・公式情報への入口",
    body: "定例会の日程、議案結果、会議録、録画、市議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "04",
    prefectureName: "宮城県",
    municipalityName: "仙台市",
    scopeLabel: "宮城県・仙台市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年第1回定例会",
    latestSessionDateLabel: "2026年2月13日 - 3月18日",
    hasLatestSession: true,
    href: "pages/sendai-city-assembly.html",
    actionLabel: "仙台市議会を見る",
  },
  {
    slug: "yokohama-city-assembly",
    title: "横浜市会の日程・会議録・公式情報への入口",
    body: "定例会の日程、議案一覧、会議録、録画、ヨコハマ議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "14",
    prefectureName: "神奈川県",
    municipalityName: "横浜市",
    scopeLabel: "神奈川県・横浜市",
    categoryLabel: "市会",
    latestSessionLabel: "令和8年第1回定例会",
    latestSessionDateLabel: "2026年1月28日 - 3月24日",
    hasLatestSession: true,
    href: "pages/yokohama-city-assembly.html",
    actionLabel: "横浜市会を見る",
  },
  {
    slug: "nagoya-city-assembly",
    title: "名古屋市会の日程・会議録・公式情報への入口",
    body: "定例会の日程、提出案件、会議録、録画、市会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "23",
    prefectureName: "愛知県",
    municipalityName: "名古屋市",
    scopeLabel: "愛知県・名古屋市",
    categoryLabel: "市会",
    latestSessionLabel: "令和8年2月定例会",
    latestSessionDateLabel: "2026年2月18日 - 3月19日",
    hasLatestSession: true,
    href: "pages/nagoya-city-assembly.html",
    actionLabel: "名古屋市会を見る",
  },
  {
    slug: "hiroshima-city-assembly",
    title: "広島市議会の日程・会議録・公式情報への入口",
    body: "定例会の日程、会議結果、会議録、議会中継、ひろしま市議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "34",
    prefectureName: "広島県",
    municipalityName: "広島市",
    scopeLabel: "広島県・広島市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年第2回定例会",
    latestSessionDateLabel: "2026年2月13日 - 3月26日",
    hasLatestSession: true,
    href: "pages/hiroshima-city-assembly.html",
    actionLabel: "広島市議会を見る",
  },
  {
    slug: "osaka-city-assembly",
    title: "大阪市会の日程・会議録・公式情報への入口",
    body: "市会日程、会議結果、会議録検索、議会中継、市会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "27",
    prefectureName: "大阪府",
    municipalityName: "大阪市",
    scopeLabel: "大阪府・大阪市",
    categoryLabel: "市会",
    latestSessionLabel: "令和8年2・3月市会（定例会第1回）",
    latestSessionDateLabel: "2026年2月17日 - 3月27日",
    hasLatestSession: true,
    href: "pages/osaka-city-assembly.html",
    actionLabel: "大阪市会を見る",
  },
  {
    slug: "saitama-city-assembly",
    title: "さいたま市議会の日程・会議録・公式情報への入口",
    body: "定例会の案内、審議結果、会議録、議会中継、市議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "11",
    prefectureName: "埼玉県",
    municipalityName: "さいたま市",
    scopeLabel: "埼玉県・さいたま市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年2月定例会",
    latestSessionDateLabel: "2026年2月3日 - 3月12日",
    hasLatestSession: true,
    href: "pages/saitama-city-assembly.html",
    actionLabel: "さいたま市議会を見る",
  },
  {
    slug: "kitakyushu-city-assembly",
    title: "北九州市議会の日程・会議録・公式情報への入口",
    body: "会期日程案、議案・会議結果、会議録検索、中継、議長記者会見の入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "40",
    prefectureName: "福岡県",
    municipalityName: "北九州市",
    scopeLabel: "福岡県・北九州市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年2月定例会",
    latestSessionDateLabel: "2026年2月19日 - 3月24日",
    hasLatestSession: true,
    href: "pages/kitakyushu-city-assembly.html",
    actionLabel: "北九州市議会を見る",
  },
  {
    slug: "kyoto-city-assembly",
    title: "京都市会の日程・会議録・公式情報への入口",
    body: "審議日程・結果、会議録検索、速報版、京都市会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "26",
    prefectureName: "京都府",
    municipalityName: "京都市",
    scopeLabel: "京都府・京都市",
    categoryLabel: "市会",
    latestSessionLabel: "令和8年2月市会",
    latestSessionDateLabel: "2026年2月16日 - 3月24日",
    hasLatestSession: true,
    href: "pages/kyoto-city-assembly.html",
    actionLabel: "京都市会を見る",
  },
  {
    slug: "kawasaki-city-assembly",
    title: "川崎市議会の日程・会議録・公式情報への入口",
    body: "会期日程、会議結果、会議録検索、配付資料、議会かわさきの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "14",
    prefectureName: "神奈川県",
    municipalityName: "川崎市",
    scopeLabel: "神奈川県・川崎市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年第1回定例会",
    latestSessionDateLabel: "2026年2月12日 - 3月18日",
    hasLatestSession: true,
    href: "pages/kawasaki-city-assembly.html",
    actionLabel: "川崎市議会を見る",
  },
  {
    slug: "fukuoka-pref-assembly",
    title: "福岡県議会の要点まとめ",
    body: "本会議の情報、会期日程、知事議案説明要旨、会議録検索、県議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "40",
    prefectureName: "福岡県",
    municipalityName: "",
    scopeLabel: "福岡県",
    categoryLabel: "県議会",
    latestSessionLabel: "令和8年2月定例会",
    latestSessionDateLabel: "2026年2月20日 - 3月24日",
    hasLatestSession: true,
    href: "pages/fukuoka-pref-assembly.html",
    actionLabel: "福岡県議会を見る",
  },
  {
    slug: "saitama-pref-assembly",
    title: "埼玉県議会の要点まとめ",
    body: "定例会概要、会期日程、議案一覧、議会中継、会議録検索の入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "11",
    prefectureName: "埼玉県",
    municipalityName: "",
    scopeLabel: "埼玉県",
    categoryLabel: "県議会",
    latestSessionLabel: "令和8年2月定例会",
    latestSessionDateLabel: "2026年2月19日 - 3月27日",
    hasLatestSession: true,
    href: "pages/saitama-pref-assembly.html",
    actionLabel: "埼玉県議会を見る",
  },
  {
    slug: "okinawa-pref-assembly",
    title: "沖縄県議会の要点まとめ",
    body: "議会情報ページ、会期日程、議決結果、知事提案説明要旨、委員会審査日程の入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "47",
    prefectureName: "沖縄県",
    municipalityName: "",
    scopeLabel: "沖縄県",
    categoryLabel: "県議会",
    latestSessionLabel: "令和8年第1回（2月定例会）",
    latestSessionDateLabel: "2026年2月18日 - 3月27日",
    hasLatestSession: true,
    href: "pages/okinawa-pref-assembly.html",
    actionLabel: "沖縄県議会を見る",
  },
  {
    slug: "niigata-pref-assembly",
    title: "新潟県議会の要点まとめ",
    body: "定例会概要、会期日程、議案一覧、議決結果、中継日程、県議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "15",
    prefectureName: "新潟県",
    municipalityName: "",
    scopeLabel: "新潟県",
    categoryLabel: "県議会",
    latestSessionLabel: "令和8年2月定例会",
    latestSessionDateLabel: "2026年2月24日 - 3月27日",
    hasLatestSession: true,
    href: "pages/niigata-pref-assembly.html",
    actionLabel: "新潟県議会を見る",
  },
  {
    slug: "hokkaido-pref-assembly",
    title: "北海道議会の要点まとめ",
    body: "定例会概要、提出案件一覧、会議録、議会中継、広報紙の入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "01",
    prefectureName: "北海道",
    municipalityName: "",
    scopeLabel: "北海道",
    categoryLabel: "道議会",
    latestSessionLabel: "令和8年第1回定例会",
    latestSessionDateLabel: "2026年2月20日 - 3月19日",
    hasLatestSession: true,
    href: "pages/hokkaido-pref-assembly.html",
    actionLabel: "北海道議会を見る",
  },
  {
    slug: "shizuoka-city-assembly",
    title: "静岡市議会の日程・会議録・公式情報への入口",
    body: "会議日程、議案集、総括質問関連資料、審議結果、会議録検索の入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "22",
    prefectureName: "静岡県",
    municipalityName: "静岡市",
    scopeLabel: "静岡県・静岡市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年2月定例会",
    latestSessionDateLabel: "2026年2月12日 - 3月19日",
    hasLatestSession: true,
    href: "pages/shizuoka-city-assembly.html",
    actionLabel: "静岡市議会を見る",
  },
  {
    slug: "ehime-pref-assembly",
    title: "愛媛県議会の要点まとめ",
    body: "定例会ページ、提出議案、会議録検索、中継、広報番組の入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "38",
    prefectureName: "愛媛県",
    municipalityName: "",
    scopeLabel: "愛媛県",
    categoryLabel: "県議会",
    latestSessionLabel: "第395回（令和8年2月）定例会",
    latestSessionDateLabel: "2026年2月25日 - 3月19日",
    hasLatestSession: true,
    href: "pages/ehime-pref-assembly.html",
    actionLabel: "愛媛県議会を見る",
  },
  {
    slug: "kumamoto-city-assembly",
    title: "熊本市議会の日程・会議録・公式情報への入口",
    body: "定例会日程、議案および審議結果、会議録検索、議会中継、議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "43",
    prefectureName: "熊本県",
    municipalityName: "熊本市",
    scopeLabel: "熊本県・熊本市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年（2026年）第1回定例会",
    latestSessionDateLabel: "2026年2月16日 - 3月23日",
    hasLatestSession: true,
    href: "pages/kumamoto-city-assembly.html",
    actionLabel: "熊本市議会を見る",
  },
  {
    slug: "ibaraki-pref-assembly",
    title: "茨城県議会の要点まとめ",
    body: "定例会概要、会期日程、質問項目、補助資料、議会中継の入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "08",
    prefectureName: "茨城県",
    municipalityName: "",
    scopeLabel: "茨城県",
    categoryLabel: "県議会",
    latestSessionLabel: "令和8年第1回定例会",
    latestSessionDateLabel: "2026年2月26日 - 3月24日",
    hasLatestSession: true,
    href: "pages/ibaraki-pref-assembly.html",
    actionLabel: "茨城県議会を見る",
  },
  {
    slug: "gifu-pref-assembly",
    title: "岐阜県議会の要点まとめ",
    body: "定例会概要、日程、上程議案、議決内容、会議録の入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "21",
    prefectureName: "岐阜県",
    municipalityName: "",
    scopeLabel: "岐阜県",
    categoryLabel: "県議会",
    latestSessionLabel: "令和8年第1回定例会",
    latestSessionDateLabel: "2026年2月26日 - 3月25日",
    hasLatestSession: true,
    href: "pages/gifu-pref-assembly.html",
    actionLabel: "岐阜県議会を見る",
  },
  {
    slug: "mie-pref-assembly",
    title: "三重県議会の要点まとめ",
    body: "提出予定議案概要、質問者、議案審議結果、録画中継、みえ県議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "24",
    prefectureName: "三重県",
    municipalityName: "",
    scopeLabel: "三重県",
    categoryLabel: "県議会",
    latestSessionLabel: "令和8年定例会（2月定例月会議）",
    latestSessionDateLabel: "2026年2月17日 - 3月31日",
    hasLatestSession: true,
    href: "pages/mie-pref-assembly.html",
    actionLabel: "三重県議会を見る",
  },
  {
    slug: "sakai-city-assembly",
    title: "堺市議会の日程・会議録・公式情報への入口",
    body: "会議日程、議案書、議決結果、会派賛否一覧、会議録の入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "27",
    prefectureName: "大阪府",
    municipalityName: "堺市",
    scopeLabel: "大阪府・堺市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年第2回市議会（定例会）",
    latestSessionDateLabel: "2026年2月16日 - 3月26日",
    hasLatestSession: true,
    href: "pages/sakai-city-assembly.html",
    actionLabel: "堺市議会を見る",
  },
  {
    slug: "miyazaki-pref-assembly",
    title: "宮崎県議会の要点まとめ",
    body: "定例会日程、採決結果、代表質問・一般質問、会議録、広報の入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "45",
    prefectureName: "宮崎県",
    municipalityName: "",
    scopeLabel: "宮崎県",
    categoryLabel: "県議会",
    latestSessionLabel: "令和8年2月定例会",
    latestSessionDateLabel: "2026年2月20日 - 3月19日",
    hasLatestSession: true,
    href: "pages/miyazaki-pref-assembly.html",
    actionLabel: "宮崎県議会を見る",
  },
  {
    slug: "kagoshima-pref-assembly",
    title: "鹿児島県議会の要点まとめ",
    body: "会期日程、質問事項、直近の定例会情報、会議録検索、議会中継の入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "46",
    prefectureName: "鹿児島県",
    municipalityName: "",
    scopeLabel: "鹿児島県",
    categoryLabel: "県議会",
    latestSessionLabel: "令和8年第1回定例会",
    latestSessionDateLabel: "2026年2月20日 - 3月27日",
    hasLatestSession: true,
    href: "pages/kagoshima-pref-assembly.html",
    actionLabel: "鹿児島県議会を見る",
  },
  {
    slug: "aomori-pref-assembly",
    title: "青森県議会の要点まとめ",
    body: "定例会日程、議案等の審査結果、本会議の動き、県議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "02",
    prefectureName: "青森県",
    municipalityName: "",
    scopeLabel: "青森県",
    categoryLabel: "県議会",
    latestSessionLabel: "令和8年2月第325回定例会",
    latestSessionDateLabel: "2026年2月24日 - 3月24日",
    hasLatestSession: true,
    href: "pages/aomori-pref-assembly.html",
    actionLabel: "青森県議会を見る",
  },
  {
    slug: "niigata-city-assembly",
    title: "新潟市議会の日程・会議録・公式情報への入口",
    body: "定例会日程、会議の結果、会議録検索、議会中継、市議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "15",
    prefectureName: "新潟県",
    municipalityName: "新潟市",
    scopeLabel: "新潟県・新潟市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年2月定例会",
    latestSessionDateLabel: "2026年2月17日 - 3月24日",
    hasLatestSession: true,
    href: "pages/niigata-city-assembly.html",
    actionLabel: "新潟市議会を見る",
  },
  {
    slug: "okayama-city-assembly",
    title: "岡山市議会の日程・会議録・公式情報への入口",
    body: "会期日程、提出議案・議決結果、会議録検索、議会中継、市議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "33",
    prefectureName: "岡山県",
    municipalityName: "岡山市",
    scopeLabel: "岡山県・岡山市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年2月定例市議会",
    latestSessionDateLabel: "2026年2月16日 - 3月17日",
    hasLatestSession: true,
    href: "pages/okayama-city-assembly.html",
    actionLabel: "岡山市議会を見る",
  },
  {
    slug: "chiba-city-assembly",
    title: "千葉市議会の日程・会議録・公式情報への入口",
    body: "定例会日程、議決結果、会議録、議会トップ、議会だよりの入口をまとめて、会期ごとの流れを追えるようにしています。",
    prefCode: "12",
    prefectureName: "千葉県",
    municipalityName: "千葉市",
    scopeLabel: "千葉県・千葉市",
    categoryLabel: "市議会",
    latestSessionLabel: "令和8年第1回定例会",
    latestSessionDateLabel: "2026年2月18日 - 3月17日",
    hasLatestSession: true,
    href: "pages/chiba-city-assembly.html",
    actionLabel: "千葉市議会を見る",
  },
];

const RESOURCE_GROUPS = [
  {
    kind: "candidate_list",
    heading: "候補者を確認",
    note: "立候補者や届出情報を確認できます。",
    action: "候補者を見る",
  },
  {
    kind: "bulletin",
    heading: "選挙公報を読む",
    note: "候補者の主張や政策を公式PDFなどで確認できます。",
    action: "公報を開く",
  },
  {
    kind: "early_voting",
    heading: "期日前投票を確認",
    note: "期間、場所、受付時間などの案内へ進みます。",
    action: "期日前を見る",
  },
  {
    kind: "polling_place",
    heading: "投票所を確認",
    note: "投票所や当日の投票案内を確認できます。",
    action: "投票所を見る",
  },
  {
    kind: "other",
    heading: "関連する公式情報",
    note: "選挙管理委員会などの公式ページを確認できます。",
    action: "公式情報を見る",
  },
];

const state = {
  query: "",
  macroRegion: "all",
  prefecture: "all",
  municipality: "all",
  selectedId: null,
};

const assemblyState = {
  query: "",
  macroRegion: "all",
  prefecture: "all",
  municipality: "all",
};

const els = {
  heroMetrics: document.getElementById("heroMetrics"),
  generatedNote: document.getElementById("generatedNote"),
  searchInput: document.getElementById("searchInput"),
  macroRegionFilter: document.getElementById("macroRegionFilter"),
  prefectureFilter: document.getElementById("prefectureFilter"),
  municipalityFilter: document.getElementById("municipalityFilter"),
  resetFilters: document.getElementById("resetFilters"),
  resultSummary: document.getElementById("resultSummary"),
  electionList: document.getElementById("electionList"),
  detail: document.getElementById("detail"),
  assemblySearchInput: document.getElementById("assemblySearchInput"),
  assemblyMacroRegionFilter: document.getElementById("assemblyMacroRegionFilter"),
  assemblyPrefectureFilter: document.getElementById("assemblyPrefectureFilter"),
  assemblyMunicipalityFilter: document.getElementById("assemblyMunicipalityFilter"),
  assemblyResetFilters: document.getElementById("assemblyResetFilters"),
  assemblyResultSummary: document.getElementById("assemblyResultSummary"),
  assemblyGrid: document.getElementById("assemblyGrid"),
  featuredAssemblyGrid: document.getElementById("featuredAssemblyGrid"),
  coverageGrid: document.getElementById("coverageGrid"),
};

const prefectureRegions = DATA.regions
  .filter((region) => region.level === "prefecture")
  .sort((left, right) => left.prefCode.localeCompare(right.prefCode));

const municipalityRegions = DATA.regions
  .filter((region) => region.level === "municipality")
  .sort((left, right) => left.prefCode.localeCompare(right.prefCode) || left.displayName.localeCompare(right.displayName, "ja"));

const regionById = new Map(DATA.regions.map((region) => [region.id, region]));
const localGovernmentSites = DATA.localGovernmentSites ?? [];
const localGovernmentSiteByKey = new Map(
  localGovernmentSites.map((site) => [`${site.regionId}|${site.siteKind}`, site]),
);
const assemblyPages = ASSEMBLY_PAGES.map((page) => {
  const prefectureRegion = prefectureRegions.find((region) => region.prefCode === page.prefCode) ?? null;
  const municipalityRegion = municipalityRegions.find((region) => region.prefCode === page.prefCode && region.name === page.municipalityName) ?? null;
  return {
    ...page,
    prefectureRegionId: prefectureRegion?.id ?? null,
    municipalityRegionId: municipalityRegion?.id ?? null,
  };
});

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateText) {
  if (!dateText) return "未定";
  const date = new Date(`${dateText}T00:00:00+09:00`);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;
}

function formatDateTime(dateText) {
  if (!dateText) return "";
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return String(dateText);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getTodayJstDateText() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function parseJstDate(dateText) {
  return new Date(`${dateText}T00:00:00+09:00`);
}

function isElectionUpcoming(election) {
  if (!election?.voteDate) return false;
  return election.voteDate >= getTodayJstDateText();
}

function getDaysFromToday(dateText) {
  const base = parseJstDate(getTodayJstDateText());
  const target = parseJstDate(dateText);
  return Math.ceil((target - base) / 86400000);
}

function parseAssemblyDateLabelEnd(dateLabel = "") {
  const match = String(dateLabel).match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*-\s*(\d{1,2})月(\d{1,2})日/);
  if (match) {
    const [, year, , , endMonth, endDay] = match;
    return `${year}-${String(endMonth).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
  }

  const fallback = String(dateLabel).match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!fallback) {
    return "";
  }

  const [, year, month, day] = fallback;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getAssemblyFeatureScore(page) {
  const text = `${page.title} ${page.body} ${page.latestSessionLabel}`.toLowerCase();
  const endDate = parseAssemblyDateLabelEnd(page.latestSessionDateLabel);
  const recencyScore = endDate ? Math.max(0, 120 - Math.abs(getDaysFromToday(endDate))) : 0;
  const budgetScore = /予算/.test(text) ? 28 : 0;
  const agendaScore = /議案|提出案件|議決結果/.test(text) ? 20 : 0;
  const transcriptScore = /会議録/.test(text) ? 16 : 0;
  const streamScore = /録画|中継/.test(text) ? 12 : 0;
  const digestScore = /議会だより|市会だより/.test(text) ? 10 : 0;
  return recencyScore + budgetScore + agendaScore + transcriptScore + streamScore + digestScore;
}

function getFeaturedAssemblyReason(page) {
  const text = `${page.title} ${page.body} ${page.latestSessionLabel}`.toLowerCase();
  const endDate = parseAssemblyDateLabelEnd(page.latestSessionDateLabel);
  const days = endDate ? getDaysFromToday(endDate) : null;

  if (/予算/.test(text)) {
    return {
      label: "予算議会を追いやすい",
      tone: days !== null && Math.abs(days) <= 60 ? "future" : "muted",
      note: "予算や補正予算に触れていて、会期の入口から主要資料へ進みやすいページです。",
    };
  }

  if (/議案/.test(text) && /会議録/.test(text) && /録画|中継/.test(text)) {
    return {
      label: "議案から深掘りしやすい",
      tone: days !== null && Math.abs(days) <= 60 ? "future" : "muted",
      note: "議案一覧から会議録や中継までつながっていて、詳細確認に向いています。",
    };
  }

  if (/議会だより|市会だより/.test(text) && /録画|中継/.test(text)) {
    return {
      label: "要約と原文を行き来しやすい",
      tone: "future",
      note: "議会だよりのような入口と、録画や会議録の原文系導線が両方そろっています。",
    };
  }

  if (/会議結果/.test(text) && /会議録/.test(text)) {
    return {
      label: "会議結果を追いやすい",
      tone: "future",
      note: "結果確認から発言確認まで自然につながるので、初見でも使いやすい構成です。",
    };
  }

  return {
    label: "直近会期を確認しやすい",
    tone: "muted",
    note: "最新の会期と原文リンクがまとまっていて、最初の入口として使いやすいページです。",
  };
}

function getDateBadge(election) {
  const days = getDaysFromToday(election.voteDate);
  if (days === 0) return { text: "本日", tone: "hot" };
  if (days > 0 && days <= 30) return { text: `あと${days}日`, tone: "hot" };
  if (days > 0) return { text: `あと${days}日`, tone: "future" };
  return { text: "終了", tone: "muted" };
}

function normalizeText(value) {
  return String(value ?? "").toLowerCase().replaceAll(/\s+/g, "");
}

function getPostalMatch(query) {
  const digits = query.replace(/[^\d]/g, "");
  if (digits.length < 3) return null;
  const prefix = digits.slice(0, 3);
  return DATA.postalPrefixes.find((entry) => entry.prefix === prefix) ?? null;
}

function getPostalDigits(query) {
  return query.replace(/[^\d]/g, "");
}

function electionSearchText(election) {
  return normalizeText([
    election.id,
    election.slug,
    election.name,
    election.description,
    election.primaryRegionName,
    election.primaryRegionShortName,
    election.prefectureName,
    election.resources.map((resource) => `${resource.kind} ${resource.title} ${resource.summary}`).join(" "),
  ].join(" "));
}

function assemblySearchText(page) {
  return normalizeText([
    page.slug,
    page.title,
    page.body,
    page.scopeLabel,
    page.categoryLabel,
    page.prefectureName,
    page.municipalityName,
    page.latestSessionLabel,
    page.latestSessionDateLabel,
  ].join(" "));
}

function getMacroRegionByPrefCode(prefCode) {
  return PREFECTURE_TO_MACRO_REGION[String(prefCode ?? "").padStart(2, "0")] ?? null;
}

function getLocalGovernmentSite(regionId, siteKind) {
  if (!regionId || !siteKind) return null;
  return localGovernmentSiteByKey.get(`${regionId}|${siteKind}`) ?? null;
}

function getElectionOfficialSite(election) {
  const municipalitySite = getLocalGovernmentSite(election.primaryRegionId, "municipality_home");
  if (municipalitySite) {
    return {
      ...municipalitySite,
      factLabel: "自治体公式",
      actionLabel: "自治体公式サイトを開く",
    };
  }

  const prefectureSite = getLocalGovernmentSite(election.prefectureRegionId, "prefecture_home");
  if (prefectureSite) {
    return {
      ...prefectureSite,
      factLabel: "都道府県公式",
      actionLabel: "都道府県公式サイトを開く",
    };
  }

  return null;
}

function electionMatchesLocation(election) {
  const municipalityRegion = state.municipality !== "all" ? regionById.get(state.municipality) : null;

  if (state.municipality !== "all") {
    if (election.scopeType === "all") return true;
    if (election.primaryRegionId === state.municipality) return true;
    if (municipalityRegion && election.prefectureRegionId === municipalityRegion.prefectureRegionId) return true;
    return false;
  }

  if (state.prefecture !== "all") {
    if (election.scopeType === "all") return true;
    if (election.primaryRegionId === state.prefecture) return true;
    if (election.prefectureRegionId === state.prefecture) return true;
    return false;
  }

  if (state.macroRegion !== "all") {
    if (election.scopeType === "all") return true;
    const prefCode = election.prefectureRegionId?.replace("pref-", "") || "";
    return getMacroRegionByPrefCode(prefCode) === state.macroRegion;
  }

  return true;
}

function assemblyMatchesLocation(page) {
  const municipalityRegion = assemblyState.municipality !== "all" ? regionById.get(assemblyState.municipality) : null;

  if (assemblyState.municipality !== "all") {
    return page.municipalityRegionId === assemblyState.municipality ||
      (municipalityRegion && page.prefectureRegionId === municipalityRegion.prefectureRegionId && (
        page.municipalityName === municipalityRegion.name || !page.municipalityRegionId
      ));
  }

  if (assemblyState.prefecture !== "all") {
    return page.prefectureRegionId === assemblyState.prefecture;
  }

  if (assemblyState.macroRegion !== "all") {
    return getMacroRegionByPrefCode(page.prefCode) === assemblyState.macroRegion;
  }

  return true;
}

function isJointElectionCandidate(election) {
  return ["municipal", "by_election"].includes(election.type) &&
    ["mayor", "assembly"].includes(election.subtype) &&
    Boolean(election.primaryRegionId) &&
    Boolean(election.voteDate);
}

function getJointElectionKey(election) {
  return [
    election.primaryRegionId,
    election.voteDate,
    election.noticeDate ?? "",
    election.phase,
  ].join("|");
}

function shouldBuildJointElection(bucket) {
  return bucket.some((election) => election.subtype === "mayor") &&
    bucket.some((election) => election.subtype === "assembly");
}

function sortSubtypeValues(subtypes) {
  const order = { mayor: 0, assembly: 1, governor: 2, upper_house: 3, lower_house: 4 };
  return [...new Set(subtypes)].sort((left, right) => (order[left] ?? 99) - (order[right] ?? 99));
}

function dedupeResourcesByUrl(resources) {
  const byUrl = new Map();
  for (const resource of sortResources(resources)) {
    const key = String(resource.url ?? "").trim();
    if (!key) continue;
    const existing = byUrl.get(key);
    if (!existing) {
      byUrl.set(key, { ...resource });
      continue;
    }

    const preferred = existing.kind === "other" ? existing : resource.kind === "other" ? resource : existing;
    byUrl.set(key, {
      ...preferred,
      summary: preferred.summary || existing.summary || resource.summary,
    });
  }
  return [...byUrl.values()];
}

function getJointSourceUrl(bucket) {
  const sharedOther = bucket
    .flatMap((election) => election.resources ?? [])
    .find((resource) => resource.kind === "other" && resource.url);
  return sharedOther?.url || bucket[0]?.sourceUrl || "";
}

function buildJointElection(bucket) {
  const subtypeOrder = { mayor: 0, assembly: 1 };
  const orderedBucket = [...bucket].sort((left, right) => {
    const subtypeCompare = (subtypeOrder[left.subtype] ?? 99) - (subtypeOrder[right.subtype] ?? 99);
    if (subtypeCompare !== 0) return subtypeCompare;
    return String(left.name ?? "").localeCompare(String(right.name ?? ""), "ja");
  });
  const base = orderedBucket.find((election) => election.subtype === "mayor") ?? orderedBucket[0];
  const regionLabel = base.primaryRegionShortName || base.primaryRegionName;
  const includedNames = orderedBucket.map((election) => election.name);
  const resources = dedupeResourcesByUrl(orderedBucket.flatMap((election) => election.resources ?? []));
  const resourceKinds = [...new Set(resources.map((resource) => resource.kind).filter(Boolean))];

  return {
    ...base,
    id: `joint:${getJointElectionKey(base)}`,
    name: includedNames.join("・") || `${regionLabel}の同時選挙`,
    type: orderedBucket.some((election) => election.type === "municipal") ? "municipal" : base.type,
    description: "同じ日に同じ地域で投票する選挙をまとめて表示しています。",
    subtypes: sortSubtypeValues(orderedBucket.map((election) => election.subtype)),
    electionIds: orderedBucket.map((election) => election.id),
    includedElectionNames: includedNames,
    resources,
    resourceKinds,
    sourceUrl: getJointSourceUrl(bucket),
    isJoint: true,
  };
}

function buildDisplayElections(elections) {
  const buckets = new Map();
  for (const election of elections) {
    if (!isJointElectionCandidate(election)) continue;
    const key = getJointElectionKey(election);
    const bucket = buckets.get(key) ?? [];
    bucket.push(election);
    buckets.set(key, bucket);
  }

  const seenJointKeys = new Set();

  return elections.flatMap((election) => {
    if (!isJointElectionCandidate(election)) {
      return [{ ...election, subtypes: [election.subtype], electionIds: [election.id], includedElectionNames: [election.name], isJoint: false }];
    }

    const key = getJointElectionKey(election);
    const bucket = buckets.get(key) ?? [election];

    if (!shouldBuildJointElection(bucket)) {
      return [{ ...election, subtypes: [election.subtype], electionIds: [election.id], includedElectionNames: [election.name], isJoint: false }];
    }

    if (seenJointKeys.has(key)) {
      return [];
    }

    seenJointKeys.add(key);
    return [buildJointElection(bucket)];
  });
}

function getFilteredElections() {
  const query = normalizeText(state.query);
  const postalMatch = getPostalMatch(state.query);

  return DATA.elections
    .filter((election) => isElectionUpcoming(election))
    .filter((election) => electionMatchesLocation(election))
    .filter((election) => {
      if (!query) return true;
      if (postalMatch) {
        const matchesMunicipality = election.primaryRegionId === postalMatch.regionId;
        const matchesPrefecture = election.prefectureRegionId === postalMatch.prefectureRegionId;
        return matchesMunicipality || matchesPrefecture || election.scopeType === "all";
      }
      return electionSearchText(election).includes(query);
    })
    .sort((left, right) => {
      return left.voteDate.localeCompare(right.voteDate);
    });
}

function isDefaultBrowse() {
  return !state.query &&
    state.macroRegion === "all" &&
    state.prefecture === "all" &&
    state.municipality === "all";
}

function getElectionView() {
  const filteredRaw = getFilteredElections();
  const filtered = buildDisplayElections(filteredRaw);
  if (!isDefaultBrowse()) {
    return {
      elections: filtered,
      total: filtered.length,
      mode: "filtered",
    };
  }

  return {
    elections: ensureSelectedElectionVisible(filtered, filtered),
    total: filtered.length,
    mode: "default",
  };
}

function ensureSelectedElectionVisible(visible, allElections) {
  if (!state.selectedId || visible.some((election) => election.id === state.selectedId)) {
    return visible;
  }

  const selected = allElections.find((election) => election.id === state.selectedId || election.electionIds?.includes(state.selectedId));
  return selected ? [...visible, selected] : visible;
}

function renderSelect(select, options, selected) {
  select.innerHTML = options
    .map((option) => `<option value="${escapeHtml(option.value)}"${option.value === selected ? " selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("");
}

function initFilters() {
  renderLocationFilters();
}

function renderLocationFilters() {
  renderSelect(els.macroRegionFilter, [
    { value: "all", label: "すべて" },
    ...Object.entries(MACRO_REGION_LABELS).map(([value, label]) => ({ value, label })),
  ], state.macroRegion);

  const prefectureOptions = prefectureRegions
    .filter((region) => state.macroRegion === "all" || getMacroRegionByPrefCode(region.prefCode) === state.macroRegion)
    .map((region) => ({
      value: region.id,
      label: region.name,
    }));

  renderSelect(els.prefectureFilter, [
    { value: "all", label: state.macroRegion === "all" ? "地方を選んでください" : "すべて" },
    ...prefectureOptions,
  ], state.prefecture);
  els.prefectureFilter.disabled = state.macroRegion === "all";

  const municipalityOptions = municipalityRegions
    .filter((region) => state.prefecture !== "all" && region.prefectureRegionId === state.prefecture)
    .map((region) => ({
      value: region.id,
      label: region.name,
    }));

  renderSelect(els.municipalityFilter, [
    { value: "all", label: state.prefecture === "all" ? "都道府県を選んでください" : "すべて" },
    ...municipalityOptions,
  ], state.municipality);
  els.municipalityFilter.disabled = state.prefecture === "all";
}

function renderAssemblyLocationFilters() {
  renderSelect(els.assemblyMacroRegionFilter, [
    { value: "all", label: "すべて" },
    ...Object.entries(MACRO_REGION_LABELS).map(([value, label]) => ({ value, label })),
  ], assemblyState.macroRegion);

  const prefectureOptions = prefectureRegions
    .filter((region) => assemblyState.macroRegion === "all" || getMacroRegionByPrefCode(region.prefCode) === assemblyState.macroRegion)
    .map((region) => ({
      value: region.id,
      label: region.name,
    }));

  renderSelect(els.assemblyPrefectureFilter, [
    { value: "all", label: assemblyState.macroRegion === "all" ? "地方を選んでください" : "すべて" },
    ...prefectureOptions,
  ], assemblyState.prefecture);
  els.assemblyPrefectureFilter.disabled = assemblyState.macroRegion === "all";

  const municipalityOptions = municipalityRegions
    .filter((region) => assemblyState.prefecture !== "all" && region.prefectureRegionId === assemblyState.prefecture)
    .map((region) => ({
      value: region.id,
      label: region.name,
    }));

  renderSelect(els.assemblyMunicipalityFilter, [
    { value: "all", label: assemblyState.prefecture === "all" ? "都道府県を選んでください" : "すべて" },
    ...municipalityOptions,
  ], assemblyState.municipality);
  els.assemblyMunicipalityFilter.disabled = assemblyState.prefecture === "all";
}

function renderHero() {
  if (!els.heroMetrics || !els.generatedNote) {
    return;
  }

  const metrics = [
    ["選挙", DATA.stats.elections],
    ["公式リンク", DATA.stats.resourceLinks],
    ["掲載地域", DATA.stats.regions],
    ["対応郵便番号", DATA.stats.postalPrefixes],
  ];

  els.heroMetrics.innerHTML = metrics.map(([label, value]) => `
    <div class="metric-card">
      <strong>${value}</strong>
      <span>${label}</span>
    </div>
  `).join("");

  els.generatedNote.textContent = `データ更新: ${formatDateTime(DATA.sourceGeneratedAt)}`;
}

function renderCoverage() {
  const resourceRows = Object.entries(KIND_LABELS)
    .map(([kind, label]) => [label, DATA.stats.byResourceKind[kind] ?? 0]);
  const typeRows = Object.entries(TYPE_LABELS)
    .map(([type, label]) => [label, DATA.stats.byType[type] ?? 0]);
  const expandedTypeRows = [...typeRows, ["議会ページ", ASSEMBLY_PAGES.length]];
  const municipalityHomeCount = DATA.stats.byLocalGovernmentSiteKind?.municipality_home
    ?? localGovernmentSites.filter((site) => site.siteKind === "municipality_home").length;
  const prefectureHomeCount = DATA.stats.byLocalGovernmentSiteKind?.prefecture_home
    ?? localGovernmentSites.filter((site) => site.siteKind === "prefecture_home").length;
  const localGovernmentRows = [
    ["自治体公式サイト", DATA.stats.localGovernmentSites ?? localGovernmentSites.length],
    ["市区町村", municipalityHomeCount],
    ["都道府県", prefectureHomeCount],
  ];

  const groups = [
    { title: "選挙種別", rows: expandedTypeRows },
    { title: "公式リンク種別", rows: resourceRows },
    { title: "公式サイト台帳", rows: localGovernmentRows },
  ];

  els.coverageGrid.innerHTML = groups.map((group) => `
    <article class="coverage-card">
      <h3>${escapeHtml(group.title)}</h3>
      ${group.rows.map(([label, value]) => `
        <div class="coverage-row">
          <span>${escapeHtml(label)}</span>
          <strong>${value}</strong>
        </div>
      `).join("")}
    </article>
  `).join("");
}

function getFilteredAssemblyPages() {
  const query = normalizeText(assemblyState.query);
  return assemblyPages
    .filter((page) => assemblyMatchesLocation(page))
    .filter((page) => !query || assemblySearchText(page).includes(query));
}

function renderAssemblySummary(pages) {
  if (!els.assemblyResultSummary) {
    return;
  }
  const total = assemblyPages.length;
  els.assemblyResultSummary.hidden = false;
  const hasFilters = Boolean(assemblyState.query) ||
    assemblyState.macroRegion !== "all" ||
    assemblyState.prefecture !== "all" ||
    assemblyState.municipality !== "all";
  els.assemblyResultSummary.textContent = hasFilters
    ? `${pages.length}件表示 / 全${total}件`
    : `掲載中の議会ページ ${total}件`;
}

function renderAssemblyPages(pages = assemblyPages) {
  if (!els.assemblyGrid) {
    return;
  }

  const buildAssemblyChips = (page) => [
    page.scopeLabel,
    page.latestSessionLabel,
    page.latestSessionDateLabel,
  ].filter(Boolean).map((label) => `<span class="subtype-pill">${escapeHtml(label)}</span>`).join("");

  if (!pages.length) {
    els.assemblyGrid.innerHTML = `
      <article class="assembly-card">
        <strong>該当する議会ページがまだありません。</strong>
        <p class="assembly-copy">キーワードや地域条件をゆるめると見つかる場合があります。</p>
        <div class="chip-row">
          <button class="summary-action" type="button" data-assembly-reset="true">条件をリセット</button>
          <a class="summary-action" href="#coverage">データ状況を見る</a>
        </div>
      </article>
    `;
    return;
  }

  els.assemblyGrid.innerHTML = pages.map((page) => `
    <a class="assembly-card assembly-card-link" href="${escapeHtml(page.href)}">
      <div class="card-topline">
        <span class="type-pill municipal">${escapeHtml(page.categoryLabel)}</span>
        ${page.hasLatestSession ? '<span class="date-badge">最新回あり</span>' : ""}
      </div>
      <strong>${escapeHtml(page.title)}</strong>
      <p class="assembly-copy">${escapeHtml(page.body)}</p>
      <div class="chip-row">${buildAssemblyChips(page)}</div>
    </a>
  `).join("");
}

function renderFeaturedAssemblyPages() {
  if (!els.featuredAssemblyGrid) {
    return;
  }

  const featuredPages = assemblyPages
    .filter((page) => page.municipalityName)
    .map((page) => {
      const reason = getFeaturedAssemblyReason(page);
      return {
        ...page,
        featureScore: getAssemblyFeatureScore(page),
        featuredReasonLabel: reason.label,
        featuredReasonTone: reason.tone,
        featuredReasonNote: reason.note,
      };
    })
    .sort((left, right) => right.featureScore - left.featureScore)
    .slice(0, 6);

  const buildAssemblyChips = (page) => [
    page.scopeLabel,
    page.latestSessionLabel,
    page.latestSessionDateLabel,
  ].filter(Boolean).map((label) => `<span class="subtype-pill">${escapeHtml(label)}</span>`).join("");

  els.featuredAssemblyGrid.innerHTML = featuredPages.map((page) => `
    <a class="assembly-card assembly-card-link" href="${escapeHtml(page.href)}">
      <div class="card-topline">
        <span class="type-pill municipal">${escapeHtml(page.categoryLabel)}</span>
        <span class="date-badge ${escapeHtml(page.featuredReasonTone ?? "muted")}">${escapeHtml(page.featuredReasonLabel ?? "注目")}</span>
      </div>
      <strong>${escapeHtml(page.title)}</strong>
      <p class="assembly-copy">${escapeHtml(page.body)}</p>
      <p class="assembly-copy">${escapeHtml(page.featuredReasonNote ?? "")}</p>
      <div class="chip-row">${buildAssemblyChips(page)}</div>
    </a>
  `).join("");
}

function renderResourceChips(election) {
  return election.resourceKinds.map((kind) => `
    <span class="kind-chip ${kind}">${escapeHtml(KIND_LABELS[kind] ?? kind)}</span>
  `).join("");
}

function renderSubtypePills(election) {
  return (election.subtypes ?? [election.subtype])
    .map((subtype) => `<span class="subtype-pill ${escapeHtml(subtype ?? "unknown")}">${escapeHtml(SUBTYPE_LABELS[subtype] ?? subtype)}</span>`)
    .join("");
}

function getElectionCardTitle(election) {
  if (!election.prefectureName) return election.name;
  return `${election.name} （${election.prefectureName}）`;
}

function hasActiveFilters() {
  return Boolean(state.query) ||
    state.macroRegion !== "all" ||
    state.prefecture !== "all" ||
    state.municipality !== "all";
}

function getEmptyStateHints() {
  const hints = [];
  const digits = getPostalDigits(state.query);
  const hasPostalQuery = digits.length >= 3;
  const postalMatch = getPostalMatch(state.query);

  if (hasPostalQuery && !postalMatch) {
    hints.push("入力された郵便番号の先頭3桁は、まだ対応データに入っていません。市区町村名や都道府県名でも試してください。");
  } else if (hasPostalQuery && postalMatch) {
    hints.push(`${postalMatch.prefix} は ${postalMatch.regionName} に対応する郵便番号データです。地方や種別の条件を外すと見つかる場合があります。`);
  } else if (state.query) {
    hints.push("地域名、選挙名、候補者、公報など、検索語を短くすると見つかる場合があります。");
  }

  if (state.municipality !== "all") {
    const region = regionById.get(state.municipality);
    hints.push(`市区町村が「${region?.name ?? state.municipality}」に絞られています。`);
  } else if (state.prefecture !== "all") {
    const region = regionById.get(state.prefecture);
    hints.push(`都道府県が「${region?.name ?? state.prefecture}」に絞られています。`);
  } else if (state.macroRegion !== "all") {
    hints.push(`地方が「${MACRO_REGION_LABELS[state.macroRegion] ?? state.macroRegion}」に絞られています。`);
  }

  if (!hints.length) {
    hints.push("掲載中のデータに該当する選挙がまだありません。対応地域は順次拡張中です。");
  }

  return hints;
}

function getEmptyStateActions() {
  const actions = [];
  const digits = getPostalDigits(state.query);
  const hasPostalQuery = digits.length >= 3;
  const postalMatch = getPostalMatch(state.query);
  const hasNarrowFilters = state.macroRegion !== "all" ||
    state.prefecture !== "all" ||
    state.municipality !== "all";

  if (hasNarrowFilters) {
    actions.push({ action: "relax-filters", label: "フィルターを広げる", primary: true });
  }

  if (hasPostalQuery && !postalMatch) {
    actions.push({ action: "search-region", label: "地域名で探す", primary: !hasNarrowFilters });
  } else if (state.query) {
    actions.push({ action: "focus-search", label: "検索語を変える", primary: !hasNarrowFilters });
  }

  if (hasActiveFilters()) {
    actions.push({ action: "reset-all", label: "条件をリセット", primary: !actions.length });
  }

  actions.push({ action: "coverage", label: "対応状況を見る", primary: false });
  return actions;
}

function renderElectionList(elections) {
  if (!elections.length) {
    const hints = getEmptyStateHints();
    const actions = getEmptyStateActions();
    els.electionList.innerHTML = `
      <div class="empty-state">
        <p class="empty-kicker">no matched elections</p>
        <h3>該当する選挙がありません</h3>
        <p class="empty-reason">掲載中のデータ範囲では一致する選挙が見つかりませんでした。</p>
        <ul>
          ${hints.slice(0, 4).map((hint) => `<li>${escapeHtml(hint)}</li>`).join("")}
        </ul>
        <div class="empty-actions">
          ${actions.map((item) => item.action === "coverage"
            ? `<a class="empty-action" href="#coverage">${escapeHtml(item.label)}</a>`
            : `<button class="empty-action${item.primary ? " primary" : ""}" type="button" data-empty-action="${escapeHtml(item.action)}">${escapeHtml(item.label)}</button>`
          ).join("")}
        </div>
      </div>
    `;
    return;
  }

  els.electionList.innerHTML = elections.map((election) => {
    const badge = getDateBadge(election);
    const selected = election.id === state.selectedId ? " selected" : "";
    return `
      <article class="election-card${selected}" data-election-id="${escapeHtml(election.id)}">
        <button class="card-main" type="button">
          <span class="card-topline">
            <span class="type-pill ${election.type}">${escapeHtml(TYPE_LABELS[election.type] ?? election.type)}</span>
            ${renderSubtypePills(election)}
            <span class="date-badge ${badge.tone}">${escapeHtml(badge.text)}</span>
          </span>
          <strong>${escapeHtml(getElectionCardTitle(election))}</strong>
          <span class="card-date">${escapeHtml(formatDate(election.voteDate))}</span>
        </button>
      </article>
    `;
  }).join("");
}

function groupResources(resources) {
  return resources.reduce((groups, resource) => {
    if (!groups[resource.kind]) groups[resource.kind] = [];
    groups[resource.kind].push(resource);
    return groups;
  }, {});
}

function sortResources(resources) {
  return [...resources].sort((left, right) => {
    const leftOrder = left.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.displayOrder ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder || String(left.title ?? "").localeCompare(String(right.title ?? ""), "ja");
  });
}

function getResourceGroups(grouped) {
  const knownKinds = new Set(RESOURCE_GROUPS.map((group) => group.kind));
  const knownGroups = RESOURCE_GROUPS.filter((group) => grouped[group.kind]?.length);
  const unknownGroups = Object.keys(grouped)
    .filter((kind) => !knownKinds.has(kind))
    .sort()
    .map((kind) => ({
      kind,
      heading: KIND_LABELS[kind] ?? "関連する公式情報",
      note: "公式ページまたは公式PDFとして確認できたリンクです。",
      action: "公式情報を見る",
    }));

  return [...knownGroups, ...unknownGroups];
}

function getSpecialDetailLinkData(election) {
  if (election.isJoint) return null;
  const links = {
    "el-pref-15-governor-2026": {
      href: "elections/niigata-governor-2026.html",
      text: "報道ベースの出馬動向は専用ページへ",
    },
    "el-pref-25-governor-2026": {
      href: "elections/shiga-governor-2026.html",
      text: "報道ベースの候補予定者ページへ",
    },
    "el-mun-10209-mayor-2026": {
      href: "elections/fujioka-mayor-2026.html",
      text: "報道ベースの候補予定者ページへ",
    },
  };
  return links[election.id] ?? null;
}

function getSpecialDetailLink(election) {
  const detailLink = getSpecialDetailLinkData(election);
  if (!detailLink) return "";
  return `
    <a class="source-link" href="${detailLink.href}">${detailLink.text}</a>
  `;
}

function isPdfResource(resource) {
  return /\.pdf(?:$|[?#])/i.test(String(resource.url ?? "")) || /pdf/i.test(String(resource.title ?? ""));
}

function getResourceSummary(resource, election) {
  const resourceType = isPdfResource(resource) ? "PDF" : "ページ";
  const fallback = String(resource.summary ?? "").trim() || "公式リンク";
  const title = String(resource.title ?? "");
  const isSharedPage = /市長・市議会議員選挙|市長選.*市議会議員選挙|市議会議員選挙.*市長選/.test(title)
    || /市議会議員選挙/.test(fallback);

  if (resource.kind === "candidate_list") {
    return `立候補届出や候補者氏名を確認できる公式${resourceType}。`;
  }
  if (resource.kind === "bulletin") {
    if (isSharedPage) {
      return `市長選と市議会議員選挙をまとめた選挙公報の公式${resourceType}。`;
    }
    return `候補者の主張や経歴を確認できる選挙公報の公式${resourceType}。`;
  }
  if (resource.kind === "early_voting") {
    if (isSharedPage) {
      return `市長選と市議会議員選挙でも使う期日前投票の公式${resourceType}。`;
    }
    return `期日前投票の期間、場所、受付時間を確認できる公式${resourceType}。`;
  }
  if (resource.kind === "polling_place") {
    if (isSharedPage) {
      return `市長選と市議会議員選挙でも使う投票所案内の公式${resourceType}。`;
    }
    return `投票所の場所や対象区域を確認できる公式${resourceType}。`;
  }
  if (resource.kind === "other" && isSharedPage) {
    return `市長選と市議会議員選挙をまとめた公式${resourceType}。`;
  }
  return fallback;
}

function renderDetail(election, elections = []) {
  if (!election) {
    els.detail.innerHTML = `
      <div class="detail-empty">
        <h3>選挙を選んでください</h3>
        <p>左のカードを選ぶと、公式リンクと日程がここに表示されます。</p>
      </div>
    `;
    return;
  }

  const badge = getDateBadge(election);
  const officialSite = getElectionOfficialSite(election);
  const resourceSections = sortResources(election.resources)
    .map((resource) => `
      <a class="resource-link ${escapeHtml(resource.kind ?? "other")}" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">
        <span>
          <strong>${escapeHtml(resource.title)}</strong>
          <small>${escapeHtml(getResourceSummary(resource, election))}</small>
        </span>
      </a>
    `).join("");

  els.detail.innerHTML = `
    <article class="detail-card">
      <div class="detail-kicker">
        <span class="type-pill ${election.type}">${escapeHtml(TYPE_LABELS[election.type] ?? election.type)}</span>
        ${renderSubtypePills(election)}
        <span class="date-badge ${badge.tone}">${escapeHtml(badge.text)}</span>
      </div>
      <h3>${escapeHtml(election.name)}</h3>
      <p class="detail-desc">${escapeHtml(election.description)}</p>
      ${election.isJoint ? `
        <p class="detail-included">
          <strong>含まれる選挙</strong>
          <span>${escapeHtml(election.includedElectionNames.join(" / "))}</span>
        </p>
      ` : ""}
      <dl class="detail-facts">
        <div><dt>投票日</dt><dd>${escapeHtml(formatDate(election.voteDate))}</dd></div>
        <div><dt>告示日</dt><dd>${escapeHtml(formatDate(election.noticeDate))}</dd></div>
        <div><dt>地域</dt><dd>${escapeHtml(election.primaryRegionName)}</dd></div>
        ${officialSite ? `
          <div>
            <dt>${escapeHtml(officialSite.factLabel)}</dt>
            <dd>
              <a class="detail-inline-link" href="${escapeHtml(officialSite.url)}" target="_blank" rel="noopener noreferrer">
                ${escapeHtml(officialSite.actionLabel)}
              </a>
            </dd>
          </div>
        ` : ""}
      </dl>
      <a class="source-link" href="${escapeHtml(election.sourceUrl)}" target="_blank" rel="noopener noreferrer">確認元の公式ページを開く</a>
      ${getSpecialDetailLink(election)}
      <div class="resources">
        <h4>公式リンク</h4>
        ${resourceSections || "<p>表示できる公式リンクがまだありません。</p>"}
      </div>
    </article>
  `;
}

function renderSummary(view) {
  els.resultSummary.textContent = "";
  els.resultSummary.hidden = true;
}

function selectElection(id, shouldScroll = false) {
  const isSameSelection = state.selectedId === id;
  if (isSameSelection && !shouldScroll) return;

  state.selectedId = id;
  const visibleElections = buildDisplayElections(getFilteredElections());
  const selected = visibleElections.find((election) => election.id === id || election.electionIds?.includes(id)) ?? null;
  if (!isSameSelection) {
    renderDetail(selected, visibleElections);
    document.querySelectorAll(".election-card").forEach((card) => {
      card.classList.toggle("selected", card.dataset.electionId === id);
    });
    if (id) history.replaceState(null, "", `#${id}`);
  }
  if (shouldScroll) document.getElementById("detail").scrollIntoView({ behavior: "smooth", block: "start" });
}

function render() {
  const view = getElectionView();
  const elections = view.elections;
  if (!state.selectedId || !elections.some((election) => election.id === state.selectedId || election.electionIds?.includes(state.selectedId))) {
    state.selectedId = elections[0]?.id ?? null;
  }

  renderSummary(view);
  renderElectionList(elections);
  renderDetail(elections.find((election) => election.id === state.selectedId || election.electionIds?.includes(state.selectedId)) ?? null, elections);
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  els.macroRegionFilter.addEventListener("change", (event) => {
    state.macroRegion = event.target.value;
    state.prefecture = "all";
    state.municipality = "all";
    renderLocationFilters();
    render();
  });

  els.prefectureFilter.addEventListener("change", (event) => {
    state.prefecture = event.target.value;
    state.municipality = "all";
    renderLocationFilters();
    render();
  });

  els.municipalityFilter.addEventListener("change", (event) => {
    state.municipality = event.target.value;
    render();
  });

  els.resetFilters.addEventListener("click", () => {
    state.query = "";
    state.macroRegion = "all";
    state.prefecture = "all";
    state.municipality = "all";
    els.searchInput.value = "";
    initFilters();
    render();
  });

  els.electionList.addEventListener("click", (event) => {
    const emptyAction = event.target.closest("[data-empty-action]");
    if (emptyAction) {
      const action = emptyAction.dataset.emptyAction;
      if (action === "relax-filters") {
        state.macroRegion = "all";
        state.prefecture = "all";
        state.municipality = "all";
        initFilters();
        render();
        return;
      }
      if (action === "search-region") {
        state.query = "";
        state.macroRegion = "all";
        state.prefecture = "all";
        state.municipality = "all";
        els.searchInput.value = "";
        initFilters();
        render();
        els.searchInput.focus();
        return;
      }
      if (action === "focus-search") {
        els.searchInput.focus();
        return;
      }
      if (action === "reset-all") {
        els.resetFilters.click();
        els.searchInput.focus();
      }
      return;
    }

    const card = event.target.closest(".election-card");
    if (!card) return;
    const shouldJumpToDetail = Boolean(event.target.closest("[data-detail-jump]"));
    if (shouldJumpToDetail) event.preventDefault();
    selectElection(card.dataset.electionId, shouldJumpToDetail);
  });

  els.assemblySearchInput.addEventListener("input", (event) => {
    assemblyState.query = event.target.value;
    renderAssemblySection();
  });

  els.assemblyMacroRegionFilter.addEventListener("change", (event) => {
    assemblyState.macroRegion = event.target.value;
    assemblyState.prefecture = "all";
    assemblyState.municipality = "all";
    renderAssemblyLocationFilters();
    renderAssemblySection();
  });

  els.assemblyPrefectureFilter.addEventListener("change", (event) => {
    assemblyState.prefecture = event.target.value;
    assemblyState.municipality = "all";
    renderAssemblyLocationFilters();
    renderAssemblySection();
  });

  els.assemblyMunicipalityFilter.addEventListener("change", (event) => {
    assemblyState.municipality = event.target.value;
    renderAssemblySection();
  });

  els.assemblyResetFilters.addEventListener("click", () => {
    assemblyState.query = "";
    assemblyState.macroRegion = "all";
    assemblyState.prefecture = "all";
    assemblyState.municipality = "all";
    els.assemblySearchInput.value = "";
    renderAssemblyLocationFilters();
    renderAssemblySection();
  });

  els.assemblyGrid.addEventListener("click", (event) => {
    const reset = event.target.closest("[data-assembly-reset]");
    if (!reset) return;
    els.assemblyResetFilters.click();
    els.assemblySearchInput.focus();
  });
}

function initFromHash() {
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  const displayElections = buildDisplayElections(DATA.elections);
  if (displayElections.some((election) => election.id === id || election.electionIds?.includes(id))) {
    state.selectedId = id;
  }
}

function renderAssemblySection() {
  const pages = getFilteredAssemblyPages();
  renderAssemblySummary(pages);
  renderAssemblyPages(pages);
}

initFromHash();
initFilters();
renderAssemblyLocationFilters();
renderHero();
renderAssemblySection();
renderFeaturedAssemblyPages();
renderCoverage();
bindEvents();
render();
