import { useCallback, useEffect, useRef, useState } from 'react'
import { CLOUD } from './supabase'
import type { Product, ToastType } from './types'
import {
  loadProducts,
  saveProduct,
  deleteProduct,
  persistLocal,
  cacheItems,
  uploadPhoto,
  subscribeToChanges,
  flushQueue,
  uid,
  todayStr,
} from './lib/data'
import { usePresence } from './lib/usePresence'
import { exportCSV, exportPDF } from './lib/export'
import { Header } from './components/Header'
import { ProductList } from './components/ProductList'
import { Analytics } from './components/Analytics'
import { ProductModal, type FormInit, type SubmitPayload } from './components/ProductModal'
import { ScannerModal } from './components/ScannerModal'
import { NameModal } from './components/NameModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Toast, type ToastMessage } from './components/Toast'

export default function App() {
  const [items, setItems] = useState<Product[]>([])
  const [myName, setMyName] = useState(() => localStorage.getItem('sc_user') || '')
  const [tab, setTab] = useState<'list' | 'stats'>('list')
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')

  const [modal, setModal] = useState<FormInit | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [nameOpen, setNameOpen] = useState(!myName)

  const [toast, setToast] = useState<ToastMessage | null>(null)
  const toastKey = useRef(0)
  const showToast = useCallback((text: string, type: ToastType = 'success') => {
    setToast({ text, type, key: toastKey.current++ })
  }, [])

  const online = usePresence(myName)

  // Initial load + realtime + offline-queue flush
  useEffect(() => {
    let alive = true
    loadProducts().then(({ items, usedCache }) => {
      if (!alive) return
      setItems(items)
      if (usedCache) showToast("Couldn't reach server — showing last saved copy", 'error')
    })
    const unsub = subscribeToChanges(() => {
      loadProducts().then(({ items }) => alive && setItems(items))
    })
    const onOnline = () => flushQueue().then((ok) => ok && showToast('All changes synced ✓', 'success'))
    window.addEventListener('online', onOnline)
    flushQueue()
    return () => {
      alive = false
      unsub()
      window.removeEventListener('online', onOnline)
    }
  }, [showToast])

  // ---------- persistence helpers ----------
  const persist = useCallback(
    async (next: Product[], changed: Product) => {
      setItems(next)
      const result = await saveProduct(changed, myName)
      if (result === 'local') persistLocal(next)
      else if (result === 'ok') cacheItems(next)
      else if (result === 'queued') showToast('Saved offline — will sync when online', 'info')
    },
    [myName, showToast],
  )

  // ---------- actions ----------
  function openAdd() {
    setEditId(null)
    setModal({ mode: 'add', barcode: '', name: '', qty: '', unit: 'pcs', category: 'Other', price: '', note: '', photo: null })
  }
  function openEdit(id: string) {
    const it = items.find((i) => i.id === id)
    if (!it) return
    setEditId(id)
    setModal({
      mode: 'edit',
      barcode: it.barcode,
      name: it.name,
      qty: String(it.qty),
      unit: it.unit,
      category: it.category,
      price: it.price ? String(it.price) : '',
      note: it.note,
      photo: it.photo,
    })
  }

  async function handleSubmit(data: SubmitPayload) {
    if (!data.name) return showToast('Please enter a product name', 'error')
    if (data.qty === undefined || Number.isNaN(data.qty) || data.qty < 0) return showToast('Please enter a valid quantity', 'error')

    let photo = data.photo
    if (CLOUD && data.photoFile) {
      try {
        showToast('Uploading photo…', 'info')
        photo = await uploadPhoto(data.photoFile)
      } catch {
        showToast('Photo upload failed — saved without photo', 'error')
        photo = data.photo && !data.photo.startsWith('data:') ? data.photo : null
      }
    }

    const fields = {
      name: data.name,
      qty: data.qty,
      unit: data.unit,
      category: data.category,
      price: data.price,
      barcode: data.barcode,
      note: data.note,
      photo,
      updated_by: myName,
    }

    if (editId) {
      const updated = items.map((it) => (it.id === editId ? { ...it, ...fields } : it))
      const changed = updated.find((it) => it.id === editId)!
      setModal(null)
      showToast('Product updated')
      await persist(updated, changed)
    } else {
      const created: Product = { id: uid(), date: todayStr(), ...fields }
      const next = [created, ...items]
      setModal(null)
      showToast('Product added')
      await persist(next, created)
    }
  }

  async function quickStep(id: string, delta: number) {
    const it = items.find((i) => i.id === id)
    if (!it) return
    const changed = { ...it, qty: Math.max(0, it.qty + delta), updated_by: myName }
    const next = items.map((i) => (i.id === id ? changed : i))
    await persist(next, changed)
  }

  async function doDelete() {
    if (!deleteId) return
    const id = deleteId
    const next = items.filter((i) => i.id !== id)
    setItems(next)
    setDeleteId(null)
    showToast('Deleted', 'error')
    const result = await deleteProduct(id)
    if (result === 'local') persistLocal(next)
    else if (result === 'ok') cacheItems(next)
    else if (result === 'queued') showToast('Deleted offline — will sync when online', 'info')
  }

  function handleScanResult(code: string) {
    setScanning(false)
    const existing = items.find((it) => it.barcode === code)
    if (existing) {
      setEditId(existing.id)
      setModal({
        mode: 'edit',
        barcode: existing.barcode,
        name: existing.name,
        qty: String(existing.qty + 1),
        unit: existing.unit,
        category: existing.category,
        price: existing.price ? String(existing.price) : '',
        note: existing.note,
        photo: existing.photo,
      })
      showToast(`Found: ${existing.name} — qty +1`, 'info')
    } else {
      setEditId(null)
      setModal({ mode: 'add', barcode: code, name: '', qty: '1', unit: 'pcs', category: 'Other', price: '', note: '', photo: null })
      showToast('Barcode scanned — fill in product details', 'info')
    }
  }

  function saveName(name: string) {
    setMyName(name)
    localStorage.setItem('sc_user', name)
    setNameOpen(false)
  }

  function runExport(kind: 'csv' | 'pdf') {
    if (!items.length) return showToast('No products to export', 'error')
    try {
      kind === 'csv' ? exportCSV(items) : exportPDF(items)
      if (kind === 'csv') showToast('CSV downloaded', 'success')
    } catch (e) {
      showToast(e instanceof Error && e.message === 'popup-blocked' ? 'Allow pop-ups to generate the PDF' : 'Export failed', 'error')
    }
  }

  return (
    <div id="app">
      <Header
        myName={myName}
        online={online}
        tab={tab}
        onTab={setTab}
        onScan={() => setScanning(true)}
        onAdd={openAdd}
        onChangeName={() => setNameOpen(true)}
      />

      <div className="content">
        {tab === 'list' ? (
          <ProductList
            items={items}
            search={search}
            setSearch={setSearch}
            filterCat={filterCat}
            setFilterCat={setFilterCat}
            onStep={quickStep}
            onEdit={openEdit}
            onDelete={setDeleteId}
          />
        ) : (
          <Analytics items={items} onExportCSV={() => runExport('csv')} onExportPDF={() => runExport('pdf')} />
        )}
      </div>

      {modal && (
        <ProductModal init={modal} onClose={() => setModal(null)} onSubmit={handleSubmit} onOpenScanner={() => { setModal(null); setScanning(true) }} />
      )}
      {scanning && <ScannerModal onClose={() => setScanning(false)} onResult={handleScanResult} />}
      {deleteId && <ConfirmDialog onCancel={() => setDeleteId(null)} onConfirm={doDelete} />}
      {nameOpen && <NameModal initial={myName} onSave={saveName} />}

      <Toast message={toast} />
    </div>
  )
}
