import type { RadarConfig, RadarSection } from '../types/radar'
import {
  axisAngleRadians,
  describeCircularArc,
  polarToCartesian,
  sectionMidAngleRadians,
} from '../utils/radarGeometry'

function sectionArcPath(
  cx: number,
  cy: number,
  r: number,
  sec: RadarSection,
  nAxes: number,
): string {
  const s = Math.max(0, Math.min(nAxes - 1, sec.startAxisIndex))
  const e = Math.max(0, Math.min(nAxes - 1, sec.endAxisIndex))
  const a0 = axisAngleRadians(s, nAxes) - 0.02
  const a1 = axisAngleRadians(e, nAxes) + 0.02
  return describeCircularArc(cx, cy, r, a0, a1)
}

type ArcsProps = {
  config: RadarConfig
  cx: number
  cy: number
  /** Usually the outer data grid radius */
  arcRadius: number
}

/**
 * Faint section guide arcs only — drawn **under** KPI labels to avoid hiding data.
 */
export function RadarSectionArcs({ config, cx, cy, arcRadius }: ArcsProps) {
  const sections = config.sections
  if (!sections?.length) return null
  const n = config.axes.length

  return (
    <g className="radar-section-arcs" aria-hidden>
      {sections.map((sec) => (
        <path
          key={`arc-${sec.id}`}
          d={sectionArcPath(cx, cy, arcRadius, sec, n)}
          fill="none"
          stroke={config.gridColor}
          strokeWidth={0.4}
          opacity={0.45}
        />
      ))}
    </g>
  )
}

type TitlesProps = {
  config: RadarConfig
  cx: number
  cy: number
  /** Place titles outside the KPI band */
  titleRadius: number
  fontSize: number
}

/**
 * Section titles only — render **after** KPI labels so they sit on the outer ring.
 */
export function RadarSectionTitleTexts({
  config,
  cx,
  cy,
  titleRadius,
  fontSize,
}: TitlesProps) {
  const sections = config.sections
  if (!sections?.length) return null

  const n = config.axes.length

  return (
    <g className="radar-section-titles" aria-hidden>
      {sections.map((sec) => {
        const mid = sectionMidAngleRadians(sec.startAxisIndex, sec.endAxisIndex, n)
        const p = polarToCartesian(cx, cy, titleRadius, mid)
        const rotation = (mid * 180) / Math.PI + 90
        const rot = rotation > 90 && rotation < 270 ? rotation + 180 : rotation

        return (
          <g key={sec.id} transform={`translate(${p.x}, ${p.y}) rotate(${rot})`}>
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fill={config.textColor}
              fontSize={fontSize * 1.05}
              fontWeight={600}
              letterSpacing="0.06em"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              opacity={0.95}
            >
              {sec.title}
            </text>
          </g>
        )
      })}
    </g>
  )
}
