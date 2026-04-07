/**
 * Core configuration types for the radar chart engine.
 * These types are backend-ready: serialize `RadarConfig` as JSON from an API.
 */

export type RadarDataset = {
  id: string
  name: string
  color: string
  /** Stroke color if different from `color` */
  strokeColor?: string
  fillColor?: string
  strokeWidth?: number
  fillOpacity?: number
  values: number[]
}

export type RadarAxis = {
  id: string
  /** Plain-language name, e.g. "Residential density" */
  label: string
  /** Legacy short text in composed label modes */
  shortLabel?: string
  /** Inline KaTeX for the KPI symbol, e.g. `"\\\\rho_r"` */
  kpiLatex?: string
  /** Display KaTeX for the full equation, e.g. `"D_r = \\\\frac{N_u}{A}"` */
  formulaLatex?: string
  /** @deprecated Use `kpiLatex` (KaTeX). Still read as fallback for older JSON. */
  formula?: string
  group?: 'proximity' | 'diversity' | 'density' | string
  maxValue: number
  /** User override: extra 180° on this KPI label (after auto layout); persisted in JSON */
  flipLabel?: boolean
}

export type RadarSection = {
  id: string
  title: string
  description?: string
  startAxisIndex: number
  endAxisIndex: number
}

export type LegendPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'

/** Optional mark in the live preview (not part of exported SVG/PNG raster). */
export type RadarBranding = {
  /** Default true; set `false` to hide the logo */
  showLogo?: boolean
  /** Image URL or app path (default: `/city-intelligence-lab-logo.png`) */
  logoSrc?: string
  /** Max width in CSS px; height follows aspect ratio */
  logoMaxWidthPx?: number
  /** 0–1 */
  logoOpacity?: number
}

export type RadarConfig = {
  title: string
  backgroundColor: string
  gridColor: string
  textColor: string
  centerX?: number
  centerY?: number
  radius?: number
  levels: number
  axes: RadarAxis[]
  datasets: RadarDataset[]
  sections?: RadarSection[]
  legend?: {
    enabled: boolean
    position: LegendPosition
  }
  footnotes?: string[]
  /** Persisted UI preferences (optional in JSON; defaults applied in app) */
  showFormulas?: boolean
  fontSizePx?: number
  theme?: 'dark' | 'light'
  /** Per-axis label nudge in SVG units (for drag-adjust or manual JSON) */
  labelOffsets?: Record<string, { dx: number; dy: number }>
  /** View zoom around chart center (1 = default) */
  zoom?: number
  /** How primary perimeter text is composed when `shortLabel` exists */
  labelStyle?: 'full' | 'short' | 'both'
  /**
   * KPI label rotation at the perimeter:
   * - `radial` — baseline parallel to the spoke (vertical at 12 o’clock, horizontal at 3 o’clock); matches many “urban performance” boards.
   * - `tangent` — baseline perpendicular to the spoke (reads around the circle; geometric “⊥ radius”).
   */
  kpiLabelOrientation?: 'radial' | 'tangent'
  /** Gap from outer plot ring to KPI label anchor (SVG px); larger = labels further out */
  labelPlotGapPx?: number
  /** Extra space beyond the KPI band reserved for section titles (SVG px) */
  sectionTitleGapPx?: number
  /** Preview-only branding (bottom-right logo) */
  branding?: RadarBranding
}

/** Default values merged into partial configs on import */
export const RADAR_CONFIG_DEFAULTS: Partial<RadarConfig> = {
  showFormulas: true,
  fontSizePx: 11,
  theme: 'dark',
  zoom: 1,
  kpiLabelOrientation: 'radial',
  legend: { enabled: true, position: 'top-right' },
}
