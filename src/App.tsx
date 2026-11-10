import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, Search, ShoppingBag } from 'lucide-react';
import { CommerceProvider, CommerceOverlays, Modal, useCommerce } from './commerce';
import { TelegramButton } from './components/TelegramButton';
import Home from './pages/Home';
import Catalog from './pages/DynamicCatalog';
import ProductPage from './pages/Product';
import { CatalogProvider } from './catalog/CatalogProvider';
import Information from './pages/Information';

const Admin = lazy(() => import('./admin/Admin'));

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openSearch, openCart, cartCount } = useCommerce();
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location]);
  const nav = <><NavLink to="/" end>Главная</NavLink><NavLink to="/catalog">Каталог</NavLink><Link to="/#services">Услуги</Link><Link to="/#about">О нас</Link><Link to="/#contacts">Контакты</Link></>;
  return <>
    <a className="skip-link" href="#main-content">Перейти к содержимому</a>
    <header className="site-header page-width">
      <Link className="brand-lockup" to="/" aria-label="TAKTO. — Главная"><span className="wordmark">TAKTO<span>.</span></span><span className="brand-description">Студия печати<br/>и брендирования</span></Link>
      <nav aria-label="Основная навигация" className="desktop-nav">{nav}</nav>
      <div className="header-actions"><button className="icon-button" onClick={openSearch} aria-label="Открыть поиск"><Search/></button><button className="icon-button cart-trigger" onClick={openCart} aria-label={`Открыть корзину, товаров: ${cartCount}`}><ShoppingBag/><span className="cart-count">{cartCount > 99 ? '99+' : cartCount}</span></button><TelegramButton/><button className="icon-button menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Открыть меню" aria-expanded={menuOpen}><Menu/></button></div>
    </header>
    {menuOpen && <Modal fullHeight title="Меню" eyebrow="TAKTO. STUDIO" onClose={() => setMenuOpen(false)}><nav className="mobile-nav" aria-label="Мобильная навигация">{nav}</nav><TelegramButton beforeOpen={() => setMenuOpen(false)}/></Modal>}
  </>;
}

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}), 60);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function Footer() {
  const { openContact } = useCommerce();
  return <footer className="site-footer page-width"><div className="footer-top"><Link to="/" className="wordmark" aria-label="TAKTO. Главная">TAKTO<span>.</span></Link><p>От дизайна до того,<br/>что можно пощупать.</p><div><Link to="/catalog">Каталог <ArrowUpRight size={16}/></Link><button onClick={() => openContact()}>Обсудить проект <ArrowUpRight size={16}/></button></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} TAKTO. Creative Print & Branding Studio</span><div className="footer-info-links"><Link to="/privacy">Данные и конфиденциальность</Link><Link to="/terms">Условия расчёта</Link></div></div></footer>;
}

function NotFound() { return <main id="main-content" className="not-found page-width"><p className="eyebrow">404 / НЕМНОГО НЕ ТУДА</p><h1>Здесь пока<br/>чистый лист.</h1><p>Вернёмся к вашим идеям?</p><Link className="button button-dark" to="/">На главную <ArrowUpRight size={20}/></Link></main>; }

export default function App() {
  const { pathname } = useLocation();
  const admin = pathname === '/admin' || pathname.startsWith('/admin/');
  return <CatalogProvider><CommerceProvider><ScrollManager/>{!admin && <Header/>}<Routes><Route path="/" element={<Home/>}/><Route path="/catalog" element={<Catalog/>}/><Route path="/catalog/:categoryId" element={<Catalog/>}/><Route path="/product/:slug" element={<ProductPage/>}/><Route path="/admin/*" element={<Suspense fallback={<main id="main-content" className="page-width" role="status">Загрузка панели управления…</main>}><Admin/></Suspense>}/><Route path="/privacy" element={<Information kind="privacy"/>}/><Route path="/terms" element={<Information kind="terms"/>}/><Route path="*" element={<NotFound/>}/></Routes>{!admin && <><Footer/><CommerceOverlays/></>}</CommerceProvider></CatalogProvider>;
}
