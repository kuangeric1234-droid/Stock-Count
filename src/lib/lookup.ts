export interface ProductInfo {
  name: string
  image: string | null
}

/**
 * Look a barcode up in the free Open Food Facts database.
 * Best coverage for food / grocery / convenience-store items; returns null
 * when the barcode isn't found (the caller then just prefills the barcode).
 * No API key required.
 */
export async function lookupBarcode(code: string): Promise<ProductInfo | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json` +
        `?fields=product_name,brands,image_front_url,image_url`,
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 1 || !data.product) return null
    const p = data.product
    const name: string = (p.product_name || p.brands || '').trim()
    const image: string | null = p.image_front_url || p.image_url || null
    if (!name && !image) return null
    return { name, image }
  } catch {
    return null
  }
}
