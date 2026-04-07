import { useCallback, useState } from 'react'
import type { RadarConfig } from '../types/radar'
import {
  downloadJson,
  downloadPngFromSvg,
  downloadSvgElement,
} from '../utils/exportUtils'

type Props = {
  svgRef: React.RefObject<SVGSVGElement | null>
  config: RadarConfig
}

export function ExportButtons({ svgRef, config }: Props) {
  const [busy, setBusy] = useState(false)

  const onSvg = useCallback(() => {
    const el = svgRef.current
    if (!el) return
    downloadSvgElement(el, 'radar-chart.svg')
  }, [svgRef])

  const onPng = useCallback(async () => {
    const el = svgRef.current
    if (!el) return
    setBusy(true)
    try {
      await downloadPngFromSvg(el, 'radar-chart.png', 3)
    } finally {
      setBusy(false)
    }
  }, [svgRef])

  const onJson = useCallback(() => {
    downloadJson(config, 'radar-config.json')
  }, [config])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="px-3 py-1.5 rounded-md text-sm font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200"
        onClick={onSvg}
      >
        Export SVG
      </button>
      <button
        type="button"
        disabled={busy}
        className="px-3 py-1.5 rounded-md text-sm font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200 disabled:opacity-50"
        onClick={() => void onPng()}
      >
        {busy ? 'PNG…' : 'Export PNG'}
      </button>
      <button
        type="button"
        className="px-3 py-1.5 rounded-md text-sm font-medium border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200"
        onClick={onJson}
      >
        Export JSON
      </button>
    </div>
  )
}
