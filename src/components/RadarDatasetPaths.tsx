import type { RadarConfig } from '../types/radar'
import { datasetPolygonPath } from '../utils/radarGeometry'

type Props = {
  config: RadarConfig
  cx: number
  cy: number
  dataRadius: number
}

export function RadarDatasetPaths({ config, cx, cy, dataRadius }: Props) {
  const maxValues = config.axes.map((a) => a.maxValue)
  const n = config.axes.length

  return (
    <g className="radar-datasets">
      {config.datasets.map((ds) => {
        const values = [...ds.values].slice(0, n)
        while (values.length < n) values.push(0)
        const path = datasetPolygonPath(cx, cy, dataRadius, values, maxValues)
        const stroke = ds.strokeColor ?? ds.color
        const fill = ds.fillColor ?? ds.color
        const sw = ds.strokeWidth ?? 1.25
        const fo = ds.fillOpacity ?? 0.12
        return (
          <path
            key={ds.id}
            d={path}
            fill={fill}
            fillOpacity={fo}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )
      })}
    </g>
  )
}
