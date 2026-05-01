import { useEffect, useRef, useState, useCallback } from "react"
import { QrCode, Camera, X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@real-life-stack/toolkit"

/**
 * QR-Verifikations-Dialog fuer Quests.
 *
 * Zwei Modi (umschaltbar):
 *   - "show" — zeigt den Quest-QR (fuer Stand/Markt/Werkstatt). Wird scanner-
 *     bereit angezeigt damit der Quest-Macher einfach sein Telefon hochhalten
 *     kann.
 *   - "scan" — der Spieler scannt einen QR. Bei Match mit `expectedCode` wird
 *     `onVerified()` aufgerufen, sonst Fehler-Hinweis.
 *
 * Nutzt die native Browser-`BarcodeDetector` API (in Chromium-Browsern,
 * Android-Chrome). Fallback: manuelle Code-Eingabe.
 */

export interface QrVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Der Code den die Quest erwartet — bei Match ist die Quest erledigt. */
  expectedCode: string
  /** Quest-Titel zur Anzeige im Dialog */
  questTitle: string
  /** Wird gerufen wenn der gescannte Code mit `expectedCode` matcht */
  onVerified: () => Promise<void> | void
}

type Mode = "show" | "scan"

export function QrVerificationDialog({
  open,
  onOpenChange,
  expectedCode,
  questTitle,
  onVerified,
}: QrVerificationDialogProps) {
  const [mode, setMode] = useState<Mode>("scan")
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // QR-Code generieren beim "show"-Modus
  useEffect(() => {
    if (mode !== "show" || !expectedCode) {
      setQrDataUrl(null)
      return
    }
    let cancelled = false
    import("qrcode").then((QRCode) => {
      if (cancelled) return
      QRCode.toDataURL(expectedCode, {
        width: 240,
        margin: 2,
        color: { dark: "#1e293b", light: "#ffffff" },
      })
        .then((url: string) => {
          if (!cancelled) setQrDataUrl(url)
        })
        .catch(() => setError("QR-Code konnte nicht erzeugt werden."))
    })
    return () => {
      cancelled = true
    }
  }, [mode, expectedCode])

  const stopScanner = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop()
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        stopScanner()
        setError(null)
        setSuccess(false)
        setManualCode("")
        setMode("scan")
      }
      onOpenChange(isOpen)
    },
    [onOpenChange, stopScanner]
  )

  const handleMatch = useCallback(
    async (scanned: string) => {
      if (scanned.trim() === expectedCode.trim()) {
        setBusy(true)
        try {
          await onVerified()
          setSuccess(true)
          stopScanner()
          setTimeout(() => handleClose(false), 1400)
        } finally {
          setBusy(false)
        }
      } else {
        setError("Der Code passt nicht zu dieser Quest.")
        stopScanner()
      }
    },
    [expectedCode, onVerified, stopScanner, handleClose]
  )

  const startScanner = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      setIsScanning(true)
    } catch {
      setError("Kamera nicht verfuegbar. Code bitte manuell eingeben.")
      setIsScanning(false)
    }
  }, [])

  // Auto-Start: wenn der Dialog im "scan"-Modus geoeffnet wird und kein
  // Fehler vorliegt, gleich die Kamera starten — Festival-Realitaet, da
  // klickt niemand zweimal.
  useEffect(() => {
    if (
      open &&
      mode === "scan" &&
      !isScanning &&
      !success &&
      !error &&
      !streamRef.current &&
      typeof navigator !== "undefined" &&
      navigator.mediaDevices?.getUserMedia
    ) {
      startScanner()
    }
  }, [open, mode, isScanning, success, error, startScanner])

  // Stream am Video haengen + Scanner-Loop
  useEffect(() => {
    if (!isScanning || !videoRef.current || !streamRef.current) return
    const video = videoRef.current
    video.srcObject = streamRef.current

    if (!("BarcodeDetector" in window)) {
      setError("Dein Browser unterstuetzt keinen QR-Scanner. Bitte Code manuell eingeben.")
      stopScanner()
      return
    }

    const detector = new (window as unknown as {
      BarcodeDetector: new (opts: { formats: string[] }) => {
        detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]>
      }
    }).BarcodeDetector({ formats: ["qr_code"] })

    let stopped = false
    const scanFrame = async () => {
      if (stopped || !videoRef.current || !streamRef.current) return
      try {
        const barcodes = await detector.detect(videoRef.current)
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue
          stopped = true
          await handleMatch(code)
          return
        }
      } catch {
        // Detection-Fehler ignorieren (nicht jedes Frame ist scanbar)
      }
      if (!stopped && streamRef.current) requestAnimationFrame(scanFrame)
    }
    video.addEventListener("loadeddata", () => requestAnimationFrame(scanFrame), { once: true })

    return () => {
      stopped = true
    }
  }, [isScanning, handleMatch, stopScanner])

  // Cleanup beim Unmount
  useEffect(() => {
    return () => stopScanner()
  }, [stopScanner])

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return
    handleMatch(manualCode)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Quest-QR
          </DialogTitle>
          <DialogDescription className="line-clamp-2">{questTitle}</DialogDescription>
        </DialogHeader>

        {/* Mode-Switcher */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          <button
            type="button"
            onClick={() => {
              stopScanner()
              setMode("scan")
              setError(null)
            }}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === "scan" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Scannen
          </button>
          <button
            type="button"
            onClick={() => {
              stopScanner()
              setMode("show")
              setError(null)
            }}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === "show" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Zeigen
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary border border-primary/30">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Verifiziert. Quest ist erledigt.</span>
          </div>
        )}

        {error && !success && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/30">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        {/* Show-Modus: QR anzeigen */}
        {mode === "show" && !success && (
          <div className="space-y-3">
            <div className="flex justify-center">
              {qrDataUrl ? (
                <div className="rounded-xl border-2 bg-white p-3 shadow-sm">
                  <img src={qrDataUrl} alt="Quest-QR" className="w-[240px] h-[240px]" />
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed bg-muted w-[260px] h-[260px] flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Halte das Telefon hoch — Spieler scannen diesen Code mit ihrer Quest-Liste.
            </p>
            <p className="text-[10px] text-center text-muted-foreground/70 font-mono break-all px-4">
              {expectedCode}
            </p>
          </div>
        )}

        {/* Scan-Modus: Kamera + Manueller Fallback */}
        {mode === "scan" && !success && (
          <div className="space-y-3">
            {isScanning ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg border-2 bg-black aspect-square object-cover"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={stopScanner}
                  disabled={busy}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={startScanner}
                  disabled={busy}
                  className="rounded-xl border-2 border-dashed bg-muted hover:bg-muted/70 transition-colors w-[260px] h-[260px] flex flex-col items-center justify-center gap-2"
                >
                  <Camera className="h-10 w-10 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Kamera starten</span>
                </button>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wider">
                Code manuell
              </p>
              <div className="flex gap-2">
                <Input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="QR-Code-Inhalt eingeben"
                  className="text-xs"
                  disabled={busy}
                />
                <Button size="sm" onClick={handleManualSubmit} disabled={busy || !manualCode.trim()}>
                  Pruefen
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
