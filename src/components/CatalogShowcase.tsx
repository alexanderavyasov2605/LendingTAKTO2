import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useCatalog } from '../catalog/CatalogProvider';
import { sampleProducts } from '../catalog/model';
import { ProductPhoto } from '../catalog/ProductCard';
import { ScrollTrigger } from '../animations/gsap';
import '../pages/products.css';
export function CatalogShowcase() {
  const { products } = useCatalog(); const selected = useRef<string[] | null>(null); const track = useRef<HTMLDivElement>(null);
  if (!selected.current && products.length) selected.current = sampleProducts(products).map(p => p.id);
  const chosen = (selected.current ?? []).flatMap(id => { const p = products.find(p => p.id === id); return p ? [p] : []; });
  useEffect(() => { ScrollTrigger.refresh(); }, [chosen.length]);
  const move = (direction: number) => track.current?.scrollBy({ left: direction * (track.current.clientWidth * .8), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  return <section className="catalog-showcase page-width section-space" aria-label="Продукция TAKTO.">{chosen.length > 0 && <><div className="section-heading"><div><p className="eyebrow">ДЕТАЛИ TAKTO.</p><h2 id="showcase-title">То, что мы создаём.</h2><p>Детали, которые делают бренд узнаваемым.</p></div><div className="showcase-controls"><button onClick={() => move(-1)} aria-label="Предыдущие товары"><ArrowLeft/></button><button onClick={() => move(1)} aria-label="Следующие товары"><ArrowRight/></button></div></div><div className="showcase-track" ref={track} tabIndex={0} aria-label="Подборка опубликованных товаров" onKeyDown={e => { if (['ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); move(e.key === 'ArrowLeft' ? -1 : 1); } }}>{chosen.map(product => <Link key={product.id} className="showcase-slide" to={`/product/${encodeURIComponent(product.slug)}`}><div><ProductPhoto product={product}/></div><h3>{product.title}<ArrowUpRight size={23}/></h3></Link>)}</div></>}
    <Link to="/catalog" className="catalog-transition"><span>{chosen.length ? 'Больше деталей. Больше возможностей.' : 'Найдём детали для вашего бренда.'}</span><b>В каталог TAKTO. <ArrowUpRight size={21}/></b></Link></section>;
}
