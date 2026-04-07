import type { RadarConfig, LegendPosition } from '../types/radar'

type Props = {
  config: RadarConfig
  width: number
  margin: number
  fontSize: number
}

function positionStyle(
  pos: LegendPosition,
  margin: number,
): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute' as const }
  switch (pos) {
    case 'top-left':
      return { ...base, top: margin, left: margin, textAlign: 'left' }
    case 'top-right':
      return { ...base, top: margin, right: margin, textAlign: 'right' }
    case 'bottom-left':
      return { ...base, bottom: margin, left: margin, textAlign: 'left' }
    case 'bottom-right':
    default:
      return { ...base, bottom: margin, right: margin, textAlign: 'right' }
  }
}

export function RadarLegend({ config, width, margin, fontSize }: Props) {
  if (!config.legend?.enabled) return null
  const pos = config.legend.position ?? 'top-right'

  const rowJustify =
    pos === 'top-left' || pos === 'bottom-left' ? 'justify-start' : 'justify-end'

  return (
    <div
      className="pointer-events-none select-none"
      style={{
        ...positionStyle(pos, margin),
        color: config.textColor,
        fontSize: `${fontSize}px`,
        lineHeight: 1.35,
        maxWidth: Math.min(220, width * 0.28),
      }}
    >
      {config.datasets.map((ds) => (
        <div key={ds.id} className={`flex items-center gap-2 mb-0.5 ${rowJustify}`}>
          <span
            className="inline-block h-px w-5 shrink-0"
            style={{
              backgroundColor: ds.strokeColor ?? ds.color,
              height: '2px',
            }}
          />
          <span className="opacity-95">{ds.name}</span>
        </div>
      ))}
    </div>
  )
}
