import type { RadarConfig } from '../types/radar'
import { axisFormulaTex, axisKpiTex } from './axisLatex'
import { splitLabelLines } from './textLayout'

/** Default gap from plot outer ring to first ink of KPI labels (SVG units). */
export function defaultLabelPlotGapPx(fontSize: number): number {
  return Math.max(10, fontSize * 1.35)
}

/** Default extra space beyond KPI band for section titles. */
export function defaultSectionTitleGapPx(fontSize: number): number {
  return Math.max(14, fontSize * 2.2)
}

function displayMainText(axis: RadarConfig['axes'][0], labelStyle: RadarConfig['labelStyle']): string {
  const style = labelStyle ?? 'both'
  let mainText = axis.label
  if (axis.shortLabel) {
    if (style === 'short') mainText = axis.shortLabel
    else if (style === 'both') mainText = `${axis.shortLabel} · ${axis.label}`
  }
  return mainText
}

/** Longest line length after wrapping heuristics. */
export function axisLabelMaxLineChars(axis: RadarConfig['axes'][0], labelStyle: RadarConfig['labelStyle']): number {
  const lines = splitLabelLines(displayMainText(axis, labelStyle))
  return Math.max(1, ...lines.map((l) => l.length))
}

/**
 * Rough max distance (SVG px) KPI text extends **outward** along the spoke from the anchor
 * when using `text-anchor: start` (radial mode).
 */
export function estimateRadialLabelOutwardExtent(
  axis: RadarConfig['axes'][0],
  config: RadarConfig,
  fontSize: number,
): number {
  const lines = splitLabelLines(displayMainText(axis, config.labelStyle))
  const longest = Math.max(1, ...lines.map((l) => l.length))
  const mainW = Math.min(longest * fontSize * 0.56, fontSize * 28)
  let extra = 0
  if (config.showFormulas !== false) {
    const kpi = axisKpiTex(axis)
    const fl = axisFormulaTex(axis)
    if (kpi) {
      extra = Math.max(
        extra,
        Math.min(kpi.length * fontSize * 0.38, fontSize * 18),
      )
    }
    if (fl) {
      extra = Math.max(
        extra,
        Math.min(fl.length * fontSize * 0.22, fontSize * 24),
      )
    }
  }
  return Math.max(mainW, extra) + fontSize * 0.6
}

/**
 * Half-thickness of the label block **along the inward radial** for tangent mode
 * (lines + formula stack in local `y` before rotation).
 */
export function estimateTangentHalfDepth(
  axis: RadarConfig['axes'][0],
  config: RadarConfig,
  fontSize: number,
): number {
  const lines = splitLabelLines(displayMainText(axis, config.labelStyle))
  const lineHeight = fontSize * 1.15
  let n = lines.length
  if (config.showFormulas !== false) {
    if (axisKpiTex(axis)) n += 1.15
    if (axisFormulaTex(axis)) n += 2.35
  }
  return (n * lineHeight) / 2 + fontSize * 0.35
}

/** Max outward extent for all axes — used to place section titles outside KPIs. */
export function maxKpiBandDepth(
  config: RadarConfig,
  fontSize: number,
  orientation: 'radial' | 'tangent',
): number {
  if (config.axes.length === 0) return fontSize * 2
  if (orientation === 'radial') {
    return Math.max(
      fontSize * 2,
      ...config.axes.map((a) => estimateRadialLabelOutwardExtent(a, config, fontSize)),
    )
  }
  return Math.max(
    fontSize * 2,
    ...config.axes.map((a) => {
      const half = estimateTangentHalfDepth(a, config, fontSize)
      const chars = axisLabelMaxLineChars(a, config.labelStyle)
      const tangential = Math.min(chars * fontSize * 0.48, fontSize * 16) * 0.35
      return half + tangential
    }),
  )
}
