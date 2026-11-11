import { Heart, ArrowUpRight, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCommerce } from '../commerce';
import { coverImage, productPrice, type Product } from './model';

export function ProductPhoto({ product }: { product: Product }) {
  const cover = coverImage(product);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [cover?.url]);
  return cover?.url && !failed
    ? <img src={cover.url} alt={cover.alt_text || product.title} width="640" height="640" loading="lazy" decoding="async" onError={() => setFailed(true)}/>
    : <span className="catalog-image-error"><ImageOff size={28} strokeWidth={1.2}/><span>{failed ? 'Фотография недоступна' : 'Фотография пока не добавлена'}</span></span>;
}

export function ProductCard({ product, category }: { product: Product; category?: string }) {
  const { favorites, toggleFavorite } = useCommerce();
  const saved = favorites.includes(product.id);
  const href = `/product/${encodeURIComponent(product.slug)}`;
  return <article className="catalog-product">
    <div className="catalog-product-image"><Link className="catalog-image-button" to={href} aria-label={`Подробнее: ${product.title}`}><ProductPhoto product={product}/></Link><button className={`catalog-favorite ${saved ? 'is-saved' : ''}`} aria-label={`${saved ? 'Убрать из избранного' : 'В избранное'}: ${product.title}`} aria-pressed={saved} onClick={() => toggleFavorite(product.id)}><Heart size={19} strokeWidth={1.4} fill={saved ? 'currentColor' : 'none'}/></button></div>
    <div className="catalog-product-content">{category && <span className="catalog-product-category">{category}</span>}<h2><Link to={href}>{product.title}</Link></h2>{product.short_description && <p>{product.short_description}</p>}<div className="catalog-product-price"><strong>{productPrice(product)}</strong></div><Link className="catalog-add" to={href}>Выбрать параметры <ArrowUpRight size={18}/></Link></div>
  </article>;
}
