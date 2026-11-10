import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type CartItem = { id: string; name: string; unitPrice: number | null; quantity: number; details?: string; priceUnit?: string; productId?: string };
export type CommerceModal = { kind: 'calculator'; categoryId?: string } | { kind: 'contact'; summary?: string } | { kind: 'cart' } | { kind: 'search' } | null;
type CommerceContextValue = {
  cart: CartItem[]; favorites: string[]; cartCount: number; modal: CommerceModal; storageAvailable: boolean;
  addItem: (item: CartItem) => void; updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void; clearCart: () => void; toggleFavorite: (id: string) => void;
  openCalculator: (categoryId?: string) => void; openContact: (summary?: string) => void;
  openCart: () => void; openSearch: () => void; closeModal: () => void;
};
const CommerceContext = createContext<CommerceContextValue | undefined>(undefined);
const CART_KEY = 'takto.cart.v1';
const FAVORITES_KEY = 'takto.favorites.v1';
function readStored(key: string): unknown {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
const validItem = (item: unknown): item is CartItem => {
  if (!item || typeof item !== 'object') return false;
  const value = item as CartItem;
  return typeof value.id === 'string' && typeof value.name === 'string' && (value.unitPrice === null || (Number.isFinite(value.unitPrice) && value.unitPrice > 0)) && Number.isInteger(value.quantity) && value.quantity > 0 && value.quantity <= 100000 && (value.details === undefined || typeof value.details === 'string') && (value.priceUnit === undefined || typeof value.priceUnit === 'string');
};
export function CommerceProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => { const value = readStored(CART_KEY); return Array.isArray(value) ? value.filter(validItem).slice(0, 100) : []; });
  const [favorites, setFavorites] = useState<string[]>(() => { const value = readStored(FAVORITES_KEY); return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string'))].slice(0, 1000) : []; });
  const [modal, setModal] = useState<CommerceModal>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); } catch { setStorageAvailable(false); } }, [cart, favorites]);
  const addItem = (item: CartItem) => {
    if (!validItem(item)) return;
    setCart(current => {
      const found = current.find(entry => entry.id === item.id);
      return found ? current.map(entry => entry.id === item.id ? { ...entry, quantity: Math.min(100000, entry.quantity + item.quantity) } : entry) : [...current, item];
    });
  };
  return <CommerceContext.Provider value={{
    cart, favorites, cartCount: cart.reduce((sum, item) => sum + item.quantity, 0), modal, storageAvailable, addItem,
    updateQuantity: (id, quantity) => { if (Number.isFinite(quantity)) setCart(current => current.map(item => item.id === id ? { ...item, quantity: Math.max(1, Math.min(100000, Math.round(quantity))) } : item)); },
    removeItem: id => setCart(current => current.filter(item => item.id !== id)), clearCart: () => setCart([]),
    toggleFavorite: id => setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]),
    openCalculator: categoryId => setModal({ kind: 'calculator', categoryId }), openContact: summary => setModal({ kind: 'contact', summary }),
    openCart: () => setModal({ kind: 'cart' }), openSearch: () => setModal({ kind: 'search' }), closeModal: () => setModal(null),
  }}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error('useCommerce must be used within CommerceProvider');
  return context;
}
