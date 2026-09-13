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
    spark:'<svg class="btn-i" viewBox="0 0 24 24"><path d="M12 2.5l1.9 6.1L20 10l-6.1 1.4L12 17.5 10.1 11.4 4 10l6.1-1.4z" fill="currentColor"/></svg>',
    share:'<svg class="btn-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="6" r="2.3"/><circle cx="18" cy="18" r="2.3"/><path d="M8.1 10.9l7.8-3.9M8.1 13.1l7.8 3.9"/></svg>',
    copy: '<svg class="btn-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>'
  };

  /* ----------------------------------------------------------------- SAMPLE
     Mousumee's own poems, shown until the Google Sheet is connected. */
  var SAMPLE_ROWS = [
    { slug:"nodir-kache", title:"নদীর কাছে", title_roman:"Nodir Kache", title_english:"By the River", lang:"bn", date:"2026-04-18", tags:"প্রকৃতি, স্মৃতি",
      poem:"সন্ধ্যা নামে ধীরে নদীর বুকে\nজলের ভাঁজে লুকোনো পুরোনো সুর\n\nআমি বসে থাকি ঘাটের সিঁড়িতে\nস্মৃতিরা ভাসে, চলে যায় বহুদূর",
      translation_en:"Evening comes down slowly on the river's breast,\nan old tune hidden in the folds of the water.\n\nI sit on the steps of the ghat\nwhile memories drift, and travel far away." },
    { slug:"shohorer-brishti", title:"শহরের বৃষ্টি", title_roman:"Shohorer Brishti", title_english:"Rain in the City", lang:"bn", date:"2026-02-09", tags:"শহর, বৃষ্টি",
      poem:"ইটের দেয়ালে বৃষ্টির আঙুল\nলিখে যায় কারও না-বলা চিঠি\n\nছাদের কার্নিশে জমে থাকে জল\nআর জমে থাকে ফেলে আসা মাটি",
      translation_en:"On the brick wall the fingers of the rain\nwrite out someone's unspoken letter.\n\nWater gathers along the ledge of the roof,\nand so does the soil we left behind." },
    { slug:"mayer-haat", title:"মায়ের হাত", title_roman:"Mayer Haat", title_english:"My Mother's Hands", lang:"bn", date:"2025-11-23", tags:"মা, স্মৃতি",
      poem:"হলুদ শাড়ির ভাঁজে রোদের গন্ধ\nউনুনের পাশে বসে থাকা দুপুর\n\nসেই হাতে ছিল সমস্ত পৃথিবী\nএখন কেবল ছবি, নিঃশব্দ, সুদূর",
      translation_en:"In the folds of a yellow sari, the smell of sunlight;\nan afternoon spent sitting beside the stove.\n\nThose hands once held the whole world.\nNow only a photograph, silent, far away." },
    { slug:"lautna", title:"लौटना", title_roman:"Lautna", title_english:"Returning", lang:"hi", date:"2025-08-30", tags:"घर वापसी, स्मृति",
      poem:"शाम की गली में एक दीया जलता है\nकिसी के लौटने की आस लिये\n\nमैं भी चलता हूँ उसी रास्ते पर\nअपने ही पैरों के निशान लिये",
      translation_en:"In the evening lane a small lamp burns,\nholding the hope that someone will return.\n\nI walk that same road myself,\ncarrying the prints of my own feet." },
    { slug:"afternoon-light", title:"Afternoon Light", title_roman:"", title_english:"", lang:"en", date:"2026-01-15", tags:"Memory, Home",
      poem:"The afternoon leans on the veranda rail,\ncounting the years in flakes of paint.\n\nSomewhere a radio remembers a song\nyour grandmother knew by heart.",
      translation_en:"" }
  ];

  /* ----------------------------------------------------------------- helpers */
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
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

  /* Bangla/Hindi titles carry romanisation so non-readers have something to say */
  function romanTitle(p){
    if(p.lang==="en") return "";
    if(p.titleRoman) return p.titleRoman;
    if(T.supports(p.lang)){ return T.line(p.title).replace(/\b[a-z]/g,function(c){return c.toUpperCase();}); }
    return "";
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
    p._hay = (p.title+" "+p.titleRoman+" "+p.titleEnglish+" "+plainText(stanzas)+" "+
      (translit?plainText(translit):"")+" "+(translation?plainText(translation):"")+" "+p.tags.join(" ")).toLowerCase();
    p._rand = Math.random();   // stable-per-load tiebreak for poems sharing a date
    return p;
  }

  /* --------------------------------------------------------------- data load */
  var POEMS=[], STATE={ q:"", lang:"all", theme:"all" };

  function gvizUrl(id, tab){ return "https://docs.google.com/spreadsheets/d/"+encodeURIComponent(id)+"/gviz/tq?tqx=out:csv&sheet="+encodeURIComponent(tab||"Poems"); }

  function poemsFromCSV(t){
    if(/^\s*</.test(t)) throw new Error("got a web page, not CSV (is the sheet shared as 'Anyone with the link'?)");
    var poems=rowsToRaw(parseCSV(t)).map(buildPoem);
    if(!poems.length) throw new Error("no usable rows");
    return poems;
  }
  function showSamples(msg){ POEMS=SAMPLE_ROWS.map(buildPoem); sortPoems(); showSourceNote(msg); afterLoad(); }
  /* The last-saved copy committed in the repo (content/poems.csv). It's the fallback when
     the live sheet can't be reached, and the source when no sheet is configured -- tried
     before the built-in samples so the site keeps showing her real poems through an outage. */
  function tryLocalCSV(onFail){
    fetch("content/poems.csv", { cache: "no-store" })
      .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.text(); })
      .then(function(t){ POEMS=poemsFromCSV(t); sortPoems(); hideSourceNote(); afterLoad(); })
      .catch(onFail);
  }
  /* Load order: live Google Sheet (if set) -> committed content/poems.csv -> built-in samples. */
  function loadPoems(){
    if(!CFG.googleSheetId){
      tryLocalCSV(function(){ showSamples('Showing <strong>sample poems</strong> by Mousumee Ghosh. Connect your Google Sheet in <code>config.js</code> (or commit <code>content/poems.csv</code>) to load her own collection.'); });
      return;
    }
    fetch(gvizUrl(CFG.googleSheetId, CFG.googleSheetTab))
      .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.text(); })
      .then(function(t){ POEMS=poemsFromCSV(t); sortPoems(); hideSourceNote(); afterLoad(); })
      .catch(function(err){
        console.warn("Live sheet load failed ("+err.message+") - trying the saved content/poems.csv");
        tryLocalCSV(function(err2){
          console.warn("content/poems.csv also unavailable ("+err2.message+") - using built-in samples");
          showSamples("Couldn't reach the poems just now. Showing a few sample poems for the moment.");
        });
      });
  }
  function sortPoems(){ POEMS.sort(function(a,b){
    if(!a.date&&!b.date) return a._rand-b._rand;   // undated: random among themselves
    if(!a.date) return 1; if(!b.date) return -1;   // undated sink to the end
    var c=b.date.localeCompare(a.date);            // newest first
    return c!==0 ? c : (a._rand-b._rand);          // same date: random within
  }); }
  function showSourceNote(html){ var n=$("#sourceNote"); n.innerHTML=html; n.hidden=false; }
  function hideSourceNote(){ $("#sourceNote").hidden=true; }

  function afterLoad(){ buildChips(); renderPotd(); renderGrid(); refillBag(); routeFromHash(); }

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
  }

  /* ------------------------------------------------------------------ grid */
  function matches(p){
    if(STATE.lang!=="all" && p.lang!==STATE.lang) return false;
    if(STATE.theme!=="all" && p.tags.indexOf(STATE.theme)<0) return false;
    if(STATE.q && p._hay.indexOf(STATE.q.toLowerCase())<0) return false;
    return true;
  }
  function snippet(p){ return flatLines(p.stanzas).filter(function(l){return l.trim();}).slice(0,4).join("\n"); }
  function cardHTML(p){
    var r=romanTitle(p);
    return '<button class="poem-card lang-'+p.lang+' reveal" data-slug="'+esc(p.slug)+'">'+
      '<span class="pc-lang '+p.lang+'">'+esc(langName(p.lang))+'</span>'+
      '<h3>'+esc(p.title)+'</h3>'+
      (r?'<span class="roman">'+esc(r)+'</span>':'')+
      '<p class="snippet">'+esc(snippet(p))+'</p>'+
      '<div class="pc-foot">'+
        p.tags.slice(0,2).map(function(t){return '<span class="tag">'+tagLabel(t)+'</span>';}).join("")+
        (p.audio?'<span class="has-audio">♪ recording</span>':'')+
      '</div>'+
    '</button>';
  }
  function renderGrid(){
    var list=POEMS.filter(matches), grid=$("#poemGrid"), rc=$("#resultCount");
    rc.textContent = list.length? (list.length+(list.length===1?" poem":" poems")+(STATE.lang==="all"&&STATE.theme==="all"&&!STATE.q?" in the collection":" found")) : "";
    if(!list.length){ grid.innerHTML='<p class="result-count">No poems match that. Try clearing the filters or the search.</p>'; return; }
    grid.innerHTML=list.map(cardHTML).join("");
    observeReveals();
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
    var r=romanTitle(p);
    var verse=p.stanzas.slice(0,2).map(function(st){return st.join("\n");}).join("\n\n");
    $("#potd").innerHTML='<div class="potd-card reveal">'+
      '<div class="potd-side">Today’s poem</div>'+
      '<div class="potd-main">'+
        '<h3 class="lang-'+p.lang+'">'+esc(p.title)+'</h3>'+
        (r?'<span class="roman">'+esc(r)+'</span>':'')+
        '<div class="potd-verse lang-'+p.lang+'">'+esc(verse)+'</div>'+
        '<button class="btn btn--hero" data-slug="'+esc(p.slug)+'">Read it, hear it →</button>'+
      '</div>'+
    '</div>';
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
    panel.scrollTop=0; panel.focus();
    wireReader(p);
    if(push!==false) history.pushState({p:slug},"", "#/poem/"+slug);
  }
  function poemIndex(slug){ for(var i=0;i<POEMS.length;i++) if(POEMS[i].slug===slug) return i; return -1; }
  function goRelative(delta){ if(!currentSlug||!POEMS.length) return; var i=poemIndex(currentSlug); if(i<0) return; var n=POEMS.length; openPoem(POEMS[(((i+delta)%n)+n)%n].slug); }
  function hideReader(){ if(reader.hidden) return; stopListening(); reader.hidden=true; reader.setAttribute("aria-hidden","true"); document.body.style.overflow=""; currentSlug=null; currentPoem=null; if(lastFocus&&lastFocus.focus) lastFocus.focus(); }
  function userClose(){ var wasPoemHash=/^#\/poem\//.test(location.hash); hideReader(); if(wasPoemHash) history.replaceState(null,"", location.pathname+location.search); }

  function readerHTML(p){
    var r=romanTitle(p);
    var romanLine = r? (p.titleEnglish? r+" · "+p.titleEnglish : r) : (p.titleEnglish||"");
    var lines="";
    p.stanzas.forEach(function(st,si){ lines+='<div class="stanza">';
      st.forEach(function(text,li){ lines+='<p class="line" data-s="'+si+'" data-l="'+li+'"><span lang="'+p.lang+'">'+esc(text)+'</span></p>'; });
      lines+='</div>';
    });

    var aids='<div class="tool-group"><p class="tool-label">Help me read this</p>';
    if(T.supports(p.lang)) aids+='<button class="btn btn--sm" data-aid="say" type="button">'+ICON.say+'Transliteration</button>';
    if(p.translation || (CFG.features && CFG.features.autoTranslate && p.lang!=="en")) aids+='<button class="btn btn--sm" data-aid="mean" type="button">'+ICON.mean+'English meaning</button>';
    if(CFG.features && CFG.features.recitation) aids+='<button class="btn btn--sm" id="listenBtn" type="button">'+ICON.play+'Recite</button>';
    aids+='</div>';

    var acts='<div class="tool-group"><p class="tool-label">Take it with you</p>';
    acts+='<button class="btn btn--sm" id="shareBtn" type="button">'+ICON.share+'Share</button>'+
          '<button class="btn btn--sm" id="copyBtn" type="button">'+ICON.copy+'Copy</button></div>';

    return ''+
      '<span class="r-lang lang-'+p.lang+'">'+esc(langName(p.lang))+(p.date?' · '+esc(formatDate(p.date)):'')+(p.audio?' · ♪ in her voice':'')+'</span>'+
      '<h1 class="r-title lang-'+p.lang+'" id="readerTitle">'+esc(p.title)+'</h1>'+
      (romanLine?'<p class="r-roman">'+esc(romanLine)+'</p>':'')+
      (p.tags.length?'<div class="r-meta">'+p.tags.map(function(t){return '<span class="tag">'+tagLabel(t)+'</span>';}).join("")+'</div>':'')+
      (p.image?'<img src="'+esc(p.image)+'" alt="" loading="lazy" style="border:2px solid var(--ink);border-radius:10px;margin-bottom:1.2rem">':'')+
      '<div class="poem-body lang-'+p.lang+'" id="poemBody">'+lines+'</div>'+
      (p.note?'<div class="r-note">'+esc(p.note)+'</div>':'')+
      '<div class="r-tools">'+aids+acts+'</div>'+
      '<p class="r-status" id="rStatus" role="status" aria-live="polite"></p>';
  }
  function formatDate(iso){ if(!iso) return ""; var d=new Date(iso.length===10?iso+"T00:00:00":iso); if(isNaN(d)) return iso; return d.toLocaleDateString(undefined,{year:"numeric",month:"long"}); }

  function wireReader(p){
    $$("#reader [data-aid]").forEach(function(b){ b.addEventListener("click",function(){ toggleAid(p,b,b.getAttribute("data-aid")); }); });
    var lb=$("#listenBtn"); if(lb) lb.addEventListener("click",function(){ toggleListen(p,lb); });
    var sb=$("#shareBtn"); if(sb) sb.addEventListener("click",function(){ share(p,sb); });
    var cb=$("#copyBtn"); if(cb) cb.addEventListener("click",function(){ copyPoem(p,cb); });
  }
  function rstatus(msg,tone){ var s=$("#rStatus"); if(!s) return; s.textContent=msg||""; if(tone) s.setAttribute("data-tone",tone); else s.removeAttribute("data-tone"); }
  function setOn(b,on){ b.classList.toggle("is-on",on); b.setAttribute("aria-pressed",String(on)); }
  function eachLine(fn){ $$("#poemBody .line").forEach(function(el){ fn(el, +el.dataset.s, +el.dataset.l); }); }
  function strip(cls){ $$("#poemBody ."+cls).forEach(function(n){ n.remove(); }); }

  /* ---- reading aids: pronunciation + English meaning, appended per line ---- */
  function toggleAid(p, btn, kind){
    var on=btn.classList.contains("is-on");
    if(kind==="say"){ if(on){ setOn(btn,false); strip("aid-say"); } else { setOn(btn,true); showSay(p); } }
    else { if(on){ setOn(btn,false); strip("aid-mean"); } else { setOn(btn,true); showMeaning(p,btn); } }
  }
  function showSay(p){
    strip("aid-say");
    eachLine(function(el,s,l){
      var src=p.stanzas[s][l]; if(!src||!src.trim()) return;
      var manual=p.translit && p.translit[s] && p.translit[s][l];
      var span=document.createElement("span"); span.className="aid-say"; span.lang="en"; span.textContent=manual||T.line(src); el.appendChild(span);
    });
    rstatus("Each line in English letters, following the sound rather than the spelling.");
  }
  function showMeaning(p, btn){
    strip("aid-mean");
    var stored=p.translation && p.translation.en;
    if(stored){
      eachLine(function(el,s,l){ var t=stored[s]&&stored[s][l]; if(t){ var span=document.createElement("span"); span.className="aid-mean"; span.lang="en"; span.textContent=t; el.appendChild(span); } });
      rstatus("Translated within the family, aiming at the sense rather than the music.");
      return;
    }
    btn.disabled=true; rstatus("Translating…");
    machineTranslate(p).then(function(map){
      eachLine(function(el,s,l){ var t=map[s+":"+l]; if(t){ var span=document.createElement("span"); span.className="aid-mean"; span.lang="en"; span.textContent=t; el.appendChild(span); } });
      rstatus("Rough machine translation (MyMemory). Poetry resists it, so read it as a doorway, not the poem.");
    }).catch(function(err){
      setOn(btn,false); rstatus("Translation is unavailable just now. The free service caps how much it will do in a day."+(err&&err.message?" ("+err.message+")":""), "warn");
    }).then(function(){ btn.disabled=false; });
  }
  function machineTranslate(p){
    var jobs=[]; p.stanzas.forEach(function(st,s){ st.forEach(function(t,l){ if(t&&t.trim()) jobs.push({key:s+":"+l,text:t.trim()}); }); });
    var out={}, pair=p.lang+"|en";
    var email=(CFG.shareEmailWithTranslator&&CFG.contactEmail)?"&de="+encodeURIComponent(CFG.contactEmail):"";
    function step(i){ if(i>=jobs.length) return Promise.resolve(out); var job=jobs[i];
      return fetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(job.text.slice(0,480))+"&langpair="+pair+email)
        .then(function(r){return r.json();}).then(function(d){ var t=d&&d.responseData&&d.responseData.translatedText;
          if(t){ if(/MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(t)) throw new Error("daily limit reached"); out[job.key]=t; } return step(i+1); });
    }
    return step(0);
  }

  /* ---- recitation: her recording if present, else the device voice ---- */
  var speaking=false, keepAlive=null, audioEl=null;
  function setListenLabel(b,on){ b.innerHTML=on?(ICON.stop+"Stop"):(ICON.play+"Recite"); b.classList.toggle("reciting",on); setOn(b,on); }
  function toggleListen(p,b){
    if(speaking){ stopListening(b); return; }
    if(p.audio){
      audioEl=new Audio(p.audio);
      audioEl.addEventListener("ended",function(){ stopListening(b); });
      audioEl.addEventListener("error",function(){ rstatus("That recording wouldn't play, so using the device voice instead.","warn"); speakWithBrowser(p,b); });
      audioEl.play().then(function(){ speaking=true; setListenLabel(b,true); rstatus("In her own voice."); }).catch(function(){ speakWithBrowser(p,b); });
      return;
    }
    speakWithBrowser(p,b);
  }
  function stopListening(b){ speaking=false; if(b) setListenLabel(b,false); else { var lb=$("#listenBtn"); if(lb) setListenLabel(lb,false); }
    if(audioEl){ audioEl.pause(); audioEl=null; } if(window.speechSynthesis) speechSynthesis.cancel(); if(keepAlive){ clearInterval(keepAlive); keepAlive=null; } }
  function getVoices(){ return new Promise(function(resolve){ if(!window.speechSynthesis) return resolve([]); var v=speechSynthesis.getVoices(); if(v.length) return resolve(v);
    var settled=false; function done(){ if(settled)return; settled=true; clearInterval(poll); speechSynthesis.removeEventListener("voiceschanged",done); resolve(speechSynthesis.getVoices()); }
    speechSynthesis.addEventListener("voiceschanged",done); var poll=setInterval(function(){ if(speechSynthesis.getVoices().length) done(); },120); setTimeout(done,2500); }); }
  function pickVoice(voices,lang){ var want={bn:"bn",hi:"hi",en:"en"}[lang]||"en";
    var hits=voices.filter(function(v){ return v.lang.toLowerCase().replace("_","-").indexOf(want)===0; });
    if(!hits.length && lang==="en") return voices[0]||null; if(!hits.length) return null;
    var local=hits.filter(function(v){return v.localService;}); return local[0]||hits[0]; }
  function speakWithBrowser(p,b){
    if(!window.speechSynthesis){ rstatus("This browser can't read text aloud. Chrome on Android or Edge on Windows can.","warn"); return; }
    rstatus("Finding a voice…");
    getVoices().then(function(voices){
      var voice=pickVoice(voices,p.lang);
      if(!voice){ rstatus(noVoiceHelp(p.lang),"warn"); return; }
      var chunks=flatLines(p.stanzas).filter(function(l){return l&&l.trim();});
      var rate=$("#rate"); var rv=rate?parseFloat(rate.value):0.86;
      speechSynthesis.cancel(); speaking=true; setListenLabel(b,true);
      rstatus("Read by the "+voice.name+" voice on this device.");
      chunks.forEach(function(text,i){ var u=new SpeechSynthesisUtterance(text); u.voice=voice; u.lang=voice.lang; u.rate=rv;
        if(i===chunks.length-1) u.onend=function(){ stopListening(b); }; u.onerror=function(){ stopListening(b); }; speechSynthesis.speak(u); });
      if(keepAlive) clearInterval(keepAlive);
      keepAlive=setInterval(function(){ if(!speaking){ clearInterval(keepAlive); keepAlive=null; return; }
        if(speechSynthesis.speaking && !speechSynthesis.paused){ speechSynthesis.pause(); speechSynthesis.resume(); } },9000);
    });
  }
  function noVoiceHelp(lang){ if(lang==="bn") return "No Bangla voice is installed here. Chrome on Android usually has one; on Windows add Bengali under Settings › Time & language. Apple devices have no Bangla voice yet, so try the Transliteration view.";
    return "No "+langName(lang)+" voice is installed here. Adding the language in your system settings usually adds its voice too."; }

  /* ------------------------------------------------------------- share / copy */
  function poemLink(p){ return location.origin+location.pathname+"#/poem/"+p.slug; }
  function share(p,btn){ var url=poemLink(p); var data={title:p.title,text:'"'+p.title+'", a poem by '+(CFG.poetName||"the poet"),url:url};
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
    var out="";
    if(mail) out+='<a class="btn btn--hero" href="'+mailHref+'">'+mailIcon+'Email</a>';
    if(fb)   out+='<a class="btn btn--hero" href="'+esc(fbLink(fb))+'" target="_blank" rel="noopener">'+fbIcon+'Facebook</a>';
    // Also print the address and link as readable text, so people can see (and copy) them
    // without having to click a button.
    var lines="";
    if(mail) lines+='<p class="contact-line"><a href="'+mailHref+'">'+esc(mail)+'</a></p>';
    if(fb)   lines+='<p class="contact-line"><a href="'+esc(fbLink(fb))+'" target="_blank" rel="noopener">'+esc(fbShow(fb))+'</a></p>';
    area.innerHTML = (out||lines)
      ? (out?'<div class="contact-actions">'+out+'</div>':'') + (lines?'<div class="contact-details">'+lines+'</div>':'')
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

    document.addEventListener("click", function(e){
      var t=e.target;
      var card=t.closest && t.closest("[data-slug]");
      if(card){ openPoem(card.getAttribute("data-slug")); return; }
      if(t.closest && t.closest("[data-close]")){ userClose(); return; }
      var nav=t.closest && t.closest(".site-nav a, .brand");
      if(nav){ if(!reader.hidden) hideReader(); return; } // let the anchor scroll
      var lc=t.closest && t.closest("[data-lang]");
      if(lc){ STATE.lang=lc.getAttribute("data-lang"); syncChips("#langChips","data-lang",STATE.lang); renderGrid(); return; }
      var tc=t.closest && t.closest("[data-tag]");
      if(tc){ STATE.theme=tc.getAttribute("data-tag"); syncChips("#themeChips","data-tag",STATE.theme); renderGrid(); return; }
    });

    $("#search").addEventListener("input", debounce(function(e){ STATE.q=e.target.value; renderGrid(); },180));
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
