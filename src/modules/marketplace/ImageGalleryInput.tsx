import { useRef, useState } from "react"
import { ImagePlus, X, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@real-life-stack/toolkit"
import { fileToMarketplaceImage, formatBytes } from "./image-upload"

/**
 * ImageGalleryInput — Bilder-Upload fuer Marktplatz-Items.
 *
 * Multi-Image: zeigt vorhandene als Thumbnails mit X-Button, plus ein
 * Plus-Feld zum Hinzufuegen. Erstes Bild wird als Cover behandelt
 * (von der Card-Sicht angezeigt).
 *
 * Hinweis: Bilder werden auf 800px lange Kante skaliert + JPEG-komprimiert
 * — alles direkt als data-URL im offer.images[]-Feld. Kein externer
 * Storage. Bytes-Angabe macht das fuer den User sichtbar.
 */

export interface ImageGalleryInputProps {
  value: string[]
  onChange: (next: string[]) => void
  /** Maximal-Anzahl Bilder. Default 5. */
  max?: number
  /** Soft-Warnung wenn ein Inserat insgesamt zuviel data hat (Bytes). Default 800 KB. */
  warnTotalBytes?: number
}

export function ImageGalleryInput({
  value,
  onChange,
  max = 5,
  warnTotalBytes = 800 * 1024,
}: ImageGalleryInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUploadInfo, setLastUploadInfo] = useState<string | null>(null)

  const totalBytes = estimateBytes(value)
  const isFull = value.length >= max

  const handleFile = async (file: File) => {
    setError(null)
    setBusy(true)
    try {
      const result = await fileToMarketplaceImage(file)
      onChange([...value, result.dataUrl])
      setLastUploadInfo(
        `${result.width}×${result.height} · ${formatBytes(result.bytes)} (von ${formatBytes(result.originalBytes)})`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen")
    } finally {
      setBusy(false)
    }
  }

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await handleFile(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) await handleFile(file)
  }

  const removeAt = (idx: number) => {
    const next = [...value]
    next.splice(idx, 1)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {value.map((url, idx) => (
          <div
            key={url.slice(0, 40) + idx}
            className="relative aspect-square rounded-md border bg-muted overflow-hidden group"
          >
            <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            {idx === 0 && (
              <span className="absolute top-1 left-1 text-[9px] font-bold px-1 rounded bg-primary text-primary-foreground">
                COVER
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Bild entfernen"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {!isFull && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            disabled={busy}
            className="aspect-square rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px]">Hinzufuegen</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="hidden"
      />

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          {value.length} von {max} Bildern · {formatBytes(totalBytes)}
        </span>
        {lastUploadInfo && !error && (
          <span className="text-primary/70">Letzter Upload: {lastUploadInfo}</span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {totalBytes > warnTotalBytes && (
        <div className="flex items-start gap-1.5 text-xs text-amber-600">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          Viele/grosse Bilder verlangsamen den Sync. Erwaege weniger oder
          kleinere Bilder.
        </div>
      )}

      {value.length === 0 && (
        <p className="text-[10px] text-muted-foreground italic">
          Bilder helfen — eine Drechselbank ohne Foto sieht jeder anders. Drag &
          Drop oder klicken zum Auswaehlen. Max 5 Bilder, Cover ist das erste.
        </p>
      )}
    </div>
  )
}

function estimateBytes(urls: string[]): number {
  let total = 0
  for (const u of urls) {
    const base64 = u.split(",")[1] ?? ""
    total += Math.round((base64.length * 3) / 4)
  }
  return total
}
