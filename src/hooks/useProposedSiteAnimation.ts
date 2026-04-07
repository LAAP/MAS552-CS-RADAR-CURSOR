import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PlaybackMode } from '../types/playback'
import type { RadarConfig } from '../types/radar'
import { resolveExistingProposedIndices } from '../utils/datasetRoles'
import {
  makeAxisAnimParams,
  organicLerpValues,
} from '../utils/organicInterpolation'

/**
 * Temporary overlay animation for the “Proposed Site” dataset only.
 * Source of truth for editable values remains `config`; chart uses `renderConfig`.
 */
export function useProposedSiteAnimation(config: RadarConfig) {
  const [durationSec, setDurationSec] = useState(30)
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('off')
  const [animatedProposedValues, setAnimatedProposedValues] = useState<
    number[] | null
  >(null)

  const startTimeMsRef = useRef(0)
  const pausedAtMsRef = useRef<number | null>(null)
  const startValuesRef = useRef<number[] | null>(null)
  const targetValuesRef = useRef<number[] | null>(null)
  const axisParamsRef = useRef<ReturnType<typeof makeAxisAnimParams> | null>(
    null,
  )

  const { existingIndex, proposedIndex } = useMemo(
    () => resolveExistingProposedIndices(config.datasets),
    [config.datasets],
  )
  const hasProposedPair = existingIndex >= 0 && proposedIndex >= 0

  const stopPlayback = useCallback(() => {
    pausedAtMsRef.current = null
    startValuesRef.current = null
    targetValuesRef.current = null
    axisParamsRef.current = null
    setAnimatedProposedValues(null)
    setPlaybackMode('off')
  }, [])

  const startPlayback = useCallback(() => {
    if (!hasProposedPair) return
    const n = config.axes.length
    const existing = config.datasets[existingIndex]?.values ?? []
    const proposed = config.datasets[proposedIndex]?.values ?? []
    const start = existing.slice(0, n)
    while (start.length < n) start.push(0)
    const target = proposed.slice(0, n)
    while (target.length < n) target.push(0)

    const durationMs = durationSec * 1000
    if (durationMs <= 0) return

    startValuesRef.current = start
    targetValuesRef.current = target
    startTimeMsRef.current = performance.now()
    pausedAtMsRef.current = null

    const seedString = `${config.axes.map((a) => a.id).join('|')}|${JSON.stringify(target)}|${durationSec}`
    axisParamsRef.current = makeAxisAnimParams(
      config.axes.map((a) => a.id),
      seedString,
    )

    setAnimatedProposedValues(start)
    setPlaybackMode('running')
  }, [
    config.axes,
    config.datasets,
    durationSec,
    existingIndex,
    hasProposedPair,
    proposedIndex,
  ])

  const onTimePrimary = useCallback(() => {
    if (!hasProposedPair) return
    if (playbackMode !== 'off') {
      stopPlayback()
      return
    }
    startPlayback()
  }, [hasProposedPair, playbackMode, startPlayback, stopPlayback])

  const onPauseToggle = useCallback(() => {
    if (playbackMode === 'running') {
      pausedAtMsRef.current = performance.now()
      setPlaybackMode('paused')
      return
    }
    if (playbackMode === 'paused') {
      const pausedAt = pausedAtMsRef.current
      if (pausedAt != null) {
        const elapsedBeforePause = pausedAt - startTimeMsRef.current
        startTimeMsRef.current = performance.now() - elapsedBeforePause
      }
      pausedAtMsRef.current = null
      setPlaybackMode('running')
    }
  }, [playbackMode])

  const onResetPlaybackPosition = useCallback(() => {
    if (playbackMode === 'off') return
    const start = startValuesRef.current
    const target = targetValuesRef.current
    const params = axisParamsRef.current
    if (!start || !target || !params) return

    startTimeMsRef.current = performance.now()
    pausedAtMsRef.current = null
    setAnimatedProposedValues([...start])
    setPlaybackMode('running')
  }, [playbackMode])

  const onReplay = useCallback(() => {
    if (!hasProposedPair) return
    stopPlayback()
    startPlayback()
  }, [hasProposedPair, startPlayback, stopPlayback])

  useEffect(() => {
    if (playbackMode !== 'running') return
    let raf = 0

    const tick = () => {
      const start = startValuesRef.current
      const target = targetValuesRef.current
      const params = axisParamsRef.current
      if (!start || !target || !params) {
        stopPlayback()
        return
      }

      const durationMs = durationSec * 1000
      if (durationMs <= 0) {
        stopPlayback()
        return
      }

      const now = performance.now()
      const t = Math.max(
        0,
        Math.min(1, (now - startTimeMsRef.current) / durationMs),
      )

      if (t >= 1) {
        stopPlayback()
        return
      }

      setAnimatedProposedValues(organicLerpValues(start, target, t, params))
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [durationSec, playbackMode, stopPlayback])

  const renderConfig = useMemo(() => {
    if (playbackMode === 'off' || !animatedProposedValues) return config
    if (proposedIndex < 0) return config

    const datasets = config.datasets.map((d, i) =>
      i === proposedIndex ? { ...d, values: animatedProposedValues } : d,
    )
    return { ...config, datasets }
  }, [animatedProposedValues, config, playbackMode, proposedIndex])

  const playbackActive = playbackMode !== 'off'

  return {
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
  }
}
