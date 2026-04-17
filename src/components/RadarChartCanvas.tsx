import { forwardRef, useMemo } from 'react'
import type { RadarConfig } from '../types/radar'
import { RadarGrid } from './RadarGrid'
import { RadarDatasetPaths } from './RadarDatasetPaths'
import {
  RadarSectionArcs,
  RadarSectionTitleTexts,
} from './RadarSectionTitles'
import {
  defaultLabelPlotGapPx,
  defaultSectionTitleGapPx,
  maxKpiBandDepth,
} from '../utils/labelPlacement'

type Props = {
  config: RadarConfig
  width: number
  height: number
}

/**
 * Single SVG scene graph for the radar: grid, polygons, section arcs, KPI labels, section titles.
 * Ref exposes the root `<svg>` for PNG/SVG export.
 */
export const RadarChartCanvas = forwardRef<SVGSVGElement, Props>(
  function RadarChartCanvas(
    { config, width, height },
    ref,
  ) {
    const cx = config.centerX ?? width / 2
    const cy = config.centerY ?? height / 2
    const zoom = config.zoom ?? 1
    const fontSize = config.fontSizePx ?? 11
    const orient = config.kpiLabelOrientation ?? 'radial'

    const { dataRadius, sectionTitleRadius } = useMemo(() => {
      const pad = Math.min(width, height) * 0.1 + fontSize * 3.6
      const baseR = Math.min(width, height) / 2 - pad
      const r = Math.max(48, baseR * zoom)
      const dataRadius = r * 0.78

      const gap = config.labelPlotGapPx ?? defaultLabelPlotGapPx(fontSize)
      const sectionExtra =
        config.sectionTitleGapPx ?? defaultSectionTitleGapPx(fontSize)
      const kpiDepth = maxKpiBandDepth(config, fontSize, orient)
      const sectionTitleRadius = dataRadius + gap + kpiDepth + sectionExtra

      return { dataRadius, sectionTitleRadius }
    }, [width, height, fontSize, zoom, config, orient])

    const n = config.axes.length

    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block max-w-full h-auto"
        role="img"
        aria-label={config.title}
      >
        <rect width="100%" height="100%" fill={config.backgroundColor} />
        {config.title ? (
          <text
            x={width / 2}
            y={28}
            textAnchor="middle"
            fill={config.textColor}
            fontSize={fontSize * 1.45}
            fontWeight={600}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            letterSpacing="0.04em"
          >
            {config.title}
          </text>
        ) : null}

        <RadarGrid
          cx={cx}
          cy={cy}
          radius={dataRadius}
          axisCount={n}
          levels={config.levels}
          gridColor={config.gridColor}
        />
        {n > 0 ? (
          <RadarDatasetPaths
            config={config}
            cx={cx}
            cy={cy}
            dataRadius={dataRadius}
          />
        ) : null}
        <RadarSectionArcs
          config={config}
          cx={cx}
          cy={cy}
          arcRadius={dataRadius}
        />
        <RadarSectionTitleTexts
          config={config}
          cx={cx}
          cy={cy}
          titleRadius={sectionTitleRadius}
          fontSize={fontSize}
        />

        {config.footnotes?.length ? (
          <g className="radar-footnotes">
            {config.footnotes.map((line, i) => (
              <text
                key={i}
                x={12}
                y={height - 10 - (config.footnotes!.length - 1 - i) * (fontSize * 1.1)}
                textAnchor="start"
                fill={config.textColor}
                fontSize={fontSize * 0.85}
                opacity={0.65}
                fontFamily="ui-monospace, monospace"
              >
                {line}
              </text>
            ))}
          </g>
        ) : null}
      </svg>
    )
  },
)
