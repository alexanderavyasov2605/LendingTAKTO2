import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart, ImageOff, Minus, Plus, ShoppingBag, ZoomIn } from 'lucide-react';
import { useCatalog } from '../catalog/CatalogProvider';
import { coverImage, emptySpecifications, priceUnits, productPrice, productSummary } from '../catalog/model';
import { Modal, useCommerce } from '../commerce';
import './products.css';
import './catalog-editorial.css';

export default function ProductPage() {
  const { slug } = useParams();
  const { products, categories, loading, error, refresh } = useCatalog();
  const product = products.find(p => p.slug === slug);
  const { openContact, addItem, openCart, favorites, toggleFavorite } = useCommerce();
  const [activeId, setActiveId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [failedImage, setFailedImage] = useState('');
  const [zoomOpen, setZoomOpen] = useState(false);
  useEffect(() => { setActiveId(''); setOptions({}); setQuantity(product?.specifications.minimum_quantity || 1); setFailedImage(''); setZoomOpen(false); }, [product?.id]);
  const pageClass = 'product-page product-editorial page-width';
  if (loading) return <main id="main-content" className={pageClass}><div className="product-state" role="status"><span className="eyebrow">КАТАЛОГ TAKTO.</span><h1>Загружаем детали…</h1><p>Подготавливаем фотографии и параметры изделия.</p></div></main>;
  if (error) return <main id="main-content" className={pageClass}><div className="product-state"><span className="eyebrow">КАТАЛОГ TAKTO.</span><h1>Попробуем ещё раз</h1><p role="alert">{error}</p><button className="button button-dark" onClick={() => void refresh()}>Повторить <ArrowRight size={18}/></button></div></main>;
  if (!product) return <main id="main-content" className={pageClass}><div className="product-state"><span className="eyebrow">КАТАЛОГ TAKTO.</span><h1>Товар недоступен</h1><p>Карточка не найдена или снята с публикации.<br/>Посмотрите другие изделия в каталоге.</p><Link className="button button-dark" to="/catalog">В каталог <ArrowRight size={18}/></Link></div></main>;

  const images = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order);
  const image = images.find(i => i.id === activeId) ?? coverImage(product);
  const availableImages = images.filter(i => i.url);
  const imageIndex = availableImages.findIndex(i => i.id === image?.id);
  const spec = { ...emptySpecifications(), ...product.specifications };
  const minimumQuantity = spec.minimum_quantity || 1;
  const summary = productSummary(product, quantity, options);
  const validQuantity = Number.isInteger(quantity) && quantity >= minimumQuantity && quantity <= 100000;
  const category = categories.find(c => c.id === product.category_id);
  const saved = favorites.includes(product.id);
  const hasImage = Boolean(image?.url && image.url !== failedImage);
  const fixedPrice = product.price_status === 'fixed' && product.price_unit !== 'request' && Boolean(product.price);
  const changePhoto = (direction: number) => {
    if (availableImages.length) setActiveId(availableImages[(Math.max(imageIndex, 0) + direction + availableImages.length) % availableImages.length].id);
  };
  const addToCart = () => {
    if (!validQuantity) return;
    addItem({ id: `product-${product.id}-${encodeURIComponent(JSON.stringify(options))}`, productId: product.id, name: product.title,
      unitPrice: fixedPrice ? product.price : null, priceUnit: priceUnits[product.price_unit], quantity,
      details: summary.split('\n').filter(line => !line.startsWith('Количество:') && !line.startsWith('Цена:')).join('\n') });
    openCart();
  };

  return <main id="main-content" className={pageClass}>
    <nav className="catalog-breadcrumb" aria-label="Хлебные крошки"><Link to="/catalog">Каталог</Link><span aria-hidden="true">/</span>{category && <><Link to={`/catalog/${category.slug}`}>{category.name}</Link><span aria-hidden="true">/</span></>}<span aria-current="page">{product.title}</span></nav>
    <div className="product-layout">
      <div className="product-gallery">
        <div className="product-main-image">
          {hasImage ? <button className="product-image-open" onClick={() => setZoomOpen(true)} aria-label={`Увеличить фотографию: ${image?.alt_text || product.title}`}><img src={image?.url} alt={image?.alt_text || product.title} width="900" height="1000" decoding="async" fetchPriority="high" onError={() => setFailedImage(image!.url!)}/><span className="product-zoom-icon" aria-hidden="true"><ZoomIn size={19}/></span></button>
            : <div className="product-image-placeholder"><ImageOff size={36} strokeWidth={1.1}/><p>{image?.url ? 'Не удалось загрузить фотографию' : 'Фотография пока не добавлена'}</p></div>}
        </div>
        {availableImages.length > 1 && <div className="product-gallery-navigation"><p aria-live="polite">{Math.max(imageIndex, 0) + 1} <span>/ {availableImages.length}</span></p><div><button aria-label="Предыдущее фото" onClick={() => changePhoto(-1)}><ArrowLeft size={18}/></button><button aria-label="Следующее фото" onClick={() => changePhoto(1)}><ArrowRight size={18}/></button></div></div>}
        {availableImages.length > 1 && <div className="product-thumbnails" role="group" aria-label="Фотографии изделия">{availableImages.map((i, index) => <button key={i.id} aria-label={`Показать фото ${index + 1}${i.alt_text ? `: ${i.alt_text}` : ''}`} aria-pressed={image?.id === i.id} onClick={() => setActiveId(i.id)}><img src={i.url} alt="" width="100" height="100" loading="lazy" decoding="async"/></button>)}</div>}
        <p className="product-gallery-note">Материал и оттенок уточним по образцам перед производством.</p>
      </div>

      <div className="product-info">
        <div className="product-kicker"><p className="eyebrow">{category?.name ?? 'TAKTO. / ПРОДУКЦИЯ'}</p><button type="button" className="product-save" aria-pressed={saved} aria-label={`${saved ? 'Убрать из избранного' : 'В избранное'}: ${product.title}`} onClick={() => toggleFavorite(product.id)}><Heart size={21} strokeWidth={1.4} fill={saved ? 'currentColor' : 'none'}/><span>{saved ? 'Сохранено' : 'Сохранить'}</span></button></div>
        <h1>{product.title}</h1>
        {product.short_description && <p className="product-short-description">{product.short_description}</p>}
        <div className="product-price-block"><strong className="product-price">{productPrice(product)}</strong><p>{fixedPrice ? 'Итоговую стоимость подтвердим после согласования параметров.' : 'Рассчитаем стоимость под ваш формат, материал и тираж.'}</p></div>
        <form onSubmit={e => { e.preventDefault(); if (validQuantity) openContact(summary); }}>
          <div className="product-form-heading"><h2>Сделайте своим</h2><span>Параметры заказа</span></div>
          <div className="product-options-grid">{([['sizes', 'Размер / формат'], ['materials', 'Материал'], ['finishes', 'Отделка']] as const).map(([key, label]) => spec[key].length > 0 && <label className="product-option" key={key}>{label}<select value={options[label] ?? ''} onChange={e => setOptions(current => ({ ...current, [label]: e.target.value }))}><option value="">Подобрать со студией</option>{spec[key].map(value => <option key={value}>{value}</option>)}</select></label>)}</div>
          <div className="product-quantity-row"><label className="product-option product-quantity-label" htmlFor="product-quantity">Количество{product.price_unit !== 'request' && <span>{priceUnits[product.price_unit]}</span>}</label><div className="product-quantity-control"><button type="button" aria-label="Уменьшить количество" disabled={quantity <= minimumQuantity} onClick={() => setQuantity(value => Math.max(minimumQuantity, value - 1))}><Minus size={17}/></button><input id="product-quantity" type="number" required min={minimumQuantity} max="100000" step="1" value={quantity} aria-describedby="product-quantity-hint" aria-invalid={!validQuantity} onChange={e => setQuantity(Number(e.target.value))}/><button type="button" aria-label="Увеличить количество" disabled={quantity >= 100000} onClick={() => setQuantity(value => Math.min(100000, Math.max(minimumQuantity - 1, value) + 1))}><Plus size={17}/></button></div></div>
          <p className={`product-quantity-hint ${!validQuantity ? 'is-invalid' : ''}`} id="product-quantity-hint">{!validQuantity ? `Укажите целое количество от ${minimumQuantity.toLocaleString('ru-RU')} до 100 000.` : spec.minimum_quantity ? `Минимальный тираж — ${spec.minimum_quantity.toLocaleString('ru-RU')}.` : 'Тираж и детали производства согласуем при расчёте.'}</p>
          <div className="product-actions"><button className="button button-dark" type="submit" disabled={!validQuantity}>Запросить расчёт <ArrowRight size={19}/></button><button type="button" className="button button-outline" disabled={!validQuantity} onClick={addToCart}><ShoppingBag size={18}/>В корзину</button></div>
          <p className="product-order-note">Без оплаты на сайте. Подтвердим макет, стоимость и сроки перед запуском.</p>
        </form>
        <dl className="product-quick-facts">{product.sku && <div><dt>Артикул</dt><dd>{product.sku}</dd></div>}{spec.lead_time && <div><dt>Срок изготовления</dt><dd>{spec.lead_time}</dd></div>}<div><dt>Под ваш бренд</dt><dd>Обсудим дизайн и материалы</dd></div></dl>
      </div>
    </div>

    <section className="product-description" aria-labelledby="product-details-title"><div><p className="eyebrow">БЛИЖЕ К ДЕТАЛЯМ</p><h2 id="product-details-title">Форма. Материал.<br/>Характер.</h2></div><div><p>{product.description || 'Детали производства и подходящие варианты обсудим с вами при расчёте.'}</p><dl>{([['production', 'Особенности изготовления'], ['lead_time', 'Сроки'], ['additional', 'Характеристики']] as const).map(([key, label]) => spec[key] && <div key={key}><dt>{label}</dt><dd>{spec[key]}</dd></div>)}</dl><Link className="product-back-link" to={category ? `/catalog/${category.slug}` : '/catalog'}><ArrowLeft size={17}/>Другие изделия{category ? `: ${category.name}` : ''}</Link></div></section>

    {zoomOpen && hasImage && <Modal wide title={product.title} eyebrow="ДЕТАЛИ ИЗДЕЛИЯ" onClose={() => setZoomOpen(false)}><div className="product-zoom-view"><img src={image?.url} alt={image?.alt_text || product.title}/>{availableImages.length > 1 && <div className="product-zoom-navigation"><button onClick={() => changePhoto(-1)} aria-label="Предыдущее фото"><ArrowLeft size={20}/></button><span aria-live="polite">{Math.max(imageIndex, 0) + 1} / {availableImages.length}</span><button onClick={() => changePhoto(1)} aria-label="Следующее фото"><ArrowRight size={20}/></button></div>}</div></Modal>}
  </main>;
}
