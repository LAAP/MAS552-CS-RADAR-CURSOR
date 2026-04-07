import type { RadarConfig } from '../types/radar'

/** Bundled default; override with `branding.logoSrc` (URL or `/public` path). */
export const DEFAULT_BRANDING_LOGO_PATH = '/city-intelligence-lab-logo.png'

type Props = {
  config: RadarConfig
  /** Light theme needs a slight shadow so a white mark stays visible */
  isDarkTheme: boolean
}

/**
 * Scalable mark in the chart preview (bottom-right). Not embedded in SVG export.
 */
export function BrandLogo({ config, isDarkTheme }: Props) {
  const b = config.branding
  if (b?.showLogo === false) return null

  const src = b?.logoSrc?.trim() || DEFAULT_BRANDING_LOGO_PATH
  const maxW = b?.logoMaxWidthPx ?? 120
  const opacity = b?.logoOpacity ?? 1

  return (
    <div className="pointer-events-none select-none absolute bottom-3 right-3 z-10">
      <img
        src={src}
        alt="City Intelligence Lab"
        className="block h-auto object-contain object-right"
        style={{
          width: `min(${maxW}px, 36vw)`,
          opacity,
          filter: isDarkTheme
            ? undefined
            : 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.35)) drop-shadow(0 0 1px rgb(0 0 0 / 0.25))',
        }}
        draggable={false}
      />
    </div>
  )
}
