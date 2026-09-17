/* =============================================================================
   app.js - Mann Mausam. No framework, no build step. ES5-ish for old devices.
   ============================================================================= */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var T = window.Translit || { line: function (s) { return s; }, supports: function () { return false; } };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var LANG_NAMES = { bn: "Bangla", hi: "Hindi", en: "English" };

  /* Reader-button icons as SVGs (class btn-i, the same 1.1em box the hero/contact buttons
     use), so every button's icon reads at the same size -- Unicode glyphs like the old
     "=~" and arrows each drew at their own size, which looked uneven. */
  var ICON = {
    say:  '<svg class="btn-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9c1.3-2.1 2.6-2.1 3.9 0s2.6 2.1 3.9 0 2.6-2.1 3.9 0 2.6 2.1 3.9 0"/><path d="M3 15c1.3-2.1 2.6-2.1 3.9 0s2.6 2.1 3.9 0 2.6-2.1 3.9 0 2.6 2.1 3.9 0"/></svg>',
    mean: '<svg class="btn-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13M14 5l3 3-3 3"/><path d="M20 16H7M10 13l-3 3 3 3"/></svg>',
    play: '<svg class="btn-i" viewBox="0 0 24 24"><path d="M7 5v14l12-7z" fill="currentColor"/></svg>',
    stop: '<svg class="btn-i" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1.6" fill="currentColor"/></svg>',
    pause:'<svg class="btn-i" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>',
    restart:'<svg class="btn-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12a8.5 8.5 0 1 0 2.4-5.9"/><path d="M3 4.5V9h4.5"/></svg>',
    spark:'<svg class="btn-i" viewBox="0 0 24 24"><path d="M12 2.5l1.9 6.1L20 10l-6.1 1.4L12 17.5 10.1 11.4 4 10l6.1-1.4z" fill="currentColor"/></svg>',
    share:'<svg class="btn-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="6" r="2.3"/><circle cx="18" cy="18" r="2.3"/><path d="M8.1 10.9l7.8-3.9M8.1 13.1l7.8 3.9"/></svg>',
    copy: '<svg class="btn-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
    // small badge icons: recording (music note), author translation (arrows), image (picture)
    bAudio:'<svg class="badge-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17V4l10-1.6V15"/><ellipse cx="6.4" cy="17.4" rx="2.6" ry="2.1" fill="currentColor" stroke="none"/><ellipse cx="16.4" cy="15.4" rx="2.6" ry="2.1" fill="currentColor" stroke="none"/></svg>',
    bTrans:'<svg class="badge-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13M14 5l3 3-3 3"/><path d="M20 16H7M10 13l-3 3 3 3"/></svg>',
    bImg:'<svg class="badge-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="8.5" cy="10" r="1.7"/><path d="M4 17l4.5-4.5 3.5 3 3-3 5 5"/></svg>'
  };

  /* --------------------------------------------------------- BUILT-IN POEMS
     Mousumee's real collection, bundled into the site as the last-resort fallback:
     used if both the live Google Sheet and the committed content/poems.csv can't be
     reached. Keep this in sync with the sheet when the collection changes. */
  var SAMPLE_ROWS = [
    { slug:"ghran-sopan", title:"ঘ্রান সোপান", title_roman:"Ghran Sopan", title_english:"The Ladder of Odour", lang:"bn", date:"2026-07-15", tags:"scent, nostalgia, childhood", poem:"জানো!\nসব সম্পর্কেরই\nএকটা নিজস্ব ঘ্রাণ আছে।\nপ্রতিটি ব্যক্তিত্ব আপন গন্ধে ধনী।\n \nজানো!\nজীবনের সবচেয়ে সঘন তমসায়\nচোখে না দেখেও, স্পর্শ-মাত্র না করেও\nতোমায় আমি চিনে ফেলি।\n \nজানো কি,\nগন্ধরা চিরস্থায়ী হয়।\nনাসারন্ধ্র বেয়ে\nহৃদয় মাঝে মায়াবী তারা,\nবায়বীয় বাসা বাঁধে!\nটের পাওনি?\n \nজানি আমি!\nকরঞ্জ তেলে চুপচুপে চুল,\nহুক্কায় ঢাকা তামাক টানা,\nআমার মুখ ধাইমার কোলে মাথা রেখে,\nমারাং বুরুর গাথা শোনার সুগন্ধ\nএখনো আমায় জঙ্গলঘন\nমায়ালোকে পৌঁছে দেয়।\nমায়ের আঁচলের হলুদ,\nসিগারেটের ধোঁয়া মাখা বাবার শার্টে মুখ গুঁজে,\nকি পরম নির্ভরতার আঘ্রাণ...\n \nমনে আছে?\nচিঠি লেখা তারুণ্যের সেই কাঁচা দিনগুলি!\nইনফ্যাচুয়েশন-এর মোহিনী সৌরভে আচ্ছন্ন;\nহঠাৎ করে পা ঠেকে যাওয়া ধুলোমাখা ধরাতলে,\nপ্রচণ্ড রোদ, বাস্তবের ঘামের গন্ধ\nতোমার চুম্বনে পরিনত হতো\nস্নিগ্ধ বসন্তে!\n \nজানো কি,\nসব সম্পর্ক গোলাপগন্ধী নয়।\nমৎস্যগন্ধী,\nনিশ্চিত তবে।\nকোনো কোনোটি,\nশিশু লালনে দুগ্ধ ধারায় আপ্লুত,\nহয়তো বা,\nঝাঁঝালো, কটু, হাসপাতালের ঔষধের,\nশ্মশানের ধূম্রজাল মাখা হয়,\nতবুও\nমৃত্তিকাবাহী জীবন\nযোজন যোজনগন্ধী।\n \nস্বেদ, অশ্রু,\nআবেগ-রসে স্নাত সুরভি\nতোমার অনুভূতি,\nতোমার উপস্থিতি!\n \nকেন তবে,\nকৃত্রিম সুগন্ধের আড়ালে\nনিজেকে লুকিয়ে ফেলো?\nকেন তবে,\nসুরভিত শরীরে\nঅচেনা আতর ঢালো?\n \nবাতাসে ভাসে যে\nতোমার সৌরভ স্বাক্ষর\nমুছে ফেল যদি,\nঅগাধ আঁধারে\nকোথায় হাতড়ে খুঁজি\nতোমার একান্ত আঁচল?\nপরিশ্রান্ত, উদ্ভ্রান্ত এ মুখ\nঅন্তরীক্ষে\nবলো কোথায় লুকাই!\nছন্দ ফিরে পাই!", translation_en:"Do you know?\nEvery relationship has its own odour.\nEvery personality is enriched with its own flavour.\n \nDo you know?\nIn life's deepest dark\nI can know you are there\nnot by seeing, not by hearing,\nneither by touching.\n \nKnow what?\nFragrances are perpetual.\n \nLike magical beings they climb down the nostrils to our hearts\nAnd build their ethereal homes there.\nDidn't you realise?\n \nI know!\nMy aaya, nanny Miyam,\nWhose hair was soaked in karanj oil\nAnd who took puffs of the hookah,\nI used to rest my head on her lap and listen to the stories of Marang Buru,\nThat very odour even now transcends me to the mysterious world of landless dense jungles.\n \nMy mother's saree,\naanchal,\nsmeared with turmeric and kitchen spices;\nMy father's shirt,\ntobacco-flavoured with his constant cigarette smoking,\nI used to tuck my face into those to indulge in\nThat absolute smell of trust and safety...\nAah!\n \nRemember?\nThose days of letter-writing in raw adolescence?\nPossessed by the mystic fragrance of\ninfatuation,\nflying in a psychedelic seventh heaven...\n \nAll of a sudden when feet were stumped\nOn the hard ground of ruthless reality,\nThe scorching sun,\nThe dust and mud and sweat of the real world,\nAll transformed into that indulging sweet spring evening\nBy our first kiss!\nRemember?\n \nBut\ndo you know?\nNot all relationships have that sweet floral flavour.\nSome are fish-scented\nbut trusting.\nSome carry the odour of overflowing milk of breastfeeding,\nchildcare.\nSome are musty, pungent, hospital-medicinal.\nSome bear the last smoke of burning ghats,\nAnd yet this earthy-flavoured life is unfathomably deep,\nimmeasurably long.\n \nThe aroma drenched\nin the juices of sweat, tears and emotions\nis your own.\nYour customized existence,\nYour personality.\n \nThen why?\nWhy do you hide yourself\nbehind the artificial scents?\n \nIf you erase your\nsignature odour from the ether,\ntell me,\nhow can I find\nyour aanchal to plunge into?\nHow can I take refuge?\nHow can I dive into the\npeace?\nHow can I find my rhythm back?", translit:"jano!\nsob somporker i\nekota nijoso ghran achhe\nprotiti boktit apon gondhe dhoni\n\njano!\njiboner sobocheye soghon tomosay\nchokhe na dekheo, sporsh-matr na koreo\ntomay ami chine pheli\n\njano ki,\ngondhora chirosthayi hoy\nnasarondhr beye\nhrid majhare mayabi tara,\nbayobiy basa bandhe!\nter paoni?\n\njani ami !\nkoronj tele chupochupe chul ,\nhukkay dakata tamakotana,\namar munda dhaimar kole matha rekhe ,\nmarangg gomoker gatha shonar sugondh\nekhono amay jonggologhon\nmayaloke pounchhe dey\nmayer ancholer holud,\nsigareter dhonya makha babar sharte mukh gunje ,\nki porom nirbhorotar aghran...\n\nmone achhe?\nchithi lekha taruner sei kancha dinoguli!\ninphachuyeshon-er mohini sourobhe achchhonn;\nhothat kore pa theke jaoya dhulomakha dhoratole,\nprochond rod - bastober ghemo gondh\ntomar chumone porinot hoto\nsnigdh bosonte !\n\njano ki,\nsob sompork golapogondhi noy\nashost motosogondha,\nnischito tobe,\nkono konoti,\nshishu lalone dugdh dharay aplut,\nhoyoto ba,\njhanjhalo, kotu, hasopataler oushodhey ,\nshmoshaner dhumrojal makha hoy,\ntobuo\nmrittikabahi jibon\njojon jojonogondhi\n\nsed, oshru,\nabeg-rose snat surobhi\ntomar onubhuti,\ntomar uposthiti!\n\nken tobe,\nkritrim sugondher arale\nnijeke lukiye phelo?\nken tobe,\nsurobhit shorire\nochena ator dhalo?\n\nbatase bhase je\ntomar sourobh sakshor\nmuchhe phel jodi,\nogadh andhare\nkothay hatore khunji\ntomar ekant anchol?\nporishrant, udbhrant e mukh\nontorikshe\nbolo kothay lukai!\nchhond phire pai!" },
    { slug:"birohi-shrabon", title:"বিরহী শ্রাবণ", title_roman:"Birohi Shrabon", title_english:"The Lovelorn Monsoon", lang:"bn", date:"2026-08-28", tags:"monsoon, nature, longing", poem:"একটি ঋতু,\nএকটি দিবস,\nএকটি যামিনী,\nএকটি মুহূর্ত নিদেন পক্ষে,\nআপন করে তোমায় দিতাম\nহে বন্ধু,\nএলো যে শ্রাবণ\nমধু পার্বন\nকিন্তু তুমি যে এলেনা।\n\nআম্রকাননে ওই যে ঝুলনা\nছুঁয়েছে মেঘের কালো সীমানা\nএসেছে সখীরা কাজল নয়না\nআকুল আমন্ত্রণ।\nকেন তুমি মিছে কথা দিয়েছিলে,\nআমার ঝুলনা ঝোলা তো হলোনা\nএলো যে শ্রাবণ\nআঁখি জলের মতন\nবন্ধু তুমি তবু এলেনা!\n\nঝর ঝর ঝর ঝরছে ঝর্ণা,\nবন বিথিকা ঘন হরিৎ বর্ণা,\nবনফুল গেঁথে পরেছে গহনা।\nশ্যামল কান্তি সবুজ ওড়না\nআমার পরা তো হলোনা।\nএলো যে শ্রাবণ\nঘোর শিহরণ\nবন্ধু তুমি কেন এলেনা!\n\nএকটি ঋতু আমার নামেতে,\nদিবস রজনী আমার নামেতে,\nমুহূর্তটুকু আমার নামেতে,\nকাঁধটি তোমার দিও গো বন্ধু হে!\nফুঁপিয়ে কেঁদেছে ঘন বরিষণ।\nবুক হু হু করা সেই ক্রন্দন,\nকাঁধে মাথা রেখে তোমার\nহে বন্ধু,\nআমার কাঁদা তো হলোনা।\n\nএলো যে শ্রাবণ\nবাণভাসির মতন\nকাগুজে আমার কিস্তিতে, আমি\nএকা একা একা ডুবলাম।\nসামলাতে তরী\nবন্ধু কান্ডারী, তুমি\nএলেনা! এলেনা! এলেনা!\n\nএক গৃহকোণ,\nএকটি উঠোন,\nএক ফালি ক্ষেত,\nসোনালী ফলন\nনামে আমাদের\nআমার বন্ধু হে\nকরা তো আমার হলোনা!\n\nবন্ধু হে আমার,\nএবারও শ্রাবণে\nএসেছে শ্রাবণ\nএবারও তো তুমি এলেনা!!", translation_en:"A season,\na day,\na night,\nat the very least, a moment,\nI would have made you mine.\nO beloved,\nthe monsoon came\nthe sacred season,\nbut you did not come.\n\nIn the mango grove, the swing\ntouches the dark edge of clouds.\nMy girlfriends arrived, kohl-lined eyes,\ntheir urgent invitation.\nWhy did you break your word?\nMy swing never swayed.\nThe monsoon came\nlike tears from my eyes.\nBeloved, still you did not come!\n\nSplash, splash, splash, the waterfall flows,\nforest paths thick and verdant,\nwildflowers adorned like jewels.\nThe dusky beauty, the green veil,\nI never got to wear it.\nThe monsoon came\nwith terrible trembling.\nBeloved, why didn't you come?\n\nA season bearing my name,\ndays and nights bearing my name,\neach moment bearing my name,\ngive me your shoulder, O beloved.\nThe heavy rain wept in sobs.\nThat heart-wrenching lamentation,\nResting my head on your shoulder\nO beloved,\nI never got to weep.\n\nThe monsoon came\nlike the arrow-float,\nin my share of paper life, I\nalone, alone, alone drowned.\nTo steady the boat,\nfriend, boatman, you\ndid not come! Did not come! Did not come!\n\nA corner of home,\na courtyard,\na strip of field,\ngolden harvests\nnamed for us,\nmy beloved,\nI never got to build it!\n\nMy beloved,\nonce again in the monsoon season\nthe monsoon has come\nand still you have not come!!", translit:"ekoti ritu,\nekoti dibos,\nekoti jamini,\nekoti muhurt niden pokshe,\napon kore tomay ditam\nhe bondhu,\nelo je shrabon\nmodhu paron\nkintu tumi je elena\n\namrokanone oi je jhulona\nchhunyechhe megher kalo simana\nesechhe sokhira kajol noyona\nakul amontron\nken tumi michhe kotha diyechhile,\namar jhulona jhola to holona\nelo je shrabon\nankhi joler moton\nbondhu tumi tobu elena!\n\njhor jhor jhor jhorochhe jhorna,\nbon bithika ghon horit borna,\nbonophul genthe porechhe gohona\nshamol kanti sobuj orona\namar pora to holona\nelo je shrabon\nghor shihoron\nbondhu tumi ken elena!\n\nekoti ritu amar namete,\ndibos rojoni amar namete,\nmuhurtotuku amar namete,\nkandhoti tomar diogo bondhu he!\nphunpiye kendechhe ghon borishon\nbuk hu hu kora sei krondon,\nkandhe matha rekhe tomar\nhe bondhu,\namar kanda to holona\n\nelo je shrabon\nbanobhasir moton\nkaguje amar kistite, ami\neka eka eka dubolam\nsamolate tori\nbondhu kandari, tumi\nelena! elena! elena!\n\nek grihokon,\nekoti uthon,\nek phali kshet,\nsonali pholon\nname amader\namar bondhu he\nkorato amar holona!\n\nbondhu he amar,\nebaro shrabone\nesechhe shrabon\nebar o to tumi elena!!", note:"A Kajri", image:"images/white-flower.jpg" },
    { slug:"amar-sadhinota", title:"আমার স্বাধীনতা", title_roman:"Amar Sadhinota", title_english:"My Freedom", lang:"bn", date:"2026-08-14", tags:"freedom, patriot", poem:"এই এসেছে\nস্বাধীনতার ভোর।\nকেমন যেন আঁধার আঁধার আঁধার।\nকেমন যেন কালচে শোণিত জমাট।\n \nএই ফুটেছে\nস্বাধীনতার ফুল।\nকেমন যেন নীরক্ত ফ্যাকাশে।\nকেমন যেন রক্ত গন্ধ মাখা।\n \nএকান্ত প্রার্থিত,\nএই তুমুল স্বাধীন হাওয়া\nকেমন যেন আর্তনাদে চাপা,\nকেমন যেন আতঙ্ক উল্কী ছাপা।\n \nগান ভেসেছে আকাশ জুড়ে আজ।\nকেন কান্না ঝরা সুরে এ গান বোনা?\n \nতবুও এ যে আমার!\nআমার নিজের স্বাধীনতা!\nপুর্বতন আমার নারী পুরুষ\nঅসংখ্য প্রাণ আহুতি দিয়ে তাদের,\nআমার তরে অমূল্য দামে কেনা।\nতাই তো আমার এই যে স্বাধীনতা\nবড় প্রিয়, বড়ই আমার চেনা।\n \nরাখছি একে জড়িয়ে আমার বুকে\nশক্ত হাতের রক্ষা আগল দিয়ে।\nনষ্ট নজর ছোঁয় না যেন তাকে!\nঅনাগত প্রজন্মরাও যেন\nশুদ্ধ, স্বাধীন চেতন হয়ে থাকে।", translation_en:"This dawn has arrived,\nfreedom's dawn.\nYet it is darkness, darkness, darkness.\nLike clotted blood, dark and thick.\n\nThis flower has bloomed,\nfreedom's flower.\nYet it is bloodless and pale.\nYet it is stained with the scent of blood.\n\nArdently prayed for,\nthis tumultuous free wind\nis muffled beneath cries of anguish,\nis branded with the mark of terror.\n\nSongs float across the sky today.\nWhy is this song woven in weeping melodies?\n\nYet this is mine!\nMy own freedom!\nMy ancestors, men and women before me,\ncountless lives sacrificed for it,\nbought for me at an incalculable price.\nSo this freedom of mine\nis deeply beloved, deeply known to me.\n\nI hold it close, clutching it to my chest,\nguarded by the strong lock of my hands.\nLet no corrupted gaze touch it!\nLet the generations yet to come\nremain pure, awakened to freedom's consciousness.", translit:"ei eseche\nswadhinotar bhor.\nkemon jeno andhar andhar andhar.\nkemon jeno kalche shonito jomat.\n\nei phutechhe\nsadhinotar phul\nkemon jeno nirokt phakashe\nkemon jeno rokto gondh makha\n\nekanto prarthito,\nei tumul sadhin haoya\nkemon jeno artonade chapa,\nkemon jeno atongk ulki chhapa\n\ngan bhesechhe akash jure aj\nken kanna jhora sure e gan bona?\n\ntobuo e je amar!\namar nijer sadhinota!\npuroton amar nari purush\nosonkko pran ahuti diye tader,\namar tore omul dame kena.\ntai to amar ei je sadhinota\nbodd priy , boroi amar chena\n\nrakhochhi eke joriye amar buke\nshokt hater roksha agol diye.\nnosht nojor chhony na jeno take!\nonagot projonmorao jeon\nshuddh, sadhin-cheton hoye thake" },
    { slug:"vah-baragad-ki-chhanv", title:"वह बरगद की छांव", title_roman:"Vah Baragad Ki Chhanv", title_english:"Shade Of The Banyan Tree", lang:"hi", date:"2024-06-16", tags:"love, nature, father", poem:"वह बरगद की छांव\nवह खुला आसमान!\nवह विस्तीर्ण तृण भूमि सा\nवक्ष विशाल!\nवे दो शक्तिमान बांहें,\nसशक्त स्तंभ से अटल पांव\nवे दो अन्तर्भेदी आंखें\nप्रच्छन्न प्रेम भरे\nछद्म शासन के\nचश्मे के पीछे\nद्युतिमान दो नयन।\n \nमेरा अल्हड़पन\nडगमगाते मेरे चरण\nमेरे सोच विचार,\nमेरी भावनाएं\nमेरा डर,\nमेरी शैतानियां\nहर वो कही अनकही जरूरतें\nमेरा हर प्रश्न\nमेरी प्रसन्नता!\nजहां सहारा,\nजहां प्रश्रय,\nजहां दिग्दर्शन,\nजहां विराम\nपाता था\nमेरे जीवन का वह जीवन रस\nपिता था\nवह मेरा पिता था।", translation_en:"He was the shade of the banyan tree,\nHe was the open sky!\nHe was like the vast expanse of grassland,\nThe broad chest!\nThose two powerful arms,\nSteady feet from a strong pillar\nThose two penetrating eyes\nHidden with love,\nBehind the veil\nof pretense,\nRadiant two eyes.\n\nMy youthful recklessness,\nMy faltering steps,\nMy thoughts and deliberations,\nMy emotions,\nMy fears,\nMy mischief,\nEvery spoken and unspoken need,\nMy every question,\nMy joy!\nWhere I found support,\nWhere I found shelter,\nWhere I found guidance,\nWhere I found respite\nThere I would find,\nThe life essence of my life,\nMy father,\nHe was my father.", translit:"vah baragad ki chhanv\nvah khula asman!\nvah vistirn trin bhumi sa\nvaksh vishal!\nve do shaktiman banhen,\nsashakt stambh se atal panv\nve do antarbhedi ankhen\nprachchhann prem bhare\nchhadm shasan ke\nchashme ke pichhe\ndyutiman do nayan\n\nmera alharapan\ndagamgate mere charan\nmere soch vichar,\nmeri bhavnaen\nmera dar,\nmeri shaitaniyan\nhar vo kahi anakhi jarurten\nmera har prashn\nmeri prasannta!\njahan sahara,\njahan prashray,\njahan digdarshan,\njahan viram\npata tha\nmere jivan ka vah jivan ras\npita tha\nvah mera pita tha", note:"Everyday is a Father's and Mother's day. It's a lifelong celebration." },
    { slug:"momabati", title:"মোমবাতি", title_roman:"Momabati", title_english:"The Candle", lang:"bn", date:"2024-07-04", tags:"night, love, city", poem:"জ্বলে মোমবাতি।\nজ্বলে! জ্বলে যায়!\nজ্বলে যায়, প্রদীপ্ত শিষের আগায়\nসারাটা রাত ধরে জ্বলে, জ্বলে যায়।\nমোমবাতি জ্বলে যায়।\n \nমোমবাতি জ্বলে যায়।\nকখনও উগ্র রক্ত লাল,\nকখনও শ্বেতশুভ্র শোক,\nকখনও পীতপান্ডুর শীর্ণ,\nকখনও নীল বেদনায় দীর্ণ,\nকখনও কৃষ্ণ ধূম্রবর্ণ !\nমোমবাতি জ্বলে! জ্বলে যায়।\nমোমবাতি জ্বলে যায়।\n \nমোমবাতি জ্বলে যায়।\nকখনও তুমুল প্রতিবাদ প্রতিরোধ।\nকখনও তীব্র প্রতিকার প্রতিশোধ।\nকখনও নিবিড় প্রেমস্তব্ধ বোধ\nকখনও আঁধারের আলোকিত গতিরোধ।\nকখনও অন্ধ কুয়াশা।\nমোমবাতি জ্বলতে জ্বলতে বদলে যায়।\nমোমবাতি জ্বলে যায়।\n \nমোমবাতি জ্বলে যায়।\nকখনও দুই নয়নে ঢলে অশ্রুবিন্দু,\nকখনও কপালে ঝলসায় স্বেদ কণিকা।\nকখনও মহাশিরায় উথলে ওঠে রক্তচাপ।\nকখনও হৃদয়ের নিভৃতে নিঃশব্দ উত্তাপ,\nবিগলিত করুণা।\nমোমবাতি জ্বলতে জ্বলতে গলে যায়।\nমোমবাতি জ্বলে যায়।\n \nমোমবাতি জ্বলে যায়।\nমোমবাতি জ্বলতে জ্বলতে ছড়িয়ে যায়।\nমোমবাতি হাতে হাতে কাঁধে কাঁধে এগিয়ে যায়।\nমোমবাতি পায়ে পায়ে পায়ে পায়ে এগিয়ে যায়।\nমোমবাতি জ্বলতে জ্বলতে\nগঞ্জে শহরে, গ্রামে, জঙ্গলে বিলিয়ে যায়।\n \nমোমবাতি জ্বলতে জ্বলতে\nমশালে বদলে যায়\nমোমবাতি জ্বলতে জ্বলতে,\nমোমবাতি চলতে চলতে,\nমশালের মিছিল হয়ে যায়।\nমোমবাতি জ্বলতে জ্বলতে\nসে মিছিলের মাদক উন্মাদনায়,\nযুগান্তরের শক্তির\nসংকল্পিত নিশান হয়ে যায়।\nমোমবাতি জ্বলে যায়।\nমোমবাতি জ্বলে যায়।\n \nমোমবাতি রাতের পর রাতে জ্বলে যায়\nমোমবাতি হাতের পর হাতে জ্বলে যায়\nমোমবাতি যুগ যুগ ধরে জ্বলে যায়\nমোমবাতি জ্বলে অনির্বাণ,\nজ্বলে যায়।", translation_en:"The candle burns.\nIt burns! Burns on!\nIt burns on, at the brilliant tip of the wick,\nburning all through the night, burning on.\nThe candle burns on.\n \nThe candle burns on.\nSometimes fierce blood red,\nsometimes pure white sorrow,\nsometimes pale yellow emaciation,\nsometimes torn in blue anguish,\nsometimes black smoky hue!\nThe candle burns! Burns on.\nThe candle burns on.\n \nThe candle burns on.\nSometimes tumultuous protest and resistance.\nSometimes sharp retribution and revenge.\nSometimes dense love-hushed knowing,\nsometimes the light-piercing stillness of darkness.\nSometimes blind fog.\nThe candle, burning, transforms.\nThe candle burns on.\n \nThe candle burns on.\nSometimes tears fall down both eyes,\nsometimes sweat glistens on the forehead.\nSometimes blood pressure surges in the great vessel.\nSometimes silent heat in the hidden heart,\nmelted compassion.\nThe candle, burning, melts away.\nThe candle burns on.\n \nThe candle burns on.\nThe candle, burning, spreads forth.\nThe candle hand to hand, shoulder to shoulder advances.\nThe candle foot to foot, foot to foot advances.\nThe candle, burning,\nscatters in bazaars, cities, villages, forests.\n \nThe candle, burning,\ntransforms into torches.\nThe candle, burning,\nthe candle, moving,\nbecomes a procession of torches.\nThe candle, burning,\nin that procession's intoxicating ecstasy,\nbecomes the resolute banner\nof ages-spanning power.\nThe candle burns on.\nThe candle burns on.\n \nThe candle burns night after night,\nthe candle burns hand after hand,\nthe candle burns age after age,\nthe candle burns eternal and unextinguished,\nburns on.", translit:"jole mombati\njole! jole jay!\njole jay, prodipto shisher agay\nsarata rat dhore jole, jole jay\nmombati jole jay\n \nmombati jole jay\nkokhono ugr rokt lal,\nkokhono shetoshubhr shok,\nkokhono pitopandur shirn,\nkokhono nil bedonay dirn,\nkokhono krishn dhumroborn !\nmombati jole! jole jay\nmombati jole jay\n \nmombati jole jay\nkokhono tumul protibad protirodh\nkokhono tibro protikar protishodh\nkokhono nibir premostobdh bodh\nkokhono andharer alokit gotirodh\nkokhono ondh kuyasha\nmombati jolote jolote bodole jay\nmombati jole jay\n \nmombati jole jay\nkokhono du noyane dhole oshrubindu,\nkokhono kopale jholosay sed konika\nkokhono mohashiray uthole othe roktochap\nkokhono hridoyer nibhrite nihshobd uttap.\nbigolit koruna\nmombati jolote jolote gole jay\nmombati jole jay\n \nmombati jole jay\nmombati jolote jolote chhoriye jay\nmombati hate hate kandhe kandhe egiye jay\nmombati paye paye paye paye egiye jay\nmombati jolote jolote\ngonje shohore, grame, jonggole biliye jay\n \nmombati jolote jolote\nmoshale bodole jay\nmombati jolote jolote,\nmombati cholote cholote,\nmoshaler michhil hoye jay\nmombati jolote jolote\nse michhiler madok unmadonay,\njugantorer shoktir\nsongkolpit nishan hoye jay\nmombati jole jay\nmombati jole jay\n \nmombati rater por rate jole jay\nmombati hater por hate jole jay\nmombati jug jug dhore jole jay\nmombati jole oniran ,\njole jay" },
    { slug:"friendship", title:"दोस्ती की चाल", title_roman:"Dosti Ki Chaal", title_english:"Friendship", lang:"hi", date:"2026-08-02", tags:"friends", poem:"दोस्ती की रौशनी,\nदोस्ती का उत्ताप\nसूरज की देन है।\nजब संग रहो\nसम्पर्क के साथ साथ चलते हैं।\nवरना हम एक-दूसरे तक\nजा जाकर पहुंचाते हैं।\nबहुत दूर, बहुत ही दूर चले जाओ\nजहां न आना,न जाना\nजहां न चिट्ठी, न पत्री\nन बात ,न व्यवहार\nफिर भी\nदिल के सितार\nके तार\nबज से उठते हैं\nएकसाथ।\nक्या यह समापतन है?\nया सुर टूटा ही नहीं कभी!\nताप और प्रकाश की तरह\nहमेशा विकिरित होते ही\nरहती है दोस्ती\nदेश, काल , माध्यम के पार।" },
    { slug:"mystery-of-evenings", title:"Mystery Of Evenings", lang:"en", date:"2026-02-07", tags:"evening", poem:"When does evening come?\nThe evening comes when the sun sinks to rest.\nWhat happen when the evening comes?\nWhen the evening comes the crows fly back to their nests, the children go to sleep.\nThe flowers shut down their petels. \nThe butterfly folds its wings and the bees come back to their hives with their collected honey." },
    { slug:"chhorar-chorachori", title:"ছড়ার ছড়াছড়ি", title_roman:"Chhorar Chorachori", lang:"bn", date:"2026-07-21", tags:"monsoon", poem:"এলো রে বাদল\nপাগলা বাগল\nআকাশ কালো করে।\nবেরো রে ছোঁড়া\nবেরো রে ছুঁড়ি\nথাকিস নে কো ঘরে।\nঘ্যাঙর ঘ্যাঙ্\nঘ্যাঙর ঘ্যাঙ্\nভর বর্ষার ব্যাঙ্,\nগান জুড়েছে।\nতান ধরেছে,\nঝিঁঝিঁ পোকার গ্যাং।\nরাজপথে আজ\nআরশোলাদের\nনাচ জমেছে,\n নানা ঢং এ\nনেড়ে শুঁড় আর ঠ্যাং।\nদেশের রাজার\nবুকের কাঁপন,\nভূরুর নাচন,\nসিস্টেম কি হবে হ্যাং?\nবদ্ গুলো কি গর্তে যাবে\nসদ্ গুলো ঢ্যা ঢ্যাং ঢ্যাং?\nবল না বুড়ো,\nবল না খুড়ো\nকি মজা হবে,\nসিস্টেম কি হবে হ্যাং?", note:"A rainy day's poem" },
    { slug:"je-chhorar-mane-nei", title:"যে ছড়ার মানে নেই", title_roman:"Je Chhorar Mane Nei", lang:"bn", date:"2026-07-21", poem:"চলতে গিয়ে থমকে দাঁড়াই।\nভাত না খেয়ে হাত ধুতে যাই।\nযখন তখন যেখানে সেখানে\nশিবের গাজন গাই।\n\nকেই বা রাজা কেই বা রানী\nকেইবা মুর্খ, কেইবা জ্ঞানী\nনীচের তলায় বাস করি ভাই,\nকি ই বা আসে যায়?\n\nআমরা ছিলাম ছা পোষন্ত\nচাকরির প্রাণ ছটফটন্ত\nভাত জোটাতে দিগ্দিগন্ত\nছবিটা পাল্টে যাচ্ছে না ।\n\nআমারা প্রজা, আমরাই স্বামী\nসিংহাসনে আসীন যে তুমি\n পায়া ধরে আছি অধম এ আমি।\nআবর্তনের চাকাটা ঘুরছেনা।", translit:"cholote giye thomoke danrai\nbhat na kheye hat dhute jai\njokhon tokhon jekhane sekhane\nshiber gajon gai\n\nkei ba raja kei ba rani\nkeiba murkho, keiba jnani\nnicher tolay bas kori bhai,\nki e ba ase jay?\n\namra chhilam chha poshonto\nchakrir pran chhotophotont\nbhat jotate digdigont\nchobita palte jachchhe na\n\namara proja, amorai swami\nsinghasone asin je tumi\npaya dhore achhi odhom e ami\nabortoner chakata ghurochhena" },
    { slug:"nirdharito-jibon", title:"নির্ধারিত জীবন", title_roman:"Nirdharito Jibon", title_english:"Foreordained Life", lang:"bn", date:"2026-08-11", poem:"এ জীবন\nএক মহাশ্মশান\nসারি সারি অপেক্ষামান দেহ\nনিজের নির্ধারিত চিতায় পূড়বে বলে,\nমাতৃগর্ভে ভ্রুণের মত শায়িত।\nযে ভাবে পাটাতনে পাটাতনে শববাহী শয্যায়\nশুয়ে" },
    { slug:"purnomidom", title:"পূর্ণমিদম্!", title_roman:"Purnomidom!", lang:"bn", date:"2026-08-14", tags:"monsoon", poem:"সে রাত\nছিলনা আকাশে\nধূসর মেঘেরা।\nতারা জমেছিল\nএসে পৃথিবী বুকে।\nবাষ্পে বাষ্পে ঝাপসা\nছিল দৃষ্টি\nছিল কায়াহীন মায়াবোধ।\nঅঝোর, অবাধ,\n অদৃশ্য বৃষ্টি,\nমূহ্যমান ধরার হৃদয়ে।\n\nজানালা দিয়ে শিয়রে এসেছিল জ্যোৎস্না\nকপালে এঁকে দিয়েছিলো\nচুম্বনের আমন্ত্রণ আল্পনা।\n\nশশী এসেছিল রবিকে বরণ করে নিতে,\nধীর স্তিমিত পায়ে,\nগরিমার উজ্জ্বলতম উত্তরীয় গায়ে,\nপা বাড়ালে তুমি পূর্ণ থেকে সম্পূর্ণতার দিকে।\n\nপূর্ণতার সাধনা তোমার আজীবনের।\nপ্রস্থানে রেখে গিয়েছো পূর্ণতাই তুমি,\nঅসীম ধনের অক্ষয় মঞ্জুষায়।\nনেই! নেই! নেই!\nনেই শূন্যতা কোথাও।\nনেই দৈন্যতা কোথাও।\nতাইতো তুমি আলোকিত পথে\n আলোক পুঞ্জের মতো যখন চলে গেলে,\nতারপরেই ঝরেছে আকাশ।\nহৃদয় মন প্রাণ ভরেছে আকাশ।\nচলে কি গিয়েছো তুমি?\nরয়ে তো গিয়েছো তুমি,\nহৃদয় ভরে।\nরেখে তো গিয়েছো তুমি\nবাইশে শ্রাবণ ও পঁচিশে বৈশাখ কে\nএক সূত্রে করে।" }
  ];

  /* ----------------------------------------------------------------- helpers */
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  // wrap each word of a poem line in its own span so the device voice can light words up
  // one at a time (karaoke style); words are single-spaced so charIndex maps cleanly.
  function wordSpans(text){
    var words=String(text||"").split(/\s+/).filter(Boolean);
    if(!words.length) return "";
    return words.map(function(w){ return '<span class="w">'+esc(w)+'</span>'; }).join(" ");
  }
  function normLang(v){ v=String(v||"").trim().toLowerCase();
    if(/^(bn|bangla|bengali|বাংলা)/.test(v)) return "bn";
    if(/^(hi|hindi|हिंदी|हिन्दी)/.test(v)) return "hi";
    if(/^(en|eng|english)/.test(v)) return "en";
    return "bn"; }
  function langName(c){ return LANG_NAMES[c] || c; }
  /* Keep letters/numbers of any script; \p{L}\p{N} stays pure ASCII in the source,
     so no character-encoding hiccup can turn it into an invalid regex. Falls back
     to ASCII-only on very old engines without Unicode property escapes. */
  function slugify(s){ var o; try{ o=String(s||"").trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-+|-+$/g,""); }
    catch(e){ o=String(s||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
    return o||"poem"; }
  function splitTags(s){ return String(s||"").split(/[,;|]/).map(function(t){return t.trim();}).filter(Boolean); }
  function toStanzas(text){
    if(!text) return [];
    return String(text).replace(/\r\n/g,"\n").replace(/\r/g,"\n").split(/\n\s*\n/)
      .map(function(b){ return b.split("\n").map(function(l){return l.trim();}); })
      .filter(function(st){ return st.join("").trim()!==""; });
  }
  function flatLines(stanzas){ var o=[]; stanzas.forEach(function(st){ st.forEach(function(l){ o.push(l); }); }); return o; }
  function plainText(stanzas){ return stanzas.map(function(st){return st.join("\n");}).join("\n\n"); }

  /* ---- forgiving date parsing ----
     The date cell may be a full date, a month + year, or just a year -- typed in any of the
     usual ways. This never throws: an unrecognised value is kept and shown as typed, so one
     odd date can't drop a poem or trip the whole load. Returns { sort, disp, prec } where
     `sort` is a comparable YYYY-MM-DD key (missing parts padded with 00). */
  var MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MONTHS={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12,
    january:1,february:2,march:3,april:4,june:6,july:7,august:8,september:9,october:10,november:11,december:12};
  function pad2(n){ n=String(n|0); return n.length<2?"0"+n:n; }
  /* Parse a date in almost any layout, with any separator (-, /, ., space, comma):
       yyyy-mm-dd  yyyy/mm/dd  dd/mm/yyyy  dd-mm-yyyy  mm-dd-yyyy  mm/dd/yyyy
       mmm-yyyy  mmm/yyyy  mmm yyyy  mmm,yyyy  "August 2025"  "30 Aug 2025"  yyyy  ...
     Strategy: pull the 4-digit year and any month-name out first, then read the remaining
     numbers -- so the separator never matters. Day-first is assumed when a d/m pair is
     ambiguous (both <= 12), which suits how the sheet is filled. Never throws; anything that
     isn't a real date returns blank (shown like an empty date). */
  function parseDate(raw){
    var s=String(raw==null?"":raw).trim(); if(!s) return null;
    var y=0,m=0,d=0,prec="raw",x;
    if(x=s.match(/^Date\((\d{4}),(\d{1,2})(?:,(\d{1,2}))?/i)){ y=+x[1]; m=+x[2]+1; d=x[3]?+x[3]:0; prec=x[3]?"day":"month"; }   // gviz serial (0-based month)
    else {
      var nameM=s.match(/[A-Za-z]{3,9}/), monByName=(nameM && MONTHS[nameM[0].toLowerCase()])||0;
      // strip a leading/whole 4-digit year, then a month name, then read what numbers remain
      var ym=s.match(/\b(\d{4})\b/); if(ym){ y=+ym[1]; }
      var rest=s.replace(/\b\d{4}\b/, " ").replace(/[A-Za-z]{3,9}/, " ");
      var nums=(rest.match(/\d{1,2}/g)||[]).map(Number);
      if(monByName){                                                    // any "<month name> ... <year>" shape
        m=monByName; if(nums.length){ d=nums[0]; } prec = d? "day":"month";
      } else if(!y && !nums.length){                                    // nothing numeric at all
        prec="raw";
      } else if(y && nums.length===0){                                  // just a year
        prec="year";
      } else if(y && nums.length===1){                                  // year + month
        m=nums[0]; prec="month";
      } else if(nums.length>=2){                                        // a full date; year is either already found or one of the parts
        if(!y){ // no 4-digit year seen -> the value was all short numbers; can't tell a year, treat as not-a-date
          prec="raw";
        } else {
          // decide which remaining number is day vs month (day-first when ambiguous)
          var a=nums[0], b=nums[1];
          // if the year sat in the MIDDLE/last, a & b are the day/month in file order; if the year
          // was first (yyyy-mm-dd) then a=month, b=day.
          if(/^\s*\d{4}\b/.test(s)){ m=a; d=b; }                        // yyyy first -> mm then dd
          else if(a>12){ d=a; m=b; } else if(b>12){ m=a; d=b; } else { d=a; m=b; }   // dd/mm (day-first default)
          prec="day";
        }
      }
    }
    if(!y || y<1000 || y>3000) return { sort:"", disp:"", prec:"raw" };   // not a real date: shown like a blank date
    if(m>12 && d<=12){ var t=m; m=d; d=t; }                              // obvious month/day swap
    if(m<1||m>12) m=0; if(d<1||d>31) d=0;
    if(!m) prec="year"; else if(!d && prec==="day") prec="month";
    var disp = prec==="year" ? String(y) : (MONTH_NAMES[(m||1)-1]+" "+y);   // UI shows month + year (day omitted)
    return { sort: pad2(y)+"-"+pad2(m)+"-"+pad2(d), disp: disp, prec: prec };
  }

  /* Bangla/Hindi titles carry romanisation so non-readers have something to say */
  function romanTitle(p){
    if(p.lang==="en") return "";
    if(p.titleRoman) return p.titleRoman;
    if(T.supports(p.lang)){ return T.line(p.title).replace(/\b[a-z]/g,function(c){return c.toUpperCase();}); }
    return "";
  }
  /* The line shown under the title (romanisation + English title). For Bangla/Hindi it's the
     roman reading then the English title; for English poems it shows whatever the title_roman /
     title_english columns hold (so the card/reader aren't cramped for those, matching the others).
     Parts are de-duplicated so an identical value never prints twice. */
  function subLine(p){
    var parts;
    if(p.lang==="en"){ parts=[p.titleRoman, p.titleEnglish]; }
    else { parts=[romanTitle(p), p.titleEnglish]; }
    parts=parts.map(function(s){ return String(s||"").trim(); }).filter(Boolean);
    var out=uniq(parts).join(" · ");
    // English has no transliteration to fall back on, so when neither column is filled we
    // echo the title itself into the roman slot -- keeps the same title/poem spacing the
    // Bangla/Hindi cards get from their romanisation.
    if(!out && p.lang==="en") out=String(p.title||"").trim();
    return out;
  }

  /* ---- CSV parsing (quoted fields with newlines/commas survive) ---- */
  function parseCSV(text){
    var rows=[], row=[], val="", i=0, inQ=false, c;
    text=text.replace(/\r\n/g,"\n").replace(/\r/g,"\n");
    while(i<text.length){ c=text[i];
      if(inQ){ if(c==='"'){ if(text[i+1]==='"'){ val+='"'; i++; } else inQ=false; } else val+=c; }
      else { if(c==='"') inQ=true; else if(c===",") { row.push(val); val=""; } else if(c==="\n"){ row.push(val); rows.push(row); row=[]; val=""; } else val+=c; }
      i++;
    }
    if(val.length||row.length){ row.push(val); rows.push(row); }
    return rows;
  }
  function canonKey(h){
    h=String(h||"").toLowerCase().replace(/[^a-z]/g,"");
    var map={ slug:"slug", id:"slug", sluglink:"slug", title:"title", name:"title",
      titleroman:"title_roman", roman:"title_roman", romanised:"title_roman", romanized:"title_roman",
      titleenglish:"title_english", englishtitle:"title_english",
      lang:"lang", language:"lang", date:"date", year:"date",
      showonwebsite:"show_on_website", show:"show_on_website", publish:"show_on_website", published:"show_on_website", live:"show_on_website",
      tags:"tags", theme:"tags", themes:"tags", topic:"tags", topics:"tags",
      audio:"audio", mp3:"audio", recording:"audio", image:"image", imageurl:"image", photo:"image",
      note:"note", notes:"note", poem:"poem", poemtext:"poem", text:"poem", body:"poem", verse:"poem", original:"poem",
      translationen:"translation_en", translationenglish:"translation_en", english:"translation_en", translation:"translation_en", meaning:"translation_en",
      translit:"translit", transliteration:"translit", pronunciation:"translit" };
    return map[h]||null;
  }
  function rowsToRaw(rows){
    if(!rows.length) return [];
    var head=rows[0].map(canonKey), out=[];
    for(var r=1;r<rows.length;r++){ var cells=rows[r]; if(!cells) continue; var o={};
      for(var c=0;c<head.length;c++){ if(head[c]) o[head[c]]=(cells[c]||"").trim(); }
      if(!o.title || !o.poem) continue;
      // show_on_website: only "yes" (any case) is shown; blank / "no" / anything else is hidden
      if(String(o.show_on_website||"").trim().toLowerCase()!=="yes") continue;
      out.push(o);
    }
    return out;
  }

  /* ---- build a poem object from a raw row ---- */
  function buildPoem(raw){
    var lang=normLang(raw.lang);
    var stanzas=toStanzas(raw.poem);
    var translit=raw.translit? toStanzas(raw.translit): null;
    var translation=raw.translation_en? toStanzas(raw.translation_en): null;
    var p={
      slug: slugify(raw.slug || raw.title_roman || raw.title),
      title: raw.title||"Untitled",
      titleRoman: raw.title_roman||"",
      titleEnglish: raw.title_english||"",
      lang: lang, date: raw.date||"", tags: splitTags(raw.tags),
      audio: raw.audio||"", image: raw.image||"", note: raw.note||"",
      stanzas: stanzas,
      translit: translit,
      translation: (lang==="en") ? null : (translation? { en: translation } : null)
    };
    var dp=parseDate(raw.date);                       // forgiving: any format, never throws
    p.dateSort = dp? dp.sort : "";                    // comparable key for ordering (may be "")
    p.dateDisp = dp? dp.disp : "";                    // human label for the reader header
    // Also index the AUTO-generated romanisation (title, body, tags) so a poem in Bangla/Hindi
    // is searchable by its roman spelling even when the sheet has no title_roman.
    var indic = (lang!=="en" && T.supports(lang));
    var romanTitleGen = indic ? T.line(p.title) : "";
    var romanBody = indic ? flatLines(stanzas).map(function(l){ return T.line(l); }).join(" ") : "";
    var romanTags = p.tags.map(function(t){ return T.line(t); }).join(" ");
    p._hay = (p.title+" "+p.titleRoman+" "+romanTitleGen+" "+p.titleEnglish+" "+plainText(stanzas)+" "+romanBody+" "+
      (translit?plainText(translit):"")+" "+(translation?plainText(translation):"")+" "+p.tags.join(" ")+" "+romanTags).toLowerCase();
    p._rand = Math.random();   // stable-per-load tiebreak for poems sharing a date
    return p;
  }

  /* --------------------------------------------------------------- data load */
  var PAGE=24;   // how many poem cards to show before "Show more"
  var POEMS=[], STATE={ q:"", lang:"all", theme:"all", attrs:[], shown:PAGE };

  function gvizUrl(id, tab){ return "https://docs.google.com/spreadsheets/d/"+encodeURIComponent(id)+"/gviz/tq?tqx=out:csv&sheet="+encodeURIComponent(tab||"Poems"); }
  // Google's own CSV export returns the DISPLAYED cell values with no column type-coercion, so a
  // date typed as text (or any odd cell) still comes through. gviz, by contrast, decides one type
  // for a whole column and blanks any cell that doesn't fit -- a text date in a mostly-date column
  // silently disappears. So we prefer the export when the tab's gid is set, gviz as a fallback.
  function exportUrl(id, gid){ return "https://docs.google.com/spreadsheets/d/"+encodeURIComponent(id)+"/export?format=csv&gid="+encodeURIComponent(gid); }
  function sheetUrls(){
    var id=CFG.googleSheetId, urls=[];
    if(CFG.googleSheetGid!=null && String(CFG.googleSheetGid).trim()!=="") urls.push(exportUrl(id, String(CFG.googleSheetGid).trim()));
    urls.push(gvizUrl(id, CFG.googleSheetTab));
    return urls;
  }

  function poemsFromCSV(t){
    if(/^\s*</.test(t)) throw new Error("got a web page, not CSV (is the sheet shared as 'Anyone with the link'?)");
    // Build poems one row at a time so a single corrupt row is skipped, not the whole sheet.
    var raws=rowsToRaw(parseCSV(t)), poems=[], skipped=0;
    for(var i=0;i<raws.length;i++){
      try{
        var poem=buildPoem(raws[i]);
        if(!poem.stanzas.length || !poem.title){ throw new Error("empty poem or title"); }   // corrupt/blank -> skip just this one
        poems.push(poem);
      }
      catch(e){ skipped++; console.warn("Skipped a poem row ("+(e&&e.message||e)+"): ", raws[i]&&raws[i].title); }
    }
    if(skipped) console.warn(skipped+" poem row(s) were skipped; the rest loaded normally.");
    if(!poems.length) throw new Error("no usable rows");   // only fall back when NOTHING loaded
    return poems;
  }
  function showSamples(msg,tone){ POEMS=SAMPLE_ROWS.map(buildPoem); sortPoems(); showSourceNote(msg,tone); afterLoad(); }
  /* The last-saved copy committed in the repo (content/poems.csv). It's the fallback when
     the live sheet can't be reached, and the source when no sheet is configured -- tried
     before the built-in samples so the site keeps showing her real poems through an outage. */
  function tryLocalCSV(onFail, okMsg){
    fetch("content/poems.csv", { cache: "no-store" })
      .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.text(); })
      .then(function(t){ POEMS=poemsFromCSV(t); sortPoems(); if(okMsg) showSourceNote(okMsg,"warn"); else hideSourceNote(); afterLoad(); })
      .catch(onFail);
  }
  /* Load order: live Google Sheet (export, then gviz) -> committed content/poems.csv -> samples. */
  function loadPoems(){
    if(!CFG.googleSheetId){
      tryLocalCSV(function(){ showSamples('Showing the <strong>built-in copy</strong> of Mousumee Ghosh\'s poems. Connect your Google Sheet in <code>config.js</code> (or commit <code>content/poems.csv</code>) to load the latest collection.'); });
      return;
    }
    var urls=sheetUrls();
    (function tryUrl(i){
      if(i>=urls.length){   // every live source failed -> saved CSV, then built-in poems
        console.warn("Live sheet load failed - trying the saved content/poems.csv");
        tryLocalCSV(function(err2){
          console.warn("content/poems.csv also unavailable ("+err2.message+") - using built-in poems");
          showSamples("Couldn't reach the live sheet or the backup copy just now. Showing the built-in poems for the moment.", "warn");
        }, "Couldn't reach the live sheet just now. These poems are from the backup copy.");
        return;
      }
      fetch(urls[i], { cache: "no-store" })
        .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.text(); })
        .then(function(t){ POEMS=poemsFromCSV(t); sortPoems(); hideSourceNote(); afterLoad(); })
        .catch(function(err){ console.warn("Sheet source "+(i+1)+" of "+urls.length+" failed ("+err.message+")"); tryUrl(i+1); });
    })(0);
  }
  function sortPoems(){ POEMS.sort(function(a,b){
    var ad=a.dateSort||"", bd=b.dateSort||"";
    if(!ad&&!bd) return a._rand-b._rand;           // undated / unrecognised: random among themselves
    if(!ad) return 1; if(!bd) return -1;           // those sink to the end
    var c=bd.localeCompare(ad);                    // newest first (YYYY-MM-DD keys compare cleanly)
    return c!==0 ? c : (a._rand-b._rand);          // same date: random within
  }); }
  function showSourceNote(html,tone){ var n=$("#sourceNote"); n.innerHTML=html; n.hidden=false; if(tone) n.setAttribute("data-tone",tone); else n.removeAttribute("data-tone"); }
  function hideSourceNote(){ var n=$("#sourceNote"); n.hidden=true; n.removeAttribute("data-tone"); }

  // Share links key on the slug, so two poems must never share one. On a collision the
  // later poem (in sorted order) gets -2, -3, … appended; the first keeps the clean slug.
  function dedupeSlugs(){
    var seen={};
    POEMS.forEach(function(p){ var base=p.slug||"poem", s=base, n=2; while(seen[s]) s=base+"-"+(n++); p.slug=s; seen[s]=1; });
  }
  function afterLoad(){ dedupeSlugs(); buildChips(); renderPotd(); renderGrid(); refillBag(); routeFromHash(); }

  /* ------------------------------------------------------------------ chips */
  function uniq(a){ var s={},o=[]; a.forEach(function(x){ if(x&&!s[x]){s[x]=1;o.push(x);} }); return o; }
  // Same treatment as the theme filter chips: a Bangla/Hindi tag gets its
  // roman reading appended in parentheses, in a slightly muted span.
  function tagLabel(t){ var r=T.line(t); return (r&&r!==t)? esc(t)+' <span style="opacity:.6">('+esc(r)+')</span>' : esc(t); }
  function buildChips(){
    var langs=uniq(POEMS.map(function(p){return p.lang;}));
    var order=["bn","hi","en"].filter(function(l){return langs.indexOf(l)>=0;});
    $("#langChips").innerHTML='<button class="chip'+(STATE.lang==="all"?" active":"")+'" data-lang="all">All languages</button>'+
      order.map(function(l){ return '<button class="chip'+(STATE.lang===l?" active":"")+'" data-lang="'+l+'">'+esc(langName(l))+'</button>'; }).join("");
    var themes=[]; POEMS.forEach(function(p){ p.tags.forEach(function(t){ themes.push(t); }); });
    themes=uniq(themes).slice(0,16);
    $("#themeChips").innerHTML=(themes.length?'<button class="chip'+(STATE.theme==="all"?" active":"")+'" data-tag="all">all themes</button>':"")+
      themes.map(function(t){ return '<button class="chip'+(STATE.theme===t?" active":"")+'" data-tag="'+esc(t)+'">'+tagLabel(t)+'</button>'; }).join("");
    // attribute chips (combinable) -- only offered when at least one poem has that thing.
    // Each carries the same little icon as the matching badge on the poem chips.
    var anyAudio=false,anyTrans=false;
    POEMS.forEach(function(p){ if(hasAudio(p))anyAudio=true; if(hasTranslation(p))anyTrans=true; });
    var defs=[["rec","with recording",ICON.bAudio,anyAudio],["trans","with translation",ICON.bTrans,anyTrans]];
    var ac=$("#attrChips"); if(ac){ ac.innerHTML=defs.filter(function(d){return d[3];}).map(function(d){
      return '<button class="chip'+(STATE.attrs.indexOf(d[0])>=0?" active":"")+'" data-attr="'+d[0]+'">'+d[2]+d[1]+'</button>'; }).join(""); }
  }

  /* ------------------------------------------------------------------ grid */
  function matches(p){
    if(STATE.lang!=="all" && p.lang!==STATE.lang) return false;
    if(STATE.theme!=="all" && p.tags.indexOf(STATE.theme)<0) return false;
    if(STATE.q && p._hay.indexOf(STATE.q.toLowerCase())<0) return false;
    // attribute filters (combinable): the poem must carry every selected one
    for(var i=0;i<STATE.attrs.length;i++){ var a=STATE.attrs[i];
      if(a==="rec" && !hasAudio(p)) return false;
      if(a==="trans" && !hasTranslation(p)) return false;
      if(a==="img" && !hasImage(p)) return false;
    }
    return true;
  }
  function snippet(p){ return flatLines(p.stanzas).filter(function(l){return l.trim();}).slice(0,4).join("\n"); }
  // A recording/image counts only if the cell holds a real media file (a URL/path with an
  // audio or image extension, or a data URI) -- not a stray note or a non-media link. So a
  // garbage value shows no badge, no filter match, and recitation falls back to the device voice.
  var AUDIO_EXT=/\.(mp3|m4a|aac|ogg|oga|opus|wav|weba|flac)(\?.*)?$/i;
  var IMG_EXT=/\.(jpe?g|png|gif|webp|avif|svg|bmp)(\?.*)?$/i;
  function hasAudio(p){ var v=String(p.audio||"").trim(); return !!v && (/^data:audio\//i.test(v) || AUDIO_EXT.test(v)); }
  function hasTranslation(p){ return !!(p.translation && p.translation.en); }   // the poet's own translation (en poems have none)
  function hasImage(p){ var v=String(p.image||"").trim(); return !!v && (/^data:image\//i.test(v) || IMG_EXT.test(v)); }
  // do two stanza-arrays line up line-for-line? (used to decide author vs machine handling)
  function sameShape(a,b){ if(!a||!b||a.length!==b.length) return false; for(var i=0;i<a.length;i++){ if(!a[i]||!b[i]||a[i].length!==b[i].length) return false; } return true; }
  // "what this poem carries" badges, shown on cards and in the reader (no badge for transliteration)
  function badges(p){
    return (hasAudio(p)?'<span class="badge badge--rec">'+ICON.bAudio+'recording</span>':'')+
           (hasTranslation(p)?'<span class="badge badge--trans">'+ICON.bTrans+'translation</span>':'')+
           (hasImage(p)?'<span class="badge badge--img">'+ICON.bImg+'image</span>':'');
  }
  function cardHTML(p){
    var r=subLine(p);
    return '<button class="poem-card lang-'+p.lang+' reveal" data-slug="'+esc(p.slug)+'">'+
      '<div class="pc-head"><span class="pc-lang '+p.lang+'">'+esc(langName(p.lang))+'</span>'+
        (p.dateDisp?'<span class="pc-date">'+esc(p.dateDisp)+'</span>':'')+'</div>'+
      '<h3>'+esc(p.title)+'</h3>'+
      (r?'<span class="roman">'+esc(r)+'</span>':'')+
      '<p class="snippet">'+esc(snippet(p))+'</p>'+
      '<div class="pc-foot">'+
        (p.tags.length?'<div class="pc-tags">'+p.tags.slice(0,2).map(function(t){return '<span class="tag">'+tagLabel(t)+'</span>';}).join("")+'</div>':'')+
        (badges(p)?'<div class="pc-badges">'+badges(p)+'</div>':'')+
      '</div>'+
    '</button>';
  }
  function renderGrid(){
    var list=POEMS.filter(matches), grid=$("#poemGrid"), rc=$("#resultCount"), more=$("#showMore");
    var unfiltered = STATE.lang==="all" && STATE.theme==="all" && !STATE.q && !STATE.attrs.length;
    rc.textContent = list.length? (list.length+(list.length===1?" poem":" poems")+(unfiltered?" in the collection":" found")) : "";
    if(!list.length){ grid.innerHTML='<div class="no-results"><p class="no-results-msg">No poems match these filters.</p><button class="btn btn--sm" id="clearFilters" type="button">Clear all filters</button></div>'; if(more) more.hidden=true; return; }
    var shown=Math.min(STATE.shown, list.length);          // show in batches so 100+ poems stay light
    grid.innerHTML=list.slice(0,shown).map(cardHTML).join("");
    observeReveals();
    if(more){ if(shown<list.length){ more.hidden=false; more.textContent="Show more poems ("+(list.length-shown)+" more)"; } else more.hidden=true; }
  }
  // Reset every filter back to the home view: all languages, all themes, no attribute
  // filters, no search.
  function clearAllFilters(){
    STATE.lang="all"; STATE.theme="all"; STATE.attrs=[]; STATE.q=""; STATE.shown=PAGE;
    var s=$("#search"); if(s) s.value="";
    syncChips("#langChips","data-lang","all");
    syncChips("#themeChips","data-tag","all");
    $$("#attrChips [data-attr]").forEach(function(c){ c.classList.remove("active"); c.setAttribute("aria-pressed","false"); });
    renderGrid();
  }

  /* ---------------------------------------------------------- poem of the day */
  function hashInt(n){ n=n|0; n=Math.imul(n^(n>>>16),0x45d9f3b); n=Math.imul(n^(n>>>16),0x45d9f3b); return (n^(n>>>16))>>>0; }
  function poemOfTheDay(){
    if(!POEMS.length) return null;
    var d=new Date(); var seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
    return POEMS[hashInt(seed)%POEMS.length];
  }
  function renderPotd(){
    var p=poemOfTheDay(); if(!p){ $("#potdWrap").hidden=true; return; }
    $("#potdWrap").hidden=false;
    var r=subLine(p);
    // Show the whole poem, but inside a fixed-height scroll box (like the reader) so the
    // section stays the same height however long the poem is.
    var verse=plainText(p.stanzas);
    $("#potd").innerHTML='<div class="potd-card reveal">'+
      '<div class="potd-side">Today’s poem</div>'+
      '<div class="potd-main">'+
        '<h3 class="lang-'+p.lang+'">'+esc(p.title)+'</h3>'+
        (r?'<span class="roman">'+esc(r)+'</span>':'')+
        '<div class="potd-verse lang-'+p.lang+'">'+esc(verse)+'</div>'+
        '<button class="btn btn--hero" data-slug="'+esc(p.slug)+'">Read it, hear it →</button>'+
      '</div>'+
    '</div>';
    var pv=$("#potd .potd-verse"); if(pv && pv.scrollHeight > pv.clientHeight+2) pv.classList.add("is-scroll");   // fade the edge only when it actually scrolls
    observeReveals();
  }

  /* --------------------------------------------------------- surprise-me bag */
  var BAG=[];
  function refillBag(exclude){
    BAG=POEMS.map(function(p){return p.slug;});
    for(var i=BAG.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=BAG[i]; BAG[i]=BAG[j]; BAG[j]=t; }
    if(exclude && BAG.length>1 && BAG[BAG.length-1]===exclude){ BAG.unshift(BAG.pop()); }
  }
  function surprise(){
    if(!POEMS.length) return;
    if(!BAG.length) refillBag(currentSlug);
    var slug=BAG.pop();
    openPoem(slug);
  }

  /* ------------------------------------------------------------- reader view */
  var reader=$("#reader"), lastFocus=null, currentSlug=null, currentPoem=null;

  function findPoem(slug){ for(var i=0;i<POEMS.length;i++) if(POEMS[i].slug===slug) return POEMS[i]; return null; }

  function openPoem(slug, push){
    var p=findPoem(slug); if(!p) return;
    stopListening(); currentSlug=slug; currentPoem=p;
    lastFocus=document.activeElement;
    $("#readerContent").innerHTML=readerHTML(p);
    reader.hidden=false; reader.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
    var panel=$(".reader-panel"); panel.className="reader-panel lang-"+p.lang;   // per-language corner motif
    reader.className="reader lang-"+p.lang;   // drives the per-language button highlight colour
    var sc=$("#reader .r-scroll"); if(sc) sc.scrollTop=0; panel.focus();
    wireReader(p);
    if(push!==false) history.pushState({p:slug},"", "#/poem/"+slug);
  }
  function poemIndex(slug){ for(var i=0;i<POEMS.length;i++) if(POEMS[i].slug===slug) return i; return -1; }
  function goRelative(delta){ if(!currentSlug||!POEMS.length) return; var i=poemIndex(currentSlug); if(i<0) return; var n=POEMS.length; openPoem(POEMS[(((i+delta)%n)+n)%n].slug); }
  function hideReader(){ if(reader.hidden) return; stopListening(); reader.hidden=true; reader.setAttribute("aria-hidden","true"); document.body.style.overflow=""; currentSlug=null; currentPoem=null; if(lastFocus&&lastFocus.focus) lastFocus.focus(); }
  function userClose(){ var wasPoemHash=/^#\/poem\//.test(location.hash); hideReader(); if(wasPoemHash) history.replaceState(null,"", location.pathname+location.search); }

  function readerHTML(p){
    var romanLine = subLine(p);
    var lines="";
    p.stanzas.forEach(function(st,si){ lines+='<div class="stanza">';
      st.forEach(function(text,li){ lines+='<p class="line" data-s="'+si+'" data-l="'+li+'"><span lang="'+p.lang+'" class="ln">'+wordSpans(text)+'</span></p>'; });
      lines+='</div>';
    });

    var aids='<div class="tool-group"><p class="tool-label">Help me read this</p>';
    if(T.supports(p.lang)) aids+='<button class="btn btn--sm" data-aid="say" type="button">'+ICON.say+'Transliteration</button>';
    if(p.translation || (CFG.features && CFG.features.autoTranslate && p.lang!=="en")) aids+='<button class="btn btn--sm" data-aid="mean" type="button">'+ICON.mean+'Translation</button>';
    if(CFG.features && CFG.features.recitation) aids+=
      '<span class="recite-group" id="reciteGroup">'+
        '<button class="btn btn--sm" id="listenBtn" type="button">'+ICON.play+'Recite</button>'+
        '<button class="btn btn--sm recite-restart" id="reciteRestart" type="button" title="Restart from the top" aria-label="Restart from the top">'+ICON.restart+'</button>'+
      '</span>';
    aids+='</div>';

    var acts='<div class="tool-group"><p class="tool-label">Take it with you</p>';
    acts+='<button class="btn btn--sm" id="shareBtn" type="button">'+ICON.share+'Share</button>'+
          '<button class="btn btn--sm" id="copyBtn" type="button">'+ICON.copy+'Copy</button></div>';

    return ''+
      // the scrolling region: header (sticky on desktop, scrolls on phones) + the poem.
      // Only this scrolls; its top/bottom edges are faded so half-cut lines don't peek.
      '<div class="r-scroll">'+
        '<div class="r-head">'+
          '<span class="r-lang lang-'+p.lang+'">'+esc(langName(p.lang))+(p.dateDisp?' · '+esc(p.dateDisp):'')+'</span>'+
          '<h1 class="r-title lang-'+p.lang+'" id="readerTitle">'+esc(p.title)+'</h1>'+
          (romanLine?'<p class="r-roman">'+esc(romanLine)+'</p>':'')+
          (p.tags.length?'<div class="r-meta">'+p.tags.map(function(t){return '<span class="tag">'+tagLabel(t)+'</span>';}).join("")+'</div>':'')+
          (badges(p)?'<div class="r-badges">'+badges(p)+'</div>':'')+
        '</div>'+
        '<div class="poem-body lang-'+p.lang+'" id="poemBody">'+lines+'</div>'+
        (p.note?'<div class="r-note"><span class="r-note-label">Author\'s Note:</span> '+esc(p.note)+'</div>':'')+   // the poet's note sits below the poem
        (hasImage(p)?'<figure class="r-image"><img alt="" loading="lazy" src="'+esc(p.image)+'"></figure>':'')+
      '</div>'+
      // fixed bottom bar: tools, aid captions, recite status
      '<div class="r-foot">'+
        '<div class="r-tools">'+aids+acts+'</div>'+
        '<div class="aid-notes"><p class="aid-note" id="sayNote" hidden></p><p class="aid-note" id="meanNote" hidden></p></div>'+
        '<p class="r-status" id="rStatus" role="status" aria-live="polite"></p>'+
      '</div>';
  }

  function wireReader(p){
    $$("#reader [data-aid]").forEach(function(b){ b.addEventListener("click",function(){ toggleAid(p,b,b.getAttribute("data-aid")); }); });
    var lb=$("#listenBtn"); if(lb) lb.addEventListener("click",function(){ toggleListen(p,lb); });
    var rr=$("#reciteRestart"); if(rr) rr.addEventListener("click",function(){ restartRecite(); });
    var sb=$("#shareBtn"); if(sb) sb.addEventListener("click",function(){ scrollReaderTop(); share(p,sb); });
    var cb=$("#copyBtn"); if(cb) cb.addEventListener("click",function(){ scrollReaderTop(); copyPoem(p,cb); });
    var im=$(".r-image img"); if(im) im.addEventListener("error",function(){ var f=im.closest(".r-image"); if(f) f.remove(); });   // a bad image URL just disappears
  }
  function rstatus(msg,tone){ var s=$("#rStatus"); if(!s) return; s.textContent=msg||""; if(tone) s.setAttribute("data-tone",tone); else s.removeAttribute("data-tone"); }
  // reading the popup back to the top (most tools) or down to a spot (a bulk translation)
  // A gentle, controlled-speed scroll so the eye can follow the reciting line (native
  // "smooth" is browser-timed and often too abrupt for short hops). Cancelable.
  var scrollAnim=null;
  function cancelScrollAnim(){ if(scrollAnim){ cancelAnimationFrame(scrollAnim); scrollAnim=null; } }
  function animScrollTo(pl, to, dur){
    cancelScrollAnim();
    to=Math.max(0, Math.min(to, pl.scrollHeight-pl.clientHeight));
    var from=pl.scrollTop, delta=to-from;
    if(Math.abs(delta)<2){ pl.scrollTop=to; return; }
    dur=dur||650; var t0=null;
    function ease(x){ return x<0.5 ? 2*x*x : 1-Math.pow(-2*x+2,2)/2; }   // easeInOutQuad
    function frame(t){ if(t0===null) t0=t; var p=Math.min(1,(t-t0)/dur);
      pl.scrollTop=from+delta*ease(p);
      if(p<1) scrollAnim=requestAnimationFrame(frame); else scrollAnim=null; }
    scrollAnim=requestAnimationFrame(frame);
  }
  function scrollReaderTop(){ cancelScrollAnim(); var pl=$("#reader .r-scroll"); if(pl) pl.scrollTop=0; }
  function scrollReaderTo(el){ cancelScrollAnim(); var pl=$("#reader .r-scroll"), hd=$("#reader .r-head"); if(!pl||!el) return;
    // only offset for the header when it's actually pinned (on phones it scrolls away)
    var stick = (hd && getComputedStyle(hd).position==="sticky") ? hd.offsetHeight : 0;
    var top = el.getBoundingClientRect().top - pl.getBoundingClientRect().top + pl.scrollTop - stick - 12;
    pl.scrollTop = Math.max(0, top); }
  function setOn(b,on){ b.classList.toggle("is-on",on); b.setAttribute("aria-pressed",String(on)); }
  function eachLine(fn){ $$("#poemBody .line").forEach(function(el){ fn(el, +el.dataset.s, +el.dataset.l); }); }
  function strip(cls){ $$("#poemBody ."+cls).forEach(function(n){ n.remove(); }); }

  /* ---- reading aids: pronunciation + English meaning, appended per line ---- */
  // Each aid has its own note (so they don't clobber each other, and each clears when
  // its button is switched off). Recitation keeps the separate #rStatus line.
  function aidNote(id,msg,tone){ var n=$("#"+id); if(!n) return; n.textContent=msg||""; n.hidden=!msg; if(tone) n.setAttribute("data-tone",tone); else n.removeAttribute("data-tone"); }
  function removeMeanBlock(){ $$("#reader .aid-mean-block").forEach(function(n){ n.remove(); }); }
  function removeSayBlock(){ $$("#reader .aid-say-block").forEach(function(n){ n.remove(); }); }
  // A whole-poem aid (used when the poet's transliteration/translation doesn't line up
  // line-for-line). Keeps a stable order below the poem: transliteration block, then
  // translation block, so if both are open they read the same way as the per-line aids.
  function mountBlock(cls, stanzas){
    var block=document.createElement("div"); block.className=cls; block.lang="en";
    block.textContent=stanzas.map(function(st){ return st.join("\n"); }).join("\n\n");
    var poem=$("#poemBody"); if(!poem) return block;
    var ref = (cls==="aid-mean-block") ? ($("#reader .aid-say-block")||poem) : poem;
    ref.parentNode.insertBefore(block, ref.nextSibling);
    return block;
  }
  function toggleAid(p, btn, kind){
    var on=btn.classList.contains("is-on");
    if(kind==="say"){
      if(on){ setOn(btn,false); strip("aid-say"); removeSayBlock(); aidNote("sayNote",""); scrollReaderTop(); }
      else { setOn(btn,true); showSay(p); }   // showSay scrolls itself (to the block, or to the top)
    } else {
      if(on){ setOn(btn,false); strip("aid-mean"); removeMeanBlock(); aidNote("meanNote",""); scrollReaderTop(); }
      else { setOn(btn,true); showMeaning(p,btn); }   // showMeaning scrolls itself (to the block, or to the top)
    }
  }
  function showSay(p){
    strip("aid-say"); removeSayBlock();
    // The poet's own transliteration is used when it lines up line-for-line; when she gave
    // one that doesn't line up, it's shown whole below the poem (like a bulk translation);
    // otherwise the site romanises every line. Never mix the two.
    if(p.translit && !sameShape(p.translit, p.stanzas)){
      var block=mountBlock("aid-say-block", p.translit);
      aidNote("sayNote", "The poet's own transliteration, shown in full below.", "translit");
      scrollReaderTo(block);
      return;
    }
    var useAuthor = p.translit && sameShape(p.translit, p.stanzas);
    eachLine(function(el,s,l){
      var st=p.stanzas[s]; var src=st&&st[l]; if(!src||!src.trim()) return;
      var text = useAuthor ? ((p.translit[s]&&p.translit[s][l])||T.line(src)) : T.line(src);
      // words wrapped so recitation can pop the matching transliteration word in step
      var span=document.createElement("span"); span.className="aid-say"; span.lang="en"; span.innerHTML=wordSpans(text);
      // transliteration always sits directly under the poem line, above any translation,
      // regardless of which aid was switched on first
      var mean=el.querySelector(".aid-mean"); if(mean) el.insertBefore(span, mean); else el.appendChild(span);
    });
    if(useAuthor) aidNote("sayNote", "The poet's own transliteration, in English letters.", "translit");
    else aidNote("sayNote", "Transliterated by the site into English letters, so you can sound out the words.", "translit");
    scrollReaderTop();
  }
  function showMeaning(p, btn){
    strip("aid-mean"); removeMeanBlock();
    var stored=p.translation && p.translation.en;
    if(stored){
      // The poet's own translation. Per-line if it matches the poem; otherwise shown whole,
      // below the poem -- never half author / half machine.
      if(sameShape(stored, p.stanzas)){
        eachLine(function(el,s,l){ var t=stored[s]&&stored[s][l]; if(t){ var span=document.createElement("span"); span.className="aid-mean"; span.lang="en"; span.textContent=t; el.appendChild(span); } });
        aidNote("meanNote", "The poet's own English translation.", "trans");
        scrollReaderTop();   // it's inline under each line; read from the top
      } else {
        var block=mountBlock("aid-mean-block", stored);
        aidNote("meanNote", "The poet's own English translation, shown in full below.", "trans");
        scrollReaderTo(block);   // shown in bulk below the poem -- take the reader to it
      }
      return;
    }
    btn.disabled=true; aidNote("meanNote","Translating…","trans"); scrollReaderTop();
    machineTranslate(p).then(function(map){
      eachLine(function(el,s,l){ var t=map[s+":"+l]; if(t){ var span=document.createElement("span"); span.className="aid-mean"; span.lang="en"; span.textContent=t; el.appendChild(span); } });
      aidNote("meanNote", "A rough machine translation, a doorway to the sense, not the poem. (Created using MyMemory.)", "trans");
    }).catch(function(err){
      setOn(btn,false); aidNote("meanNote","Translation is unavailable just now. The free service caps how much it will do in a day."+(err&&err.message?" ("+err.message+")":""), "warn");
    }).then(function(){ btn.disabled=false; });
  }
  // Translate line by line, but several lines at once (a small pool) instead of strictly one
  // after another -- a long poem finishes in a fraction of the time while staying well under
  // the free service's rate limit. The first hard failure (e.g. daily cap) stops the batch.
  function machineTranslate(p){
    var jobs=[]; p.stanzas.forEach(function(st,s){ st.forEach(function(t,l){ if(t&&t.trim()) jobs.push({key:s+":"+l,text:t.trim()}); }); });
    var out={}, pair=p.lang+"|en";
    var email=(CFG.shareEmailWithTranslator&&CFG.contactEmail)?"&de="+encodeURIComponent(CFG.contactEmail):"";
    var CONC=6, i=0, active=0, failed=null;
    function one(job){
      return fetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(job.text.slice(0,480))+"&langpair="+pair+email)
        .then(function(r){return r.json();}).then(function(d){ var t=d&&d.responseData&&d.responseData.translatedText;
          if(t){ if(/MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(t)) throw new Error("daily limit reached"); out[job.key]=t; } });
    }
    return new Promise(function(resolve,reject){
      function pump(){
        if(failed){ if(active===0) reject(failed); return; }
        if(i>=jobs.length && active===0){ resolve(out); return; }
        while(active<CONC && i<jobs.length && !failed){
          active++;
          one(jobs[i++]).catch(function(e){ failed=failed||e; }).then(function(){ active--; pump(); });
        }
      }
      pump();
    });
  }

  /* ---- recitation: her recording if present, else the device voice ----
     Supports play / pause / resume, plus a restart-from-the-top control. Audio uses the
     <audio> element's native pause/resume; the device voice re-speaks from the current line
     (browser TTS pause/resume is unreliable, especially on phones). */
  var speaking=false;      // a recitation is active (playing or paused)
  var recPaused=false;     // paused?
  var recMode=null;        // "audio" | "tts"
  var keepAlive=null, audioEl=null, curUtter=null, tts=null, ttsGen=0;

  function reciteUI(){
    var b=$("#listenBtn"), grp=$("#reciteGroup"), rb=$("#reciteRestart");
    if(!b) return;
    if(!speaking){ b.innerHTML=ICON.play+"Recite"; b.classList.remove("reciting"); setOn(b,false); if(grp) grp.classList.remove("on"); }
    else if(recPaused){ b.innerHTML=ICON.play+"Resume"; b.classList.remove("reciting"); setOn(b,true); if(grp) grp.classList.add("on"); }
    else { b.innerHTML=ICON.pause+"Pause"; b.classList.add("reciting"); setOn(b,true); if(grp) grp.classList.add("on"); }
    if(rb) rb.classList.toggle("is-on", speaking);   // restart matches the (filled) main button
  }
  function stopKeepAlive(){ if(keepAlive){ clearInterval(keepAlive); keepAlive=null; } }
  function startKeepAlive(){
    // keep a long device-voice recitation past a browser's internal cutoff (see note below)
    stopKeepAlive();
    var touch = (window.matchMedia && matchMedia("(hover: none)").matches) || navigator.maxTouchPoints>0;
    keepAlive=setInterval(function(){
      if(!speaking||recPaused){ stopKeepAlive(); return; }
      if(touch){ if(speechSynthesis.paused) speechSynthesis.resume(); }
      else if(speechSynthesis.speaking && !speechSynthesis.paused){ speechSynthesis.pause(); speechSynthesis.resume(); }
    }, touch?4000:10000);
  }

  function toggleListen(p,b){
    if(!speaking){ startRecite(p,b); return; }
    if(recPaused) resumeRecite(); else pauseRecite();
  }
  function startRecite(p,b){
    scrollReaderTop();
    if(hasAudio(p)){   // only a real audio file; garbage goes straight to the device voice
      recMode="audio";
      var fellBack=false;
      function fallback(){ if(fellBack) return; fellBack=true; if(audioEl){ audioEl.pause(); audioEl=null; } startTTS(p,b,true); }
      audioEl=new Audio(p.audio);
      audioEl.addEventListener("ended",function(){ stopListening(); });
      audioEl.addEventListener("error",fallback);
      audioEl.play().then(function(){ if(fellBack) return; speaking=true; recPaused=false; reciteUI(); rstatus("In her own voice.","recite"); }).catch(fallback);
      return;
    }
    startTTS(p,b,false);
  }
  function pauseRecite(){
    recPaused=true; stopKeepAlive();
    if(recMode==="audio"){ if(audioEl) audioEl.pause(); }
    else { ttsGen++; if(window.speechSynthesis) speechSynthesis.cancel(); }   // stale onends ignored; idx kept
    reciteUI();
  }
  function resumeRecite(){
    recPaused=false;
    if(recMode==="audio"){ if(audioEl) audioEl.play(); }
    else { ttsGen++; ttsSpeak(); startKeepAlive(); }
    reciteUI();
  }
  function restartRecite(){
    if(!speaking) return;
    scrollReaderTop(); recPaused=false;
    if(recMode==="audio"){ if(audioEl){ audioEl.currentTime=0; audioEl.play(); } }
    else { ttsGen++; if(window.speechSynthesis) speechSynthesis.cancel(); tts.idx=0; ttsSpeak(); startKeepAlive(); }
    reciteUI();
  }
  // full stop (poem ended, reader closed, or navigated away)
  function stopListening(keepStatus){
    var hadHighlight = !!$("#poemBody .reciting-word");
    speaking=false; recPaused=false; recMode=null; ttsGen++;
    if(audioEl){ audioEl.pause(); audioEl=null; }
    if(window.speechSynthesis) speechSynthesis.cancel();
    stopKeepAlive(); clearHighlight(); reciteUI(); if(!keepStatus) rstatus("");
    if(hadHighlight) scrollReaderTop();   // stopping a recitation returns to the top
  }

  function getVoices(){ return new Promise(function(resolve){ if(!window.speechSynthesis) return resolve([]); var v=speechSynthesis.getVoices(); if(v.length) return resolve(v);
    var settled=false; function done(){ if(settled)return; settled=true; clearInterval(poll); speechSynthesis.removeEventListener("voiceschanged",done); resolve(speechSynthesis.getVoices()); }
    speechSynthesis.addEventListener("voiceschanged",done); var poll=setInterval(function(){ if(speechSynthesis.getVoices().length) done(); },120); setTimeout(done,2500); }); }
  // Prefer a female voice for the poet's work where the device offers one. There is no
  // standard gender field, so this reads the voice name (best-effort; device-dependent).
  var FEMALE_RE=/female|woman|\bfem\b|aditi|raveena|heera|kalpana|swara|kanya|ananya|neerja|priya|isha|zira|hazel|susan|samantha|tessa|google/i;
  var MALE_RE=/\bmale\b|\bman\b|hemant|ravi|prabhat|madhur|rishi|david|mark|george|james|daniel|alex/i;
  function pickVoice(voices,lang){ var want={bn:"bn",hi:"hi",en:"en"}[lang]||"en";
    var hits=voices.filter(function(v){ return v.lang.toLowerCase().replace("_","-").indexOf(want)===0; });
    if(!hits.length){ if(lang==="en") hits=voices.slice(); else return null; }
    function score(v){ var n=v.name||"", s=0;
      if(FEMALE_RE.test(n) && !MALE_RE.test(n)) s+=3;   // sounds female
      if(MALE_RE.test(n)) s-=3;                          // sounds male
      if(v.localService) s+=1;                           // on-device is snappier
      return s; }
    return hits.slice().sort(function(a,b){ return score(b)-score(a); })[0]||null; }
  // Karaoke highlight (device voice only -- we know position because we speak line by line,
  // and onboundary tells us the word within a line; an mp3 gives no such position).
  function clearHighlight(){ $$("#poemBody .reciting-word").forEach(function(w){ w.classList.remove("reciting-word"); }); }
  function scrollLineIntoView(el){
    var pl=$("#reader .r-scroll"); if(!pl||!el) return;
    var pr=pl.getBoundingClientRect(), er=el.getBoundingClientRect();
    var hd=$("#reader .r-head"); var stick=(hd&&getComputedStyle(hd).position==="sticky")?hd.offsetHeight:0;
    if(er.top < pr.top+stick+24 || er.bottom > pr.bottom-24){   // only when it drifts out of view
      var band=pl.clientHeight-stick;
      animScrollTo(pl, pl.scrollTop + (er.top-pr.top) - stick - band/2 + er.height/2, 700);
    }
  }
  // which word (index) covers this character position in the line's text
  function wordIndexAt(words, charIndex){
    var off=0;
    for(var i=0;i<words.length;i++){ var wl=words[i].textContent.length;
      if(charIndex>=off && charIndex<off+wl) return i; off+=wl+1; }   // +1 for the space
    return words.length ? words.length-1 : -1;
  }
  // speak the current line (tts.idx); onboundary lights each word; each line's onend advances.
  // A generation token (ttsGen) invalidates callbacks of a line cancelled by pause/restart/stop.
  function ttsSpeak(){
    if(!speaking||recPaused||!tts) return;
    if(tts.idx>=tts.chunks.length){ stopListening(); return; }
    var gen=ttsGen;
    var el=tts.lineEls[tts.idx];
    var words = el ? $$(".ln .w", el) : [];   // the poem's own words (not the aid spans)
    clearHighlight(); scrollLineIntoView(el);
    // Pop the poem word i and, if the site's transliteration is showing, its matching word.
    // Transliteration words are looked up live so toggling it on mid-recitation is picked up.
    function light(i){
      clearHighlight();
      if(words[i]) words[i].classList.add("reciting-word");
      var tw = el ? $$(".aid-say .w", el) : [];
      if(tw[i]) tw[i].classList.add("reciting-word");
    }
    var u=new SpeechSynthesisUtterance(tts.chunks[tts.idx]); u.voice=tts.voice; u.lang=tts.voice.lang; u.rate=tts.rv;
    var boundaryFired=false, wt=null, wi=0;
    function stopTimer(){ if(wt){ clearTimeout(wt); wt=null; } }
    // Fallback for voices that don't report word boundaries: advance ONE word at a time by a
    // rough estimate, so it's still word-by-word (never the whole line -- that merges the words).
    function estimate(){
      if(gen!==ttsGen||!speaking||recPaused||boundaryFired){ stopTimer(); return; }
      if(wi>=words.length){ stopTimer(); return; }
      light(wi);
      var wl=words[wi].textContent.length; wi++;
      wt=setTimeout(estimate, Math.max(200, wl*72)/(tts.rv||0.72));
    }
    var started=false, t0=Date.now();
    // Did this utterance actually speak? True if the engine said so (onstart/onboundary), if the
    // estimate timer advanced, or if enough time simply passed. A PHANTOM end/error (Chrome
    // dropping a fresh utterance right after cancel()) fires within a few ms with none of these.
    function played(){ return started || boundaryFired || wi>0 || (Date.now()-t0) > 250; }
    // A real end advances to the next line; a phantom one retries the SAME line instead of
    // skipping it (skipping used to race idx to the end and silently stop the whole poem).
    function done(){
      stopTimer(); if(gen!==ttsGen||!speaking||recPaused) return;
      if(!played() && (tts._tries||0)<4){ tts._tries=(tts._tries||0)+1; setTimeout(function(){ if(gen===ttsGen&&speaking&&!recPaused) ttsSpeak(); }, 90); return; }
      tts._tries=0; tts.idx++; ttsSpeak();
    }
    u.onstart=function(){ started=true; tts._tries=0; };
    u.onboundary=function(e){ if(gen!==ttsGen||!speaking||recPaused) return; if(e.name && e.name!=="word") return; boundaryFired=true; stopTimer(); light(wordIndexAt(words, e.charIndex||0)); };
    u.onend=done;
    u.onerror=done;   // canceled/interrupted/etc: retry rather than kill the recitation
    curUtter=u; speechSynthesis.speak(u);
    // if no real word boundary arrives shortly, drive the estimated word-by-word highlight
    setTimeout(function(){ if(gen===ttsGen && speaking && !recPaused && !boundaryFired){ wi=0; estimate(); } }, 280);
  }
  function startTTS(p,b,fromFallback){
    recMode="tts";
    if(!window.speechSynthesis){ stopListening(true); rstatus("This browser can't read text aloud. Chrome on Android or Edge on Windows can.","warn"); return; }
    rstatus("Finding a voice…","recite");
    getVoices().then(function(voices){
      var voice=pickVoice(voices,p.lang);
      if(!voice){ stopListening(true); rstatus(noVoiceHelp(p.lang),"warn"); return; }
      // pull the spoken lines from the DOM so each maps to a .line element (for highlighting).
      // The first span in a .line is the poem text (any transliteration/translation is appended after).
      var lineEls=$$("#poemBody .line").filter(function(el){ var sp=el.querySelector("span"); return sp && sp.textContent.trim(); });
      var chunks=lineEls.map(function(el){ return el.querySelector("span").textContent.trim(); });
      if(!chunks.length){ stopListening(); return; }
      var rate=$("#rate"); var rv=rate?parseFloat(rate.value):0.72;   // gentle, unhurried pace for poetry
      tts={ chunks:chunks, lineEls:lineEls, voice:voice, rv:rv, idx:0 };
      speaking=true; recPaused=false; ttsGen++; speechSynthesis.cancel();
      reciteUI();
      rstatus((fromFallback?"That recording wouldn't play, so it's read by your device's ":"Read by your device's ")+langName(p.lang)+" voice.","recite");
      ttsSpeak();
      // Long poems: keep the device voice alive past a browser's internal cutoff. Desktop
      // Chrome silently stops after ~15s; a periodic pause+resume resets that timer. On phones
      // that same trick CUTS the speech off, so there we only nudge resume() (never pause).
      // (Her uploaded mp3s play through <audio>, which has no such limit.)
      startKeepAlive();
    });
  }
  function noVoiceHelp(lang){ return "No "+langName(lang)+" voice on this device. Open Transliteration to sound out the words."; }

  /* ------------------------------------------------------------- share / copy */
  function poemLink(p){ return location.origin+location.pathname+"#/poem/"+p.slug; }
  function share(p,btn){ var url=poemLink(p);
    var r=romanTitle(p); var disp=p.title+(r?" ("+r+")":"");   // add the roman title for Bangla/Hindi
    var data={title:disp,text:'"'+disp+'", a poem by '+(CFG.poetName||"the poet"),url:url};
    if(navigator.share){ navigator.share(data).catch(function(){}); return; }
    if(navigator.clipboard){ navigator.clipboard.writeText(url).then(function(){ flash(btn,"✓ Link copied"); }); } else prompt("Copy this link:",url); }
  function copyPoem(p,btn){ var r=romanTitle(p); var text=p.title+(r?" ("+r+")":"")+"\n\n"+plainText(p.stanzas)+"\n\nby "+(CFG.poetName||"");
    if(navigator.clipboard){ navigator.clipboard.writeText(text).then(function(){ flash(btn,"✓ Copied"); }).catch(function(){ rstatus("Copy didn't work. Select the poem and copy by hand.","warn"); }); } }
  function flash(btn,msg){ var t=btn.innerHTML; btn.innerHTML=msg; setTimeout(function(){ btn.innerHTML=t; },1500); }

  /* ------------------------------------------------------------- theme / bulb */
  var THEME_KEY="mann-mausam-theme";
  function isDark(){ var t=document.documentElement.getAttribute("data-theme"); if(t) return t==="dark"; return window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches; }
  function applyTheme(t){ document.documentElement.setAttribute("data-theme",t); $("#pullChain").setAttribute("aria-pressed",t==="dark"); var m=$('meta[name=theme-color]'); if(m) m.setAttribute("content",t==="dark"?"#14161f":"#c1502e"); }
  function initTheme(){ var saved; try{ saved=localStorage.getItem(THEME_KEY); }catch(e){} applyTheme(saved || "light"); }  // light is the default; dark only after a pull
  function bounceChain(){ var pc=$("#pullChain"); pc.classList.remove("pulling"); void pc.offsetWidth; pc.classList.add("pulling"); }
  function toggleTheme(){ var next=isDark()?"light":"dark"; bounceChain();
    applyTheme(next); try{ localStorage.setItem(THEME_KEY,next); }catch(e){} }

  /* ---- the pull itself: a real drag, not a click. Hold and drag down to lengthen
     the chain (top mount stays put); hold and drag sideways to swing it. Releasing
     -- however the browser ends the gesture -- is what toggles the light, with a
     swing-and-spring-back settle. A plain click/tap and Enter/Space still work too.
     Move/up listeners live on `document`, not the button, so a fast drag that carries
     the pointer off this small graphic (or a gesture the browser cancels, e.g. if it
     tries to treat the drag as a scroll) still reliably reaches the toggle. */
  function wirePullChain(){
    var pc=$("#pullChain"), pcPull=$("#pcPull"), pcKnob=$("#pcKnob"), mount=$(".pc-mount"); if(!pc||!pcPull) return;
    var MAX_SWING=48, MAX_STRETCH=0.34, dragging=false, pivotX=0, pivotY=0, restLen=1, lastAngle=0, suppressClick=false;
    // The pivot is the fixed mount at the top; restLen is the pivot->bulb distance at rest.
    // Measured fresh at each grab, so it stays right at any screen size (incl. the .66 mobile scale).
    function measure(){
      var m=(mount||pc).getBoundingClientRect(); pivotX=m.left+m.width/2; pivotY=m.top+m.height;
      var k=(pcKnob||pcPull).getBoundingClientRect(); var kx=k.left+k.width/2, ky=k.top+k.height/2;
      restLen=Math.max(24, Math.sqrt((kx-pivotX)*(kx-pivotX)+(ky-pivotY)*(ky-pivotY)));
    }
    // Follow the finger/cursor like a real chain: the chain rotates to point at it (swinging
    // either way) and stretches by how far past its rest length you pull.
    function setLive(clientX,clientY){
      var dx=clientX-pivotX, dy=clientY-pivotY; if(dy<0) dy=0;   // a chain hangs below its mount, never above
      var ang=Math.atan2(dx,dy)*180/Math.PI;                    // 0 = straight down, + = finger to the right
      if(ang>MAX_SWING) ang=MAX_SWING; if(ang<-MAX_SWING) ang=-MAX_SWING;
      var dist=Math.sqrt(dx*dx+dy*dy), stretch=(dist-restLen)/restLen;
      if(stretch<0) stretch=0; if(stretch>MAX_STRETCH) stretch=MAX_STRETCH;
      var scale=1+stretch;
      lastAngle=-ang;   // SVG rotation is clockwise-positive; negate so the bulb follows the finger
      pcPull.style.transform="rotate("+lastAngle.toFixed(2)+"deg) scaleY("+scale.toFixed(3)+")";
      if(pcKnob) pcKnob.style.transform="scaleY("+(1/scale).toFixed(4)+")";   // keep the bulb its true shape
    }
    function onMove(e){ if(!dragging) return; setLive(e.clientX,e.clientY); if(e.cancelable) e.preventDefault(); }
    function onEnd(){
      if(!dragging) return;
      dragging=false; pc.classList.remove("dragging"); pcPull.style.transform="";
      if(pcKnob) pcKnob.style.transform="";   // hand the bulb back to the spring keyframe
      pcPull.style.setProperty("--swing", lastAngle.toFixed(2)+"deg");
      document.removeEventListener("pointermove",onMove);
      document.removeEventListener("pointerup",onEnd);
      document.removeEventListener("pointercancel",onEnd);
      suppressClick=true; setTimeout(function(){ suppressClick=false; },400);
      toggleTheme();   // any release after a press-and-hold counts as "letting go"
    }
    pc.addEventListener("pointerdown",function(e){
      if(e.pointerType==="mouse" && e.button!==0) return;
      // Capture this pointer so every move/up keeps coming to us. On a phone this is what
      // stops Chrome deciding the drag is a scroll and cancelling it a moment after you grab.
      try{ if(e.target && e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId); }catch(_e){}
      dragging=true; lastAngle=0; pc.classList.add("dragging");   // .dragging also pauses the idle sway (CSS) for steady tracking
      measure(); setLive(e.clientX,e.clientY);                    // respond from the very first touch
      document.addEventListener("pointermove",onMove,{passive:false});
      document.addEventListener("pointerup",onEnd);
      document.addEventListener("pointercancel",onEnd);
      if(e.cancelable) e.preventDefault();   // suppresses the compatibility click that would otherwise follow
    });
    // Keyboard activation (Enter/Space) never fires pointerdown, so it still reaches here;
    // suppressClick guards the rare case a compatibility click leaks through after a drag.
    pc.addEventListener("click",function(){ if(suppressClick) return; pcPull.style.setProperty("--swing","0deg"); toggleTheme(); });
  }

  /* ------------------------------------------------------------------ config */
  /* The centre title cycles through the languages: first the whole phrase in Bangla,
     Hindi and English, then every per-word pairing of the two words across the three
     languages. Words come from the three siteName forms in config, split on spaces. */
  var titleTimer=null;
  function startTitleCycle(){
    var t=$("#heroTitle"), w1=$("#htWord1"), w2=$("#htWord2"); if(!t||!w1||!w2) return;
    var words={
      bn:(CFG.siteNameBangla||"").split(/\s+/),
      hi:(CFG.siteNameHindi||"").split(/\s+/),
      en:(CFG.siteName||"").split(/\s+/)
    };
    // Exactly one word changes between steps, so the phrase always reads in full -- no empty gap:
    // both Bangla -> Mann to Hindi -> both Hindi -> Mann to English -> both English -> Mann back to Bangla -> (loop)
    var seq=[ ["bn","bn"], ["hi","bn"], ["hi","hi"], ["en","hi"], ["en","en"], ["bn","en"] ];
    var i=0;
    function setWord(el,idx,lang){ el.textContent=(words[lang]||[])[idx]||""; el.className="ht-word lang-"+lang; el.setAttribute("lang",lang); }
    function fadeWord(el,idx,lang){ el.style.opacity="0"; setTimeout(function(){ setWord(el,idx,lang); el.style.opacity="1"; }, 480); }
    setWord(w1,0,seq[0][0]); setWord(w2,1,seq[0][1]);
    t.setAttribute("aria-label", CFG.siteName||"");
    if(seq.length<2) return;
    if(titleTimer) clearInterval(titleTimer);
    titleTimer=setInterval(function(){
      var n=(i+1)%seq.length;
      if(seq[i][0]!==seq[n][0]) fadeWord(w1,0,seq[n][0]);   // fade only the word that actually changes; the other stays put
      if(seq[i][1]!==seq[n][1]) fadeWord(w2,1,seq[n][1]);
      i=n;
    }, 2800);
  }

  function applyConfig(){
    if(CFG.siteName) $("#brandName").textContent=CFG.siteName;
    var sub=$("#heroSubline"); if(sub) sub.textContent = CFG.poetName? ("Poems by "+CFG.poetName) : "Poems";
    $("#brandSub").textContent = CFG.poetName? ("By "+CFG.poetName) : "";   // shorter form beside the header logo
    $("#heroTagline").textContent=CFG.siteTagline||"";
    var fn=$("#footerName"); if(fn) fn.textContent="";
    startTitleCycle();
    document.title=(CFG.siteName||"Poems")+" · "+(CFG.poetName||"");
    $("#aboutHeading").textContent=CFG.aboutHeading||"About the Poet";
    var at=CFG.aboutText, atEl=$("#aboutText");
    if(atEl){ var paras=Array.isArray(at)?at:[at||""]; atEl.innerHTML=paras.map(function(p){ return '<p>'+esc(p)+'</p>'; }).join(""); }
    $("#aboutCaption").textContent=CFG.aboutPhotoCaption||CFG.poetName||"";
    if(CFG.aboutPhoto){ $("#aboutPhoto .photo-frame").innerHTML='<img src="'+esc(CFG.aboutPhoto)+'" alt="'+esc(CFG.poetName||"")+'">'; }
    renderContact();
  }
  function fbLink(v){ v=String(v||"").trim(); if(!v) return ""; return /^https?:\/\//i.test(v) ? v : ("https://"+v.replace(/^\/+/,"")); }
  function fbShow(v){ return String(v||"").trim().replace(/^https?:\/\//i,"").replace(/\/+$/,""); }
  function renderContact(){
    var area=$("#contactArea"), mail=CFG.contactEmail||"", fb=CFG.facebook||"";
    var mailIcon='<svg class="btn-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7.5 8.5 6 8.5-6"/></svg>';
    var fbIcon='<svg class="btn-i" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>';
    var mailHref='mailto:'+esc(mail)+'?subject='+encodeURIComponent("A note about your poems");
    // Each button carries a small translucent label on top and the real address/link below,
    // so the contact is readable without clicking. Both open in a new tab so the poems stay put.
    function card(href, icon, label, value){
      return '<a class="btn btn--hero btn--contact" href="'+href+'" target="_blank" rel="noopener">'+icon+
        '<span class="btn-contact-text"><span class="btn-contact-label">'+esc(label)+'</span>'+
        '<span class="btn-contact-value">'+esc(value)+'</span></span></a>';
    }
    var out="";
    if(mail) out+=card(mailHref, mailIcon, "Email", mail);
    if(fb)   out+=card(fbLink(fb), fbIcon, "Social media", fbShow(fb));
    area.innerHTML = out
      ? '<div class="contact-actions">'+out+'</div>'
      : '<p>Add a contact email or Facebook link in <code>config.js</code>.</p>';
  }

  /* -------------------------------------------------------------- reveal obs */
  var io;
  function observeReveals(){ if(!("IntersectionObserver" in window)){ $$(".reveal").forEach(function(e){e.classList.add("in");}); return; }
    if(!io) io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }); },{threshold:.12});
    $$(".reveal:not(.in)").forEach(function(e){ io.observe(e); }); }

  /* -------------------------------------------------------------- scroll spy */
  var SECTIONS=["home","poems","about","contact"];
  function spy(){
    var y=window.scrollY+ (window.innerHeight*0.32);
    var active="home";
    for(var i=0;i<SECTIONS.length;i++){ var el=document.getElementById(SECTIONS[i]); if(el && el.offsetTop<=y) active=SECTIONS[i]; }
    if(active==="home") active="poems"; // brand covers home; nav starts at Poems
    $$(".site-nav a").forEach(function(a){ a.classList.toggle("active", a.getAttribute("data-nav")===active); });
  }

  /* --------------------------------------------------------------- routing */
  function routeFromHash(){
    var m=/^#\/poem\/(.+)$/.exec(location.hash);
    if(m){ var slug=decodeURIComponent(m[1]); if(slug!==currentSlug) openPoem(slug,false); }
    else { hideReader(); }
  }

  /* --------------------------------------------------------------- listeners */
  function wireGlobal(){
    wirePullChain();
    $("#surpriseBtn").addEventListener("click", surprise);
    $("#readerPrev").addEventListener("click", function(){ goRelative(-1); });
    $("#readerNext").addEventListener("click", function(){ goRelative(1); });
    // Swipe across the popup to move between poems (mainly for phones): the card follows the
    // finger, then flings off and the next card slides in from the other side (Tinder-style).
    // A clearly horizontal drag swipes; vertical drags still scroll the poem normally.
    (function(){
      var panel=$(".reader-panel"); if(!panel) return;
      var sx=0, sy=0, active=false, decided=false, horiz=false, dx=0, W=0, animating=false;
      function tf(x, rot, op){ panel.style.transform="translateX("+x+"px) rotate("+rot+"deg)"; if(op!=null) panel.style.opacity=op; }
      function clearTf(){ panel.style.transition=""; panel.style.transform=""; panel.style.opacity=""; }
      panel.addEventListener("touchstart", function(e){
        if(animating || e.touches.length!==1){ active=false; return; }
        active=true; decided=false; horiz=false; dx=0;
        sx=e.touches[0].clientX; sy=e.touches[0].clientY; W=panel.offsetWidth||window.innerWidth;
        panel.style.transition="";
      }, {passive:true});
      panel.addEventListener("touchmove", function(e){
        if(!active) return;
        dx=e.touches[0].clientX-sx; var dy=e.touches[0].clientY-sy;
        if(!decided){ if(Math.abs(dx)<8 && Math.abs(dy)<8) return; decided=true; horiz=Math.abs(dx)>Math.abs(dy)*1.2; }
        if(horiz){ e.preventDefault(); tf(dx, dx/28, Math.max(.55, 1-Math.abs(dx)/(W*1.5))); }
      }, {passive:false});
      panel.addEventListener("touchend", function(){
        if(!active) return; active=false;
        if(!horiz){ return; }
        var s = dx<0 ? -1 : 1;                          // swipe direction (-1 left, +1 right)
        if(Math.abs(dx) > Math.min(120, W*0.28)){
          animating=true;
          panel.style.transition="transform .22s ease-out, opacity .22s ease-out";
          tf(s*W*1.35, s*14, 0);                        // fling off in the swipe direction
          setTimeout(function(){
            goRelative(s<0 ? 1 : -1);                    // swipe left = next
            panel.style.transition=""; tf(-s*W*1.35, -s*14, 0);   // place next card on the far side
            void panel.offsetWidth;                     // reflow so the next transition runs
            panel.style.transition="transform .28s cubic-bezier(.2,.8,.2,1), opacity .28s ease";
            tf(0,0,1);                                  // slide it in to centre
            setTimeout(function(){ clearTf(); animating=false; }, 300);
          }, 220);
        } else {
          panel.style.transition="transform .25s ease, opacity .25s ease"; tf(0,0,1);   // spring back
          setTimeout(function(){ panel.style.transition=""; }, 260);
        }
      }, {passive:true});
    })();

    document.addEventListener("click", function(e){
      var t=e.target;
      // A tap anywhere outside the recite control stops the recitation and returns it to
      // "Recite" (there's otherwise no way to fully stop -- pause only toggles to resume).
      if(speaking && !(t.closest && t.closest("#reciteGroup"))) stopListening();
      if(t.closest && t.closest("#clearFilters")){ clearAllFilters(); return; }
      var card=t.closest && t.closest("[data-slug]");
      if(card){ openPoem(card.getAttribute("data-slug")); return; }
      if(t.closest && t.closest("[data-close]")){ userClose(); return; }
      var nav=t.closest && t.closest(".site-nav a, .brand");
      if(nav){ if(!reader.hidden) hideReader(); return; } // let the anchor scroll
      var lc=t.closest && t.closest("[data-lang]");
      if(lc){ STATE.lang=lc.getAttribute("data-lang"); STATE.shown=PAGE; syncChips("#langChips","data-lang",STATE.lang); renderGrid(); return; }
      var tc=t.closest && t.closest("[data-tag]");
      if(tc){ STATE.theme=tc.getAttribute("data-tag"); STATE.shown=PAGE; syncChips("#themeChips","data-tag",STATE.theme); renderGrid(); return; }
      var ac=t.closest && t.closest("[data-attr]");
      if(ac){ var a=ac.getAttribute("data-attr"), k=STATE.attrs.indexOf(a);   // combinable toggle
        if(k>=0) STATE.attrs.splice(k,1); else STATE.attrs.push(a);
        ac.classList.toggle("active"); STATE.shown=PAGE; renderGrid(); return; }
    });

    var sm=$("#showMore"); if(sm) sm.addEventListener("click", function(){ STATE.shown+=PAGE; renderGrid(); });
    $("#search").addEventListener("input", debounce(function(e){ STATE.q=e.target.value; STATE.shown=PAGE; renderGrid(); },180));
    document.addEventListener("keydown", function(e){
      if(reader.hidden) return;
      if(e.key==="Escape") userClose();
      else if(e.key==="ArrowLeft") goRelative(-1);
      else if(e.key==="ArrowRight") goRelative(1);
    });
    window.addEventListener("hashchange", routeFromHash);
    window.addEventListener("popstate", routeFromHash);
    window.addEventListener("scroll", throttle(spy,150), { passive:true });
    window.addEventListener("beforeunload", function(){ if(window.speechSynthesis) speechSynthesis.cancel(); });
    spy();
  }
  function syncChips(sel,attr,val){ $$(sel+" .chip").forEach(function(b){ b.classList.toggle("active", b.getAttribute(attr)===val); }); }
  function debounce(fn,ms){ var t; return function(){ var a=arguments,c=this; clearTimeout(t); t=setTimeout(function(){fn.apply(c,a);},ms); }; }
  function throttle(fn,ms){ var last=0,timer; return function(){ var now=Date.now(); if(now-last>=ms){ last=now; fn(); } else { clearTimeout(timer); timer=setTimeout(function(){ last=Date.now(); fn(); }, ms-(now-last)); } }; }

  /* ------------------------------------------------------------------- start */
  initTheme();
  applyConfig();
  wireGlobal();
  loadPoems();
})();
