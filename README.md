# Arccos Round Viewer

Simple Vite + React + TypeScript web app to explore local Arccos-exported round JSON files with a geospatial shot map and round statistics.

## Features

- Round list with search & quick stats.
- Round detail view:
  - Aggregate stats (GIR, fairways, putts, approach distance, up & down, scoring average).
  - Interactive Leaflet map: each hole rendered as a colored polyline with shot markers.
  - Focus mode: click a hole (or legend chip) to isolate it; toggle to show all holes again.
  - Scorecard table with per-hole metrics and timing.
- Local JSON ingestion via Vite `import.meta.glob` (no backend needed).

## Data Assumptions & Notes

- Data exported using [skhavari/arccos-export](https://github.com/skhavari/arccos-export).
- `data/rounds.json` supplies round summaries (contains par & over/under used for score if needed).
- Each `data/round_<id>.json` contains hole + shot detail. Hole par values are not present; heuristics approximate fairway opportunities (skips likely par 3s when computing fairways-hit percentage).
- Approach shot distance uses hole `approachShotId` when available.

## Getting Started

Install deps and start dev server:

```bash
npm install
npm run dev
```

Navigate to the printed local URL (default http://localhost:5173). The existing `data/` directory is consumed directly; ensure it remains at repo root.

## Build

```bash
npm run build
npm run preview
```

## License

Internal / personal project sample – adapt freely.
