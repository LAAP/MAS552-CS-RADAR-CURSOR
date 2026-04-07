export type AxisAnimParams = {
  delay: number
  speedExp: number
  noiseAmp: number
  noiseFreq: number
  noisePhase: number
}

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep01(t: number) {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

function xmur3(str: string) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeAxisAnimParams(axisIds: string[], seedString: string) {
  const seedFn = xmur3(seedString)
  const rand = mulberry32(seedFn())
  const params: AxisAnimParams[] = []
  for (let i = 0; i < axisIds.length; i++) {
    const r1 = rand()
    const r2 = rand()
    const r3 = rand()
    const r4 = rand()
    const r5 = rand()

    params.push({
      delay: 0.08 * r1,
      speedExp: 0.85 + 0.55 * r2,
      noiseAmp: 0.09 + 0.06 * r3,
      noiseFreq: 1.2 + 1.8 * r4,
      noisePhase: Math.PI * 2 * r5,
    })
  }
  return params
}

/** Maps global t in [0,1] to per-axis progress; wobble is 0 at t=0 and t=1. */
export function organicInterpolate01(t: number, p: AxisAnimParams) {
  const g = clamp01(t)
  const local = clamp01((g - p.delay) / Math.max(1e-6, 1 - p.delay))

  const eased = Math.pow(smoothstep01(local), p.speedExp)

  const envelope = local * (1 - local)
  const wobble = Math.sin(Math.PI * 2 * p.noiseFreq * local + p.noisePhase)
  const noisy = eased + wobble * p.noiseAmp * envelope

  return clamp01(noisy)
}

export function organicLerpValues(
  start: number[],
  target: number[],
  t: number,
  params: AxisAnimParams[],
) {
  const n = Math.max(start.length, target.length, params.length)
  const out: number[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const a = start[i] ?? 0
    const b = target[i] ?? 0
    const p = params[i] ?? {
      delay: 0,
      speedExp: 1,
      noiseAmp: 0,
      noiseFreq: 1,
      noisePhase: 0,
    }
    out[i] = lerp(a, b, organicInterpolate01(t, p))
  }
  return out
}

