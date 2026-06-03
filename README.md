# drillbit index

a sveltekit site for browsing the community-maintained drillbit item spreadsheet in a cleaner, easier-to-navigate format.

the app currently includes:

- a hero / landing page
- a grouped item index
- per-item detail pages with variant switching
- a builder work-in-progress page
- a custom 404 page
- light and dark themes

## data source

the catalog is loaded from this public google sheet:

[drillbit index spreadsheet](https://docs.google.com/spreadsheets/d/1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU/edit?gid=0#gid=0)

the app reads these tabs:

- `droppers`
- `upgraders`
- `furnaces`

data loading lives in [src/lib/server/sheets.ts](C:\Users\ivads\Documents\GAME-PROJECTS\RBX-PROJECTS\db-index\src\lib\server\sheets.ts).

notes about parsing:

- the app uses the sheet csv export, not the `gviz` json endpoint
- this is intentional so mixed values like `15.62/15.63` are preserved exactly
- blank cells are treated as `N/A`
- exact sheet text like `N/A` is preserved as-is
- item variants are grouped into one entry per item in the main index

## routes

- `/`  
  hero page for the drillbit index

- `/index`  
  grouped catalog with category tabs, search, and sorting

- `/index/[category]/[slug]`  
  expanded item page with variant switching for base, shiny, mythic, and shiny mythic when available

- `/builder`  
  placeholder page for future builder functionality

## tech stack

- `sveltekit`
- `svelte 5`
- `typescript`
- `vite`
- `@lucide/svelte`

## development

install dependencies:

```sh
npm install
```

start the dev server:

```sh
npm run dev
```

run type and svelte checks:

```sh
npm run check
```

build for production:

```sh
npm run build
```

preview the production build locally:

```sh
npm run preview
```

## project structure

```text
src/
  lib/
    components/
      CatalogSummaryCard.svelte
      StatusPage.svelte
      ThemeToggle.svelte
    server/
      sheets.ts
    types.ts
  routes/
    +layout.svelte
    +error.svelte
    +page.svelte
    builder/+page.svelte
    index/+page.server.ts
    index/+page.svelte
    index/[category]/[slug]/+page.svelte
  app.css
```

## ui behavior

- the background is shared across all pages
- the dotted backdrop reacts to cursor position
- the main index only shows one card per item
- variant-specific stats are shown on the detail page
- sorting supports name and rarity, plus category grouping on the `all` tab
- the builder button exists visually, but the builder itself is not implemented yet

## maintenance notes

if the spreadsheet changes shape, check these areas first:

- column names in [src/lib/server/sheets.ts](C:\Users\ivads\Documents\GAME-PROJECTS\RBX-PROJECTS\db-index\src\lib\server\sheets.ts)
- shared item types in [src/lib/types.ts](C:\Users\ivads\Documents\GAME-PROJECTS\RBX-PROJECTS\db-index\src\lib\types.ts)
- index page rendering in [src/routes/index/+page.svelte](C:\Users\ivads\Documents\GAME-PROJECTS\RBX-PROJECTS\db-index\src\routes\index\+page.svelte)
- item detail rendering in [src/routes/index/[category]/[slug]/+page.svelte](C:\Users\ivads\Documents\GAME-PROJECTS\RBX-PROJECTS\db-index\src\routes\index\[category]\[slug]\+page.svelte)

## status

this project is actively being shaped around the spreadsheet and current site needs, so expect the schema, views, and builder page to keep evolving.

# contributions
contributions are welcome! if you'd like to contribute, simply send a pr and i'll take a look at it.

# ai
this project makes heavy use of ai to speed up development.
