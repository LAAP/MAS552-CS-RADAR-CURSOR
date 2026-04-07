/**
 * Label rotation and anchor hints for perimeter text on radar charts.
 */

/** Rotation (degrees) and text-anchor for SVG <text> near the chart edge. */
export type LabelLayout = {
  rotation: number
  anchor: 'start' | 'middle' | 'end'
  baseline: 'auto' | 'hanging' | 'middle' | 'central'
}

export type KpiLabelOrientationMode = 'radial' | 'tangent'

/** When true, add 180° and use `text-anchor: end` so radial KPI text grows outward and reads upright. */
function radialReadabilityHalfTurn(angleRad: number): boolean {
  const cosT = Math.cos(angleRad)
  const sinT = Math.sin(angleRad)
  // Upper-right (~1–2 o’clock): cos>0, sin<0; omit the wedge tight to 12 o’clock.
  const upperRight =
    cosT > 0.12 && sinT < -0.02 && angleRad > (-70 * Math.PI) / 180
  // Lower: only after ~38° below the 3–9 horizontal so we don’t flip too soon past 3 o’clock.
  const lower = sinT > Math.sin((38 * Math.PI) / 180)
  return upperRight || lower
}

/**
 * KPI label rotation (SVG `transform="rotate(...)"`: positive = clockwise).
 *
 * - **tangent** — baseline ⟂ radius (text runs around the circle; horizontal at 12 o’clock).
 * - **radial** — baseline ∥ radius / spoke (vertical at top, horizontal at 3 o’clock), like the reference board.
 *
 * `extraRotation` adds user/drag offset in degrees.
 */
export function layoutRadialLabel(
  angleRad: number,
  extraRotationDeg = 0,
  mode: KpiLabelOrientationMode = 'radial',
): LabelLayout {
  const thetaDeg = (angleRad * 180) / Math.PI

  let rotation: number
  if (mode === 'tangent') {
    rotation = thetaDeg + 90
    if (rotation > 90 && rotation < 270) rotation += 180
  } else {
    // Radial: align local +x with the outward spoke, then half-turn only where Latin reads wrong.
    // Old rule `sin(θ) > 0` flipped the entire lower half-plane, so anything past 3 o'clock flipped
    // too early (e.g. 4 o'clock) while upper-right (~1–2 o'clock) stayed upside down.
    rotation = thetaDeg
    if (radialReadabilityHalfTurn(angleRad)) rotation += 180
  }

  rotation += extraRotationDeg

  // Radial: grow **outward** from the plot; `end` when a half-turn was applied.
  let anchor: LabelLayout['anchor'] = 'middle'
  if (mode === 'radial') {
    anchor = radialReadabilityHalfTurn(angleRad) ? 'end' : 'start'
  } else {
    const c = Math.cos(angleRad)
    if (c > 0.35) anchor = 'start'
    else if (c < -0.35) anchor = 'end'
  }

  return {
    rotation,
    anchor,
    baseline: 'middle',
  }
}

/** Per-axis manual flip: 180° + swap start/end so text still grows away from the plot. */
export function applyUserLabelFlip(
  layout: LabelLayout,
  flipLabel?: boolean,
): LabelLayout {
  if (!flipLabel) return layout
  let anchor = layout.anchor
  if (anchor === 'start') anchor = 'end'
  else if (anchor === 'end') anchor = 'start'
  return {
    ...layout,
    rotation: layout.rotation + 180,
    anchor,
  }
}

/** Split long labels on explicit "\\n" or at commas for optional breaks */
export function splitLabelLines(text: string): string[] {
  if (text.includes('\n')) {
    return text.split('\n').map((l) => l.trim()).filter(Boolean)
  }
  if (text.length > 28 && text.includes(',')) {
    const idx = text.indexOf(',')
    return [text.slice(0, idx).trim(), text.slice(idx + 1).trim()]
  }
  return [text]
}
