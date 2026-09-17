/* =============================================================================
   CONFIG.js  -  Edit this file to make the site yours.
   Day-to-day you never touch code: POEMS live in your Google Sheet (see README).
   ============================================================================= */

window.SITE_CONFIG = {

  /* ---- Identity ---------------------------------------------------------- */
  siteName:        "Mann Mausam",            // the website's name (English/Latin)
  siteNameHindi:   "मन मौसम",                 // Hindi form, shown under the title
  siteNameBangla:  "মন মৌসম",                 // Bangla form, shown BIG as the main hero title
  poetName:        "Mousumee Ghosh",         // the poet
  poetNameBangla:  "মৌসুমী ঘোষ",              // her name in Bangla
  siteTagline:     "As the seasons turn, so do her verses: through monsoon and memory, lamplight and longing. In Bangla, Hindi and English, Mousumee Ghosh writes the changing weather of the heart, and gathers it here for you to read, to hear, and to carry with you.",

  // The eyebrow line above the title cycles through these, in order.
  // Edit the wording freely; keep the "lang" so each shows in the right typeface.
  byline: [
    { lang:"en", text:"Poems by Mousumee Ghosh" },
    { lang:"bn", text:"মৌসুমী ঘোষের কবিতা" },
    { lang:"hi", text:"मौसुमी घोष की कविताएँ" }
  ],

  /* ---- About / bio (shown in the About section) -------------------------- */
  aboutHeading:    "About the Poet",
  // A few short paragraphs (each becomes its own <p>). Edit freely.
  aboutText: [
    "Born in Bengal and raised in Ranchi, Mousumee Ghosh has carried a poet's eye the length and breadth of India, and home again.",
    "She has written for most of her life, in Bangla, Hindi and English, following the sound of rain, the weight of memory, and the small wonders of an ordinary day.",
    "A teacher by calling, she runs a school in Ranchi, where she lives today. Mann Mausam (a play on her name, and on the Hindi mausam, 'season') gathers her poems in one place, to be read, heard and shared."
  ],
  aboutPhoto:      "images/mousumee_ghosh_aboutme_pic.jpeg",   // paste an image URL to show her photo; leave "" for a framed placeholder
  aboutPhotoCaption: "Mousumee Ghosh",

  /* ---- Contact ----------------------------------------------------------- */
  contactEmail:    "mousumee2009@gmail.com",                  // shown on the Email button + used for mailto
  facebook:        "https://facebook.com/mousumee.ghosh",     // shown on the Social button + its link (optional)

  /* ---- Google Sheet (your no-code content manager) ----------------------- */
  // Share the sheet "Anyone with the link -> Viewer", then paste its ID here.
  // (The ID is the long code in the URL between /d/ and /edit.)
  // Until set, the site shows the bundled sample poems.
  googleSheetId:   "1m4UB-lK0lIMyB7jqsJCn_adAMAyEC5UeTBb04EcTOfE",
  googleSheetTab:  "Poems",
  // The Poems tab's gid (the "gid=..." number in the sheet URL when that tab is open).
  // With it set, the site reads the sheet via Google's CSV export, which returns exactly what
  // each cell displays -- so a date (or anything) typed as text still shows, instead of being
  // dropped the way the older endpoint drops cells that don't match a column's guessed type.
  googleSheetGid:  "490640914",

  /* ---- Feature switches -------------------------------------------------- */
  features: {
    recitation:    true,   // read poems aloud (mp3 recording if provided, else device voice)
    autoTranslate: true,   // rough MyMemory translation when no human one is in the sheet
  },

  shareEmailWithTranslator: false,  // send contact email to MyMemory to raise the free limit
};
