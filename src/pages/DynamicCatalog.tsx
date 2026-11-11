import { useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Heart, Search, SlidersHorizontal, X } from 'lucide-react';
import { gsap, useGSAP } from '../animations/gsap';
import { useCommerce } from '../commerce';
import { useCatalog } from '../catalog/CatalogProvider';
import { ProductCard } from '../catalog/ProductCard';
import './catalog.css';

export default function Catalog() {
  const { products, categories, loading, error, refresh } = useCatalog();
  const { favorites, openContact } = useCommerce();
  const { categoryId } = useParams();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const search = params.get('search') ?? '';
  const saved = params.get('saved') === '1';
  const sort = params.get('sort') ?? '';
  const slug = categoryId === 'windows' ? 'vinyl' : categoryId;
  const category = categories.find(c => c.slug === slug);
  const update = (key: string, value: string) => setParams(current => {
    const next = new URLSearchParams(current);
    if (value) next.set(key, value); else next.delete(key);
    return next;
  }, { replace: true });
  const query = search.trim().toLocaleLowerCase('ru');
  const filtered = products.filter(p => (!slug || p.category_id === category?.id)
    && (!saved || favorites.includes(p.id))
    && (!query || `${p.title} ${p.short_description} ${p.sku} ${categories.find(c => c.id === p.category_id)?.name ?? ''}`.toLocaleLowerCase('ru').includes(query)));
  if (sort) filtered.sort((a, b) => {
    const aPrice = a.price_status === 'fixed' && a.price_unit !== 'request' && a.price ? a.price : null;
    const bPrice = b.price_status === 'fixed' && b.price_unit !== 'request' && b.price ? b.price : null;
    return aPrice === null ? (bPrice === null ? 0 : 1) : bPrice === null ? -1 : sort === 'price-asc' ? aPrice - bPrice : bPrice - aPrice;
  });
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !filtered.length) return;
    gsap.from('.catalog-product', { y: 12, opacity: 0, duration: .38, stagger: .025, clearProps: 'all' });
  }, { scope: root, dependencies: [search, saved, sort, slug, products], revertOnUpdate: true });
  const suffix = params.size ? `?${params.toString()}` : '';
  const activeFilters = Number(Boolean(slug)) + Number(Boolean(query)) + Number(saved) + Number(Boolean(sort));
  const savedCount = favorites.filter(id => products.some(p => p.id === id)).length;

  return <main id="main-content" className="catalog-page" ref={root}>
    <nav className="catalog-breadcrumb" aria-label="Хлебные крошки"><Link to="/">Главная</Link><span aria-hidden="true">/</span>{category ? <><Link to="/catalog">Каталог</Link><span aria-hidden="true">/</span><span aria-current="page">{category.name}</span></> : <span aria-current="page">Каталог</span>}</nav>
    <header className="catalog-intro">
      <div><p className="catalog-eyebrow">TAKTO. / КАТАЛОГ ПРОДУКЦИИ</p><h1>{category?.name ?? <>Ваш бренд.<br/><span>В деталях.</span></>}</h1></div>
      <div className="catalog-intro-aside"><p>От первой наклейки до готовой упаковки.<br/>Выберите основу — остальное создадим вместе.</p><button className="catalog-custom" onClick={() => openContact()}>Обсудить свою идею <ArrowUpRight size={19}/></button></div>
    </header>

    <nav className="catalog-categories" aria-label="Категории продукции">
      <Link to={`/catalog${suffix}`} className={!slug ? 'is-active' : ''} aria-current={!slug ? 'page' : undefined}>Вся продукция <span>{products.length}</span></Link>
      {categories.map(c => <Link key={c.id} to={`/catalog/${c.slug}${suffix}`} className={slug === c.slug ? 'is-active' : ''} aria-current={slug === c.slug ? 'page' : undefined}>{c.name}<span>{products.filter(p => p.category_id === c.id).length}</span></Link>)}
    </nav>

    <div className="catalog-toolbar">
      <label className="catalog-search"><Search size={20} aria-hidden="true"/><input type="search" aria-label="Поиск в каталоге" placeholder="Название или артикул" value={search} onChange={e => update('search', e.target.value)}/>{search && <button type="button" aria-label="Очистить поиск" onClick={() => update('search', '')}><X size={17}/></button>}</label>
      <button className={`catalog-filter-trigger ${filtersOpen ? 'is-active' : ''}`} aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(value => !value)}><SlidersHorizontal size={18}/>Фильтры{activeFilters > 0 && <span>{activeFilters}</span>}</button>
      <div className={`catalog-filter-panel ${filtersOpen ? 'is-open' : ''}`} id="catalog-filters">
        <button className={`catalog-saved-toggle ${saved ? 'is-active' : ''}`} aria-pressed={saved} onClick={() => update('saved', saved ? '' : '1')}><Heart size={17} fill={saved ? 'currentColor' : 'none'}/>Избранное <span>{savedCount}</span></button>
        <label className="catalog-sort"><span className="catalog-sr">Сортировка товаров</span><select value={sort} onChange={e => update('sort', e.target.value)}><option value="">Сначала новые</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option></select></label>
      </div>
    </div>
    {activeFilters > 0 && <div className="catalog-active-filters" aria-label="Выбранные фильтры">
      {slug && <Link to={`/catalog${suffix}`}>{category?.name ?? 'Категория'}<X size={14}/><span className="catalog-sr"> — убрать категорию</span></Link>}
      {query && <button onClick={() => update('search', '')}>«{search}»<X size={14}/><span className="catalog-sr"> — убрать поиск</span></button>}
      {saved && <button onClick={() => update('saved', '')}>Избранное<X size={14}/><span className="catalog-sr"> — убрать фильтр</span></button>}
      {sort && <button onClick={() => update('sort', '')}>{sort === 'price-asc' ? 'Сначала дешевле' : 'Сначала дороже'}<X size={14}/><span className="catalog-sr"> — сбросить сортировку</span></button>}
      <Link className="catalog-reset" to="/catalog">Сбросить всё</Link>
    </div>}
    <div className="catalog-results-info"><span role="status" aria-live="polite">{loading ? 'Загружаем каталог…' : `Товаров: ${filtered.length}`}</span><span>Создаём под вашу задачу</span></div>

    {loading ? <div className="catalog-loading" role="status"><span className="catalog-sr">Подбираем детали для вашего бренда…</span><div className="catalog-grid" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <div className="catalog-skeleton" key={index}><div/><i/><i/></div>)}</div></div>
      : error ? <div className="catalog-empty" role="alert"><span className="catalog-empty-label">КАТАЛОГ ВРЕМЕННО НЕДОСТУПЕН</span><h2>Не удалось загрузить продукцию</h2><p>{error}</p><button className="button button-dark" onClick={() => void refresh()}>Попробовать снова <ArrowRight size={18}/></button></div>
      : filtered.length ? <div className="catalog-grid">{filtered.map(p => <ProductCard key={p.id} product={p} category={categories.find(c => c.id === p.category_id)?.name}/>)}</div>
      : <div className="catalog-empty"><Search size={30} strokeWidth={1.3}/><span className="catalog-empty-label">{!products.length ? 'СОБИРАЕМ КОЛЛЕКЦИЮ' : 'ВАША ПОДБОРКА'}</span><h2>{!products.length ? 'Новые детали — скоро здесь' : saved ? 'Здесь будут ваши находки' : 'Пока ничего не нашли'}</h2><p>{!products.length ? 'Каталог пополняется. Расскажите о своей задаче — поможем выбрать материал, формат и тираж.' : saved ? 'Сохраняйте понравившиеся изделия сердечком. Если они скрыты фильтрами, попробуйте сбросить выбор.' : 'Попробуйте другой запрос или посмотрите всю продукцию.'}</p>{!products.length ? <button className="button button-dark" onClick={() => openContact()}>Обсудить заказ <ArrowRight size={17}/></button> : <Link className="catalog-empty-link" to="/catalog">Показать всю продукцию <ArrowRight size={17}/></Link>}</div>}

    <aside className="catalog-bottom-callout"><span className="catalog-callout-label">ЕСТЬ СВОЯ ИДЕЯ?</span><div><h2>Начнём с чистого листа.</h2><p>Особенный формат, материал или задача.<br/>Поможем найти подходящее решение.</p></div><button onClick={() => openContact()}>Обсудить проект <ArrowUpRight size={22}/></button></aside>
  </main>;
}
