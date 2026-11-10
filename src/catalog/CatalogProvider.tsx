import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getCategories, getProducts } from './api';
import type { Category, Product } from './model';
import { supabase } from './supabase';

type CatalogState = { products: Product[]; categories: Category[]; loading: boolean; error: string; refresh: () => Promise<void> };
const Context = createContext<CatalogState | null>(null);
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    try {
      if (!supabase) throw new Error('not-configured');
      const [nextProducts, nextCategories] = await Promise.all([getProducts(), getCategories()]);
      if (current !== generation.current) return;
      setProducts(nextProducts); setCategories(nextCategories); setError('');
    } catch {
      if (current !== generation.current) return;
      // Never keep a formerly published item visible after a failed refresh.
      setProducts([]); setError('Каталог временно недоступен. Попробуйте ещё раз или обсудите заказ со студией.');
    } finally { if (current === generation.current) setLoading(false); }
  }, []);
  useEffect(() => {
    void refresh();
    const update = () => { if (document.visibilityState === 'visible') void refresh(); };
    const timer = window.setInterval(update, 60_000);
    window.addEventListener('focus', update); window.addEventListener('takto:catalog-changed', update);
    document.addEventListener('visibilitychange', update);
    return () => { ++generation.current; clearInterval(timer); window.removeEventListener('focus', update); window.removeEventListener('takto:catalog-changed', update); document.removeEventListener('visibilitychange', update); };
  }, [refresh]);
  return <Context.Provider value={{ products, categories, loading, error, refresh }}>{children}</Context.Provider>;
}
export function useCatalog() { const context = useContext(Context); if (!context) throw new Error('CatalogProvider required'); return context; }
