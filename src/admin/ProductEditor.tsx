import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2 } from 'lucide-react';
import { catalogError, removeFiles, saveProduct } from '../catalog/api';
import { emptySpecifications, makeSlug, priceUnits, type Category, type Product, type ProductImage, type ProductStatus } from '../catalog/model';
import { uploadImage } from '../catalog/uploads';

function newProduct(category: string): Product {
  return { id: crypto.randomUUID(), slug: '', sku: '', title: '', short_description: '', description: '', category_id: category,
    price: null, price_unit: 'piece', price_status: 'on_request', specifications: emptySpecifications(), status: 'draft',
    created_at: '', updated_at: '', product_images: [] };
}
export function ProductEditor({ product, categories, onClose, onSaved }: { product?: Product; categories: Category[]; onClose: () => void; onSaved: (message: string) => void }) {
  const [form, setForm] = useState<Product>(() => product ? { ...product, specifications: { ...emptySpecifications(), ...product.specifications } } : newProduct(categories[0]?.id ?? ''));
  const [images, setImages] = useState<ProductImage[]>(() => [...(product?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order));
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [lists, setLists] = useState(() => ({ sizes: product?.specifications.sizes?.join('\n') ?? '', materials: product?.specifications.materials?.join('\n') ?? '', finishes: product?.specifications.finishes?.join('\n') ?? '' }));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const staged = useRef<ProductImage[]>([]);
  const lock = useRef(false);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; staged.current.forEach(image => { if (image.url?.startsWith('blob:')) URL.revokeObjectURL(image.url); }); }; }, []);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty || uploading) { event.preventDefault(); event.returnValue = ''; } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty, uploading]);
  const update = <K extends keyof Product>(key: K, value: Product[K]) => { setForm(current => ({ ...current, [key]: value })); setDirty(true); };
  async function upload(files: FileList | File[]) {
    if (lock.current || busy) return;
    lock.current = true; setUploading(true); setError(''); setDirty(true);
    const failures: string[] = [];
    for (let i = 0; i < files.length; i++) {
      setProgress(`Загрузка ${i + 1} из ${files.length}`);
      try {
        const image = await uploadImage(files[i], form.id);
        if (!active.current) { await removeFiles([image.storage_path]); URL.revokeObjectURL(image.url!); break; }
        staged.current.push(image);
        setImages(current => [...current, { ...image, is_cover: current.length === 0, sort_order: current.length }]);
      } catch (failure) { failures.push(failure instanceof Error ? failure.message : 'Не удалось загрузить фото.'); }
    }
    lock.current = false;
    if (active.current) { setUploading(false); setProgress(''); setError(failures.join('\n')); }
  }
  function moveImage(index: number, delta: number) {
    setImages(current => { const next = [...current]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; return next; }); setDirty(true);
  }
  async function cancel() {
    if (dirty && !window.confirm('Закрыть карточку без сохранения изменений?')) return;
    setBusy(true);
    try { await removeFiles(staged.current.map(i => i.storage_path)); onClose(); }
    catch { setError('Не удалось удалить временные фотографии. Повторите отмену при восстановлении подключения.'); setBusy(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || lock.current) return;
    setBusy(true); setError('');
    const status = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)?.value as ProductStatus || 'draft';
    const numericPrice = price.trim() && form.price_unit !== 'request' ? Number(price) : null;
    if (numericPrice !== null && (!Number.isFinite(numericPrice) || numericPrice <= 0)) { setError('Укажите цену больше нуля или оставьте поле пустым.'); setBusy(false); return; }
    const specifications = { ...form.specifications, ...Object.fromEntries(Object.entries(lists).map(([key, value]) => [key, value.split('\n').map(line => line.trim()).filter(Boolean)])) };
    const next = { ...form, title: form.title.trim(), sku: form.sku.trim(), slug: form.slug || makeSlug(form.title, form.id), price: numericPrice, price_status: numericPrice === null ? 'on_request' as const : 'fixed' as const, specifications, status };
    try {
      await saveProduct(next, images, Boolean(product));
      const retained = new Set(images.map(i => i.storage_path));
      const removed = [...(product?.product_images ?? []), ...staged.current].filter(i => !retained.has(i.storage_path));
      let warning = '';
      try { await removeFiles(removed.map(i => i.storage_path)); } catch { warning = ' Неиспользуемые файлы остались в Storage; см. инструкцию очистки.'; }
      setDirty(false); window.dispatchEvent(new Event('takto:catalog-changed'));
      onSaved(`${status === 'published' ? 'Товар опубликован.' : 'Черновик сохранён.'}${warning}`);
    } catch (failure) { setError(catalogError(failure)); setBusy(false); }
  }
  return <form className="admin-editor" onSubmit={save}>
    <div className="admin-heading"><div><p className="eyebrow">TAKTO. / КАТАЛОГ</p><h2>{product ? 'Редактировать товар' : 'Новый товар'}</h2></div><button type="button" className="admin-secondary" disabled={busy || uploading} onClick={cancel}>Отмена</button></div>
    <fieldset disabled={busy} className="admin-group"><legend>01 — Основное</legend><div className="admin-fields">
      <label>Название товара *<input required maxLength={200} value={form.title} onChange={e => update('title', e.target.value)}/></label>
      <label>Категория *<select required value={form.category_id} onChange={e => update('category_id', e.target.value)}><option value="" disabled>Выберите категорию</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="admin-wide">Краткое описание<textarea rows={2} maxLength={500} value={form.short_description} onChange={e => update('short_description', e.target.value)}/></label>
      <label className="admin-wide">Полное описание<textarea rows={5} maxLength={20000} value={form.description} onChange={e => update('description', e.target.value)}/></label>
      <label>SKU / артикул<input maxLength={100} value={form.sku} onChange={e => update('sku', e.target.value)}/></label>
      {form.slug && <p className="admin-hint">Постоянный адрес: /product/{form.slug}</p>}
    </div></fieldset>
    <fieldset disabled={busy || uploading} className="admin-group"><legend>02 — Фотографии</legend>
      <label className="admin-drop" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void upload(e.dataTransfer.files); }}><ImagePlus size={30}/><span>Выберите фотографии или перетащите сюда</span><small>JPG, PNG, WebP · до 8 МБ на файл · до 40 Мп</small><input type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="Загрузить фотографии" onChange={e => { if (e.target.files) void upload(e.target.files); e.target.value = ''; }}/></label>
      <div className="admin-gallery">{images.map((image, index) => <article key={image.id} className={image.is_cover ? 'is-cover' : ''}>
        <img src={image.url} alt={image.alt_text || form.title || 'Предпросмотр фотографии'} width="320" height="240"/>
        <label>Alt-текст<input maxLength={500} value={image.alt_text} onChange={e => { setImages(current => current.map(i => i.id === image.id ? { ...i, alt_text: e.target.value } : i)); setDirty(true); }}/></label>
        <div className="admin-image-actions"><button type="button" aria-pressed={image.is_cover} onClick={() => { setImages(current => current.map(i => ({ ...i, is_cover: i.id === image.id }))); setDirty(true); }}><Star size={15}/>{image.is_cover ? 'Главная' : 'Сделать главной'}</button><button type="button" disabled={index === 0} onClick={() => moveImage(index, -1)} aria-label={`Фото ${index + 1}: переместить раньше`}><ArrowUp size={16}/></button><button type="button" disabled={index === images.length - 1} onClick={() => moveImage(index, 1)} aria-label={`Фото ${index + 1}: переместить позже`}><ArrowDown size={16}/></button><button type="button" aria-label={`Удалить фото ${index + 1}`} onClick={() => { setImages(current => { const next = current.filter(i => i.id !== image.id); if (image.is_cover && next[0]) next[0] = { ...next[0], is_cover: true }; return next; }); setDirty(true); }}><Trash2 size={16}/></button></div>
      </article>)}</div>
      <p className="admin-hint">Первое фото становится главным. Удаление и порядок применяются после сохранения карточки.</p>
    </fieldset>
    {progress && <p role="status">{progress}…</p>}
    <fieldset disabled={busy} className="admin-group"><legend>03 — Цена и параметры</legend><div className="admin-fields">
      <label>Цена, сум<input type="number" min="0.01" max="999999999999.99" step="0.01" disabled={form.price_unit === 'request'} value={price} onChange={e => { setPrice(e.target.value); setDirty(true); }}/><small>Пустое поле — «По запросу».</small></label>
      <label>Единица измерения<select value={form.price_unit} onChange={e => update('price_unit', e.target.value as Product['price_unit'])}>{Object.entries(priceUnits).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      {([['sizes', 'Размеры и форматы'], ['materials', 'Материалы'], ['finishes', 'Отделка']] as const).map(([key, label]) => <label key={key}>{label}<textarea rows={3} placeholder="Каждый вариант с новой строки" value={lists[key]} onChange={e => { setLists(current => ({ ...current, [key]: e.target.value })); setDirty(true); }}/></label>)}
      <label>Минимальный тираж<input type="number" min="1" max="100000" step="1" value={form.specifications.minimum_quantity ?? ''} onChange={e => update('specifications', { ...form.specifications, minimum_quantity: e.target.value ? Number(e.target.value) : null })}/></label>
      {([['production','Особенности изготовления'],['lead_time','Примечание о сроках'],['additional','Дополнительные характеристики']] as const).map(([key, label]) => <label key={key}>{label}<textarea rows={3} maxLength={3000} value={form.specifications[key]} onChange={e => update('specifications', { ...form.specifications, [key]: e.target.value })}/></label>)}
    </div></fieldset>
    <fieldset disabled={busy || uploading} className="admin-group"><legend>04 — Публикация</legend><p>Черновики доступны только вам. Опубликованные товары появляются в каталоге; товары с фото могут попасть в подборку на главной.</p><div className="admin-actions"><button type="submit" className="admin-secondary" value="draft">Сохранить черновик</button><button type="submit" className="admin-primary" value="published">{busy ? 'Сохранение…' : 'Опубликовать'}</button></div></fieldset>
    {error && <p className="admin-error" role="alert">{error}</p>}
  </form>;
}
