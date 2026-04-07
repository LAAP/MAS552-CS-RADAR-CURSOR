import type { PlaybackMode } from '../types/playback'

type Props = {
  durationSec: number
  setDurationSec: (v: number) => void
  playbackMode: PlaybackMode
  onTimePrimary: () => void
  onPauseToggle: () => void
  onReset: () => void
  onReplay: () => void
  hasProposed: boolean
}

export function TimeControls({
  durationSec,
  setDurationSec,
  playbackMode,
  onTimePrimary,
  onPauseToggle,
  onReset,
  onReplay,
  hasProposed,
}: Props) {
  const isRunning = playbackMode === 'running'
  const isPaused = playbackMode === 'paused'
  const playbackActive = playbackMode !== 'off'
  const canControl = hasProposed

  const baseBtn =
    'px-2.5 py-1.5 rounded-md text-xs border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={`${baseBtn} border-indigo-400/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-100`}
        onClick={onTimePrimary}
        disabled={!canControl}
        title={
          !hasProposed
            ? 'Needs a “Proposed Site” dataset'
            : playbackActive
              ? 'Stop animation and return to editable chart'
              : durationSec <= 0
                ? 'Set duration above 0s to run an animation (0s = chart already shows targets)'
                : 'Play: animate Proposed from Existing to current targets'
        }
      >
        {playbackActive ? 'Stop' : 'Time'}
      </button>
      <button
        type="button"
        className={baseBtn}
        onClick={onPauseToggle}
        disabled={!canControl || !playbackActive}
        title={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </button>
      <button
        type="button"
        className={baseBtn}
        onClick={onReset}
        disabled={!canControl || !playbackActive}
        title="During playback: jump back to Existing Site start and keep playing"
      >
        Reset
      </button>
      <button
        type="button"
        className={baseBtn}
        onClick={onReplay}
        disabled={!canControl}
        title="Replay from start"
      >
        Replay
      </button>

      <div className="flex items-center gap-2 pl-1">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">
          Duration
        </span>
        <input
          type="range"
          min={0}
          max={60}
          step={1}
          value={durationSec}
          onChange={(e) => setDurationSec(Number(e.target.value))}
          className="w-[120px] accent-indigo-400"
          disabled={isRunning}
          title={
            isRunning ? 'Pause or stop to adjust duration' : 'Animation duration (0 = instant)'
          }
        />
        <span className="text-[10px] tabular-nums text-zinc-400 w-[46px] text-right">
          {durationSec}s
        </span>
      </div>
    </div>
  )
}

