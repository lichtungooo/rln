/**
 * Bild-Upload-Helfer fuer Marktplatz-Items.
 *
 * All-WoT-Stack hat keinen externen File-Storage — Bilder leben als
 * data-URL direkt im Item. Damit der WoT-Doc nicht aufblaeht, werden
 * Uploads strikt skaliert + JPEG-komprimiert.
 *
 * Ziel: ~50 KB pro Bild (max 800px breit/hoch, JPEG q 0.82).
 * Bei mehreren Bildern pro Inserat schnell ueberschaubar.
 */

const DEFAULT_MAX_DIMENSION = 800
const DEFAULT_QUALITY = 0.82

export interface UploadResult {
  /** data:image/... URL */
  dataUrl: string
  /** Groesse der erzeugten data-URL in Bytes */
  bytes: number
  /** Original-Bytes (vor Kompression) */
  originalBytes: number
  /** Skalierte Pixel-Maße */
  width: number
  height: number
}

/**
 * Liest eine File ein, skaliert sie auf max maxDimension (Aspect-Ratio bleibt
 * erhalten) und gibt eine JPEG-data-URL zurueck.
 */
export async function fileToMarketplaceImage(
  file: File,
  options?: { maxDimension?: number; quality?: number }
): Promise<UploadResult> {
  const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION
  const quality = options?.quality ?? DEFAULT_QUALITY
  const originalBytes = file.size

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error("Datei konnte nicht gelesen werden"))
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error("Bild konnte nicht geladen werden"))
    el.src = dataUrl
  })

  const ratio = Math.min(1, maxDimension / Math.max(img.width, img.height))
  const targetWidth = Math.round(img.width * ratio)
  const targetHeight = Math.round(img.height * ratio)

  const canvas = document.createElement("canvas")
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas-Context nicht verfuegbar")
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, targetWidth, targetHeight)
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  const out = canvas.toDataURL("image/jpeg", quality)

  // base64-Laenge auf Byte-Schaetzung — base64 ist ~4/3 der Original-Bytes
  const base64Part = out.split(",")[1] ?? ""
  const bytes = Math.round((base64Part.length * 3) / 4)

  return {
    dataUrl: out,
    bytes,
    originalBytes,
    width: targetWidth,
    height: targetHeight,
  }
}

export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}
