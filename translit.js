/* ============================================================
   translit.js - approximate romanisation for Bangla + Hindi
   ------------------------------------------------------------
   Runs entirely in the browser. No library, no network, no key.

   This is a PRONUNCIATION aid, not a scholarly transliteration.
   It follows how a line is spoken rather than how it is spelled:
   Bangla's inherent vowel is "o" (mon), a final inherent vowel is
   dropped (ghor), Bangla jo-phola is silent (sondha); Hindi drops
   its medial schwa (lautna).

   To correct any line by hand, fill the "translit" column of that
   poem's row, shaped exactly like the "poem" column (same lines).

   The \u escapes are deliberate: Bengali/Devanagari nukta letters
   are Unicode composition-exclusions, so literal characters + NFC
   will NOT reunite them. Keep the escapes and the NUKTA_PAIRS table.
   ============================================================ */

(function (global) {
  "use strict";

  var BN = {
    virama: "্",
    inherent: "o",
    deleteMedialSchwa: false,
    silentAfterVirama: "যব",   // jo-phola, bo-phola
    cons: {
      "ক": "k",  "খ": "kh", "গ": "g",  "ঘ": "gh", "ঙ": "ng",
      "চ": "ch", "ছ": "chh","জ": "j",  "ঝ": "jh", "ঞ": "n",
      "ট": "t",  "ঠ": "th", "ড": "d",  "ঢ": "dh", "ণ": "n",
      "ত": "t",  "থ": "th", "দ": "d",  "ধ": "dh", "ন": "n",
      "প": "p",  "ফ": "ph", "ব": "b",  "ভ": "bh", "ম": "m",
      "য": "j",  "র": "r",  "ল": "l",
      "শ": "sh", "ষ": "sh", "স": "s",  "হ": "h",
      "ড়": "r",  "ঢ়": "rh", "য়": "y",  "ৎ": "t"
    },
    vowels: {
      "অ": "o",  "আ": "a",  "ই": "i",  "ঈ": "i",
      "উ": "u",  "ঊ": "u",  "ঋ": "ri",
      "এ": "e",  "ঐ": "oi", "ও": "o",  "ঔ": "ou"
    },
    matra: {
      "া": "a",  "ি": "i",  "ী": "i",  "ু": "u",
      "ূ": "u",  "ৃ": "ri", "ে": "e",  "ৈ": "oi",
      "ো": "o",  "ৌ": "ou"
    },
    signs: { "ং": "ng", "ঃ": "h", "ঁ": "n" }
  };

  var HI = {
    virama: "्",
    inherent: "a",
    deleteMedialSchwa: true,
    silentAfterVirama: "",
    cons: {
      "क": "k",  "ख": "kh", "ग": "g",  "घ": "gh", "ङ": "ng",
      "च": "ch", "छ": "chh","ज": "j",  "झ": "jh", "ञ": "n",
      "ट": "t",  "ठ": "th", "ड": "d",  "ढ": "dh", "ण": "n",
      "त": "t",  "थ": "th", "द": "d",  "ध": "dh", "न": "n",
      "प": "p",  "फ": "ph", "ब": "b",  "भ": "bh", "म": "m",
      "य": "y",  "र": "r",  "ल": "l",  "ळ": "l",  "व": "v",
      "श": "sh", "ष": "sh", "स": "s",  "ह": "h",
      "क़": "q",  "ख़": "kh", "ग़": "g",  "ज़": "z",
      "ड़": "r",  "ढ़": "rh", "फ़": "f",  "य़": "y"
    },
    vowels: {
      "अ": "a",  "आ": "a",  "इ": "i",  "ई": "i",
      "उ": "u",  "ऊ": "u",  "ऋ": "ri",
      "ए": "e",  "ऐ": "ai", "ओ": "o",  "औ": "au"
    },
    matra: {
      "ा": "a",  "ि": "i",  "ी": "i",  "ु": "u",
      "ू": "u",  "ृ": "ri", "े": "e",  "ै": "ai",
      "ो": "o",  "ौ": "au"
    },
    signs: { "ं": "n", "ः": "h", "ँ": "n" }
  };

  /* Guarantee the precomposed nukta consonants are present as keys,
     no matter how the literal glyphs above were saved to disk. */
  (function ensureNukta() {
    var C = String.fromCharCode;
    BN.cons[C(0x09DC)] = "r"; BN.cons[C(0x09DD)] = "rh"; BN.cons[C(0x09DF)] = "y";
    HI.cons[C(0x0958)] = "q";  HI.cons[C(0x0959)] = "kh"; HI.cons[C(0x095A)] = "g";
    HI.cons[C(0x095B)] = "z";  HI.cons[C(0x095C)] = "r";  HI.cons[C(0x095D)] = "rh";
    HI.cons[C(0x095E)] = "f";  HI.cons[C(0x095F)] = "y";
  })();

  var DIGITS = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
    "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
    "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"
  };

  /* Compose the decomposed nukta sequences by hand, then drop any
     leftover nukta. NFC will not do this for the exclusion set. */
  var NUKTA_PAIRS = [
    ["ড়", "ড়"], ["ঢ়", "ঢ়"], ["য়", "য়"],
    ["क़", "क़"], ["ख़", "ख़"], ["ग़", "ग़"],
    ["ज़", "ज़"], ["ड़", "ड़"], ["ढ़", "ढ़"],
    ["फ़", "फ़"], ["य़", "य़"]
  ];
  var LEFTOVER_NUKTA = /[়़]/g;

  /* Built from code points so the source stays pure ASCII and cannot be
     mangled by an editor normalising the literal nukta glyphs. */
  function composeNukta(s) {
    var C = String.fromCharCode;
    var pairs = [
      [0x09A1, 0x09DC], [0x09A2, 0x09DD], [0x09AF, 0x09DF],
      [0x0915, 0x0958], [0x0916, 0x0959], [0x0917, 0x095A],
      [0x091C, 0x095B], [0x0921, 0x095C], [0x0922, 0x095D],
      [0x092B, 0x095E], [0x092F, 0x095F]
    ];
    var bnNukta = C(0x09BC), hiNukta = C(0x093C);
    for (var i = 0; i < pairs.length; i++) {
      var nukta = pairs[i][0] >= 0x0980 ? bnNukta : hiNukta;
      s = s.split(C(pairs[i][0]) + nukta).join(C(pairs[i][1]));
    }
    return s.replace(new RegExp("[" + bnNukta + hiNukta + "]", "g"), "");
  }

  function scriptOf(ch) {
    var c = ch.charCodeAt(0);
    if (c >= 0x0980 && c <= 0x09FF) return BN;
    if (c >= 0x0900 && c <= 0x097F) return HI;
    return null;
  }

  function isIndic(ch) { return scriptOf(ch) !== null; }

  function parse(src, S) {
    var units = [];
    var i = 0, n = src.length;

    while (i < n) {
      var ch = src[i];

      if (DIGITS[ch]) { units.push({ raw: DIGITS[ch] }); i++; continue; }

      if (S.vowels[ch]) {
        var v = { raw: S.vowels[ch] };
        i++;
        while (i < n && S.signs[src[i]]) { v.raw += S.signs[src[i]]; i++; }
        units.push(v);
        continue;
      }
      if (S.matra[ch]) { units.push({ raw: S.matra[ch] }); i++; continue; }
      if (S.signs[ch]) { units.push({ raw: S.signs[ch] }); i++; continue; }
      if (ch === S.virama) { i++; continue; }

      var base = S.cons[ch];
      if (!base) { i++; continue; }

      var unit = { cons: base, vowel: null, explicit: false, tail: "", initial: units.length === 0 };
      i++;

      var next = i < n ? src[i] : "";

      if (next === S.virama) {
        var after = i + 1 < n ? src[i + 1] : "";
        if (after && S.silentAfterVirama.indexOf(after) >= 0) {
          i += 2;
          var m = i < n ? src[i] : "";
          if (S.matra[m]) { unit.vowel = S.matra[m]; unit.explicit = true; i++; }
          else if (i < n) { unit.vowel = S.inherent; }
          while (i < n && S.signs[src[i]]) { unit.tail += S.signs[src[i]]; i++; }
        } else {
          i++;
        }
        units.push(unit);
        continue;
      }

      if (S.matra[next]) {
        unit.vowel = S.matra[next];
        unit.explicit = true;
        i++;
        while (i < n && S.signs[src[i]]) { unit.tail += S.signs[src[i]]; i++; }
        units.push(unit);
        continue;
      }

      if (S.signs[next]) {
        unit.vowel = S.inherent;
        while (i < n && S.signs[src[i]]) { unit.tail += S.signs[src[i]]; i++; }
        units.push(unit);
        continue;
      }

      if (i < n) unit.vowel = S.inherent;
      units.push(unit);
    }

    return units;
  }

  function deleteSchwa(units, S) {
    for (var i = 0; i < units.length; i++) {
      var u = units[i];
      if (!u.cons || u.explicit || u.initial || u.vowel !== S.inherent) continue;
      var next = null;
      for (var j = i + 1; j < units.length; j++) {
        if (units[j].cons) { next = units[j]; break; }
      }
      if (next && next.explicit) u.vowel = null;
    }
  }

  function render(units) {
    var out = "";
    units.forEach(function (u) {
      if (u.raw !== undefined) { out += u.raw; return; }
      out += u.cons + (u.vowel || "") + (u.tail || "");
    });
    return out.replace(/([aeiou])\1{2,}/g, "$1$1");
  }

  function word(src, S) {
    var units = parse(src, S);
    if (S.deleteMedialSchwa) deleteSchwa(units, S);
    return render(units);
  }

  function line(text) {
    if (!text) return "";
    var src = composeNukta(String(text).normalize("NFC")).replace(LEFTOVER_NUKTA, "");
    var out = "", buf = "", S = null;

    function flush() {
      if (buf) { out += word(buf, S || BN); buf = ""; }
    }

    for (var i = 0; i < src.length; i++) {
      var ch = src[i];
      if (isIndic(ch)) {
        var s = scriptOf(ch);
        if (S && s !== S) flush();
        S = s;
        buf += ch;
      } else {
        flush();
        if (ch === "।" || ch === "॥") out += ".";
        else out += ch;
      }
    }
    flush();
    return out.replace(/[ \t]+/g, " ").trim();
  }

  global.Translit = {
    line: line,
    supports: function (lang) { return /^(bn|hi|sa|mr|ne)/.test(String(lang || "")); }
  };

})(window);
