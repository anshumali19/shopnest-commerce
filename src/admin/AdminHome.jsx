import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, MousePointerClick, ArrowRight, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useDB } from '../kit/db';
import { PageHeader, StatCard, Card, CardHeader, Badge, Select } from '../kit/ui';
import { money, money2, compact, timeAgo } from '../kit/format';
import { FIN_TONE, FUL_TONE } from './shared';

export default function AdminHome() {
  const { db } = useDB();
  const [range, setRange] = useState('30');
  const s = useMemo(() => {
    const days = Number(range);
    const since = Date.now() - days * 864e5;
    const prevSince = since - days * 864e5;
    const paid = db.orders.filter((o) => o.financial !== 'Refunded');
    const cur = paid.filter((o) => new Date(o.createdAt) >= since);
    const prev = paid.filter((o) => new Date(o.createdAt) >= prevSince && new Date(o.createdAt) < since);
    const sales = cur.reduce((a, o) => a + o.total, 0);
    const prevSales = prev.reduce((a, o) => a + o.total, 0);
    const series = Array.from({ length: days }, (_, i) => {
      const d = new Date(Date.now() - (days - 1 - i) * 864e5);
      const k = d.toDateString();
      return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), sales: Math.round(cur.filter((o) => new Date(o.createdAt).toDateString() === k).reduce((a, o) => a + o.total, 0)) };
    });
    const sessions = db.sessions.slice(-days).reduce((a, x) => a + x.count, 0);
    const units = {};
    cur.forEach((o) => o.items.forEach((it) => (units[it.productId] = (units[it.productId] || 0) + it.qty)));
    const top = Object.entries(units).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => ({ p: db.products.find((x) => x.id === id), n })).filter((x) => x.p);
    return { sales, delta: prevSales ? ((sales - prevSales) / prevSales) * 100 : 0, orders: cur.length, aov: cur.length ? sales / cur.length : 0, sessions, conv: sessions ? (cur.length / sessions) * 100 : 0, series, top };
  }, [db, range]);

  return (
    <>
      <PageHeader title={`Welcome back, Riley`} subtitle={`Here's how ${db.settings.storeName} is performing.`} actions={<Select value={range} onChange={(e) => setRange(e.target.value)} className="w-40" options={[{ value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }]} />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total sales" value={money(s.sales)} delta={s.delta} hint="vs previous period" icon={DollarSign} />
        <StatCard label="Orders" value={s.orders} hint={`AOV ${money2(s.aov)}`} icon={ShoppingBag} tone="blue" />
        <StatCard label="Online store sessions" value={compact(s.sessions)} icon={MousePointerClick} tone="purple" />
        <StatCard label="Conversion rate" value={`${s.conv.toFixed(2)}%`} icon={Users} tone="yellow" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Sales over time" />
          <div className="h-72 p-4">
            <ResponsiveContainer>
              <AreaChart data={s.series}>
                <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#059669" stopOpacity={0.3} /><stop offset="100%" stopColor="#059669" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} interval={range === '30' ? 4 : 0} />
                <YAxis tickFormatter={(v) => '$' + compact(v)} tickLine={false} axisLine={false} width={45} />
                <Tooltip formatter={(v) => money(v)} />
                <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={2} fill="url(#sg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Top products" subtitle="By units sold" />
          <ul className="divide-y divide-slate-100">
            {s.top.map(({ p, n }) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                <img src={p.images[0].replace('w=900', 'w=120')} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <Link to={`/admin/products/${p.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:underline">{p.title}</Link>
                <span className="text-sm text-slate-500">{n} sold</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Recent orders" action={<Link to="/admin/orders" className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">All orders <ArrowRight size={12} /></Link>} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {db.orders.slice(0, 7).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3"><Link to={`/admin/orders/${o.id}`} className="font-medium hover:underline">#{o.number}</Link></td>
                    <td className="px-5 py-3 text-slate-600">{o.customerName}</td>
                    <td className="px-5 py-3 text-slate-500">{timeAgo(o.createdAt)}</td>
                    <td className="px-5 py-3"><Badge tone={FIN_TONE[o.financial]} dot>{o.financial}</Badge></td>
                    <td className="px-5 py-3"><Badge tone={FUL_TONE[o.fulfillment]} dot>{o.fulfillment}</Badge></td>
                    <td className="px-5 py-3 text-right font-medium">{money2(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold"><Package size={16} /> Things to do</div>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link to="/admin/orders" className="flex justify-between rounded-lg bg-amber-50 px-3 py-2 text-amber-800 hover:bg-amber-100"><span>Orders to fulfill</span><b>{db.orders.filter((o) => o.fulfillment === 'Unfulfilled' && o.financial === 'Paid').length}</b></Link></li>
            <li><Link to="/admin/products" className="flex justify-between rounded-lg bg-rose-50 px-3 py-2 text-rose-800 hover:bg-rose-100"><span>Products low on stock</span><b>{db.products.filter((p) => p.inventory <= 5).length}</b></Link></li>
            <li><Link to="/admin/products" className="flex justify-between rounded-lg bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"><span>Draft products</span><b>{db.products.filter((p) => p.status === 'Draft').length}</b></Link></li>
            <li><Link to="/admin/theme" className="flex justify-between rounded-lg bg-brand-50 px-3 py-2 text-brand-800 hover:bg-brand-100"><span>Customize your theme</span><ArrowRight size={14} /></Link></li>
          </ul>
        </Card>
      </div>
    </>
  );
}
