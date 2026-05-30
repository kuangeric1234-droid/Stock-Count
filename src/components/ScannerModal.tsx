import { useEffect, useRef, useState } from 'react'

interface Props {
  onClose: () => void
  onResult: (code: string) => void
}

const FORMATS = ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'itf', 'codabar', 'data_matrix', 'aztec', 'pdf417']

export function ScannerModal({ onClose, onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [fallback, setFallback] = useState<null | { supported: boolean; message?: string }>(null)
  const [manual, setManual] = useState('')

  useEffect(() => {
    let stream: MediaStream | null = null
    let raf = 0
    let stopped = false

    async function start() {
      if (!('BarcodeDetector' in window)) {
        setFallback({ supported: false })
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        const detector = new BarcodeDetector({ formats: FORMATS })
        const tick = async () => {
          if (stopped) return
          if (video.readyState >= 2) {
            try {
              const codes = await detector.detect(video)
              if (codes.length > 0) {
                onResult(codes[0].rawValue)
                return
              }
            } catch {
              /* transient detect error — keep scanning */
            }
          }
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      } catch (e) {
        setFallback({ supported: true, message: e instanceof Error ? e.message : 'Camera unavailable' })
      }
    }
    start()

    return () => {
      stopped = true
      if (raf) cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [onResult])

  return (
    <div className="scanner-overlay">
      <div className="scanner-header">
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Scan Barcode / QR Code</span>
        <button onClick={onClose} style={{ background: '#2a2d40', color: '#9ca3af', borderRadius: 8, padding: '7px 14px', fontSize: 14 }}>
          Close
        </button>
      </div>

      {fallback ? (
        <div className="unsupported-box">
          <div style={{ fontSize: 48 }}>{fallback.supported ? '📷' : '⚠️'}</div>
          {fallback.supported ? (
            <div style={{ fontSize: 14, color: '#f87171' }}>Camera access denied: {fallback.message}</div>
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Scanning not supported</div>
              <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>
                Please use Chrome 88+ or Edge 88+, or enter the barcode manually.
              </div>
            </>
          )}
          <div className="manual-col">
            <input
              placeholder="Enter barcode…"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && manual.trim() && onResult(manual.trim())}
              style={{ background: '#1a1d27', border: '1px solid #2a2d40', borderRadius: 10, padding: '11px 14px', color: '#f3f4f6', fontSize: 15, width: '100%' }}
            />
            <button
              onClick={() => manual.trim() && onResult(manual.trim())}
              style={{ background: '#f5c542', color: '#0f1117', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 15, fontWeight: 700 }}
            >
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <video ref={videoRef} className="scanner-video" playsInline muted />
          <div className="scanner-frame">
            <div className="scanner-box">
              <div className="corner corner-tl" />
              <div className="corner corner-tr" />
              <div className="corner corner-bl" />
              <div className="corner corner-br" />
              <div className="scan-line" />
            </div>
          </div>
          <div className="scanner-hint">Point the barcode or QR code at the frame</div>
        </div>
      )}
    </div>
  )
}
