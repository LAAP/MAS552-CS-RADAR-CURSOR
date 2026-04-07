import { axisAngleRadians, polarToCartesian } from '../utils/radarGeometry'

type Props = {
  cx: number
  cy: number
  radius: number
  axisCount: number
  levels: number
  gridColor: string
}

/**
 * Concentric circles and radial spokes — thin technical grid.
 */
export function RadarGrid({ cx, cy, radius, axisCount, levels, gridColor }: Props) {
  const circles = []
  for (let L = 1; L <= levels; L++) {
    const r = (radius * L) / levels
    circles.push(
      <circle
        key={`c-${L}`}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={gridColor}
        strokeWidth={0.65}
      />,
    )
  }

  const spokes = []
  for (let i = 0; i < axisCount; i++) {
    const a = axisAngleRadians(i, axisCount)
    const p = polarToCartesian(cx, cy, radius, a)
    spokes.push(
      <line
        key={`s-${i}`}
        x1={cx}
        y1={cy}
        x2={p.x}
        y2={p.y}
        stroke={gridColor}
        strokeWidth={0.65}
      />,
    )
  }

  return (
    <g className="radar-grid" aria-hidden>
      {circles}
      {spokes}
    </g>
  )
}
