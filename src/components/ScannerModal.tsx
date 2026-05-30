import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'

interface Props {
  onClose: () => void
  onResult: (code: string) => void
}

export function ScannerModal({ onClose, onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [manual, setManual] = useState('')

  // Keep the latest callback without restarting the camera on parent re-renders.
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let controls: IScannerControls | null = null
    let done = false

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current!,
        (result, _err, ctrl) => {
          controls = ctrl
          if (result && !done) {
            done = true
            ctrl.stop()
            onResultRef.current(result.getText())
          }
        },
      )
      .then((ctrl) => {
        controls = ctrl
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Camera unavailable')
      })

    return () => {
      done = true
      controls?.stop()
    }
  }, [])

  const submitManual = () => manual.trim() && onResult(manual.trim())

  return (
    <div className="scanner-overlay">
      <div className="scanner-header">
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Scan Barcode / QR Code</span>
        <button onClick={onClose} style={{ background: '#2a2d40', color: '#9ca3af', borderRadius: 8, padding: '7px 14px', fontSize: 14 }}>
          Close
        </button>
      </div>

      {error ? (
        <div className="unsupported-box">
          <div style={{ fontSize: 48 }}>📷</div>
          <div style={{ fontSize: 14, color: '#f87171' }}>Camera unavailable: {error}</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Allow camera access in your browser, or enter the barcode manually.</div>
          <div className="manual-col">
            <input
              placeholder="Enter barcode…"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitManual()}
              style={{ background: '#1a1d27', border: '1px solid #2a2d40', borderRadius: 10, padding: '11px 14px', color: '#f3f4f6', fontSize: 15, width: '100%' }}
            />
            <button onClick={submitManual} style={{ background: '#f5c542', color: '#0f1117', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 15, fontWeight: 700 }}>
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
