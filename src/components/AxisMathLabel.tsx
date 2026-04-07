import { BlockMath, InlineMath } from 'react-katex'
import type { LabelLayout } from '../utils/textLayout'

type Props = {
  lines: string[]
  kpiTex?: string
  formulaTex?: string
  showMath: boolean
  textColor: string
  fontSize: number
  anchor: LabelLayout['anchor']
}

/**
 * HTML label stack for use inside SVG `<foreignObject>`: plain lines + KaTeX.
 */
export function AxisMathLabel({
  lines,
  kpiTex,
  formulaTex,
  showMath,
  textColor,
  fontSize,
  anchor,
}: Props) {
  const lineHeight = fontSize * 1.15
  const textAlign =
    anchor === 'start' ? 'left' : anchor === 'end' ? 'right' : 'center'

  return (
    // xmlns required for valid XHTML inside SVG foreignObject
    <div
      {...{ xmlns: 'http://www.w3.org/1999/xhtml' }}
      style={{
        color: textColor,
        textAlign,
        fontSize,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        lineHeight: `${lineHeight}px`,
        userSelect: 'none',
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      {showMath && kpiTex ? (
        <div
          style={{
            marginTop: 3,
            fontSize: fontSize * 0.92,
            lineHeight: 1.2,
            opacity: 0.92,
          }}
        >
          <InlineMath math={kpiTex} renderError={() => <span>{kpiTex}</span>} />
        </div>
      ) : null}
      {showMath && formulaTex ? (
        <div
          style={{
            marginTop: 6,
            fontSize: fontSize * 0.88,
            lineHeight: 1.15,
            opacity: 0.88,
          }}
        >
          <BlockMath math={formulaTex} renderError={() => <span>{formulaTex}</span>} />
        </div>
      ) : null}
    </div>
  )
}
