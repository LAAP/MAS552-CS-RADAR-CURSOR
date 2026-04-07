import { useState } from 'react'
import type { RadarConfig } from '../types/radar'
import { normalizeRadarConfig } from '../utils/configNormalize'

type Props = {
  config: RadarConfig
  onApply: (c: RadarConfig) => void
  /** When true, Apply/Sync disabled and textarea read-only (e.g. during Time animation) */
  lockEditing?: boolean
}

/**
 * Raw JSON editor with validation. Draft text is local; use "Sync from chart"
 * to pull the latest live config from the control panel / imports.
 */
export function JsonEditor({ config, onApply, lockEditing }: Props) {
  const [text, setText] = useState(() => JSON.stringify(config, null, 2))
  const [error, setError] = useState<string | null>(null)

  const syncFromChart = () => {
    setText(JSON.stringify(config, null, 2))
    setError(null)
  }

  const apply = () => {
    try {
      const parsed = JSON.parse(text) as Partial<RadarConfig>
      const norm = normalizeRadarConfig(parsed)
      setError(null)
      setText(JSON.stringify(norm, null, 2))
      onApply(norm)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-2">
      <div className="flex flex-wrap gap-2 shrink-0">
        <button
          type="button"
          onClick={apply}
          disabled={lockEditing}
          title={lockEditing ? 'Stop Time animation to edit JSON' : undefined}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-600/80 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:hover:bg-emerald-600/80"
        >
          Apply JSON
        </button>
        <button
          type="button"
          onClick={syncFromChart}
          disabled={lockEditing}
          title={lockEditing ? 'Stop Time animation to sync' : undefined}
          className="px-3 py-1.5 rounded-md text-sm font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200 disabled:opacity-50 disabled:hover:bg-white/5"
        >
          Sync from chart
        </button>
        {error ? (
          <span className="text-xs text-red-400 self-center truncate" title={error}>
            {error}
          </span>
        ) : null}
      </div>
      <textarea
        className={`flex-1 min-h-[200px] w-full rounded-md border border-white/10 bg-black/40 text-zinc-200 font-mono text-xs p-3 resize-y focus:outline-none focus:ring-1 focus:ring-cyan-500/50 ${lockEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
        spellCheck={false}
        readOnly={lockEditing}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  )
}
