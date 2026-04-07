import type { RadarConfig } from '../types/radar'
import { normalizeRadarConfig } from './configNormalize'

export const SAVED_VERSIONS_MAX = 10
const STORAGE_KEY = 'radar-generator-saved-versions-v1'

export type SavedRadarVersion = {
  id: string
  name: string
  savedAt: string
  config: RadarConfig
}

function safeParse(raw: string | null): SavedRadarVersion[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data
      .filter(
        (row): row is SavedRadarVersion =>
          row &&
          typeof row === 'object' &&
          typeof (row as SavedRadarVersion).id === 'string' &&
          typeof (row as SavedRadarVersion).name === 'string' &&
          typeof (row as SavedRadarVersion).savedAt === 'string' &&
          (row as SavedRadarVersion).config &&
          typeof (row as SavedRadarVersion).config === 'object',
      )
      .map((row) => ({
        ...row,
        config: normalizeRadarConfig(
          row.config as Partial<RadarConfig>,
        ),
      }))
      .slice(0, SAVED_VERSIONS_MAX)
  } catch {
    return []
  }
}

export function loadSavedVersions(): SavedRadarVersion[] {
  if (typeof localStorage === 'undefined') return []
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

function writeVersions(list: SavedRadarVersion[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export type SaveVersionResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Persist a deep-cloned snapshot. Fails if the name is empty or the cap is reached.
 */
export function saveCurrentVersion(
  name: string,
  config: RadarConfig,
): SaveVersionResult {
  const trimmed = name.trim()
  if (!trimmed) {
    return { ok: false, error: 'Enter a name for this version.' }
  }
  const list = loadSavedVersions()
  if (list.length >= SAVED_VERSIONS_MAX) {
    return {
      ok: false,
      error: `Maximum ${SAVED_VERSIONS_MAX} saved versions. Remove one before saving another.`,
    }
  }
  const snapshot = JSON.parse(JSON.stringify(config)) as RadarConfig
  const next: SavedRadarVersion = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: trimmed,
    savedAt: new Date().toISOString(),
    config: normalizeRadarConfig(snapshot),
  }
  try {
    writeVersions([next, ...list])
    return { ok: true }
  } catch {
    return {
      ok: false,
      error: 'Could not save (storage may be full or unavailable).',
    }
  }
}

export function removeSavedVersion(id: string): void {
  const list = loadSavedVersions().filter((v) => v.id !== id)
  writeVersions(list)
}
