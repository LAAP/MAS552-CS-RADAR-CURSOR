import type { MouseEvent as ReactMouseEvent } from 'react'
import type { RadarConfig } from '../types/radar'
import { axisFormulaTex, axisKpiTex } from '../utils/axisLatex'
import { axisAngleRadians, polarToCartesian } from '../utils/radarGeometry'
import {
  defaultLabelPlotGapPx,
  estimateTangentHalfDepth,
} from '../utils/labelPlacement'
import {
  applyUserLabelFlip,
  layoutRadialLabel,
  splitLabelLines,
} from '../utils/textLayout'
import { AxisMathLabel } from './AxisMathLabel'

const FO_WIDTH = 280

type Props = {
  config: RadarConfig
  cx: number
  cy: number
  plotOuterRadius: number
  fontSize: number
  onLabelOffsetChange?: (
    axisId: string,
    offset: { dx: number; dy: number },
  ) => void
  draggingAxisId?: string | null
  setDraggingAxisId?: (id: string | null) => void
}

/**
 * Perimeter labels in SVG via `foreignObject` so KaTeX can render axis math.
 */
export function RadarLabels({
  config,
  cx,
  cy,
  plotOuterRadius,
  fontSize,
  onLabelOffsetChange,
  draggingAxisId,
  setDraggingAxisId,
}: Props) {
  const n = config.axes.length
  const showMath = config.showFormulas !== false
  const orient = config.kpiLabelOrientation ?? 'radial'
  const gap = config.labelPlotGapPx ?? defaultLabelPlotGapPx(fontSize)

  return (
    <g className="radar-labels" style={{ cursor: onLabelOffsetChange ? 'grab' : undefined }}>
      {config.axes.map((axis, i) => {
        const angle = axisAngleRadians(i, n)
        const off = config.labelOffsets?.[axis.id] ?? { dx: 0, dy: 0 }

        const style = config.labelStyle ?? 'both'
        let mainText = axis.label
        if (axis.shortLabel) {
          if (style === 'short') mainText = axis.shortLabel
          else if (style === 'both') mainText = `${axis.shortLabel} · ${axis.label}`
        }
        const lines = splitLabelLines(mainText)

        const tangentHalf =
          orient === 'tangent'
            ? estimateTangentHalfDepth(axis, config, fontSize)
            : 0
        const radialAlongSpoke =
          plotOuterRadius + gap + (orient === 'tangent' ? tangentHalf : 0)

        const base = polarToCartesian(cx, cy, radialAlongSpoke, angle)
        const x = base.x + off.dx
        const y = base.y + off.dy
        const layout = applyUserLabelFlip(
          layoutRadialLabel(angle, 0, orient),
          axis.flipLabel,
        )

        const kpiTex = showMath ? axisKpiTex(axis) : undefined
        const formulaTex = showMath ? axisFormulaTex(axis) : undefined

        const lineHeight = fontSize * 1.15
        const plainH = lines.length * lineHeight
        const kpiH = kpiTex ? fontSize * 1.5 : 0
        const formH = formulaTex ? fontSize * 3.6 : 0
        const foH = Math.max(plainH + kpiH + formH + 24, 44)
        const foPad = 8
        const foX =
          layout.anchor === 'start'
            ? 0
            : layout.anchor === 'end'
              ? -FO_WIDTH
              : -FO_WIDTH / 2
        const foY = -foH / 2 - foPad / 2

        const onMouseDown = (e: ReactMouseEvent<SVGGElement>) => {
          if (!onLabelOffsetChange || !setDraggingAxisId) return
          e.preventDefault()
          setDraggingAxisId(axis.id)
          const startX = e.clientX
          const startY = e.clientY
          const startOff = { ...off }

          const onMove = (ev: globalThis.MouseEvent) => {
            const dx = ev.clientX - startX
            const dy = ev.clientY - startY
            onLabelOffsetChange(axis.id, {
              dx: startOff.dx + dx,
              dy: startOff.dy + dy,
            })
          }
          const onUp = () => {
            setDraggingAxisId(null)
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
          }
          window.addEventListener('mousemove', onMove)
          window.addEventListener('mouseup', onUp)
        }

        return (
          <g
            key={axis.id}
            transform={`translate(${x}, ${y}) rotate(${layout.rotation})`}
            onMouseDown={onMouseDown}
            style={{
              cursor: onLabelOffsetChange ? 'grab' : undefined,
              opacity: draggingAxisId === axis.id ? 0.85 : 1,
            }}
          >
            <foreignObject
              x={foX}
              y={foY}
              width={FO_WIDTH}
              height={foH + foPad}
              style={{ overflow: 'visible' }}
            >
              <AxisMathLabel
                lines={lines}
                kpiTex={kpiTex}
                formulaTex={formulaTex}
                showMath={showMath}
                textColor={config.textColor}
                fontSize={fontSize}
                anchor={layout.anchor}
              />
            </foreignObject>
          </g>
        )
      })}
    </g>
  )
}
