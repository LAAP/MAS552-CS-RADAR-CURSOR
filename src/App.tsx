import { useCallback, useEffect, useRef, useState } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { ExportButtons } from './components/ExportButtons'
import { JsonEditor } from './components/JsonEditor'
import { BrandLogo } from './components/BrandLogo'
import { RadarChartCanvas } from './components/RadarChartCanvas'
import { RadarLegend } from './components/RadarLegend'
import { SavedVersionsMenu } from './components/SavedVersionsMenu'
import { TimeControls } from './components/TimeControls'
import { demoRadarConfig, minimalPresetConfig } from './data/demoRadarConfig'
import { useProposedSiteAnimation } from './hooks/useProposedSiteAnimation'
import type { RadarConfig } from './types/radar'
import { normalizeRadarConfig } from './utils/configNormalize'
import { fetchMockRadarConfig } from './utils/mockBackend'

export default function App() {
  const [config, setConfig] = useState<RadarConfig>(() =>
    normalizeRadarConfig(demoRadarConfig),
  )
  const [showJson, setShowJson] = useState(true)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [loadingMock, setLoadingMock] = useState(false)
  const [draggingAxisId, setDraggingAxisId] = useState<string | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewSize, setPreviewSize] = useState({ w: 920, h: 780 })

  const {
    renderConfig,
    proposedIndex,
    hasProposedPair,
    durationSec,
    setDurationSec,
    playbackMode,
    playbackActive,
    onTimePrimary,
    onPauseToggle,
    onResetPlaybackPosition,
    onReplay,
  } = useProposedSiteAnimation(config)

  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const update = () => {
      const cr = el.getBoundingClientRect()
      const w = Math.max(320, Math.floor(cr.width))
      const h = Math.max(380, Math.floor(cr.height))
      setPreviewSize({ w, h })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onLabelOffsetChange = useCallback(
    (axisId: string, offset: { dx: number; dy: number }) => {
      setConfig((c) => ({
        ...c,
        labelOffsets: { ...c.labelOffsets, [axisId]: offset },
      }))
    },
    [],
  )

  const resetDemo = () => setConfig(normalizeRadarConfig(demoRadarConfig))
  const loadMinimal = () =>
    setConfig(normalizeRadarConfig(minimalPresetConfig))

  const applyPastedJson = () => {
    try {
      const parsed = JSON.parse(pasteText) as Partial<RadarConfig>
      setConfig(normalizeRadarConfig(parsed))
      setPasteOpen(false)
      setPasteText('')
    } catch {
      alert('Invalid JSON')
    }
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const text = await f.text()
    try {
      const parsed = JSON.parse(text) as Partial<RadarConfig>
      setConfig(normalizeRadarConfig(parsed))
    } catch {
      alert('Could not parse JSON file')
    }
    e.target.value = ''
  }

  const loadFromMockBackend = async () => {
    setLoadingMock(true)
    try {
      const data = await fetchMockRadarConfig()
      setConfig(data)
    } finally {
      setLoadingMock(false)
    }
  }

  const isDark = (config.theme ?? 'dark') === 'dark'
  const shell = isDark
    ? 'bg-[#050506] text-zinc-200'
    : 'bg-slate-100 text-slate-900'

  return (
    <div className={`min-h-svh flex flex-col ${shell}`}>
      <header className="shrink-0 border-b border-white/10 px-4 py-3 flex flex-wrap items-center gap-3 justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            Radar generator
          </span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 hidden sm:inline">
            Urban analytics
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="px-2.5 py-1.5 rounded-md text-xs border border-white/15 bg-white/5 hover:bg-white/10"
            onClick={() => setShowJson((v) => !v)}
          >
            {showJson ? 'Hide JSON' : 'Show JSON'}
          </button>
          <button
            type="button"
            className="px-2.5 py-1.5 rounded-md text-xs border border-white/15 bg-white/5 hover:bg-white/10"
            onClick={() => setPasteOpen((v) => !v)}
          >
            Paste JSON
          </button>
          <button
            type="button"
            className="px-2.5 py-1.5 rounded-md text-xs border border-white/15 bg-white/5 hover:bg-white/10"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void onFile(e)}
          />
          <button
            type="button"
            disabled={loadingMock}
            className="px-2.5 py-1.5 rounded-md text-xs border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 disabled:opacity-50"
            onClick={() => void loadFromMockBackend()}
          >
            {loadingMock ? 'Loading…' : 'Mock API'}
          </button>
          <button
            type="button"
            className="px-2.5 py-1.5 rounded-md text-xs border border-white/15 bg-white/5 hover:bg-white/10"
            onClick={loadMinimal}
          >
            Preset: minimal
          </button>
          <button
            type="button"
            className="px-2.5 py-1.5 rounded-md text-xs border border-white/15 bg-white/5 hover:bg-white/10"
            onClick={resetDemo}
          >
            Reset demo
          </button>
          <SavedVersionsMenu
            config={config}
            onLoadVersion={(c) => setConfig(c)}
          />
          <TimeControls
            durationSec={durationSec}
            setDurationSec={(v) => setDurationSec(Math.max(0, Math.min(60, v)))}
            playbackMode={playbackMode}
            onTimePrimary={onTimePrimary}
            onPauseToggle={onPauseToggle}
            onReset={onResetPlaybackPosition}
            onReplay={onReplay}
            hasProposed={hasProposedPair}
          />
          <ExportButtons svgRef={svgRef} config={config} />
        </div>
      </header>

      {pasteOpen ? (
        <div className="border-b border-white/10 px-4 py-2 bg-black/30 flex flex-col gap-2 sm:flex-row sm:items-end">
          <textarea
            className="flex-1 min-h-[100px] rounded border border-white/10 bg-black/40 font-mono text-xs p-2 text-zinc-200"
            placeholder="Paste full RadarConfig JSON…"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <button
            type="button"
            className="px-4 py-2 rounded-md text-sm bg-emerald-600/80 hover:bg-emerald-600 text-white shrink-0"
            onClick={applyPastedJson}
          >
            Apply
          </button>
        </div>
      ) : null}

      <main className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 gap-0">
        <aside className="lg:w-[340px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 p-3 overflow-hidden bg-black/15">
          <ControlPanel
            config={config}
            onChange={setConfig}
            proposedDatasetIndex={proposedIndex >= 0 ? proposedIndex : undefined}
            lockProposedValues={playbackActive}
          />
        </aside>

        <section className="flex-1 flex flex-col min-w-0 min-h-0 p-3 gap-3">
          <div
            ref={previewRef}
            className="relative flex-1 min-h-[420px] rounded-xl border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center"
          >
            <RadarChartCanvas
              ref={svgRef}
              config={renderConfig}
              width={previewSize.w}
              height={previewSize.h}
              onLabelOffsetChange={onLabelOffsetChange}
              draggingAxisId={draggingAxisId}
              setDraggingAxisId={setDraggingAxisId}
            />
            <RadarLegend
              config={renderConfig}
              width={previewSize.w}
              margin={14}
              fontSize={config.fontSizePx ?? 11}
            />
            <BrandLogo config={config} isDarkTheme={isDark} />
          </div>
          <p className="text-[10px] text-zinc-500 px-1">
            Tip: drag perimeter labels to nudge position; offsets save in config (
            <code className="text-zinc-400">labelOffsets</code>).
          </p>
        </section>

        {showJson ? (
          <aside className="lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 p-3 bg-black/15 min-h-[200px] lg:min-h-0 flex flex-col">
            <JsonEditor
              config={config}
              onApply={setConfig}
              lockEditing={playbackActive}
            />
          </aside>
        ) : null}
      </main>
    </div>
  )
}
