import { CATEGORIES, CHART_COLORS, type Product } from '../types'

interface Props {
  items: Product[]
  onExportCSV: () => void
  onExportPDF: () => void
}

export function Analytics({ items, onExportCSV, onExportPDF }: Props) {
  const totalItems = items.length
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const totalVal = items.reduce((s, i) => s + i.qty * i.price, 0)

  const catSummary = CATEGORIES.map((cat) => ({
    cat,
    qty: items.filter((i) => i.category === cat).reduce((s, i) => s + i.qty, 0),
    count: items.filter((i) => i.category === cat).length,
  })).filter((c) => c.count > 0)

  const maxQty = Math.max(...items.map((i) => i.qty), 1)
  const sorted = [...items].sort((a, b) => b.qty - a.qty).slice(0, 8)

  return (
    <>
      <div className="export-row">
        <button className="btn-export" onClick={onExportCSV}>
          ⬇️ Export CSV
        </button>
        <button className="btn-export" onClick={onExportPDF}>
          🖨️ Print / PDF
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-val" style={{ color: '#60a5fa' }}>
            {totalItems}
          </div>
          <div className="stat-lbl">Product Types</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔢</div>
          <div className="stat-val" style={{ color: '#34d399' }}>
            {totalQty}
          </div>
          <div className="stat-lbl">Total Units</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-val" style={{ color: '#f5c542' }}>
            ${totalVal.toFixed(0)}
          </div>
          <div className="stat-lbl">Inventory Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-val" style={{ color: '#c084fc' }}>
            {catSummary.length}
          </div>
          <div className="stat-lbl">Categories</div>
        </div>
      </div>

      {catSummary.length > 0 && (
        <div className="section-card">
          <div className="section-title">By Category</div>
          {catSummary.map((c, i) => {
            const pct = totalQty > 0 ? Math.round((c.qty / totalQty) * 100) : 0
            return (
              <div className="bar-row" key={c.cat}>
                <div className="bar-label">
                  <span>{c.cat}</span>
                  <span>
                    {c.qty} units · {pct}%
                  </span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="section-card">
          <div className="section-title">Top Stock by Quantity</div>
          {sorted.map((item, i) => {
            const pct = Math.round((item.qty / maxQty) * 100)
            return (
              <div className="rank-row" key={item.id}>
                <div className={`rank-num ${i < 3 ? 'top' : ''}`}>{i + 1}</div>
                <div className="rank-photo">{item.photo ? <img src={item.photo} alt="" /> : '📦'}</div>
                <div className="rank-info">
                  <div className="rank-name">{item.name}</div>
                  <div className="rank-bar-track">
                    <div className="rank-bar-fill" style={{ width: `${pct}%`, background: `hsl(${200 + i * 22},65%,55%)` }} />
                  </div>
                </div>
                <div className="rank-qty">
                  {item.qty} {item.unit}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {items.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📊</div>
          <div className="empty-text">No data yet — add some products first</div>
        </div>
      )}
    </>
  )
}
