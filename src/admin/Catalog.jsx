import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Copy } from 'lucide-react';
import { useDB } from '../kit/db';
import { PageHeader, DataTable, Badge, Card, Button, FormModal, Drawer, Avatar, Toggle, useToast } from '../kit/ui';
import { money, money2, date } from '../kit/format';
import { slug } from '../seed';
import { FIN_TONE, FUL_TONE } from './shared';

export function Collections() {
  const { db, setDb, update, remove } = useDB();
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  return (
    <>
      <PageHeader title="Collections" subtitle="Group products into categories shown in your store's navigation." actions={<Button icon={Plus} onClick={() => setEdit({})}>Create collection</Button>} />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {db.collections.map((c) => {
          const count = db.products.filter((p) => p.collectionIds.includes(c.id)).length;
          return (
            <Card key={c.id} className="overflow-hidden">
              <img src={c.image.replace('w=1200', 'w=600')} alt="" className="h-40 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between"><div className="font-semibold">{c.title}</div><Badge>{count} products</Badge></div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.description}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setEdit(c)}>Edit</Button>
                  <a href={`/collections/${c.handle}`} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost">View</Button></a>
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => { if (confirm('Delete collection?')) { remove('collections', c.id); toast('Collection deleted'); } }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit collection' : 'New collection'}
        fields={[{ name: 'title', label: 'Title', required: true, span: 2 }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'image', label: 'Image URL', type: 'url', span: 2, required: true }]}
        initial={edit}
        onSubmit={(v) => {
          if (edit.id) update('collections', edit.id, v);
          else { const h = slug(v.title); setDb((d) => ({ ...d, collections: [...d.collections, { ...v, id: h, handle: h }] })); }
          toast('Collection saved'); setEdit(null);
        }} />
    </>
  );
}

export function Customers() {
  const { db } = useDB();
  const [view, setView] = useState(null);
  const rows = db.customers.map((c) => {
    const os = db.orders.filter((o) => o.customerId === c.id && o.financial !== 'Refunded');
    return { ...c, orders: os.length, spent: os.reduce((s, o) => s + o.total, 0), last: os[0]?.createdAt };
  });
  return (
    <>
      <PageHeader title="Customers" subtitle={`${db.customers.length} customers · ${db.customers.filter((c) => c.acceptsMarketing).length} subscribed to email marketing`} />
      <DataTable rows={rows} exportName="customers" searchKeys={['name', 'email', 'city']} onRowClick={setView} initialSort={{ key: 'spent', dir: 'desc' }}
        columns={[
          { key: 'name', label: 'Customer', render: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} /><div><div className="font-medium text-slate-900">{r.name}</div><div className="text-xs text-slate-500">{r.email}</div></div></div> },
          { key: 'acceptsMarketing', label: 'Email', render: (r) => r.acceptsMarketing ? <Badge tone="green">Subscribed</Badge> : <Badge>Not subscribed</Badge>, sortValue: (r) => (r.acceptsMarketing ? 1 : 0) },
          { key: 'city', label: 'Location' },
          { key: 'orders', label: 'Orders', align: 'right' },
          { key: 'spent', label: 'Amount spent', align: 'right', render: (r) => <span className="font-medium">{money2(r.spent)}</span> },
        ]} />
      <Drawer open={!!view} onClose={() => setView(null)} title={view?.name}>
        {view && (
          <div className="space-y-5">
            <div className="flex items-center gap-4"><Avatar name={view.name} size={56} /><div><div className="font-semibold">{view.name}</div><div className="text-sm text-slate-500">{view.email}</div><div className="text-xs text-slate-400">{view.city} · customer since {date(view.createdAt)}</div></div></div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Card className="p-3"><div className="text-lg font-semibold">{money(view.spent)}</div><div className="text-xs text-slate-500">Lifetime spend</div></Card>
              <Card className="p-3"><div className="text-lg font-semibold">{view.orders}</div><div className="text-xs text-slate-500">Orders</div></Card>
            </div>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {db.orders.filter((o) => o.customerId === view.id).map((o) => (
                <li key={o.id}><Link to={`/admin/orders/${o.id}`} className="flex items-center justify-between px-3 py-2.5 text-sm hover:bg-slate-50"><span className="font-medium">#{o.number}</span><span className="text-slate-500">{date(o.createdAt)}</span><Badge tone={FUL_TONE[o.fulfillment]}>{o.fulfillment}</Badge><span>{money2(o.total)}</span></Link></li>
              ))}
            </ul>
          </div>
        )}
      </Drawer>
    </>
  );
}

export function Discounts() {
  const { db, add, update, remove } = useDB();
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  const label = (d) => d.type === 'percent' ? `${d.value}% off` : d.type === 'fixed' ? `$${d.value} off` : 'Free shipping';
  return (
    <>
      <PageHeader title="Discounts" subtitle="Codes customers can enter at checkout. Try one on the storefront!" actions={<Button icon={Plus} onClick={() => setEdit({ active: true })}>Create discount</Button>} />
      <DataTable rows={db.discounts} searchKeys={['code']}
        columns={[
          { key: 'code', label: 'Code', render: (r) => <span className="inline-flex items-center gap-2 font-mono font-semibold">{r.code}<button className="text-slate-400 hover:text-slate-700 cursor-pointer" onClick={() => { navigator.clipboard?.writeText(r.code); toast('Code copied'); }} aria-label="Copy code"><Copy size={13} /></button></span> },
          { key: 'type', label: 'Value', render: label },
          { key: 'minSubtotal', label: 'Minimum', render: (r) => (r.minSubtotal ? `Orders over ${money(r.minSubtotal)}` : 'No minimum') },
          { key: 'used', label: 'Used', align: 'right' },
          { key: 'active', label: 'Status', render: (r) => <Toggle checked={r.active} onChange={(v) => { update('discounts', r.id, { active: v }); toast(v ? `${r.code} activated` : `${r.code} disabled`); }} label={r.active ? 'Active' : 'Inactive'} /> },
          { key: 'a', label: '', sortable: false, render: (r) => <div className="flex justify-end gap-1"><Button size="xs" variant="ghost" icon={Pencil} onClick={() => setEdit(r)} /><Button size="xs" variant="ghost" icon={Trash2} onClick={() => { remove('discounts', r.id); toast('Discount deleted'); }} /></div> },
        ]} />
      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit discount' : 'New discount code'}
        fields={[
          { name: 'code', label: 'Code', required: true, placeholder: 'SPRING15' },
          { name: 'type', label: 'Type', type: 'select', options: [{ value: 'percent', label: 'Percentage' }, { value: 'fixed', label: 'Fixed amount' }, { value: 'free_shipping', label: 'Free shipping' }] },
          { name: 'value', label: 'Value', type: 'number' },
          { name: 'minSubtotal', label: 'Minimum order ($)', type: 'number' },
        ]}
        initial={edit}
        onSubmit={(v) => { const out = { ...v, code: v.code.toUpperCase().replace(/\s/g, '') }; edit.id ? update('discounts', edit.id, out) : add('discounts', { ...out, active: true, used: 0 }); toast('Discount saved'); setEdit(null); }} />
    </>
  );
}
