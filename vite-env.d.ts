/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}

// BarcodeDetector is not in the default TS DOM lib yet
interface BarcodeDetectorResult {
  rawValue: string
  format: string
}
declare class BarcodeDetector {
  constructor(options?: { formats: string[] })
  detect(source: CanvasImageSource): Promise<BarcodeDetectorResult[]>
}
