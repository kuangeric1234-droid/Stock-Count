import type { Product } from '../types'

function esc(s: unknown): string {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function dateStamp(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportCSV(items: Product[]) {
  const headers = ['Name', 'Quantity', 'Unit', 'Category', 'Unit Price', 'Total Value', 'Barcode', 'Counted By', 'Date', 'Notes']
  const cell = (c: unknown) => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`
  const rows = items.map((i) =>
    [i.name, i.qty, i.unit, i.category, i.price, (i.qty * i.price).toFixed(2), i.barcode, i.updated_by, i.date, i.note]
      .map(cell)
      .join(','),
  )
  const csv = [headers.map(cell).join(','), ...rows].join('\r\n')
  download(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }), `stock-count-${dateStamp()}.csv`)
}

export function exportPDF(items: Product[]) {
  const totalItems = items.length
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const totalVal = items.reduce((s, i) => s + i.qty * i.price, 0)
  const counters = [...new Set(items.map((i) => i.updated_by).filter(Boolean))].join(', ') || '—'
  const rows = items
    .map(
      (i, n) => `<tr>
        <td>${n + 1}</td>
        <td>${esc(i.name)}${i.note ? `<div class="n">${esc(i.note)}</div>` : ''}</td>
        <td class="r"><b>${i.qty}</b> ${esc(i.unit)}</td>
        <td>${esc(i.category)}</td>
        <td class="r">${i.price ? '$' + Number(i.price).toFixed(2) : '—'}</td>
        <td class="r">${i.price ? '$' + (i.qty * i.price).toFixed(2) : '—'}</td>
        <td>${esc(i.barcode || '')}</td>
        <td>${esc(i.updated_by || '')}</td>
      </tr>`,
    )
    .join('')
  const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Stock Count Report</title>
    <style>
      *{box-sizing:border-box} body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;padding:28px}
      h1{margin:0 0 2px;font-size:22px} .sub{color:#666;font-size:13px;margin-bottom:18px}
      .cards{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
      .c{border:1px solid #ddd;border-radius:10px;padding:12px 16px;min-width:130px}
      .c .v{font-size:20px;font-weight:800} .c .l{font-size:11px;color:#777;text-transform:uppercase;letter-spacing:.5px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th{background:#f3f4f6;text-align:left;padding:8px;border-bottom:2px solid #ddd;font-size:11px;text-transform:uppercase;letter-spacing:.3px;color:#555}
      td{padding:8px;border-bottom:1px solid #eee;vertical-align:top}
      td.r{text-align:right;white-space:nowrap} .n{color:#888;font-size:11px;font-style:italic}
      tfoot td{font-weight:800;border-top:2px solid #ccc;background:#fafafa}
      @media print{body{padding:0}.noprint{display:none}}
      .btn{background:#f5c542;border:none;border-radius:8px;padding:10px 20px;font-weight:700;cursor:pointer;font-size:14px;margin-bottom:18px}
    </style></head><body>
    <button class="btn noprint" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <h1>Stock Count Report</h1>
    <div class="sub">Generated ${new Date().toLocaleString()} · Counted by: ${esc(counters)}</div>
    <div class="cards">
      <div class="c"><div class="v">${totalItems}</div><div class="l">Product Types</div></div>
      <div class="c"><div class="v">${totalQty}</div><div class="l">Total Units</div></div>
      <div class="c"><div class="v">$${totalVal.toFixed(2)}</div><div class="l">Inventory Value</div></div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Product</th><th class="r">Qty</th><th>Category</th><th class="r">Unit Price</th><th class="r">Value</th><th>Barcode</th><th>By</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td></td><td>TOTAL</td><td class="r">${totalQty}</td><td></td><td></td><td class="r">$${totalVal.toFixed(2)}</td><td></td><td></td></tr></tfoot>
    </table>
    <script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script>
    </body></html>`
  const w = window.open('', '_blank')
  if (!w) throw new Error('popup-blocked')
  w.document.open()
  w.document.write(doc)
  w.document.close()
}
