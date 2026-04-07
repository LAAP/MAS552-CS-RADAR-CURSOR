import type { RadarAxis } from '../types/radar'

/** Inline KPI symbol (prefer `kpiLatex`; fall back to legacy `formula` plain text). */
export function axisKpiTex(axis: RadarAxis): string | undefined {
  const t = axis.kpiLatex ?? axis.formula
  return t?.trim() ? t.trim() : undefined
}

/** Display-mode equation (KaTeX). */
export function axisFormulaTex(axis: RadarAxis): string | undefined {
  const t = axis.formulaLatex
  return t?.trim() ? t.trim() : undefined
}
