import type {
  LegendPosition,
  RadarAxis,
  RadarConfig,
  RadarDataset,
  RadarSection,
} from '../types/radar'
type Props = {
  config: RadarConfig
  onChange: (next: RadarConfig) => void
  /** When set with lockProposedValues, per-axis value inputs for that dataset are disabled */
  proposedDatasetIndex?: number
  lockProposedValues?: boolean
}

const inputCls =
  'w-full rounded border border-white/10 bg-black/30 text-zinc-100 text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500/40'
const labelCls = 'text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5'
const cardCls = 'rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-2'

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function ControlPanel({
  config,
  onChange,
  proposedDatasetIndex,
  lockProposedValues,
}: Props) {
  const n = config.axes.length

  const patch = (partial: Partial<RadarConfig>) => {
    onChange({ ...config, ...partial })
  }

  const setAxis = (index: number, partial: Partial<RadarAxis>) => {
    const axes = config.axes.map((a, i) =>
      i === index ? { ...a, ...partial } : a,
    )
    onChange({ ...config, axes })
  }

  const addAxis = () => {
    const axis: RadarAxis = {
      id: nextId('axis'),
      label: 'New indicator',
      maxValue: 100,
      kpiLatex: 'x_i',
    }
    const axes = [...config.axes, axis]
    const datasets = config.datasets.map((d) => ({
      ...d,
      values: [...d.values, 50],
    }))
    onChange({ ...config, axes, datasets })
  }

  const removeAxis = (index: number) => {
    if (n <= 1) return
    const axes = config.axes.filter((_, i) => i !== index)
    const datasets = config.datasets.map((d) => ({
      ...d,
      values: d.values.filter((_, i) => i !== index),
    }))
    onChange({ ...config, axes, datasets })
  }

  const setDataset = (index: number, partial: Partial<RadarDataset>) => {
    const datasets = config.datasets.map((d, i) =>
      i === index ? { ...d, ...partial } : d,
    )
    onChange({ ...config, datasets })
  }

  const setDatasetValue = (di: number, vi: number, value: number) => {
    const datasets = config.datasets.map((d, i) => {
      if (i !== di) return d
      const values = [...d.values]
      values[vi] = value
      return { ...d, values }
    })
    onChange({ ...config, datasets })
  }

  const addDataset = () => {
    const ds: RadarDataset = {
      id: nextId('ds'),
      name: 'Scenario',
      color: '#94a3b8',
      strokeWidth: 1.25,
      fillOpacity: 0.1,
      values: Array.from({ length: n }, () => 50),
    }
    onChange({ ...config, datasets: [...config.datasets, ds] })
  }

  const removeDataset = (index: number) => {
    if (config.datasets.length <= 1) return
    onChange({
      ...config,
      datasets: config.datasets.filter((_, i) => i !== index),
    })
  }

  const setSection = (index: number, partial: Partial<RadarSection>) => {
    const sections = (config.sections ?? []).map((s, i) =>
      i === index ? { ...s, ...partial } : s,
    )
    onChange({ ...config, sections })
  }

  const addSection = () => {
    const sec: RadarSection = {
      id: nextId('sec'),
      title: 'Section',
      startAxisIndex: 0,
      endAxisIndex: Math.max(0, n - 1),
    }
    onChange({ ...config, sections: [...(config.sections ?? []), sec] })
  }

  const removeSection = (index: number) => {
    const sections = (config.sections ?? []).filter((_, i) => i !== index)
    onChange({ ...config, sections: sections.length ? sections : undefined })
  }

  const setFootnote = (i: number, text: string) => {
    const footnotes = [...(config.footnotes ?? [])]
    footnotes[i] = text
    onChange({ ...config, footnotes })
  }

  const addFootnote = () => {
    onChange({
      ...config,
      footnotes: [...(config.footnotes ?? []), 'Note'],
    })
  }

  const applyTheme = (theme: 'dark' | 'light') => {
    if (theme === 'dark') {
      patch({
        theme: 'dark',
        backgroundColor: '#0a0a0c',
        gridColor: 'rgba(255,255,255,0.14)',
        textColor: '#f4f4f5',
      })
    } else {
      patch({
        theme: 'light',
        backgroundColor: '#f8fafc',
        gridColor: 'rgba(15,23,42,0.12)',
        textColor: '#0f172a',
      })
    }
  }

  return (
    <div className="space-y-3 text-left overflow-y-auto max-h-[calc(100vh-7rem)] pr-1">
      <div className={cardCls}>
        <span className={labelCls}>Chart</span>
        <input
          className={inputCls}
          value={config.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className={labelCls}>Theme</span>
            <select
              className={inputCls}
              value={config.theme ?? 'dark'}
              onChange={(e) =>
                applyTheme(e.target.value as 'dark' | 'light')
              }
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div>
            <span className={labelCls}>Font size (px)</span>
            <input
              type="number"
              min={8}
              max={22}
              className={inputCls}
              value={config.fontSizePx ?? 11}
              onChange={(e) =>
                patch({ fontSizePx: Number(e.target.value) || 11 })
              }
            />
          </div>
          <div>
            <span className={labelCls}>Zoom</span>
            <input
              type="number"
              min={0.5}
              max={2}
              step={0.05}
              className={inputCls}
              value={config.zoom ?? 1}
              onChange={(e) =>
                patch({ zoom: Number(e.target.value) || 1 })
              }
            />
          </div>
          <div>
            <span className={labelCls}>Grid levels</span>
            <input
              type="number"
              min={2}
              max={12}
              className={inputCls}
              value={config.levels}
              onChange={(e) =>
                patch({ levels: Math.max(2, Number(e.target.value) || 5) })
              }
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            checked={config.showFormulas !== false}
            onChange={(e) => patch({ showFormulas: e.target.checked })}
          />
          Show KPI math (KaTeX)
        </label>
        <div>
          <span className={labelCls}>Label style (with short label)</span>
          <select
            className={inputCls}
            value={config.labelStyle ?? 'both'}
            onChange={(e) =>
              patch({
                labelStyle: e.target.value as RadarConfig['labelStyle'],
              })
            }
          >
            <option value="full">Full label only</option>
            <option value="short">Short only</option>
            <option value="both">Short · full</option>
          </select>
        </div>
        <div>
          <span className={labelCls}>KPI text vs spoke</span>
          <select
            className={inputCls}
            value={config.kpiLabelOrientation ?? 'radial'}
            onChange={(e) =>
              patch({
                kpiLabelOrientation: e.target.value as
                  | 'radial'
                  | 'tangent',
              })
            }
          >
            <option value="radial">Parallel to spoke (reference board)</option>
            <option value="tangent">Perpendicular to spoke (around circle)</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className={labelCls}>KPI gap from plot (px)</span>
            <input
              type="number"
              min={0}
              max={80}
              step={1}
              className={inputCls}
              placeholder="auto"
              value={config.labelPlotGapPx ?? ''}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '') {
                  patch({ labelPlotGapPx: undefined })
                  return
                }
                const n = Number(raw)
                patch({
                  labelPlotGapPx: Number.isFinite(n) ? n : undefined,
                })
              }}
            />
          </div>
          <div>
            <span className={labelCls}>Section title margin (px)</span>
            <input
              type="number"
              min={0}
              max={120}
              step={1}
              className={inputCls}
              placeholder="auto"
              value={config.sectionTitleGapPx ?? ''}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '') {
                  patch({ sectionTitleGapPx: undefined })
                  return
                }
                const n = Number(raw)
                patch({
                  sectionTitleGapPx: Number.isFinite(n) ? n : undefined,
                })
              }}
            />
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 leading-snug">
          Leave gaps empty for automatic spacing. Increase if labels still crowd the grid or section titles.
        </p>
      </div>

      <div className={cardCls}>
        <span className={labelCls}>Colors</span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className={labelCls}>Background</span>
            <input
              type="color"
              className={`${inputCls} h-8 p-0`}
              value={toHexColor(config.backgroundColor)}
              onChange={(e) => patch({ backgroundColor: e.target.value })}
            />
          </div>
          <div>
            <span className={labelCls}>Grid</span>
            <input
              className={inputCls}
              value={config.gridColor}
              onChange={(e) => patch({ gridColor: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <span className={labelCls}>Text</span>
            <input
              type="color"
              className={`${inputCls} h-8 p-0`}
              value={toHexColor(config.textColor)}
              onChange={(e) => patch({ textColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className={cardCls}>
        <span className={labelCls}>Logo (preview)</span>
        <p className="text-[10px] text-zinc-600 mb-2 leading-snug">
          Bottom-right on the live chart only; not embedded in exported SVG/PNG.
        </p>
        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={config.branding?.showLogo !== false}
            onChange={(e) =>
              patch({
                branding: {
                  ...config.branding,
                  showLogo: e.target.checked,
                },
              })
            }
          />
          Show City Intelligence Lab mark
        </label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <span className={labelCls}>Max width (px)</span>
            <input
              type="number"
              min={48}
              max={320}
              step={1}
              className={inputCls}
              placeholder="120"
              value={config.branding?.logoMaxWidthPx ?? ''}
              onChange={(e) => {
                const raw = e.target.value
                patch({
                  branding: {
                    ...config.branding,
                    logoMaxWidthPx:
                      raw === ''
                        ? undefined
                        : Number.isFinite(Number(raw))
                          ? Number(raw)
                          : config.branding?.logoMaxWidthPx,
                  },
                })
              }}
            />
          </div>
          <div>
            <span className={labelCls}>Opacity</span>
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              className={inputCls}
              placeholder="1"
              value={
                config.branding?.logoOpacity === undefined
                  ? ''
                  : config.branding.logoOpacity
              }
              onChange={(e) => {
                const raw = e.target.value
                patch({
                  branding: {
                    ...config.branding,
                    logoOpacity:
                      raw === ''
                        ? undefined
                        : Number.isFinite(Number(raw))
                          ? Math.min(1, Math.max(0, Number(raw)))
                          : config.branding?.logoOpacity,
                  },
                })
              }}
            />
          </div>
        </div>
        <div>
          <span className={labelCls}>Image URL or path</span>
          <input
            className={inputCls}
            placeholder="/city-intelligence-lab-logo.png"
            value={config.branding?.logoSrc ?? ''}
            onChange={(e) =>
              patch({
                branding: {
                  ...config.branding,
                  logoSrc: e.target.value.trim() || undefined,
                },
              })
            }
          />
        </div>
      </div>

      <div className={cardCls}>
        <div className="flex justify-between items-center">
          <span className={labelCls}>Axes ({n})</span>
          <button
            type="button"
            className="text-xs text-cyan-400 hover:text-cyan-300"
            onClick={addAxis}
          >
            + Add axis
          </button>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {config.axes.map((axis, i) => (
            <div
              key={axis.id}
              className="rounded border border-white/5 p-2 space-y-1.5 bg-black/20"
            >
              <div className="flex justify-between gap-1">
                <span className="text-[10px] text-zinc-600">#{i + 1}</span>
                <button
                  type="button"
                  className="text-[10px] text-red-400/90 hover:text-red-300"
                  onClick={() => removeAxis(i)}
                >
                  Remove
                </button>
              </div>
              <input
                className={inputCls}
                placeholder="Label"
                value={axis.label}
                onChange={(e) => setAxis(i, { label: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Short label (optional)"
                value={axis.shortLabel ?? ''}
                onChange={(e) =>
                  setAxis(i, { shortLabel: e.target.value || undefined })
                }
              />
              <input
                className={inputCls}
                placeholder={'KPI KaTeX (inline), e.g. \\rho_r'}
                value={axis.kpiLatex ?? axis.formula ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  setAxis(i, {
                    kpiLatex: v || undefined,
                    ...(v ? { formula: undefined } : {}),
                  })
                }}
              />
              <textarea
                className={`${inputCls} min-h-[52px] resize-y font-mono`}
                rows={2}
                placeholder={'Display KaTeX, e.g. D_r = \\frac{N_u}{A}'}
                spellCheck={false}
                value={axis.formulaLatex ?? ''}
                onChange={(e) =>
                  setAxis(i, {
                    formulaLatex: e.target.value || undefined,
                  })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className={labelCls}>Max</span>
                  <input
                    type="number"
                    className={inputCls}
                    value={axis.maxValue}
                    onChange={(e) =>
                      setAxis(i, { maxValue: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div>
                  <span className={labelCls}>Group</span>
                  <input
                    className={inputCls}
                    placeholder="tag"
                    value={axis.group ?? ''}
                    onChange={(e) =>
                      setAxis(i, { group: e.target.value || undefined })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                <span className={labelCls}>Axis label</span>
                <button
                  type="button"
                  className={`text-xs px-2.5 py-1 rounded border shrink-0 ${
                    axis.flipLabel
                      ? 'border-amber-400/60 bg-amber-500/15 text-amber-200'
                      : 'border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                  onClick={() =>
                    setAxis(i, {
                      flipLabel: axis.flipLabel ? undefined : true,
                    })
                  }
                >
                  {axis.flipLabel ? 'Flipped · click to reset' : 'Flip'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={cardCls}>
        <div className="flex justify-between items-center">
          <span className={labelCls}>Datasets</span>
          <button
            type="button"
            className="text-xs text-cyan-400 hover:text-cyan-300"
            onClick={addDataset}
          >
            + Add
          </button>
        </div>
        {config.datasets.map((ds, di) => (
          <div
            key={ds.id}
            className="rounded border border-white/5 p-2 space-y-2 bg-black/20"
          >
            <div className="flex justify-between gap-2">
              <input
                className={inputCls}
                value={ds.name}
                onChange={(e) => setDataset(di, { name: e.target.value })}
              />
              <button
                type="button"
                className="text-xs text-red-400/90 shrink-0"
                onClick={() => removeDataset(di)}
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className={labelCls}>Stroke</span>
                <input
                  type="color"
                  className={`${inputCls} h-7 p-0`}
                  value={toHexColor(ds.strokeColor ?? ds.color)}
                  onChange={(e) =>
                    setDataset(di, { strokeColor: e.target.value })
                  }
                />
              </div>
              <div>
                <span className={labelCls}>Fill</span>
                <input
                  type="color"
                  className={`${inputCls} h-7 p-0`}
                  value={toHexColor(ds.fillColor ?? ds.color)}
                  onChange={(e) =>
                    setDataset(di, { fillColor: e.target.value })
                  }
                />
              </div>
              <div>
                <span className={labelCls}>Line</span>
                <input
                  type="number"
                  min={0.5}
                  max={6}
                  step={0.25}
                  className={inputCls}
                  value={ds.strokeWidth ?? 1.25}
                  onChange={(e) =>
                    setDataset(di, {
                      strokeWidth: Number(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div>
                <span className={labelCls}>Fill α</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.05}
                  className={inputCls}
                  value={ds.fillOpacity ?? 0.12}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    setDataset(di, {
                      fillOpacity: Number.isFinite(v) ? v : 0,
                    })
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 max-h-40 overflow-y-auto">
              {config.axes.map((ax, vi) => {
                const valueLocked =
                  Boolean(lockProposedValues) &&
                  proposedDatasetIndex !== undefined &&
                  di === proposedDatasetIndex
                return (
                  <label
                    key={ax.id}
                    className="flex items-center gap-1 text-[10px] text-zinc-500"
                  >
                    <span className="truncate w-20" title={ax.label}>
                      {ax.shortLabel ?? ax.label.slice(0, 8)}
                    </span>
                    <input
                      type="number"
                      className={`${inputCls} py-0.5 ${valueLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={ds.values[vi] ?? 0}
                      disabled={valueLocked}
                      onChange={(e) =>
                        setDatasetValue(di, vi, Number(e.target.value) || 0)
                      }
                    />
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={cardCls}>
        <div className="flex justify-between items-center">
          <span className={labelCls}>Sections</span>
          <button
            type="button"
            className="text-xs text-cyan-400 hover:text-cyan-300"
            onClick={addSection}
          >
            + Add
          </button>
        </div>
        {(config.sections ?? []).map((sec, si) => (
          <div
            key={sec.id}
            className="rounded border border-white/5 p-2 space-y-1 bg-black/20"
          >
            <div className="flex justify-between">
              <input
                className={inputCls}
                value={sec.title}
                onChange={(e) => setSection(si, { title: e.target.value })}
              />
              <button
                type="button"
                className="text-xs text-red-400/90"
                onClick={() => removeSection(si)}
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className={labelCls}>Start idx</span>
                <input
                  type="number"
                  min={0}
                  max={n - 1}
                  className={inputCls}
                  value={sec.startAxisIndex}
                  onChange={(e) =>
                    setSection(si, {
                      startAxisIndex: Math.min(
                        n - 1,
                        Math.max(0, Number(e.target.value) || 0),
                      ),
                    })
                  }
                />
              </div>
              <div>
                <span className={labelCls}>End idx</span>
                <input
                  type="number"
                  min={0}
                  max={n - 1}
                  className={inputCls}
                  value={sec.endAxisIndex}
                  onChange={(e) =>
                    setSection(si, {
                      endAxisIndex: Math.min(
                        n - 1,
                        Math.max(0, Number(e.target.value) || 0),
                      ),
                    })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={cardCls}>
        <span className={labelCls}>Legend</span>
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={config.legend?.enabled !== false}
            onChange={(e) =>
              patch({
                legend: {
                  ...config.legend,
                  enabled: e.target.checked,
                  position:
                    config.legend?.position ?? ('top-right' as LegendPosition),
                },
              })
            }
          />
          Enabled
        </label>
        <div>
          <span className={labelCls}>Position</span>
          <select
            className={inputCls}
            value={config.legend?.position ?? 'top-right'}
            onChange={(e) =>
              patch({
                legend: {
                  enabled: config.legend?.enabled ?? true,
                  position: e.target.value as LegendPosition,
                },
              })
            }
          >
            <option value="top-right">Top right</option>
            <option value="top-left">Top left</option>
            <option value="bottom-right">Bottom right</option>
            <option value="bottom-left">Bottom left</option>
          </select>
        </div>
      </div>

      <div className={cardCls}>
        <div className="flex justify-between items-center">
          <span className={labelCls}>Footnotes</span>
          <button
            type="button"
            className="text-xs text-cyan-400 hover:text-cyan-300"
            onClick={addFootnote}
          >
            + Add
          </button>
        </div>
        {(config.footnotes ?? []).map((line, i) => (
          <input
            key={i}
            className={inputCls}
            value={line}
            onChange={(e) => setFootnote(i, e.target.value)}
          />
        ))}
      </div>

      <button
        type="button"
        className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 border border-white/10 rounded-md"
        onClick={() =>
          onChange({
            ...config,
            labelOffsets: {},
          })
        }
      >
        Reset label drag offsets
      </button>
    </div>
  )
}

/** Color `<input type="color">` needs #rrggbb; fall back if value is rgba etc. */
function toHexColor(css: string): string {
  const t = css.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(t)) return t
  if (/^#[0-9a-fA-F]{3}$/.test(t)) {
    const h = t.slice(1)
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
  }
  return '#38bdf8'
}
