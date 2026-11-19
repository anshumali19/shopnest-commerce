import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useDB } from '../kit/db';
import { useToast } from '../kit/ui';
import { date } from '../kit/format';
import { ProductCard } from './Catalog';
import { R } from './Storefront';

export default function Home() {
  const { db } = useDB();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const t = db.theme;
  const r = R[t.radius];
  const active = db.products.filter((p) => p.status === 'Active');
  const featured = active.filter((p) => p.featured).slice(0, 8);
  const featCol = db.collections.find((c) => c.id === t.featuredCollection) || db.collections[0];
  const colProducts = active.filter((p) => p.collectionIds.includes(featCol?.id)).slice(0, 4);
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={t.heroImage} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-40">
          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-white sm:text-6xl">{t.heroTitle}</h1>
          <p className="mt-5 max-w-lg text-lg text-white/80">{t.heroSubtitle}</p>
          <Link to="/collections/all" className={`mt-8 inline-flex items-center gap-2 ${r} px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110`} style={{ background: 'var(--a)' }}>{t.heroCta} <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="border-b border-slate-100">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 text-sm sm:grid-cols-3 sm:px-6">
          {[[Truck, `Free shipping over $${db.settings.freeShippingOver}`], [RefreshCcw, '30-day free returns'], [ShieldCheck, 'Lifetime repair promise']].map(([I, txt]) => (
            <div key={txt} className="flex items-center justify-center gap-3 text-slate-600"><I size={18} style={{ color: 'var(--a)' }} />{txt}</div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between"><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Shop by category</h2><Link to="/collections/all" className="text-sm font-medium underline-offset-4 hover:underline">View all</Link></div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {db.collections.map((c) => (
            <Link key={c.id} to={`/collections/${c.handle}`} className={`group relative aspect-[4/5] overflow-hidden ${r === 'rounded-full' ? 'rounded-3xl' : r}`}>
              <img src={c.image.replace('w=1200', 'w=700')} alt={c.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-lg font-semibold text-white">{c.title}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Best sellers</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{featured.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      {featCol && (
        <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
          <div className={`grid overflow-hidden bg-slate-50 lg:grid-cols-2 ${r === 'rounded-full' ? 'rounded-3xl' : r}`}>
            <img src={featCol.image} alt="" className="h-72 w-full object-cover lg:h-full" />
            <div className="p-8 sm:p-12">
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--a)' }}>Featured collection</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{featCol.title}</h2>
              <p className="mt-3 text-slate-600">{featCol.description}</p>
              <div className="mt-8 grid grid-cols-2 gap-4">{colProducts.map((p) => <ProductCard key={p.id} p={p} compact />)}</div>
            </div>
          </div>
        </section>
      )}

      {t.showTestimonials && (
        <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Loved by thousands</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {db.testimonials.map((x) => (
              <figure key={x.name} className={`border border-slate-100 p-6 shadow-sm ${r === 'rounded-full' ? 'rounded-3xl' : r}`}>
                <div className="flex gap-0.5 text-amber-400">{Array.from({ length: x.rating }, (_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
                <blockquote className="mt-4 text-slate-700">“{x.text}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold">{x.name} <span className="font-normal text-slate-400">· Verified buyer</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {t.showBlog && (
        <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between"><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">From the journal</h2><Link to="/blogs/journal" className="text-sm font-medium hover:underline">All stories</Link></div>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {db.posts.filter((p) => p.published).slice(0, 3).map((p) => (
              <Link key={p.id} to={`/blogs/journal/${p.handle}`} className="group">
                <div className={`aspect-[3/2] overflow-hidden ${r === 'rounded-full' ? 'rounded-3xl' : r}`}><img src={p.image?.replace('w=1200', 'w=700')} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                <div className="mt-4 text-xs text-slate-500">{date(p.publishedAt)} · {p.author}</div>
                <h3 className="mt-1 text-lg font-semibold group-hover:underline">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {t.showNewsletter && (
        <section className="mx-auto mt-24 max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Join the list</h2>
          <p className="mt-2 text-slate-600">New drops, restocks and stories — straight to your inbox. Get 10% off your first order.</p>
          <form onSubmit={(e) => { e.preventDefault(); if (email) { toast('Thanks! Use code WELCOME10 at checkout'); setEmail(''); } }} className="mx-auto mt-6 flex max-w-md gap-2">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={`h-12 flex-1 border border-slate-300 px-4 text-sm outline-none focus:border-slate-900 ${r}`} />
            <button className={`h-12 px-6 text-sm font-semibold text-white cursor-pointer ${r}`} style={{ background: 'var(--p)' }}>Subscribe</button>
          </form>
        </section>
      )}
    </>
  );
}
