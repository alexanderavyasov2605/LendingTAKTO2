import { IMAGE_BUCKET, requireSupabase } from './supabase';
import type { ProductImage } from './model';

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export function imageSignature(bytes: Uint8Array) {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if ([137,80,78,71,13,10,26,10].every((byte, index) => bytes[index] === byte)) return 'image/png';
  if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}
export async function uploadImage(file: File, productId: string): Promise<ProductImage> {
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name}: максимальный размер — 8 МБ.`);
  const mime = imageSignature(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
  if (!mime || mime !== file.type) throw new Error(`${file.name}: выберите JPG, PNG или WebP.`);
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error(`${file.name}: изображение должно быть не больше 40 мегапикселей.`);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Браузер не поддерживает обработку изображений.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Не удалось обработать изображение.')), 'image/webp', .86));
    const id = crypto.randomUUID();
    const extension = blob.type === 'image/webp' ? 'webp' : 'png';
    const storage_path = `${productId}/${id}.${extension}`;
    const { error } = await requireSupabase().storage.from(IMAGE_BUCKET).upload(storage_path, blob, { contentType: blob.type, cacheControl: '300', upsert: false });
    if (error) throw new Error(`${file.name}: загрузка не завершена. Проверьте подключение и права доступа.`);
    return { id, product_id: productId, storage_path, alt_text: '', sort_order: 0, is_cover: false, url: URL.createObjectURL(blob) };
  } finally { bitmap.close(); }
}
