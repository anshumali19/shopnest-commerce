import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Package, ShieldCheck } from 'lucide-react';
import { useDB } from '../kit/db';
import { money2, date } from '../kit/format';
import { R } from './Storefront';

const SESSION = 'shopnest-customer';
const inp = 'h-12 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-slate-900';

/** Customer sign-in. Store staff can switch to the admin sign-in from here. */
export function AccountLogin() {
  const { db } = useDB();
  const navigate = useNavigate();
  const r = R[db.theme.radius];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signIn = (e) => {
    e.preventDefault();
    sessionStorage.setItem(SESSION, email.trim().toLowerCase());
    navigate('/account');
  };
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-center text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-center text-sm text-slate-500">Track orders and check out faster.</p>
      <form onSubmit={signIn} className="mt-8 space-y-3">
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
        <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inp} />
        <button className={`h-12 w-full text-sm font-semibold text-white transition hover:brightness-110 cursor-pointer ${r}`} style={{ background: 'var(--a)' }}>Sign in</button>
      </form>
      <p className="mt-3 text-center text-xs text-slate-400">Demo store: any email and password will work.</p>
      <div className="my-8 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-400"><span className="h-px flex-1 bg-slate-200" />Store staff<span className="h-px flex-1 bg-slate-200" /></div>
      <Link to="/admin/login" className={`flex h-12 w-full items-center justify-center gap-2 border border-slate-300 text-sm font-semibold hover:border-slate-900 ${r}`}>
        <ShieldCheck size={16} /> Sign in as admin
      </Link>
    </div>
  );
}

export function Account() {
  const { db } = useDB();
  const navigate = useNavigate();
  const email = sessionStorage.getItem(SESSION);
  if (!email) {
    return <div className="py-32 text-center text-slate-500">You're not signed in. <Link to="/account/login" className="underline">Sign in</Link></div>;
  }
  const orders = db.orders.filter((o) => o.email.toLowerCase() === email);
  const name = orders[0]?.customerName || email.split('@')[0];
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Hi, {name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500">{email}</p>
        </div>
        <button onClick={() => { sessionStorage.removeItem(SESSION); navigate('/'); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 cursor-pointer"><LogOut size={15} /> Sign out</button>
      </div>
      <h2 className="mt-10 mb-4 text-lg font-semibold">Order history</h2>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          <Package className="mx-auto mb-3 text-slate-300" size={28} />
          No orders yet. <Link to="/collections/all" className="underline">Start shopping</Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
              <div><div className="font-semibold">Order #{o.number}</div><div className="text-slate-500">{date(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} items</div></div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${o.financial === 'Refunded' ? 'bg-slate-100 text-slate-600' : o.fulfillment === 'Fulfilled' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{o.financial === 'Refunded' ? 'Refunded' : o.fulfillment === 'Fulfilled' ? 'Shipped' : 'Processing'}</span>
              <span className="font-medium">{money2(o.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
