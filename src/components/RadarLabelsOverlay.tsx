import type { MouseEvent as ReactMouseEvent } from 'react'
import type { RadarConfig } from '../types/radar'
import { axisFormulaTex, axisKpiTex } from '../utils/axisLatex'
import { defaultLabelPlotGapPx } from '../utils/labelPlacement'
import { axisAngleRadians, polarToCartesian } from '../utils/radarGeometry'
import { splitLabelLines } from '../utils/textLayout'
import { AxisMathLabel } from './AxisMathLabel'

const LABEL_WIDTH = 280

type Props = {
  config: RadarConfig
  width: number
  height: number
  onLabelOffsetChange?: (
    axisId: string,
    offset: { dx: number; dy: number },
  ) => void
  draggingAxisId?: string | null
  setDraggingAxisId?: (id: string | null) => void
}

export function RadarLabelsOverlay({
  config,
  width,
  height,
  onLabelOffsetChange,
  draggingAxisId,
  setDraggingAxisId,
}: Props) {
  const cx = config.centerX ?? width / 2
  const cy = config.centerY ?? height / 2
  const zoom = config.zoom ?? 1
  const fontSize = config.fontSizePx ?? 11
  const pad = Math.min(width, height) * 0.1 + fontSize * 3.6
  const baseR = Math.min(width, height) / 2 - pad
  const r = Math.max(48, baseR * zoom)
  const plotOuterRadius = r * 0.78
  const gap = config.labelPlotGapPx ?? defaultLabelPlotGapPx(fontSize)
  const n = config.axes.length
  const showMath = config.showFormulas !== false

  return (
    <div
      className="absolute inset-0"
      style={{ pointerEvents: onLabelOffsetChange ? 'auto' : 'none' }}
    >
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

        const base = polarToCartesian(cx, cy, plotOuterRadius + gap, angle)
        const x = base.x + off.dx
        const y = base.y + off.dy

        const kpiTex = showMath ? axisKpiTex(axis) : undefined
        const formulaTex = showMath ? axisFormulaTex(axis) : undefined

        const lineHeight = fontSize * 1.15
        const plainH = lines.length * lineHeight
        const kpiH = kpiTex ? fontSize * 1.5 : 0
        const formH = formulaTex ? fontSize * 3.2 : 0
        const labelH = Math.max(plainH + kpiH + formH + 18, 44)

        let textAlign: 'left' | 'center' | 'right' = 'center'
        let left = x - LABEL_WIDTH / 2
        const cos = Math.cos(angle)
        if (cos > 0.3) {
          textAlign = 'left'
          left = x
        } else if (cos < -0.3) {
          textAlign = 'right'
          left = x - LABEL_WIDTH
        }
        const top = y - labelH / 2

        const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
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
          <div
            key={axis.id}
            onMouseDown={onMouseDown}
            style={{
              position: 'absolute',
              left,
              top,
              width: LABEL_WIDTH,
              minHeight: labelH,
              pointerEvents: onLabelOffsetChange ? 'auto' : 'none',
              cursor: onLabelOffsetChange ? 'grab' : 'default',
              opacity: draggingAxisId === axis.id ? 0.85 : 1,
            }}
          >
            <AxisMathLabel
              lines={lines}
              kpiTex={kpiTex}
              formulaTex={formulaTex}
              showMath={showMath}
              textColor={config.textColor}
              fontSize={fontSize}
              anchor={
                textAlign === 'left'
                  ? 'start'
                  : textAlign === 'right'
                    ? 'end'
                    : 'middle'
              }
            />
          </div>
        )
      })}
    </div>
  )
}
