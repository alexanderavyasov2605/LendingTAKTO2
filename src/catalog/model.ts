export type ProductStatus = 'draft' | 'published' | 'archived';
export const priceUnits = {
  piece: 'шт.', sheet: 'лист', kit: 'комплект', set: 'набор',
  linear_meter: 'пог. м', square_meter: 'м²', project: 'проект', request: 'по запросу',
} as const;
export type PriceUnit = keyof typeof priceUnits;
export interface Category { id: string; name: string; slug: string; sort_order: number }
export interface Specifications {
  sizes: string[]; materials: string[]; finishes: string[]; minimum_quantity: number | null;
  production: string; lead_time: string; additional: string;
}
export interface ProductImage {
  id: string; product_id: string; storage_path: string; alt_text: string;
  is_cover: boolean; sort_order: number; url?: string;
}
export interface Product {
  id: string; slug: string; sku: string; title: string; short_description: string;
  description: string; category_id: string; price: number | null; price_unit: PriceUnit;
  price_status: 'fixed' | 'on_request'; specifications: Specifications;
  status: ProductStatus; created_at: string; updated_at: string; product_images: ProductImage[];
}
export const emptySpecifications = (): Specifications => ({ sizes: [], materials: [], finishes: [], minimum_quantity: null, production: '', lead_time: '', additional: '' });
export function productPrice(product: Pick<Product, 'price' | 'price_status' | 'price_unit'>) {
  if (product.price_status !== 'fixed' || !product.price || product.price_unit === 'request') return 'По запросу';
  return `${new Intl.NumberFormat('ru-RU').format(product.price)} сум / ${priceUnits[product.price_unit]}`;
}
export function coverImage(product: Product) {
  return product.product_images.find(image => image.is_cover) ?? [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
}
export function sampleProducts(products: Product[], limit = 8, random = Math.random): Product[] {
  const pool = [...new Map(products.filter(p => p.status === 'published' && coverImage(p)?.url).map(p => [p.id, p])).values()];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, limit);
}
export function productSummary(product: Product, quantity: number, options: Record<string, string>) {
  return [`Товар: ${product.title}`, `ID: ${product.id}`, product.sku && `Артикул: ${product.sku}`,
    `Количество: ${quantity} ${priceUnits[product.price_unit] === 'по запросу' ? 'ед.' : priceUnits[product.price_unit]}`,
    ...Object.entries(options).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`),
    `Цена: ${productPrice(product)}`, 'Просьба подтвердить расчёт, параметры и сроки.'].filter(Boolean).join('\n');
}
export function makeSlug(title: string, id: string) {
  const base = title.toLowerCase().normalize('NFKC').replace(/[^a-zа-яё0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'product';
  return `${base}-${id}`;
}
