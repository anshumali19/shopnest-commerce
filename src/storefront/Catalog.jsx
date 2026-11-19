import { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Minus, Plus, Truck, RefreshCcw, ChevronDown, Star } from 'lucide-react';
import { useDB } from '../kit/db';
import { money2 } from '../kit/format';
import { useCart, R } from './Storefront';

export function ProductCard({ p, compact }) {
  const { db } = useDB();
  const r = R[db.theme.radius];
  const sale = p.compareAt && p.compareAt > p.price;
  return (
    <Link to={`/products/${p.handle}`} className="group block">
      <div className={`relative aspect-[4/5] overflow-hidden bg-slate-100 ${r === 'rounded-full' ? 'rounded-3xl' : r}`}>
        <img src={p.images[0]?.replace('w=900', 'w=600')} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {p.images[1] && <img src={p.images[1].replace('w=900', 'w=600')} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />}
        {sale && <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold" style={{ color: 'var(--a)' }}>Sale</span>}
        {p.inventory <= 5 && <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">Only {p.inventory} left</span>}
      </div>
      <div className={compact ? 'mt-2' : 'mt-4'}>
        <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-slate-900`}>{p.title}</h3>
        <div className={`mt-1 flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          <span className={sale ? 'font-semibold' : 'text-slate-700'} style={sale ? { color: 'var(--a)' } : undefined}>{money2(p.price)}</span>
          {sale && <span className="text-slate-400 line-through">{money2(p.compareAt)}</span>}
        </div>
      </div>
    </Link>
  );
}

export function Collection() {
  const { handle } = useParams();
  const { db } = useDB();
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(250);
  const [onSale, setOnSale] = useState(false);
  const col = db.collections.find((c) => c.handle === handle);
  const items = useMemo(() => {
    let x = db.products.filter((p) => p.status === 'Active' && (handle === 'all' || p.collectionIds.includes(col?.id)));
    x = x.filter((p) => p.price <= maxPrice && (!onSale || (p.compareAt && p.compareAt > p.price)));
    if (sort === 'low') x = [...x].sort((a, b) => a.price - b.price);
    if (sort === 'high') x = [...x].sort((a, b) => b.price - a.price);
    if (sort === 'new') x = [...x].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'featured') x = [...x].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return x;
  }, [db.products, handle, col, sort, maxPrice, onSale]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="border-b border-slate-100 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{handle === 'all' ? 'Shop all' : col?.title || 'Collection'}</h1>
        <p className="mt-2 max-w-2xl text-slate-600">{handle === 'all' ? 'Every piece in our current range.' : col?.description}</p>
      </div>
      <div className="flex flex-col gap-10 pt-8 lg:flex-row">
        <aside className="shrink-0 space-y-6 lg:w-56">
          <div>
            <div className="mb-2 text-sm font-semibold">Sort by</div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
              <option value="featured">Featured</option><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
            </select>
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm font-semibold"><span>Max price</span><span className="font-normal text-slate-500">${maxPrice}</span></div>
            <input type="range" min="20" max="250" step="5" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full" style={{ accentColor: 'var(--a)' }} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} style={{ accentColor: 'var(--a)' }} /> On sale only</label>
          <div className="hidden lg:block">
            <div className="mb-2 text-sm font-semibold">Collections</div>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li><Link to="/collections/all" className={handle === 'all' ? 'font-semibold text-slate-900' : 'hover:underline'}>All products</Link></li>
              {db.collections.map((c) => <li key={c.id}><Link to={`/collections/${c.handle}`} className={c.handle === handle ? 'font-semibold text-slate-900' : 'hover:underline'}>{c.title}</Link></li>)}
            </ul>
          </div>
        </aside>
        <div className="flex-1">
          <div className="mb-4 text-sm text-slate-500">{items.length} products</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          {items.length === 0 && <div className="py-20 text-center text-slate-500">No products match these filters.</div>}
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, children, open: o = false }) {
  const [open, setOpen] = useState(o);
  return (
    <div className="border-b border-slate-200">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left text-sm font-medium cursor-pointer">{title}<ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} /></button>
      {open && <div className="pb-4 text-sm leading-relaxed text-slate-600">{children}</div>}
    </div>
  );
}

export function Product() {
  const { handle } = useParams();
  const { db } = useDB();
  const { add } = useCart();
  const p = db.products.find((x) => x.handle === handle && x.status === 'Active');
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState('');
  useEffect(() => { setImgIdx(0); setSize(null); setQty(1); setErr(''); }, [handle]);
  if (!p) return <div className="py-32 text-center text-slate-500">Product not found. <Link to="/collections/all" className="underline">Browse all</Link></div>;
  const r = R[db.theme.radius];
  const related = db.products.filter((x) => x.id !== p.id && x.status === 'Active' && x.collectionIds.some((c) => p.collectionIds.includes(c))).slice(0, 4);
  const col = db.collections.find((c) => c.id === p.collectionIds[0]);
  const sale = p.compareAt && p.compareAt > p.price;
  const addToCart = () => {
    if (p.sizes.length && !size) return setErr('Please choose a size');
    add(p, size, qty);
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-xs text-slate-500"><Link to="/" className="hover:underline">Home</Link> / {col && <><Link to={`/collections/${col.handle}`} className="hover:underline">{col.title}</Link> / </>}<span className="text-slate-800">{p.title}</span></nav>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          {p.images.length > 1 && (
            <div className="flex gap-3 sm:flex-col">
              {p.images.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`h-20 w-16 overflow-hidden rounded-lg border-2 cursor-pointer ${i === imgIdx ? 'border-slate-900' : 'border-transparent opacity-70'}`}><img src={src.replace('w=900', 'w=160')} alt="" className="h-full w-full object-cover" /></button>
              ))}
            </div>
          )}
          <div className={`aspect-[4/5] flex-1 overflow-hidden bg-slate-100 ${r === 'rounded-full' ? 'rounded-3xl' : r}`}><img src={p.images[imgIdx]?.replace('w=900', 'w=1200')} alt={p.title} className="h-full w-full object-cover" /></div>
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{p.title}</h1>
          <div className="mt-2 flex items-center gap-1 text-sm text-slate-500"><span className="flex text-amber-400">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill="currentColor" />)}</span> 4.9 · 128 reviews</div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold" style={sale ? { color: 'var(--a)' } : undefined}>{money2(p.price)}</span>
            {sale && <><span className="text-lg text-slate-400 line-through">{money2(p.compareAt)}</span><span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: 'var(--a)' }}>Save {Math.round((1 - p.price / p.compareAt) * 100)}%</span></>}
          </div>
          <p className="mt-1 text-xs text-slate-500">Tax included. Shipping calculated at checkout.</p>
          {p.sizes.length > 0 && (
            <div className="mt-8">
              <div className="mb-2 text-sm font-medium">Size {size && <span className="text-slate-500">— {size}</span>}</div>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <button key={s} onClick={() => { setSize(s); setErr(''); }} className={`h-11 min-w-12 border px-4 text-sm cursor-pointer ${r} ${size === s ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-900'}`}>{s}</button>
                ))}
              </div>
              {err && <p className="mt-2 text-sm text-rose-600">{err}</p>}
            </div>
          )}
          <div className="mt-8 flex gap-3">
            <div className={`flex items-center border border-slate-300 ${r}`}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-3 cursor-pointer" aria-label="Decrease"><Minus size={15} /></button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-3 cursor-pointer" aria-label="Increase"><Plus size={15} /></button>
            </div>
            <button onClick={addToCart} disabled={p.inventory === 0} className={`h-12 flex-1 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50 cursor-pointer ${r}`} style={{ background: 'var(--a)' }}>{p.inventory === 0 ? 'Sold out' : 'Add to cart'}</button>
          </div>
          {p.inventory > 0 && p.inventory <= 5 && <p className="mt-3 text-sm font-medium text-rose-600">Hurry — only {p.inventory} left in stock</p>}
          <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3"><Truck size={16} /> Free shipping over ${db.settings.freeShippingOver}</div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3"><RefreshCcw size={16} /> Free 30-day returns</div>
          </div>
          <div className="mt-8 border-t border-slate-200">
            <Accordion title="Description" open>{p.description}</Accordion>
            <Accordion title="Materials & care">Made with responsibly sourced materials. Machine wash cold, hang dry. Do not bleach.</Accordion>
            <Accordion title="Shipping & returns">Ships within 1–2 business days. Free returns within 30 days of delivery.</Accordion>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-2xl font-semibold tracking-tight">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{related.map((x) => <ProductCard key={x.id} p={x} />)}</div>
        </section>
      )}
    </div>
  );
}

export function SearchPage() {
  const [params] = useSearchParams();
  const { db } = useDB();
  const q = (params.get('q') || '').toLowerCase();
  const items = db.products.filter((p) => p.status === 'Active' && (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)));
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Search results</h1>
      <p className="mt-2 text-slate-600">{items.length} results for “{params.get('q')}”</p>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  );
}
