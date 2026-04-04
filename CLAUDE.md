# CLAUDE.md — Influenza Visualization

WHO FluNet (2009–2024) spiral-timeline dashboard for 6 countries.

**Live demo**: https://neu-blush.vercel.app/

## How It Works

The app is a **single jQuery `$(document).ready(...)` block** in `js/script.js` (~2100 lines). There is no build step, no module system, no npm. Scripts load via `<script>` tags in `index.html`:

```
lib/jquery-3.7.1.min.js → lib/gmynd.js → data/influenza_six.js → js/script.js
```

`influenza_six.js` exposes a global `data` array of ~49,890 WHO FluNet records. `gmynd.js` provides tiny math helpers (`gmynd.degrees`, `gmynd.radians`).

### Visualization — `draw()`

- Renders a **spiral scatter plot** into `.canvas` using jQuery-created `<div class="dot">` elements with absolute positioning
- Iterates 2012–2020 (hardcoded), all 12 months, all 6 countries
- Each dot is positioned via polar→cartesian conversion: angle = month × 30° offset by country index; radius = baseRadius + incremental step
- Dot opacity encodes value intensity (value / maxCaseValue)
- Draws 12 radial grid lines via `drawGridLines()` and month labels via `createMonthLabels()`

### Data pipeline

- `data/influenza_six.js` → global `data` array, each entry is one country+date row with columns like `"Share of positive tests - All types of surveillance"`, `"Reported cases of influenza-like illnesses"`, etc.
- `calculateSeasonalRiskPatterns()` computes a composite risk score (0–100) per country-month using predictability (25%), global severity (45%), seasonal timing (15%), and seasonal strength (15%). Results stored on data entries under the key `"Seasonal Risk Patterns - Which countries have the most predictable/severe seasons"`

### Country colors (fixed map)

| Country | Color |
|---------|-------|
| Japan | `#FF4C4C` |
| North Korea | `#36CFC9` |
| Germany | `#FFEC3D` |
| Iceland | `#9254DE` |
| UAE | `#69C0FF` |
| Iran | `#FF9C6E` |

### Settings system

- `initializeSettings()` creates a settings panel with text-based option selectors and legacy sliders
- Settings stored in `window.visualizationSettings` and `localStorage` key `influenza-viz-settings`
- `updateVisualizationSettings()` applies dot size, opacity, transitions, grid lines, month labels, tooltip behavior, brightness, high contrast, zero-value display, scaling method — in real-time to existing DOM elements or by re-drawing
- Defaults: `dotSize: 10`, `dotOpacity: 0.8`, `enableTransitions: true`, `showGridLines: true`, `showMonthLabels: true`, `backgroundBrightness: 1.0`

### Country Analysis / Comparison panel

Three modes:
1. **Monthly** (`runCountryComparison`) — single month cross-country ranking
2. **Seasonal** (`runSeasonalComparison`) — 12-month mini bar chart per country
3. **Multi-Year** (`runYearlyComparison`) — selected years comparison
4. **Seasonal Risk** (`runSeasonalRiskAnalysis`) — risk-score filtering + categorization (Very High ≥70, High ≥50, Moderate ≥30, Low ≥15)

### Tooltip system

- Dot hover populates `.info-box` with country, date, formatted value, risk category (for seasonal risk mode), and month-over-month change calculation
- Change lookup walks back up to 12 months to find previous non-zero data point

### Key state variables (all inside `$(document).ready`)

| Variable | Purpose |
|----------|---------|
| `caseModel` | Currently selected metric |
| `countryColors` | Country → color map |
| `data` | Global data array (from `influenza_six.js`) |
| `window.visualizationSettings` | Current user settings |

## Project Structure

```
/
├── index.html           # Main page, loads scripts via <script> tags
├── css/styles.css       # Dark theme, overlay panels, tooltip styling
├── js/script.js         # All application logic (~2100 lines)
├── data/
│   ├── influenza_six.js # WHO data (global `data` array)
│   └── influenza.js     # Raw data backup
└── lib/
    ├── gmynd.js         # Math utilities (degrees, radians)
    └── jquery-3.7.1.min.js
```

## Commands

Project is served as static files. Use any static file server:

```bash
# VS Code Live Server, python, or similar
python3 -m http.server 8000
npx serve .
```

## Conventions

- No ES modules, no bundler, no npm — plain HTML + CSS + JS
- jQuery for all DOM manipulation
- `gmynd.js` for math helpers
- Data is inline JS array, not fetched via API
- All code is in a single IIFE-like `$(document).ready)` block
- No year selector exists — the spiral always renders 2012–2020 data

## TODO

- [ ] Remove `data/influenza.js` (raw data backup, not referenced by code or build)
- [ ] Remove untracked `plan.md` from working directory
- [ ] Remove orphaned `console.log` statements in `js/script.js` (lines ~188-189, ~222)
- [ ] Clean up `settings` example text still referencing "year changes"
- [ ] Consider removing or renaming "Multi-Year Analysis" comparison mode — year selector is gone, only comparison panel has year dropdowns
- [x] Remove unused `generateMonths()` standalone helper (inlined into draw() loop)
- [ ] Remove `plan.md` from git index if accidentally added
