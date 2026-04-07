import type { RadarConfig } from '../types/radar'
import { demoRadarConfig } from '../data/demoRadarConfig'
import { normalizeRadarConfig } from './configNormalize'

/**
 * Simulates `GET /api/radar-config` — swap for `fetch` when wiring a backend.
 */
export async function fetchMockRadarConfig(
  delayMs = 420,
): Promise<RadarConfig> {
  await new Promise((r) => setTimeout(r, delayMs))
  const clone = JSON.parse(JSON.stringify(demoRadarConfig)) as RadarConfig
  return normalizeRadarConfig(clone)
}
