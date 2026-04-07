/**
 * Polar ↔ Cartesian helpers and path building for SVG radar charts.
 * Keeps rendering math out of React components so the engine can be swapped.
 */

export type Point = { x: number; y: number }

const TAU = Math.PI * 2

/** Angle for axis index i with n axes; 0 = top (−Y in SVG), clockwise. */
export function axisAngleRadians(i: number, n: number): number {
  if (n <= 0) return -Math.PI / 2
  return -Math.PI / 2 + (TAU * i) / n
}

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleRad: number,
): Point {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

/** Normalized radius in [0, 1] from raw value and axis max. */
export function normalizedRadius(
  value: number,
  maxValue: number,
): number {
  if (maxValue <= 0) return 0
  const v = value / maxValue
  return Math.max(0, Math.min(1, v))
}

/** Closed polygon path for one dataset; assumes values.length === nAxes. */
export function datasetPolygonPath(
  cx: number,
  cy: number,
  dataRadius: number,
  values: number[],
  maxValues: number[],
): string {
  const n = Math.min(values.length, maxValues.length)
  if (n === 0) return ''
  const pts: Point[] = []
  for (let i = 0; i < n; i++) {
    const t = axisAngleRadians(i, n)
    const nr = normalizedRadius(values[i] ?? 0, maxValues[i] ?? 1)
    pts.push(polarToCartesian(cx, cy, dataRadius * nr, t))
  }
  return (
    pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(3)} ${p.y.toFixed(3)}`)
      .join(' ') + ' Z'
  )
}

/** SVG arc along circle from angle a0 to a1 (radians), shorter positive sweep. */
export function describeCircularArc(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
): string {
  const p0 = polarToCartesian(cx, cy, r, a0)
  const p1 = polarToCartesian(cx, cy, r, a1)
  let delta = a1 - a0
  while (delta <= -Math.PI) delta += TAU
  while (delta > Math.PI) delta -= TAU
  const large = Math.abs(delta) > Math.PI / 2 ? 1 : 0
  const sweep = delta > 0 ? 1 : 0
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} ${sweep} ${p1.x} ${p1.y}`
}

/** Mid-angle (radians) between first and last axis of a contiguous index range [start, end]. */
export function sectionMidAngleRadians(
  startIndex: number,
  endIndex: number,
  nAxes: number,
): number {
  if (nAxes <= 0) return -Math.PI / 2
  const s = Math.max(0, Math.min(nAxes - 1, startIndex))
  const e = Math.max(0, Math.min(nAxes - 1, endIndex))
  const a0 = axisAngleRadians(s, nAxes)
  const a1 = axisAngleRadians(e, nAxes)
  let mid = (a0 + a1) / 2
  // If wrap is shorter the other way, adjust (for sections spanning > half circle)
  if (e < s) {
    mid = (a0 + a1 + TAU) / 2
    if (mid > Math.PI) mid -= TAU
  }
  return mid
}

export function degrees(rad: number): number {
  return (rad * 180) / Math.PI
}
