import type { RadarConfig, RadarDataset } from '../types/radar'
import { RADAR_CONFIG_DEFAULTS } from '../types/radar'

/** Trim or pad dataset values to match `axisCount` using last value or 0. */
export function syncDatasetValues(
  datasets: RadarDataset[],
  axisCount: number,
): RadarDataset[] {
  return datasets.map((d) => {
    const v = [...d.values]
    while (v.length < axisCount) {
      v.push(v[v.length - 1] ?? 0)
    }
    if (v.length > axisCount) v.length = axisCount
    return { ...d, values: v }
  })
}

/**
 * Fill missing fields after JSON import / API response so rendering is stable.
 */
export function normalizeRadarConfig(input: Partial<RadarConfig>): RadarConfig {
  const axes = input.axes ?? []
  const n = axes.length
  const datasets = syncDatasetValues(input.datasets ?? [], n)

  const merged: RadarConfig = {
    title: input.title ?? 'Radar chart',
    backgroundColor: input.backgroundColor ?? '#0a0a0c',
    gridColor: input.gridColor ?? 'rgba(255,255,255,0.14)',
    textColor: input.textColor ?? '#f4f4f5',
    centerX: input.centerX,
    centerY: input.centerY,
    radius: input.radius,
    levels: input.levels ?? 5,
    axes,
    datasets,
    sections: input.sections,
    footnotes: input.footnotes,
    showFormulas: input.showFormulas ?? RADAR_CONFIG_DEFAULTS.showFormulas,
    fontSizePx: input.fontSizePx ?? RADAR_CONFIG_DEFAULTS.fontSizePx,
    theme: input.theme ?? RADAR_CONFIG_DEFAULTS.theme,
    labelOffsets: input.labelOffsets,
    zoom: input.zoom ?? RADAR_CONFIG_DEFAULTS.zoom,
    kpiLabelOrientation:
      input.kpiLabelOrientation ?? RADAR_CONFIG_DEFAULTS.kpiLabelOrientation,
    labelPlotGapPx: input.labelPlotGapPx,
    sectionTitleGapPx: input.sectionTitleGapPx,
    labelStyle: input.labelStyle,
    legend: {
      enabled: input.legend?.enabled ?? true,
      position: input.legend?.position ?? 'top-right',
    },
    branding: input.branding,
  }

  return merged
}
