# Carbon Logica theme for Wiki.js 2.5 (fork notes)

This fork of `requarks/wiki` at v2.5.314 carries the Carbon Logica staff wiki theme. It is
built into a custom image (`.github/workflows/cl-build.yml`) and pinned in the deployment repo
`cl-wiki-deploy`. Upstream is untouched apart from the files listed here; rebasing on a newer
2.5.x tag means re-applying these files.

Design source: the design canvas "Carbon Logica Wiki Theme" and
`carbon-logica-design-system` (`DESIGN.md`, `src/styles/tokens.css`). Every colour, size and
radius below comes from there.

## Where the theme lives

| Layer | File | What it does |
| --- | --- | --- |
| Tokens (SCSS vars) | `client/scss/base/cl-vars.scss` | `$cl-navy`, `$cl-green`, … injected into EVERY `.scss` and `<style lang="scss">` block via `global.scss`. |
| Tokens (CSS vars) | `client/scss/base/cl-theme.scss` | `--cl-page`, `--cl-surface`, `--cl-border`, `--cl-text`, `--cl-heading`, `--cl-muted`, `--cl-link`, `--cl-accent`, `--cl-accent-deep`, `--cl-accent-pale`, `--cl-navy`, `--cl-good/-bg`, `--cl-info/-bg`, `--cl-warn/-bg`, `--cl-serious/-bg`, `--cl-critical/-bg`, `--cl-shadow-sm/md/lg`, `--cl-table-head`, `--cl-table-head-text`. Set on `.v-application`, re-set on `.v-application.theme--dark`. Use these for anything that must flip with dark mode. |
| Global component restyle | `client/scss/base/cl-theme.scss` | Arial, buttons, inputs, cards, menus, dialogs, chips, alerts, tabs, data tables, footer, and a safety net mapping leftover Material colour classes (`.blue`, `.indigo`, `.teal--text`, …) onto the brand. |
| Vuetify palette | `client/client-app.js` | light: primary navy `#233142`, secondary/success deep green `#1E7B34`, accent green `#8BC926`, error `#B4322B`, info `#2C5C86`, warning `#B58200`. dark: primary/accent green `#8BC926`, error `#F4837B`, info `#8EC1F0`, warning `#F2C94C`. |
| Light/dark resolution | `client/helpers/appearance.js` | `resolveDarkMode(store)`, `setOverride('light'|'dark')`, `clearOverride()`, `hasOverride()`. Precedence: browser toggle (localStorage `cl-appearance`) > profile appearance (JWT `ap`) > site default. |
| Brand assets | `client/static/img/cl/` | `carbon-logica-logo.png` (navy wordmark, light backgrounds), `carbon-logica-logo-reversed.png` (white wordmark, navy), `cl-leaf.png` (square mark). Served at `/_assets/img/cl/<file>`. |
| Top bar | `client/components/common/nav-header.vue` | Navy bar, reversed wordmark, search, New page, theme toggle, account. |
| Reader theme | `client/themes/default/` | `components/page.vue`, `nav-sidebar.vue`, `nav-footer.vue`, `scss/app.scss` (content typography, tables, callouts, comments, print). |
| Other views | `client/components/login.vue`, `admin.vue`, `editor.vue`, `profile/*.vue`, `history.vue`, `tags.vue`, `source.vue`, `not-found.vue`, `unauthorized.vue`, `comments.vue`, `common/search-results.vue` | Page-level layout and colours. |

## Design rules (apply everywhere)

- Type: Arial stack, body 16 px / 1.55 ink `#2B3440`; h1 28/700 navy (-0.02em); h2 22/700 DEEP GREEN
  `#1E7B34`; h3 18/700 navy; h4 16/700 navy; small 14; caption 12 muted `#747A82`; caps label
  12/700 uppercase 0.06em deep green (Vuetify `.overline` is restyled to this). Mono
  `"Cascadia Mono", Consolas, "Courier New", monospace`.
- Colour roles: navy for the top bar, table headers, headings and one dark block per page; bright
  green `#8BC926` only as an accent (primary button fill with NAVY text, the 2 px rule under the top
  bar, TOC active rail, focus ring); deep green for links, H2, captions and small text.
  Page background wash `#F4F7FA`, surfaces white, borders `#D5DCE4` (controls `#B9C4D0`).
- Dark mode: page `#1A232E`, surfaces navy `#233142`, raised `#263646`, sunken `#2C3A4B`,
  borders `#37475A` / `#4A5C72`, text `#E3E9EF`, headings white, muted `#B3C0CD`, bright green
  replaces deep green for links/H2/labels, status colours lifted (`--cl-*` vars already flip).
- Radii: 2 px chips and small inputs, 4 px buttons/inputs, 8 px cards/dialogs, pill status chips.
  Shadows navy-tinted and light (`--cl-shadow-sm` on cards). Borders 1 px.
- Buttons: sentence case (no uppercase), weight 600. Primary = green with navy text. Secondary =
  outlined `#B9C4D0` with navy text. Ghost = text button, deep green. Danger = `#B4322B` white text.
  Height 32 px small, 36 px default in bars, 42 px medium.
- Callouts / alerts: 1 px border in the status colour, 8 px radius, status tint background,
  20 px icon in the status colour, bold lead word. No thick left stripe.
- Tables in content: navy header with white bold text, 1 px `#D5DCE4` borders, zebra `#F4F7FA`,
  numeric columns right-aligned. Admin/data tables: wash header, 12 px uppercase 0.04em navy.
- Tag chips: 24 px, 2 px radius, pale green fill, deep green 600 text, 1 px `#D5DCE4` border.
- Status pills: `padding 2px 8px`, pill radius, 12/600, 8 px dot in the status colour.
- Icons stay MDI (`mdi-*`), coloured with the brand (never indigo/teal/blue-grey): use
  `color='primary'`, `color='accent'`, or inherit from text.
- No gradients, no photos on the sign-in page, no emoji.

## Conventions

- Templates are Pug (`<template lang='pug'>`), styles `<style lang='scss'>`; `$cl-*` variables and
  `mc()` are available in every style block without importing. Prefer `var(--cl-*)` for anything
  that must change in dark mode; `$cl-*` for constants (green, navy).
- Vuetify colour classes (`primary`, `accent`, `error`, …) resolve to the palette above. Do not
  add new Material classes (`indigo`, `teal`, `blue-grey`); replace the ones you touch.
- Keep `page.vue`'s `props` and `created()` intact (Wiki.js requirement). Keep every `$t()` key,
  every `ref`, every event handler and every `v-if` permission check. Change looks, not behaviour.
- ESLint `standard` style (no semicolons, 2-space indent, single quotes). Pug indentation is
  2 spaces; a misindented Pug line breaks the whole component at build time, so re-read your edit.
- There is no local build in this environment; the image is built by GitHub Actions. Double-check
  Pug and SCSS syntax by eye, and keep changes reviewable.
