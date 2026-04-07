# Urban Radar Generator

Interactive **radar (spider) chart** tool for comparing urban KPIs across scenarios. Edit axes, values, and styling in the browser; export SVG, PNG, or JSON. A **time-based mode** animates the **Proposed Site** polygon from the **Existing Site** baseline toward your target values, with organic per-axis motion over a user-chosen duration (0–60 seconds).

---

## Features

- **Dynamic radar chart** — custom SVG (no chart library lock-in), crisp at export scale.
- **Editable KPIs** — axes with labels, optional KaTeX on spokes, sections (thematic arcs), multiple datasets.
- **Static vs animated Proposed Site** — default is **static**: the chart reflects your inputs immediately. **Animation** is optional and temporary.
- **Time simulation (0–60 s)** — duration slider; `0 s` means no timed animation (chart already shows targets).
- **Organic growth** — per-axis delay, easing, and bounded wobble so motion feels natural but still **ends exactly** on your Proposed values.
- **Saved versions** — up to 10 named snapshots in `localStorage`.
- **Import/export** — paste/upload JSON, mock API loader, SVG/PNG/JSON export.

---

## Demo: how the animation works

Conceptually, the **Existing Site** line is the *starting condition* and **Proposed Site** is the *target*. When you press **Time** (play), the app does **not** overwrite your saved Proposed numbers. Instead it shows a **temporary** copy of the polygon that begins coincident with Existing and, over the selected duration, moves so each axis approaches your current Proposed value. When playback finishes (or you press **Stop**), the chart returns to **static** mode and shows the real values from your config again.

---

## How it works

### Existing Site vs Proposed Site

The demo config (`src/data/demoRadarConfig.ts`) includes datasets named **Existing Site** and **Proposed Site**. The app resolves them by name (case-insensitive substring match: `existing` / `proposed`). If names differ, it falls back to the **first** dataset as “existing” and the **second** as “proposed” for animation pairing.

### Static vs animated rendering

| Mode | What you see for Proposed |
|------|---------------------------|
| **Static** (`playbackMode === 'off'`) | Values from `config.datasets[proposed]` — live edits update the chart immediately. |
| **Animated** (`running` or `paused`) | A derived config replaces only the Proposed `values` array with `animatedProposedValues` for the preview. `config` in React state is unchanged. |

### Interpolation

Progress uses `requestAnimationFrame`, normalized time `t ∈ [0,1]`, and `src/utils/organicInterpolation.ts`: per-axis parameters (delay, easing exponent, smooth sine wobble with zero at endpoints) so axes need not move in lockstep. At `t ≥ 1`, playback stops and the UI reads Proposed from `config` again.

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **KaTeX** + **react-katex** for math on axis labels (`foreignObject` in SVG)

---

## Installation

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | ESLint |

---

## Usage

### Editing values

- Use the **left panel** (Datasets → per-axis numbers). Changes apply to the in-memory `RadarConfig` immediately in **static** mode.
- Toggle **Show JSON** to edit raw JSON; **Apply JSON** merges through `normalizeRadarConfig`.
- While **Time** animation is **running or paused**, Proposed value inputs and JSON apply/sync are **locked** so the preview stays consistent.

### Running the animation

1. Set **Proposed Site** values to your targets (static preview updates live).
2. Choose **Duration** (0–60 s). Values above 0 define the length of the run; **0 s** skips timed playback (tooltip explains).
3. Press **Time** to start: Proposed animates from **Existing** toward current **Proposed** targets.
4. Press **Stop** (same control, relabeled while active) to exit animation and return to static editing with your real Proposed values.

### Time controls

- **Time / Stop** — start playback from static, or stop and return to static.
- **Pause / Resume** — freeze or continue the current run (still in “animated” display until Stop or completion).
- **Reset** (during playback) — jump the animated line back to the Existing baseline and continue from there.
- **Replay** — stop if needed, then start a fresh run with the current duration and targets.

---

## Project structure

```
src/
  App.tsx                 # Shell layout, config state, wiring
  main.tsx                # Entry + global CSS
  styles/
    global.css            # Tailwind + root layout + KaTeX color
  types/
    radar.ts              # RadarConfig and related types
    playback.ts           # PlaybackMode union
    react-katex.d.ts
  data/
    demoRadarConfig.ts    # Demo + minimal preset
  hooks/
    useProposedSiteAnimation.ts  # Playback state, RAF loop, renderConfig overlay
  components/             # UI + SVG chart pieces (canvas, grid, labels, legend, …)
  utils/
    radarGeometry.ts      # Spoke paths, scales
    configNormalize.ts    # Merge partial JSON into full config
    organicInterpolation.ts
    datasetRoles.ts       # Resolve Existing / Proposed dataset indices
    exportUtils.ts, labelPlacement.ts, textLayout.ts, …
    mockBackend.ts        # Stub API
    savedVersionsStorage.ts
public/                   # Static assets (e.g. branding logo)
```

---

## Developer notes

### Real config vs animated overlay

- **`config` (React state)** is the **source of truth** for persistence, export, and static editing.
- **`renderConfig`** is either `config` or a shallow copy with the Proposed dataset’s `values` replaced by `animatedProposedValues` during playback.
- Animation is **temporary** so exports (JSON) stay aligned with user intent and you never “lose” target values by stopping mid-tween.

### Timing and easing

- Wall-clock duration is `durationSec * 1000` ms; pause adjusts `startTimeMsRef` so elapsed time is preserved.
- **0 s** duration: `startPlayback` returns without entering playback; the chart already displays targets.
- Organic curves live in **`organicInterpolation.ts`** (deterministic PRNG from axis ids + target snapshot + duration for repeatable runs).

### Backend later

Replace `fetchMockRadarConfig` in `src/utils/mockBackend.ts` with your API; keep passing payloads through **`normalizeRadarConfig`**.

---

## Data model (summary)

Full types: `src/types/radar.ts`.

- **`axes`** — spokes: `label`, optional `kpiLatex` / `formulaLatex`, `maxValue`, etc.
- **`datasets`** — scenarios with `values[i]` per axis.
- **`sections`** — optional arcs between axis index ranges.
- **`branding`** — preview logo (not part of raster export in some pipelines).

### KaTeX in JSON

In JSON files, escape backslashes: one TeX backslash is written as `\\` (e.g. `"kpiLatex": "\\rho_r"`). In TypeScript string literals you often need `\\\\` for the same output. PNG/SVG export may treat `foreignObject` differently in some tools — verify in your workflow.

---

## Export

- **SVG / PNG** — from the live preview SVG (`src/utils/exportUtils.ts`).
- **JSON** — current `RadarConfig` (always the **real** config, not the animated overlay).

---

## Saved versions

**Saved versions** in the header stores up to **10** named configs in **`localStorage`** (`radar-generator-saved-versions-v1`). Clearing site data removes them.

---

## Future improvements

- Optional backend persistence for saved versions.
- E2E tests for normalize + export.
- Accessibility pass on SVG labels and control labels.
- Configurable labels for “Existing” / “Proposed” role detection beyond name heuristics.

---

## Publishing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: urban radar generator"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Add a `LICENSE` (e.g. MIT) and GitHub **About** description when you make the repo public.
