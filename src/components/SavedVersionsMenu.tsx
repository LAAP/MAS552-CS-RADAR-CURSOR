import { useEffect, useRef, useState } from 'react'
import type { RadarConfig } from '../types/radar'
import { normalizeRadarConfig } from '../utils/configNormalize'
import {
  loadSavedVersions,
  removeSavedVersion,
  saveCurrentVersion,
  SAVED_VERSIONS_MAX,
  type SavedRadarVersion,
} from '../utils/savedVersionsStorage'

type Props = {
  config: RadarConfig
  onLoadVersion: (config: RadarConfig) => void
}

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function SavedVersionsMenu({ config, onLoadVersion }: Props) {
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<SavedRadarVersion[]>(() =>
    loadSavedVersions(),
  )
  const [name, setName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const refresh = () => setVersions(loadSavedVersions())

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const onSave = () => {
    setMessage(null)
    const result = saveCurrentVersion(name, config)
    if (!result.ok) {
      setMessage(result.error)
      return
    }
    setName('')
    refresh()
    setMessage('Saved.')
    window.setTimeout(() => setMessage(null), 2000)
  }

  const onLoad = (v: SavedRadarVersion) => {
    onLoadVersion(normalizeRadarConfig(v.config))
    setOpen(false)
    setMessage(null)
  }

  const onRemove = (id: string) => {
    removeSavedVersion(id)
    refresh()
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className="px-2.5 py-1.5 rounded-md text-xs border border-violet-500/35 bg-violet-500/10 hover:bg-violet-500/20 text-violet-200"
        onClick={() => {
          setOpen((o) => !o)
          setMessage(null)
          if (!open) refresh()
        }}
      >
        Saved versions ({versions.length}/{SAVED_VERSIONS_MAX})
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full mt-1.5 w-[min(100vw-2rem,20rem)] z-[100] rounded-lg border border-white/15 bg-[#0c0c0f] shadow-xl shadow-black/50 p-3 text-left"
          role="dialog"
          aria-label="Saved radar versions"
        >
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
            Save current chart
          </div>
          <div className="flex gap-1.5 mb-2">
            <input
              type="text"
              className="flex-1 min-w-0 rounded border border-white/10 bg-black/40 text-zinc-100 text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
              placeholder="Version name…"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSave()
              }}
            />
            <button
              type="button"
              disabled={!name.trim() || versions.length >= SAVED_VERSIONS_MAX}
              className="shrink-0 px-2.5 py-1.5 rounded-md text-xs font-medium bg-violet-600/85 hover:bg-violet-600 text-white disabled:opacity-40 disabled:pointer-events-none"
              onClick={onSave}
            >
              Save
            </button>
          </div>
          {versions.length >= SAVED_VERSIONS_MAX ? (
            <p className="text-[10px] text-amber-400/90 mb-2">
              Limit reached — remove a version to save a new one.
            </p>
          ) : null}
          {message ? (
            <p className="text-[10px] text-zinc-400 mb-2">{message}</p>
          ) : null}

          <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 mt-3 border-t border-white/10 pt-2">
            Your versions
          </div>
          {versions.length === 0 ? (
            <p className="text-xs text-zinc-500 py-2">No saved versions yet.</p>
          ) : (
            <ul className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="rounded border border-white/5 bg-white/[0.03] p-2 text-xs"
                >
                  <div className="font-medium text-zinc-200 truncate" title={v.name}>
                    {v.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 mb-1.5">
                    {formatWhen(v.savedAt)}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      className="px-2 py-1 rounded text-[10px] bg-emerald-600/70 hover:bg-emerald-600 text-white"
                      onClick={() => onLoad(v)}
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded text-[10px] border border-red-500/40 text-red-300 hover:bg-red-500/10"
                      onClick={() => onRemove(v.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
