import type { RadarDataset } from '../types/radar'

/**
 * Finds indices for “Existing Site” vs “Proposed Site” by name, with a demo fallback
 * (first dataset = existing, second = proposed) when names do not match.
 */
export function resolveExistingProposedIndices(datasets: RadarDataset[]) {
  const byName = (needle: string) =>
    datasets.findIndex((d) =>
      d.name.toLowerCase().includes(needle.toLowerCase()),
    )

  let existingIndex = byName('existing')
  let proposedIndex = byName('proposed')

  if (existingIndex < 0) existingIndex = datasets[0] ? 0 : -1
  if (proposedIndex < 0)
    proposedIndex = datasets[1] ? 1 : existingIndex === 0 ? 1 : -1

  return { existingIndex, proposedIndex }
}
