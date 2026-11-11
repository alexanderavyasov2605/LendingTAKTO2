import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useCatalog } from '../catalog/CatalogProvider';
import { sampleProducts } from '../catalog/model';
import { ProductPhoto } from '../catalog/ProductCard';
import { ScrollTrigger } from '../animations/gsap';
import '../pages/products.css';
export function CatalogShowcase() {
  const { products, loading, error, refresh } = useCatalog();
  const selected = useRef<string[] | null>(null);
  const track = useRef<HTMLDivElement>(null);
  if (!selected.current && products.length) selected.current = sampleProducts(products).map(p => p.id);
  const chosen = (selected.current ?? []).flatMap(id => { const p = products.find(p => p.id === id); return p ? [p] : []; });
  useEffect(() => { ScrollTrigger.refresh(); }, [chosen.length]);
  const move = (direction: number) => track.current?.scrollBy({ left: direction * (track.current.clientWidth * .8), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  return <section className="catalog-showcase page-width section-space" aria-labelledby="showcase-title">
    <div className="section-heading">
      <div><p className="eyebrow">ДЕТАЛИ TAKTO.</p><h2 id="showcase-title">Маленькие вещи.<br/>Цельное впечатление.</h2></div>
      <div className="showcase-heading-aside">
        <p className="section-intro">Детали, которые делают бренд узнаваемым.</p>
        {chosen.length > 1 && <div className="showcase-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Предыдущие товары" aria-controls="showcase-track"><ArrowLeft size={20}/></button>
          <button type="button" onClick={() => move(1)} aria-label="Следующие товары" aria-controls="showcase-track"><ArrowRight size={20}/></button>
        </div>}
      </div>
    </div>
    {chosen.length > 0 ? <>
      <div className="showcase-track" id="showcase-track" ref={track} tabIndex={0} aria-label="Подборка опубликованных товаров" onKeyDown={event => {
        if (event.target === event.currentTarget && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
          event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
        {chosen.map((product, index) => <Link key={product.id} className="showcase-slide" to={`/product/${encodeURIComponent(product.slug)}`}>
          <div className="showcase-image"><ProductPhoto product={product}/></div>
          <p className="showcase-item-meta"><span>ДЕТАЛЬ / {String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={19} aria-hidden="true"/></p>
          <h3>{product.title}</h3>
        </Link>)}
      </div>
      {chosen.length > 1 && <p className="track-hint">Листайте подборку <ArrowRight size={16} aria-hidden="true"/></p>}
    </> : <div className="showcase-state" role="status" aria-live="polite">
      <p>{loading ? 'Загружаем детали…' : error || 'В подборке пока нет товаров. Посмотрите каталог или обсудите свою задачу со студией.'}</p>
      {!loading && error && <button type="button" onClick={() => void refresh()}>Попробовать снова <ArrowRight size={17} aria-hidden="true"/></button>}
    </div>}
    <Link to="/catalog" className="catalog-transition"><span>Подберите детали для своего бренда.</span><b>Весь каталог <ArrowUpRight size={20} aria-hidden="true"/></b></Link>
  </section>;
}
