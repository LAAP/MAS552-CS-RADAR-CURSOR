/**
 * PNG / SVG / JSON download helpers (decoupled from React).
 */

export function downloadTextFile(
  content: string,
  filename: string,
  mime: string,
): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadJson(data: unknown, filename = 'radar-config.json'): void {
  downloadTextFile(
    JSON.stringify(data, null, 2),
    filename,
    'application/json',
  )
}

/** Serialize an SVG element to a standalone string with XML declaration optional */
export function serializeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  if (!clone.getAttribute('xmlns:xlink')) {
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  }
  return new XMLSerializer().serializeToString(clone)
}

export function downloadSvgElement(
  svg: SVGSVGElement,
  filename = 'radar-chart.svg',
): void {
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializeSvg(svg)
  downloadTextFile(xml, filename, 'image/svg+xml')
}

/**
 * Rasterize SVG to PNG via canvas (crisp at `pixelRatio`).
 */
export function svgToPngDataUrl(
  svg: SVGSVGElement,
  pixelRatio = 3,
): Promise<string> {
  const xml = serializeSvg(svg)
  const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const w = svg.width.baseVal.value || img.naturalWidth
      const h = svg.height.baseVal.value || img.naturalHeight
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(w * pixelRatio)
      canvas.height = Math.round(h * pixelRatio)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Canvas unsupported'))
        return
      }
      ctx.scale(pixelRatio, pixelRatio)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG for PNG export'))
    }
    img.src = url
  })
}

export async function downloadPngFromSvg(
  svg: SVGSVGElement,
  filename = 'radar-chart.png',
  pixelRatio = 3,
): Promise<void> {
  const dataUrl = await svgToPngDataUrl(svg, pixelRatio)
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
