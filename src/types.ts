export interface Product {
  id: string
  name: string
  qty: number
  unit: string
  category: string
  price: number
  barcode: string
  note: string
  photo: string | null
  updated_by: string
  date: string
}

/** Shape of a row as stored in / returned from Supabase. */
export interface ProductRow {
  id: string
  name: string
  qty: number
  unit: string | null
  category: string | null
  price: number | null
  barcode: string | null
  note: string | null
  photo: string | null
  updated_by: string | null
  created_at?: string
  updated_at?: string
}

export const CATEGORIES = ['Food', 'Drinks', 'Household', 'Electronics', 'Clothing', 'Other'] as const
export const FILTER_CATEGORIES = ['All', ...CATEGORIES] as const
export const UNITS = ['pcs', 'box', 'pack', 'bottle', 'set', 'bag', 'roll', 'sheet', 'kg'] as const
export const CHART_COLORS = ['#60a5fa', '#34d399', '#f5c542', '#c084fc', '#fb7185', '#fb923c']

export type ToastType = 'success' | 'error' | 'info'
