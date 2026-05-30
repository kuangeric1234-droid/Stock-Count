import { sb, CLOUD } from '../supabase'
import type { Product, ProductRow } from '../types'

const CACHE_KEY = 'sc_cache'
const LOCAL_KEY = 'sc_items'
const QUEUE_KEY = 'sc_pending'

export function uid(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2)
}
export function todayStr(): string {
  return new Date().toLocaleDateString('en-US')
}

function mapRow(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    qty: Number(r.qty) || 0,
    unit: r.unit || 'pcs',
    category: r.category || 'Other',
    price: Number(r.price) || 0,
    barcode: r.barcode || '',
    note: r.note || '',
    photo: r.photo || null,
    updated_by: r.updated_by || '',
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US') : todayStr(),
  }
}

function rowFromProduct(p: Product, updatedBy: string): ProductRow {
  return {
    id: p.id,
    name: p.name,
    qty: p.qty,
    unit: p.unit,
    category: p.category,
    price: p.price,
    barcode: p.barcode,
    note: p.note,
    photo: p.photo,
    updated_by: updatedBy,
    updated_at: new Date().toISOString(),
  }
}

// ---------- Offline queue ----------
type QueuedOp = { type: 'upsert'; row: ProductRow } | { type: 'delete'; id: string }

function readQueue(): QueuedOp[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}
function writeQueue(ops: QueuedOp[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(ops))
}
function enqueue(op: QueuedOp) {
  const q = readQueue()
  q.push(op)
  writeQueue(q)
}

/** Returns true if everything synced, false if items remain queued. */
export async function flushQueue(): Promise<boolean | null> {
  if (!CLOUD || !sb || !navigator.onLine) return null
  const ops = readQueue()
  if (!ops.length) return null
  writeQueue([])
  const failed: QueuedOp[] = []
  for (const op of ops) {
    try {
      if (op.type === 'upsert') {
        const { error } = await sb.from('products').upsert(op.row)
        if (error) throw error
      } else {
        const { error } = await sb.from('products').delete().eq('id', op.id)
        if (error) throw error
      }
    } catch {
      failed.push(op)
    }
  }
  if (failed.length) writeQueue(failed)
  return failed.length === 0
}

// ---------- Load ----------
export async function loadProducts(): Promise<{ items: Product[]; usedCache: boolean }> {
  if (CLOUD && sb) {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error || !data) {
      // Surface the real reason — usually "table doesn't exist" (SQL not run)
      // or a bad URL/key. Check the browser console to diagnose.
      console.error('[Stock Count] Supabase load failed:', error?.message || error, error)
      const cached: Product[] = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')
      return { items: cached, usedCache: true }
    }
    const items = (data as ProductRow[]).map(mapRow)
    localStorage.setItem(CACHE_KEY, JSON.stringify(items))
    return { items, usedCache: false }
  }
  const items: Product[] = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  return { items, usedCache: false }
}

// ---------- Write ----------
/** Persist a product. Returns 'ok' | 'queued' | 'local'. */
export async function saveProduct(p: Product, updatedBy: string): Promise<'ok' | 'queued' | 'local'> {
  if (!CLOUD || !sb) return 'local' // caller persists the local array separately
  const row = rowFromProduct(p, updatedBy)
  try {
    const { error } = await sb.from('products').upsert(row)
    if (error) throw error
    return 'ok'
  } catch {
    enqueue({ type: 'upsert', row })
    return 'queued'
  }
}

export async function deleteProduct(id: string): Promise<'ok' | 'queued' | 'local'> {
  if (!CLOUD || !sb) return 'local'
  try {
    const { error } = await sb.from('products').delete().eq('id', id)
    if (error) throw error
    return 'ok'
  } catch {
    enqueue({ type: 'delete', id })
    return 'queued'
  }
}

export function persistLocal(items: Product[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
}
export function cacheItems(items: Product[]) {
  if (CLOUD) localStorage.setItem(CACHE_KEY, JSON.stringify(items))
}

// ---------- Photo upload ----------
export async function uploadPhoto(file: File): Promise<string> {
  if (!sb) throw new Error('offline')
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${uid()}.${ext}`
  const { error } = await sb.storage
    .from('photos')
    .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' })
  if (error) throw error
  return sb.storage.from('photos').getPublicUrl(path).data.publicUrl
}

// ---------- Realtime ----------
export function subscribeToChanges(onChange: () => void): () => void {
  if (!CLOUD || !sb) return () => {}
  const client = sb
  const channel = client
    .channel('products-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, onChange)
    .subscribe()
  return () => {
    client.removeChannel(channel)
  }
}
