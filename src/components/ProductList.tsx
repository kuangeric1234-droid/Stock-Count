import { FILTER_CATEGORIES, type Product } from '../types'

interface Props {
  items: Product[]
  search: string
  setSearch: (v: string) => void
  filterCat: string
  setFilterCat: (c: string) => void
  onStep: (id: string, delta: number) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function ProductList({ items, search, setSearch, filterCat, setFilterCat, onStep, onEdit, onDelete }: Props) {
  const totalItems = items.length
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const totalVal = items.reduce((s, i) => s + i.qty * i.price, 0)

  const q = search.toLowerCase()
  const filtered = items.filter(
    (it) =>
      (filterCat === 'All' || it.category === filterCat) &&
      (it.name.toLowerCase().includes(q) || (it.barcode && it.barcode.includes(search))),
  )

  return (
    <>
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search by name or barcode…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>
            ×
          </button>
        )}
      </div>

      <div className="cat-scroll">
        {FILTER_CATEGORIES.map((c) => (
          <button key={c} className={`chip ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="summary-row">
        <div className="summary-card">
          <div className="summary-val">
            {totalItems}
            <span className="summary-unit"> SKU</span>
          </div>
          <div className="summary-label">Products</div>
        </div>
        <div className="summary-card">
          <div className="summary-val">
            {totalQty}
            <span className="summary-unit"> units</span>
          </div>
          <div className="summary-label">Total Stock</div>
        </div>
        <div className="summary-card">
          <div className="summary-val">${totalVal.toFixed(0)}</div>
          <div className="summary-label">Total Value</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <div className="empty-text">
            {items.length === 0 ? 'No products yet — tap Add or Scan' : 'No products match your search'}
          </div>
        </div>
      ) : (
        filtered.map((item) => (
          <div className="item-card" key={item.id}>
            <div className="item-photo">{item.photo ? <img src={item.photo} alt="" /> : '📦'}</div>
            <div className="item-info">
              <div className="item-top">
                <div className="item-name">{item.name}</div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="item-qty">
                    {item.qty}
                    <span className="item-qty-unit"> {item.unit}</span>
                  </div>
                  {item.price > 0 && (
                    <div className="item-price">
                      ${item.price}/{item.unit}
                    </div>
                  )}
                </div>
              </div>
              <div className="tags">
                <span className="tag tag-cat">{item.category}</span>
                <span className="tag tag-date">{item.date}</span>
                {item.barcode && <span className="tag tag-bc">🔖 {item.barcode}</span>}
                {item.updated_by && <span className="tag tag-user">👤 {item.updated_by}</span>}
              </div>
              {item.note && <div className="item-note">{item.note}</div>}
              <div className="item-actions">
                <button className="btn-step" onClick={() => onStep(item.id, -1)}>
                  −
                </button>
                <button className="btn-step" onClick={() => onStep(item.id, 1)}>
                  +
                </button>
                <button className="btn-edit" onClick={() => onEdit(item.id)}>
                  ✏️ Edit
                </button>
                <button className="btn-del" onClick={() => onDelete(item.id)}>
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  )
}
