import { useRef, useState } from 'react'
import { CATEGORIES, UNITS } from '../types'

export interface FormInit {
  mode: 'add' | 'edit'
  barcode: string
  name: string
  qty: string
  unit: string
  category: string
  price: string
  note: string
  photo: string | null
}

export interface SubmitPayload {
  name: string
  qty: number
  unit: string
  category: string
  price: number
  barcode: string
  note: string
  /** Existing photo URL/data to keep when no new file is chosen. */
  photo: string | null
  /** A freshly chosen file to upload, if any. */
  photoFile: File | null
}

interface Props {
  init: FormInit
  onClose: () => void
  onSubmit: (data: SubmitPayload) => void
  onOpenScanner: () => void
}

export function ProductModal({ init, onClose, onSubmit, onOpenScanner }: Props) {
  const [barcode, setBarcode] = useState(init.barcode)
  const [name, setName] = useState(init.name)
  const [qty, setQty] = useState(init.qty)
  const [unit, setUnit] = useState(init.unit)
  const [category, setCategory] = useState(init.category)
  const [price, setPrice] = useState(init.price)
  const [note, setNote] = useState(init.note)
  const [photo, setPhoto] = useState<string | null>(init.photo)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function step(d: number) {
    setQty((q) => String(Math.max(0, (Number(q) || 0) + d)))
  }

  function submit() {
    onSubmit({
      name: name.trim(),
      qty: Number(qty),
      unit,
      category,
      price: Number(price) || 0,
      barcode: barcode.trim(),
      note: note.trim(),
      photo,
      photoFile,
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <div className="modal-title">{init.mode === 'edit' ? 'Edit Product' : 'Add Product'}</div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="field-group">
          <label className="field-label">Product Photo</label>
          <div className="photo-area" onClick={() => fileRef.current?.click()}>
            {photo ? (
              <img className="photo-preview" src={photo} alt="" />
            ) : (
              <div className="photo-placeholder">
                <div className="photo-placeholder-icon">📷</div>
                <div style={{ fontSize: 13 }}>Tap to take photo or choose image</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhoto} />
          {photo && (
            <button
              className="btn-remove-photo"
              onClick={() => {
                setPhoto(null)
                setPhotoFile(null)
              }}
            >
              Remove Photo
            </button>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">
            Barcode <span style={{ color: '#6b7280', fontWeight: 400 }}>(auto-filled by scan)</span>
          </label>
          <div className="barcode-row">
            <input className="field-input" style={{ flex: 1 }} placeholder="Barcode (optional)" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
            <button
              onClick={onOpenScanner}
              style={{ background: '#1e2a1e', color: '#34d399', border: '1px solid #1a3a1a', borderRadius: 10, padding: '0 14px', fontSize: 20, flexShrink: 0 }}
            >
              📷
            </button>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Product Name *</label>
          <input className="field-input" placeholder="Enter product name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field-row">
          <div className="field-group" style={{ flex: 2, marginBottom: 0 }}>
            <label className="field-label">Quantity *</label>
            <div className="qty-stepper">
              <button type="button" onClick={() => step(-1)}>
                −
              </button>
              <input className="field-input" type="number" inputMode="numeric" placeholder="0" value={qty} onChange={(e) => setQty(e.target.value)} />
              <button type="button" onClick={() => step(1)}>
                +
              </button>
            </div>
          </div>
          <div className="field-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="field-label">Unit</label>
            <select className="field-input" value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row" style={{ marginTop: 14 }}>
          <div className="field-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="field-label">Category</label>
            <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="field-label">Unit Price ($)</label>
            <input className="field-input" type="number" inputMode="decimal" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>

        <div className="field-group" style={{ marginTop: 14 }}>
          <label className="field-label">Notes</label>
          <textarea className="field-input" rows={2} placeholder="Optional notes…" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <button className="btn-submit" onClick={submit}>
          {init.mode === 'edit' ? 'Save Changes' : 'Add Product'}
        </button>
      </div>
    </div>
  )
}
