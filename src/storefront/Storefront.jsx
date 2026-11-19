import { createContext, useContext, useEffect, useState } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Minus, Plus, Trash2, User, Instagram, Twitter, Facebook } from 'lucide-react';
import { useDB } from '../kit/db';
import { useToast } from '../kit/ui';
import { money2 } from '../kit/format';
import { computeTotals } from '../seed';
import Home from './Home';
import { Collection, Product, SearchPage } from './Catalog';
import { CartPage, Checkout, ThankYou } from './Checkout';
import { Page, Blog, Post } from './Content';
import { AccountLogin, Account } from './Account';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);
export const R = { rounded: 'rounded-xl', sharp: 'rounded-none', pill: 'rounded-full' };

function CartProvider({ children }) {
  const { db, setKey } = useDB();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const items = db.cart || [];
  const api = {
    items, open, setOpen,
    count: items.reduce((s, i) => s + i.qty, 0),
    totals: computeTotals(items, db.settings, null),
    add: (p, variant, qty = 1) => {
      setKey('cart', (c = []) => {
        const k = `${p.id}:${variant || ''}`;
        const ex = c.find((i) => i.key === k);
        return ex ? c.map((i) => (i.key === k ? { ...i, qty: i.qty + qty } : i)) : [...c, { key: k, productId: p.id, title: p.title, image: p.images[0], handle: p.handle, variant, qty, price: p.price }];
      });
      setOpen(true);
      toast(`Added ${p.title} to cart`);
    },
    setQty: (key, qty) => setKey('cart', (c = []) => (qty <= 0 ? c.filter((i) => i.key !== key) : c.map((i) => (i.key === key ? { ...i, qty } : i)))),
    clear: () => setKey('cart', []),
  };
  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

function CartDrawer() {
  const { items, open, setOpen, totals, setQty } = useCart();
  const { db } = useDB();
  const navigate = useNavigate();
  const r = R[db.theme.radius];
  if (!open) return null;
  const remaining = db.settings.freeShippingOver - totals.subtotal;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 animate-fade" onClick={() => setOpen(false)} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white animate-slide">
        <div className="flex items-center justify-between border-b px-6 py-4"><h2 className="text-lg font-semibold">Your cart</h2><button onClick={() => setOpen(false)} aria-label="Close cart" className="cursor-pointer"><X size={20} /></button></div>
        {items.length > 0 && (
          <div className="border-b px-6 py-3 text-sm">
            {remaining > 0 ? <>You're <b>{money2(remaining)}</b> away from free shipping</> : <>🎉 You've unlocked <b>free shipping</b></>}
            <div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (totals.subtotal / db.settings.freeShippingOver) * 100)}%`, background: 'var(--a)' }} /></div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 && <div className="py-20 text-center text-slate-500">Your cart is empty.</div>}
          <ul className="space-y-5">
            {items.map((i) => (
              <li key={i.key} className="flex gap-4">
                <img src={i.image.replace('w=900', 'w=200')} alt="" className="h-24 w-20 rounded-lg object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2"><span className="text-sm font-medium">{i.title}</span><span className="text-sm">{money2(i.price * i.qty)}</span></div>
                  {i.variant && <span className="text-xs text-slate-500">Size {i.variant}</span>}
                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex items-center rounded-full border">
                      <button onClick={() => setQty(i.key, i.qty - 1)} className="p-1.5 cursor-pointer" aria-label="Decrease"><Minus size={13} /></button>
                      <span className="w-6 text-center text-sm">{i.qty}</span>
                      <button onClick={() => setQty(i.key, i.qty + 1)} className="p-1.5 cursor-pointer" aria-label="Increase"><Plus size={13} /></button>
                    </div>
                    <button onClick={() => setQty(i.key, 0)} className="text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="Remove"><Trash2 size={15} /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {items.length > 0 && (
          <div className="border-t px-6 py-5">
            <div className="flex justify-between font-medium"><span>Subtotal</span><span>{money2(totals.subtotal)}</span></div>
            <p className="mt-1 text-xs text-slate-500">Shipping, taxes and discount codes calculated at checkout.</p>
            <button onClick={() => { setOpen(false); navigate('/checkout'); }} className={`mt-4 h-12 w-full ${r} text-sm font-semibold text-white cursor-pointer`} style={{ background: 'var(--a)' }}>Checkout</button>
            <button onClick={() => { setOpen(false); navigate('/cart'); }} className="mt-2 h-10 w-full text-sm text-slate-600 underline cursor-pointer">View cart</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Header() {
  const { db } = useDB();
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState(false);
  const navigate = useNavigate();
  const loc = useLocation();
  useEffect(() => setMenu(false), [loc.pathname]);
  const links = [{ to: '/collections/all', label: 'Shop all' }, ...db.collections.map((c) => ({ to: `/collections/${c.handle}`, label: c.title })), { to: '/blogs/journal', label: 'Journal' }];
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      {db.theme.announcement && <div className="px-4 py-2 text-center text-xs font-medium tracking-wide text-white" style={{ background: 'var(--p)' }}>{db.theme.announcement}</div>}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <button className="lg:hidden cursor-pointer" onClick={() => setMenu(true)} aria-label="Menu"><Menu size={22} /></button>
        <Link to="/" className="text-xl font-bold tracking-tight" style={{ color: 'var(--p)' }}>{db.settings.storeName}</Link>
        <nav className="hidden flex-1 items-center gap-6 lg:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} className={({ isActive }) => `text-sm transition hover:opacity-100 ${isActive ? 'font-semibold opacity-100' : 'opacity-70'}`}>{l.label}</NavLink>)}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          {search ? (
            <form onSubmit={(e) => { e.preventDefault(); navigate(`/search?q=${encodeURIComponent(q)}`); setSearch(false); }}>
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => setSearch(false)} placeholder="Search products…" className="h-9 w-44 rounded-full border px-4 text-sm outline-none sm:w-60" />
            </form>
          ) : <button onClick={() => setSearch(true)} aria-label="Search" className="cursor-pointer"><Search size={20} /></button>}
          <Link to={sessionStorage.getItem('shopnest-customer') ? '/account' : '/account/login'} aria-label="Account"><User size={20} /></Link>
          <button onClick={() => setOpen(true)} className="relative cursor-pointer" aria-label="Cart">
            <ShoppingBag size={21} />
            {count > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: 'var(--a)' }}>{count}</span>}
          </button>
        </div>
      </div>
      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white p-6 animate-slide-left">
            <button onClick={() => setMenu(false)} className="mb-6 cursor-pointer" aria-label="Close menu"><X size={22} /></button>
            <nav className="flex flex-col gap-4">{links.map((l) => <Link key={l.to} to={l.to} className="text-lg">{l.label}</Link>)}</nav>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { db } = useDB();
  return (
    <footer className="mt-24 text-white" style={{ background: 'var(--p)' }}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-xl font-bold">{db.settings.storeName}</div>
          <p className="mt-3 max-w-sm text-sm opacity-70">{db.settings.tagline}</p>
          <div className="mt-5 flex gap-4 opacity-80"><Instagram size={18} /><Twitter size={18} /><Facebook size={18} /></div>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Shop</div>
          <ul className="space-y-2 text-sm opacity-70">{db.collections.map((c) => <li key={c.id}><Link to={`/collections/${c.handle}`} className="hover:underline">{c.title}</Link></li>)}</ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Info</div>
          <ul className="space-y-2 text-sm opacity-70">
            {db.pages.filter((p) => p.published).map((p) => <li key={p.id}><Link to={`/pages/${p.handle}`} className="hover:underline">{p.title}</Link></li>)}
            <li><Link to="/blogs/journal" className="hover:underline">Journal</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs opacity-60">© {new Date().getFullYear()} {db.settings.storeName} · Powered by ShopNest</div>
    </footer>
  );
}

export default function Storefront() {
  const { db } = useDB();
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => { document.title = `${db.settings.storeName} — ${db.settings.tagline}`; }, [db.settings]);
  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-slate-900" style={{ '--p': db.theme.primary, '--a': db.theme.accent }}>
        <Header />
        <main>
          <Routes>
            <Route index element={<Home />} />
            <Route path="collections/:handle" element={<Collection />} />
            <Route path="products/:handle" element={<Product />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders/:id" element={<ThankYou />} />
            <Route path="pages/:handle" element={<Page />} />
            <Route path="blogs/journal" element={<Blog />} />
            <Route path="blogs/journal/:handle" element={<Post />} />
            <Route path="account/login" element={<AccountLogin />} />
            <Route path="account" element={<Account />} />
            <Route path="*" element={<div className="py-32 text-center"><h1 className="text-3xl font-semibold">Page not found</h1><Link to="/" className="mt-4 inline-block underline">Back home</Link></div>} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
