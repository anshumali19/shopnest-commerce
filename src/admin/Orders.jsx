import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Truck, RotateCcw, Printer, Mail, MapPin, Clock } from 'lucide-react';
import { useDB } from '../kit/db';
import { PageHeader, DataTable, Badge, Card, CardHeader, Button, Avatar, useToast } from '../kit/ui';
import { money2, dateTime, timeAgo } from '../kit/format';
import { FIN_TONE, FUL_TONE, thumb } from './shared';

export function Orders() {
  const { db } = useDB();
  const navigate = useNavigate();
  const rows = db.orders.map((o) => ({ ...o, status: o.financial === 'Refunded' ? 'Refunded' : o.fulfillment, itemsCount: o.items.reduce((s, i) => s + i.qty, 0) }));
  return (
    <>
      <PageHeader title="Orders" subtitle={`${db.orders.length} orders · new storefront orders appear here instantly`} />
      <DataTable
        rows={rows}
        pageSize={15}
        exportName="orders"
        searchKeys={['number', 'customerName', 'email']}
        filter={{ key: 'status', options: ['Unfulfilled', 'Fulfilled', 'Refunded'] }}
        onRowClick={(r) => navigate(`/admin/orders/${r.id}`)}
        initialSort={{ key: 'createdAt', dir: 'desc' }}
        columns={[
          { key: 'number', label: 'Order', render: (r) => <span className="font-semibold text-slate-900">#{r.number}</span>, sortValue: (r) => r.number },
          { key: 'createdAt', label: 'Date', render: (r) => <span className="text-slate-500">{dateTime(r.createdAt)}</span>, sortValue: (r) => new Date(r.createdAt).getTime(), csv: (r) => r.createdAt },
          { key: 'customerName', label: 'Customer' },
          { key: 'financial', label: 'Payment', render: (r) => <Badge tone={FIN_TONE[r.financial]} dot>{r.financial}</Badge> },
          { key: 'fulfillment', label: 'Fulfillment', render: (r) => <Badge tone={FUL_TONE[r.fulfillment]} dot>{r.fulfillment}</Badge> },
          { key: 'itemsCount', label: 'Items', align: 'right' },
          { key: 'total', label: 'Total', align: 'right', render: (r) => <span className="font-medium">{money2(r.total)}</span> },
        ]}
      />
    </>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { db, update } = useDB();
  const toast = useToast();
  const o = db.orders.find((x) => x.id === id);
  if (!o) return <div className="text-sm text-slate-500">Order not found. <Link to="/admin/orders" className="text-brand-700 underline">Back to orders</Link></div>;
  const cust = db.customers.find((c) => c.id === o.customerId);
  const custOrders = db.orders.filter((x) => x.customerId === o.customerId);
  const log = (text, patch) => update('orders', o.id, (x) => ({ ...patch, timeline: [...x.timeline, { at: new Date().toISOString(), text }] }));

  return (
    <>
      <PageHeader
        breadcrumb={<Link to="/admin/orders" className="inline-flex items-center gap-1 hover:underline"><ArrowLeft size={12} /> Orders</Link>}
        title={<span className="flex flex-wrap items-center gap-3">#{o.number} <Badge tone={FIN_TONE[o.financial]} dot>{o.financial}</Badge><Badge tone={FUL_TONE[o.fulfillment]} dot>{o.fulfillment}</Badge></span>}
        subtitle={`${dateTime(o.createdAt)} · from Online Store`}
        actions={<>
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
          {o.financial === 'Paid' && <Button variant="secondary" icon={RotateCcw} onClick={() => { if (confirm(`Refund ${money2(o.total)} to ${o.customerName}?`)) { log(`Refunded ${money2(o.total)}`, { financial: 'Refunded' }); toast('Refund issued'); } }}>Refund</Button>}
        </>}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><Badge tone={FUL_TONE[o.fulfillment]}>{o.fulfillment}</Badge> {o.items.reduce((s, i) => s + i.qty, 0)} items</span>}
              action={o.fulfillment === 'Unfulfilled' && o.financial === 'Paid' && <Button size="sm" icon={Truck} onClick={() => { log('Order fulfilled · shipping confirmation emailed', { fulfillment: 'Fulfilled' }); toast(`Order #${o.number} fulfilled`); }}>Fulfill items</Button>} />
            <ul className="divide-y divide-slate-100">
              {o.items.map((it, i) => (
                <li key={i} className="flex items-center gap-4 px-5 py-3">
                  <img src={thumb(it.image)} alt="" className="h-14 w-14 rounded-lg border border-slate-200 object-cover" />
                  <div className="flex-1"><div className="text-sm font-medium">{it.title}</div>{it.variant && <div className="text-xs text-slate-500">Size: {it.variant}</div>}</div>
                  <div className="text-sm text-slate-500">{money2(it.price)} × {it.qty}</div>
                  <div className="w-24 text-right text-sm font-medium">{money2(it.price * it.qty)}</div>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Payment summary" action={<Badge tone={FIN_TONE[o.financial]}>{o.financial}</Badge>} />
            <div className="space-y-2 p-5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{money2(o.subtotal)}</span></div>
              {o.discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount {o.discountCode && <Badge>{o.discountCode}</Badge>}</span><span>−{money2(o.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{o.shipping ? money2(o.shipping) : 'Free'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{money2(o.tax)}</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold"><span>Total</span><span>{money2(o.total)}</span></div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Timeline" />
            <ol className="space-y-4 p-5">
              {[...o.timeline].reverse().map((t, i) => (
                <li key={i} className="flex gap-3 text-sm"><Clock size={15} className="mt-0.5 text-slate-400" /><div><div>{t.text}</div><div className="text-xs text-slate-500">{dateTime(t.at)}</div></div></li>
              ))}
            </ol>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</div>
            <div className="mt-3 flex items-center gap-3"><Avatar name={o.customerName} size={40} /><div><div className="font-medium">{o.customerName}</div><div className="text-xs text-slate-500">{custOrders.length} order{custOrders.length !== 1 ? 's' : ''} · customer since {timeAgo(cust?.createdAt || o.createdAt)}</div></div></div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2"><Mail size={14} /> {o.email}</div>
              <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5" /><span>{o.address?.line1}<br />{o.address?.city} {o.address?.zip}<br />{o.address?.country}</span></div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</div>
            <p className="mt-2 text-sm text-slate-500">{o.note || 'No notes from customer.'}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
