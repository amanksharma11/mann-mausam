# Mann Mausam — poems by Mousumee Ghosh

A warm, retro-modern, Bengal-inspired website for **Mousumee Ghosh's** poems in
**Bangla, Hindi and English**. Readers can see each poem, reveal a **romanised
pronunciation (transliteration)** and an **English meaning** *beneath every line*,
hear it **recited** (her own mp3 recording if there is one, otherwise the device
voice), switch between a **daytime and a lamplit night theme** with the pull-chain,
and **contact** her. New poems are added by typing into a **Google Sheet** — the
code never changes.

Everything runs at **zero cost**, with **no paid APIs, no keys, and no build step**
— plain HTML, CSS and JavaScript served straight from GitHub Pages.

---

## The files

| File | What it is |
|------|------------|
| `index.html` | Page structure. |
| `styles.css` | All the design (retro palette, newsprint texture, dark mode, responsive). |
| `app.js` | Behaviour (load poems, filter, reader, recite, translate, theme, pull-chain). |
| `translit.js` | Hand-written Bangla/Hindi → English-letters pronunciation engine. |
| `config.js` | **The only code file you edit.** Name, bio, contact, sheet ID, feature switches. |
| `favicon.svg` | The lotus stamp used as icon + logo. |
| `sheet-template.csv` | Import into Google Sheets to start the poem sheet with the right columns. |
| `content/poems.csv` | The committed **fallback** copy of the poems (used if the live sheet can't be reached). |
| `images/` | The About photo and any poem images. |
| `audio/` | Optional mp3 recitations (referenced from the sheet's `audio` column). |
| `.nojekyll` | Keep this — it stops GitHub Pages from mangling the site. |

---

## 1. Preview it locally

From inside the site folder:

```bash
python -m http.server 8123
```

Open <http://localhost:8123>. (Open it through the server, **not** by double-clicking
`index.html` — a `file://` page can't load the poems.) It shows the sample poems until
you connect the sheet.

---

## 2. Add poems with Google Sheets (no code)

1. Create a Google Sheet, then **File → Import → Upload → `sheet-template.csv` →
   Replace current sheet**. That gives you the exact columns (and example poems).
2. Rename the tab to **`Poems`** (or change `googleSheetTab` in `config.js`).
3. **Share → General access → Anyone with the link → Viewer.**
4. Copy the **Sheet ID** (the long code in the URL between `/d/` and `/edit`) into
   `googleSheetId` in `config.js`.

Refresh — her poems appear. **Add a poem = add a row.** Edits show within a few minutes
(Google caches the export).

### The columns

Order doesn't matter — the importer reads by header name.

| Column | Required | Notes |
|--------|----------|-------|
| `slug_link` | recommended | Short code for the share link (`birohi-shrabon`). Made from the title if blank. **Never change a slug once it's been shared.** |
| `title` | ✅ | In the poem's own script. |
| `title_roman` | optional | Romanised title (`Birohi Shrabon`). Auto-generated if blank. |
| `title_english` | optional | English title (`The Lovelorn Monsoon`). |
| `language` | ✅ | `bn`, `hi`, or `en` (also accepts Bangla / Hindi / English). Sets the font, corner motif and reading aids. |
| `date` | recommended | `YYYY-MM-DD`. Newest sorts first, and drives "Poem of the day". Undated poems sink to the end. |
| `show_on_website` | ✅ | `yes` to publish the poem. Anything else — blank, `no`, a draft note — hides it. |
| `poem_text` | ✅ | The poem. **Alt+Enter** for line breaks; leave a blank line between stanzas. |
| `translation_english` | optional | Her own English translation, shaped like the poem (same lines). Falls back to a rough machine translation when blank. |
| `transliteration` | optional | Hand-corrected romanisation, shaped like the poem. Overrides the automatic engine line-by-line. |
| `tags` | optional | Comma-separated themes — become the filter chips. |
| `audio` | optional | Path/URL to an **mp3 recitation** (e.g. `audio/birohi-shrabon.mp3`). If present, "Recite" plays it instead of the device voice. |
| `image` | optional | Image URL/path to show with the poem. |
| `note` | optional | A poet's / translator's note. |

> **Pronunciation & meaning default to automatic, and defer to her.** If
> `transliteration` is empty, `translit.js` romanises each line; if you fill it in,
> yours wins. Likewise `translation_english`: filled = shown, blank = a labelled rough
> machine translation.

### Where the poems come from (and the safety net)

The site loads poems in this order, so it always has something to show:

1. **The live Google Sheet** (if `googleSheetId` is set).
2. **`content/poems.csv`** — the last-saved copy committed in this repo. Used if the
   sheet is ever unreachable. To refresh it, download the sheet
   (**File → Download → CSV**) and replace this file.
3. **Built-in sample poems** — only if neither of the above is available.

> **Privacy:** a link-shared sheet is publicly readable, and its CSV includes even
> `show_on_website = no` rows. Keep unfinished drafts in a *separate* tab (not `Poems`),
> or keep the sheet fully private and run the site from `content/poems.csv` alone
> (leave `googleSheetId` blank).

### Recordings (mp3)

Drop an mp3 into `audio/` (or host it anywhere) and put its path in the `audio`
column. "Recite" then plays **her own voice**; poems without a recording fall back to
the device's built-in voice.

---

## 3. Put it online for free (GitHub Pages)

1. Publish this folder as a **public** GitHub repo (GitHub Desktop: *Add local
   repository → Commit → Publish*). Keep `.nojekyll` in the repo — don't use GitHub's
   drag-and-drop web uploader, which silently drops dotfiles.
2. On GitHub: **Settings → Pages → Deploy from a branch → `main` / root.**
3. Live at `https://YOUR-USERNAME.github.io/REPO/`. Updating poems happens in the sheet
   — no redeploy. Design changes: commit and push, and Pages rebuilds in a minute.

---

## 4. Contact

The **Email** button uses `contactEmail` (a plain `mailto:`, nothing to set up), and
the **Facebook** button uses `facebook` in `config.js`. Both are also shown as plain,
readable text under the buttons so people can see them without clicking. Leave a field
blank to hide its button.

---

## 5. Feature switches (`config.js` → `features`)

| Switch | Does | Cost |
|--------|------|------|
| `recitation` | Plays her mp3 recording if provided, else the device's built-in voice. | Free |
| `autoTranslate` | Rough MyMemory translation for a poem that has no human one in the sheet. | Free |

---

## 6. Make it yours (`config.js`)

- **Name, site name, bio, contact email, Facebook link, photo** → `config.js`
  (`aboutPhoto` shows her photo in the framed slot — a portrait around 4:5 works best).
- **Colours / fonts** → the tokens at the top of `styles.css`
  (`:root` = day, `:root[data-theme="dark"]` = night).

🪔
