import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, CheckCircle2, Minus, Plus, Trash2, Tag } from 'lucide-react';
import { useDB } from '../kit/db';
import { money2, uid } from '../kit/format';
import { computeTotals } from '../seed';
import { useCart, R } from './Storefront';

const inp = 'h-12 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-slate-900';

export function CartPage() {
  const { items, setQty, totals } = useCart();
  const { db } = useDB();
  const r = R[db.theme.radius];
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
      {items.length === 0 ? (
        <div className="py-20 text-center"><p className="text-slate-500">Your cart is empty.</p><Link to="/collections/all" className={`mt-6 inline-block px-6 py-3 text-sm font-semibold text-white ${r}`} style={{ background: 'var(--a)' }}>Continue shopping</Link></div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <ul className="divide-y divide-slate-200 border-y border-slate-200 lg:col-span-2">
            {items.map((i) => (
              <li key={i.key} className="flex gap-5 py-6">
                <Link to={`/products/${i.handle}`}><img src={i.image.replace('w=900', 'w=240')} alt="" className="h-32 w-24 rounded-lg object-cover" /></Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between"><Link to={`/products/${i.handle}`} className="font-medium hover:underline">{i.title}</Link><span className="font-medium">{money2(i.price * i.qty)}</span></div>
                  {i.variant && <span className="text-sm text-slate-500">Size {i.variant}</span>}
                  <div className="mt-auto flex items-center gap-4">
                    <div className="flex items-center rounded-full border"><button onClick={() => setQty(i.key, i.qty - 1)} className="p-2 cursor-pointer" aria-label="Decrease"><Minus size={14} /></button><span className="w-6 text-center text-sm">{i.qty}</span><button onClick={() => setQty(i.key, i.qty + 1)} className="p-2 cursor-pointer" aria-label="Increase"><Plus size={14} /></button></div>
                    <button onClick={() => setQty(i.key, 0)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 cursor-pointer"><Trash2 size={14} /> Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="h-fit rounded-2xl bg-slate-50 p-6">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{money2(totals.subtotal)}</span></div>
            <div className="mt-2 flex justify-between text-sm text-slate-500"><span>Shipping</span><span>{totals.shipping ? money2(totals.shipping) : 'Free'}</span></div>
            <Link to="/checkout" className={`mt-6 flex h-12 items-center justify-center text-sm font-semibold text-white ${r}`} style={{ background: 'var(--a)' }}>Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function Checkout() {
  const { db, setDb } = useDB();
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const [f, setF] = useState({ email: '', first: '', last: '', address: '', city: '', zip: '', country: 'United States' });
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [codeMsg, setCodeMsg] = useState('');
  const [placing, setPlacing] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const t = computeTotals(items, db.settings, discount);

  const apply = () => {
    const d = db.discounts.find((x) => x.code === code.trim().toUpperCase() && x.active);
    if (!d) { setDiscount(null); return setCodeMsg('That code is not valid.'); }
    if (t.subtotal < (d.minSubtotal || 0)) return setCodeMsg(`This code needs a minimum order of ${money2(d.minSubtotal)}.`);
    setDiscount(d);
    setCodeMsg(`${d.code} applied!`);
  };

  const place = (e) => {
    e.preventDefault();
    if (!items.length) return;
    setPlacing(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      const name = `${f.first} ${f.last}`.trim();
      const id = 'o' + uid();
      setDb((d) => {
        let cust = d.customers.find((c) => c.email.toLowerCase() === f.email.toLowerCase());
        const customers = cust ? d.customers : [{ id: 'cu' + uid(), name, email: f.email, city: f.city, acceptsMarketing: true, createdAt: now }, ...d.customers];
        cust = cust || customers[0];
        const number = Math.max(...d.orders.map((o) => o.number), 1000) + 1;
        const order = {
          id, number, customerId: cust.id, email: f.email, customerName: name, items: items.map(({ key, handle, ...i }) => i),
          ...t, discountCode: discount?.code || null, financial: 'Paid', fulfillment: 'Unfulfilled',
          address: { line1: f.address, city: f.city, zip: f.zip, country: f.country },
          timeline: [{ at: now, text: 'Order placed on Online Store' }, { at: now, text: `Payment of ${money2(t.total)} captured` }], createdAt: now,
        };
        return {
          ...d, customers, orders: [order, ...d.orders], cart: [],
          products: d.products.map((p) => { const q = items.filter((i) => i.productId === p.id).reduce((s, i) => s + i.qty, 0); return q ? { ...p, inventory: Math.max(0, p.inventory - q) } : p; }),
          discounts: discount ? d.discounts.map((x) => (x.id === discount.id ? { ...x, used: x.used + 1 } : x)) : d.discounts,
        };
      });
      clear();
      navigate(`/orders/${id}`);
    }, 900);
  };

  if (!items.length) return <div className="py-32 text-center text-slate-500">Your cart is empty. <Link to="/collections/all" className="underline">Shop now</Link></div>;
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-5">
      <form onSubmit={place} className="space-y-8 lg:col-span-3">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Contact</h2>
          <input required type="email" placeholder="Email" value={f.email} onChange={set('email')} className={inp} />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Delivery</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input required placeholder="First name" value={f.first} onChange={set('first')} className={inp} />
            <input required placeholder="Last name" value={f.last} onChange={set('last')} className={inp} />
            <input required placeholder="Address" value={f.address} onChange={set('address')} className={`${inp} sm:col-span-2`} />
            <input required placeholder="City" value={f.city} onChange={set('city')} className={inp} />
            <input required placeholder="ZIP / Postal code" value={f.zip} onChange={set('zip')} className={inp} />
            <select value={f.country} onChange={set('country')} className={`${inp} sm:col-span-2`}>{['United States', 'Canada', 'United Kingdom', 'India', 'Australia', 'Germany'].map((c) => <option key={c}>{c}</option>)}</select>
          </div>
        </section>
        <section>
          <h2 className="mb-1 text-lg font-semibold">Payment</h2>
          <p className="mb-3 flex items-center gap-1 text-xs text-slate-500"><Lock size={12} /> Demo store — no payment details are collected and no real charge is made.</p>
          <div className="rounded-lg border border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            <label className="flex items-center gap-2"><input type="radio" defaultChecked style={{ accentColor: 'var(--a)' }} /> Test payment (simulated)</label>
          </div>
        </section>
        <button disabled={placing} className="h-14 w-full rounded-lg text-base font-semibold text-white transition hover:brightness-110 disabled:opacity-60 cursor-pointer" style={{ background: 'var(--a)' }}>{placing ? 'Processing…' : `Pay ${money2(t.total)}`}</button>
      </form>
      <aside className="h-fit rounded-2xl bg-slate-50 p-6 lg:col-span-2">
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={i.key} className="flex items-center gap-4">
              <div className="relative"><img src={i.image.replace('w=900', 'w=160')} alt="" className="h-16 w-16 rounded-lg border border-slate-200 object-cover" /><span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] text-white">{i.qty}</span></div>
              <div className="flex-1 text-sm"><div className="font-medium">{i.title}</div>{i.variant && <div className="text-xs text-slate-500">{i.variant}</div>}</div>
              <span className="text-sm">{money2(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-2">
          <div className="relative flex-1"><Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount code (try WELCOME10)" className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none" /></div>
          <button type="button" onClick={apply} className="rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium cursor-pointer">Apply</button>
        </div>
        {codeMsg && <p className={`mt-2 text-xs ${discount ? 'text-emerald-600' : 'text-rose-600'}`}>{codeMsg}</p>}
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money2(t.subtotal)}</span></div>
          {t.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>−{money2(t.discount)}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>{t.shipping ? money2(t.shipping) : 'Free'}</span></div>
          <div className="flex justify-between"><span>Estimated tax</span><span>{money2(t.tax)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-semibold"><span>Total</span><span>{money2(t.total)}</span></div>
        </div>
      </aside>
    </div>
  );
}

export function ThankYou() {
  const { id } = useParams();
  const { db } = useDB();
  const o = db.orders.find((x) => x.id === id);
  if (!o) return <div className="py-32 text-center text-slate-500">Order not found.</div>;
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <CheckCircle2 size={56} className="mx-auto" style={{ color: 'var(--a)' }} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Thank you, {o.customerName.split(' ')[0]}!</h1>
      <p className="mt-2 text-slate-600">Order <b>#{o.number}</b> is confirmed. A confirmation has been sent to {o.email}.</p>
      <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-left">
        {o.items.map((i, k) => <div key={k} className="flex justify-between py-1 text-sm"><span>{i.qty} × {i.title}{i.variant ? ` (${i.variant})` : ''}</span><span>{money2(i.qty * i.price)}</span></div>)}
        <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-semibold"><span>Total paid</span><span>{money2(o.total)}</span></div>
      </div>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/collections/all" className="rounded-lg px-6 py-3 text-sm font-semibold text-white" style={{ background: 'var(--a)' }}>Continue shopping</Link>
        <Link to="/account" onClick={() => sessionStorage.setItem('shopnest-customer', o.email.toLowerCase())} className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold">View my orders</Link>
      </div>
    </div>
  );
}
