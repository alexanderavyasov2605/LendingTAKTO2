import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import { requireSupabase, supabase } from '../catalog/supabase';
import { catalogError, changeStatus, deleteProduct, getCategories, getProducts } from '../catalog/api';
import { coverImage, productPrice, type Category, type Product } from '../catalog/model';
import { ProductEditor } from './ProductEditor';
import './admin.css';

function Login({ error: externalError, onSuccess }: { error: string; onSuccess: () => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { error: failure } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password });
      if (failure) { setError(failure.status === 429 ? 'Слишком много попыток. Попробуйте позже.' : 'Вход не выполнен. Проверьте email, пароль и подключение.'); return; }
      setPassword(''); onSuccess();
    } catch { setError('Сервис входа недоступен. Попробуйте позже.'); }
    finally { setBusy(false); }
  }
  return <div className="admin-login"><Link to="/" className="wordmark">TAKTO<span>.</span></Link><form onSubmit={login}><p className="eyebrow">ТОЛЬКО ДЛЯ ВЛАДЕЛЬЦА</p><h1>Панель управления</h1><p>Войдите, чтобы управлять каталогом продукции.</p><label>Email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)}/></label><label>Пароль<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)}/></label><button className="admin-primary" disabled={busy || !supabase}>{busy ? 'Вход…' : 'Войти'}</button>{(error || externalError) && <p className="admin-error" role="alert">{error || externalError}</p>}{!supabase && <p className="admin-error" role="status">Supabase ещё не подключён. Инструкция находится в docs/supabase-setup.md.</p>}</form></div>;
}
function PasswordForm() {
  const [password, setPassword] = useState(''); const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function change(event: FormEvent) {
    event.preventDefault(); setMessage('');
    if (password !== repeat) { setMessage('Пароли не совпадают.'); return; }
    setBusy(true);
    try {
      const { error } = await requireSupabase().auth.updateUser({ password });
      if (error) { setMessage('Не удалось изменить пароль. Проверьте требования к паролю или выйдите и войдите снова перед повторной попыткой.'); return; }
      setPassword(''); setRepeat(''); setMessage('Пароль изменён.');
    } catch { setMessage('Сервис недоступен. Повторите попытку позже.'); }
    finally { setBusy(false); }
  }
  return <details className="admin-password"><summary>Изменить пароль</summary><form onSubmit={change}><label>Новый пароль<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)}/></label><label>Повторите пароль<input type="password" autoComplete="new-password" minLength={12} required value={repeat} onChange={e => setRepeat(e.target.value)}/></label><button className="admin-secondary" disabled={busy}>{busy ? 'Сохранение…' : 'Изменить пароль'}</button>{message && <p role="status">{message}</p>}</form></details>;
}
function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]); const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null); const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { const [p, c] = await Promise.all([getProducts(true), getCategories()]); setProducts(p); setCategories(c); }
    catch { setError('Не удалось загрузить каталог. Проверьте миграцию, права доступа и подключение.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  async function act(operation: () => Promise<unknown>) {
    setBusy(true); setError(''); setNotice('');
    try { const result = await operation(); setNotice(typeof result === 'string' && result ? result : 'Изменения сохранены.'); window.dispatchEvent(new Event('takto:catalog-changed')); await refresh(); }
    catch (failure) { setError(catalogError(failure)); }
    finally { setBusy(false); }
  }
  if (editing) return <ProductEditor product={editing === 'new' ? undefined : editing} categories={categories} onClose={() => setEditing(null)} onSaved={message => { setEditing(null); setNotice(message); void refresh(); }}/>;
  return <><header className="admin-heading"><div><Link to="/" className="wordmark">TAKTO<span>.</span></Link><span className="admin-label"> / ADMIN</span><h1>Управление каталогом продукции</h1></div><button className="admin-secondary" onClick={() => void act(async () => { const { error: failure } = await requireSupabase().auth.signOut(); if (failure) throw failure; })} disabled={busy}><LogOut size={16}/>Выйти</button></header>
    <div className="admin-toolbar"><div className="admin-counts"><span><b>{products.filter(p => p.status === 'published').length}</b> опубликовано</span><span><b>{products.filter(p => p.status === 'draft').length}</b> черновиков</span><span><b>{products.filter(p => p.status === 'archived').length}</b> скрыто</span></div><button className="admin-primary" onClick={() => setEditing('new')} disabled={loading || !categories.length || busy}><Plus size={18}/>Добавить товар</button></div>
    <PasswordForm/>
    <label className="admin-filter">Показывать<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Все карточки</option><option value="published">Опубликованные</option><option value="draft">Черновики</option><option value="archived">Скрытые</option></select></label>
    {notice && <p className="admin-notice" role="status">{notice}</p>}{error && <p className="admin-error" role="alert">{error} <button onClick={() => void refresh()}>Повторить</button></p>}
    {loading ? <p role="status">Загружаем каталог…</p> : <div className="admin-list">{products.filter(p => filter === 'all' || p.status === filter).map(product => <article key={product.id} className="admin-row"><div className="admin-thumb">{coverImage(product)?.url ? <img src={coverImage(product)?.url} alt="" width="80" height="80" loading="lazy"/> : <span>Без фото</span>}</div><div className="admin-row-title"><h2>{product.title}</h2><p>{categories.find(c => c.id === product.category_id)?.name}</p><small>Обновлено: {new Date(product.updated_at).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}</small></div><strong>{productPrice(product)}</strong><span className={`admin-status status-${product.status}`}>{product.status === 'published' ? 'Опубликован' : product.status === 'draft' ? 'Черновик' : 'Скрыт'}</span><div className="admin-row-actions"><button disabled={busy} onClick={() => setEditing(product)}>Редактировать</button><button disabled={busy} onClick={() => void act(() => changeStatus(product, product.status === 'published' ? 'archived' : 'published'))}>{product.status === 'published' ? 'Скрыть' : 'Опубликовать'}</button><button className="admin-danger" disabled={busy} onClick={() => { if (window.confirm(`Удалить «${product.title}» и его фотографии? Это действие нельзя отменить.`)) void act(() => deleteProduct(product)); }}>Удалить</button></div></article>)}{!products.length && !error && <div className="admin-empty"><h2>Ваш каталог начинается здесь</h2><p>Добавьте первый товар и сохраните его как черновик. На сайт он попадёт только после публикации.</p></div>}</div>}
  </>;
}
export default function Admin() {
  const [state, setState] = useState<'loading' | 'login' | 'admin'>('loading');
  const [error, setError] = useState(''); const version = useRef(0);
  const check = useCallback(async () => {
    const request = ++version.current;
    if (!supabase) { setState('login'); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (request !== version.current) return;
      if (!user) { setState('login'); return; }
      const { data, error: failure } = await supabase.rpc('is_catalog_admin');
      if (request !== version.current) return;
      if (failure || data !== true) { setError('У этого аккаунта нет доступа к управлению каталогом.'); setState('login'); await supabase.auth.signOut(); return; }
      setError(''); setState('admin');
    } catch { if (request === version.current) { setError('Не удалось проверить доступ. Повторите вход.'); setState('login'); } }
  }, []);
  useEffect(() => {
    void check();
    const subscription = supabase?.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') { ++version.current; setState('login'); } else { window.setTimeout(() => void check(), 0); } });
    return () => { ++version.current; subscription?.data.subscription.unsubscribe(); };
  }, [check]);
  return <main id="main-content" className="admin-shell">{state === 'loading' ? <p className="admin-loading" role="status">Проверяем доступ…</p> : state === 'admin' ? <Dashboard/> : <Login error={error} onSuccess={() => void check()}/>}</main>;
}
