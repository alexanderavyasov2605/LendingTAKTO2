import { IMAGE_BUCKET, requireSupabase } from './supabase';
import type { Category, Product, ProductImage, ProductStatus } from './model';

const PAGE_SIZE = 200;
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await requireSupabase().from('categories').select('*').order('sort_order');
  if (error) throw error;
  return data ?? [];
}
export async function getProducts(admin = false): Promise<Product[]> {
  const client = requireSupabase();
  const all: Product[] = [];
  // Paginate beyond the API row limit; there is no fixed catalogue size.
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = client.from('products').select('*, product_images(*)').order('created_at', { ascending: false }).order('id').range(from, from + PAGE_SIZE - 1);
    if (!admin) query = query.eq('status', 'published');
    const { data, error } = await query;
    if (error) throw error;
    all.push(...(data as Product[]));
    if (data.length < PAGE_SIZE) break;
  }
  return signImages(all);
}
export async function signImages(products: Product[]): Promise<Product[]> {
  const images = products.flatMap(p => p.product_images);
  const urls = new Map<string, string>();
  for (let start = 0; start < images.length; start += 100) {
    const batch = images.slice(start, start + 100);
    const { data, error } = await requireSupabase().storage.from(IMAGE_BUCKET).createSignedUrls(batch.map(i => i.storage_path), 300);
    if (error) throw error;
    data?.forEach(i => { if (i.path && i.signedUrl && !i.error) urls.set(i.path, i.signedUrl); });
  }
  return products.map(p => ({ ...p, product_images: p.product_images.map(i => ({ ...i, url: urls.get(i.storage_path) })) }));
}
export async function saveProduct(product: Product, images: ProductImage[], existing: boolean): Promise<Product> {
  const { product_images: _images, created_at: _created, updated_at, ...fields } = product;
  const { data, error } = await requireSupabase().rpc('save_catalog_product', {
    p_product: fields,
    p_images: images.map((image, index) => ({ id: image.id, storage_path: image.storage_path, alt_text: image.alt_text, is_cover: image.is_cover, sort_order: index })),
    p_expected_updated_at: existing ? updated_at : null,
  });
  if (error) throw error;
  return { ...data, product_images: images } as Product;
}
export async function changeStatus(product: Product, status: ProductStatus) {
  return saveProduct({ ...product, status }, product.product_images, true);
}
export async function removeFiles(paths: string[]) {
  if (!paths.length) return;
  const { error } = await requireSupabase().storage.from(IMAGE_BUCKET).remove(paths);
  if (error) throw error;
}
export async function deleteProduct(product: Product) {
  const { data, error } = await requireSupabase().from('products').delete().eq('id', product.id).eq('updated_at', product.updated_at).select('id');
  if (error) throw error;
  if (!data.length) throw new Error('Карточка уже изменена. Обновите список перед удалением.');
  try { await removeFiles(product.product_images.map(i => i.storage_path)); return ''; }
  catch { return 'Карточка удалена. Некоторые файлы остались в Storage; удалите их по инструкции очистки.'; }
}
export function catalogError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === '23505') return 'Этот адрес или артикул уже используется.';
  if (code === '40001') return 'Карточка изменена в другой вкладке. Сохраните введённые данные и откройте актуальную карточку.';
  if (code === '42501' || code === 'PGRST301') return 'Недостаточно прав. Войдите в аккаунт администратора.';
  return 'Не удалось сохранить изменения. Проверьте подключение и повторите попытку. Введённые данные сохранены в форме.';
}
