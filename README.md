# Leonida Ledger — GTA 6 Trophy Guide & Tracker

[![make.fun](https://img.shields.io/badge/make.fun-gta6--trophy--guide--01-orange)](https://make.fun/c/gta6-trophy-guide-01/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Offline](https://img.shields.io/badge/offline-static%20files-brightgreen.svg)](app/index.html)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden on PlayStation until earned.

## What it does

- **Checklist tracker** — every trophy with its official name, description and grade; tick it off and your progress is saved in the browser (localStorage), with export to `.json` and import back.
- **Filters** — by kind (story, missable, collectibles, activities, world & combat, online), by grade, by earned / still to earn, plus full-text search. The official list has no online trophy, so that filter honestly shows zero.
- **Spoiler setting** — hides the names and descriptions of hidden story trophies until you earn them (or switch it off).
- **Roadmap to the platinum** — five stages built from the official descriptions: story and missables first, then activities, then collectibles, then clean-up.
- **Missables flagged** — 22 trophies tied to a named mission, a stranger strand or a one-shot moment, each with what to do and how to replay it.
- **A guide for every trophy, in our own words**, each with a tip and its sources: the official list on Exophase and PSNProfiles for names, descriptions, grades and PSN counts, and honest notes where a description does not pin down a place or trigger.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network: every file the app loads lives under `app/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Layout

- `app/index.html` — the guide shell (checklist, roadmap, missables, about)
- `app/css/style.css` — the paper-and-coral look, our own design
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, hidden flag, kind, missable flag, PSN count, stage, guide, tip, sources
- `app/data/roadmap.json` — the five roadmap stages
- `app/js/main.js` — boot and wiring; `app/js/views.js` — rendering; `app/js/filters.js` — kinds, search and the spoiler rule; `app/js/store.js` — saved progress, export and import
- `screenshots/` — real renders of the app in a browser (the first by name is the cover)
- `vendor/makefun-frontend.ts` — the kit's library, unchanged

## Sources

Official trophy names, descriptions, grades and hidden flags as PlayStation publishes them, via [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). Guides are original writing for this entry. No Rockstar Games logo, artwork or game screenshots are used. GTA 6 and Grand Theft Auto are trademarks of Rockstar Games; this is an unofficial fan guide.

## License

MIT — see [LICENSE](LICENSE).
