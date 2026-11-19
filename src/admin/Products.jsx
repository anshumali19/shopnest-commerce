import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, ExternalLink, ImagePlus, X } from 'lucide-react';
import { useDB } from '../kit/db';
import { PageHeader, DataTable, Badge, Card, CardHeader, Button, Field, Input, Textarea, Select, Toggle, cx, useToast } from '../kit/ui';
import { money2 } from '../kit/format';
import { slug, uid } from '../seed';
import { thumb } from './shared';

export function Products() {
  const { db } = useDB();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const col = Object.fromEntries(db.collections.map((c) => [c.id, c.title]));
  return (
    <>
      <PageHeader title="Products" subtitle={`${db.products.length} products`} actions={<Button icon={Plus} onClick={() => navigate('/admin/products/new')}>Add product</Button>} />
      <DataTable
        rows={db.products.map((p) => ({ ...p, collection: p.collectionIds.map((c) => col[c]).join(', ') }))}
        initialQuery={params.get('q') || undefined}
        exportName="products"
        searchKeys={['title', 'sku', 'collection']}
        filter={{ key: 'status', options: ['Active', 'Draft'] }}
        onRowClick={(r) => navigate(`/admin/products/${r.id}`)}
        columns={[
          { key: 'title', label: 'Product', render: (r) => <div className="flex items-center gap-3"><img src={thumb(r.images[0], 100)} alt="" className="h-10 w-10 rounded-lg border border-slate-200 object-cover" /><span className="font-medium text-slate-900">{r.title}</span></div> },
          { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'Active' ? 'green' : 'gray'}>{r.status}</Badge> },
          { key: 'inventory', label: 'Inventory', render: (r) => <span className={r.inventory <= 5 ? 'font-medium text-rose-600' : ''}>{r.inventory} in stock{r.sizes?.length ? ` · ${r.sizes.length} variants` : ''}</span> },
          { key: 'collection', label: 'Collection' },
          { key: 'price', label: 'Price', align: 'right', render: (r) => <span>{money2(r.price)}{r.compareAt && <span className="ml-1 text-xs text-slate-400 line-through">{money2(r.compareAt)}</span>}</span> },
        ]}
      />
    </>
  );
}

const empty = { title: '', description: '', price: 0, compareAt: null, images: [], collectionIds: [], sizes: [], status: 'Active', inventory: 0, sku: '', vendor: 'Northbound', featured: false };

export function ProductEditor() {
  const { id } = useParams();
  const { db, setDb, remove } = useDB();
  const toast = useToast();
  const navigate = useNavigate();
  const existing = db.products.find((p) => p.id === id);
  const [p, setP] = useState(existing || empty);
  const [newImg, setNewImg] = useState('');
  const [sizesText, setSizesText] = useState((existing?.sizes || []).join(', '));
  useEffect(() => { if (existing) { setP(existing); setSizesText(existing.sizes.join(', ')); } }, [id]); // eslint-disable-line
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));

  const save = () => {
    if (!p.title.trim()) return toast('Title is required', 'error');
    const out = { ...p, handle: p.handle || slug(p.title), price: Number(p.price) || 0, compareAt: p.compareAt ? Number(p.compareAt) : null, inventory: Number(p.inventory) || 0, sizes: sizesText.split(',').map((s) => s.trim()).filter(Boolean) };
    if (existing) setDb((d) => ({ ...d, products: d.products.map((x) => (x.id === id ? out : x)) }));
    else {
      const nid = 'p' + uid();
      setDb((d) => ({ ...d, products: [{ ...out, id: nid, createdAt: new Date().toISOString(), tags: [] }, ...d.products] }));
      navigate(`/admin/products/${nid}`, { replace: true });
    }
    toast('Product saved — live on your storefront');
  };

  return (
    <>
      <PageHeader
        breadcrumb={<Link to="/admin/products" className="inline-flex items-center gap-1 hover:underline"><ArrowLeft size={12} /> Products</Link>}
        title={existing ? p.title || 'Untitled product' : 'Add product'}
        actions={<>
          {existing && <a href={`/products/${existing.handle}`} target="_blank" rel="noreferrer"><Button variant="secondary" icon={ExternalLink}>Preview</Button></a>}
          {existing && <Button variant="secondary" icon={Trash2} onClick={() => { if (confirm('Delete this product?')) { remove('products', id); navigate('/admin/products'); toast('Product deleted'); } }}>Delete</Button>}
          <Button onClick={save}>Save</Button>
        </>}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="space-y-4 p-5">
            <Field label="Title"><Input value={p.title} onChange={(e) => set('title', e.target.value)} placeholder="Short sleeve t-shirt" /></Field>
            <Field label="Description"><Textarea rows={6} value={p.description} onChange={(e) => set('description', e.target.value)} /></Field>
          </Card>
          <Card>
            <CardHeader title="Media" subtitle="Paste any image URL" />
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {p.images.map((src, i) => (
                  <div key={i} className={cx('group relative aspect-square overflow-hidden rounded-lg border border-slate-200', i === 0 && 'col-span-2 row-span-2')}>
                    <img src={thumb(src, 400)} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => set('images', p.images.filter((_, j) => j !== i))} className="absolute right-1 top-1 hidden rounded-full bg-white p-1 shadow group-hover:block cursor-pointer" aria-label="Remove image"><X size={12} /></button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Input value={newImg} onChange={(e) => setNewImg(e.target.value)} placeholder="https://images.unsplash.com/…" />
                <Button variant="secondary" icon={ImagePlus} onClick={() => { if (newImg) { set('images', [...p.images, newImg]); setNewImg(''); } }}>Add</Button>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Pricing" />
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <Field label="Price ($)"><Input type="number" step="0.01" value={p.price} onChange={(e) => set('price', e.target.value)} /></Field>
              <Field label="Compare-at price ($)" hint="Shows as a sale price"><Input type="number" step="0.01" value={p.compareAt || ''} onChange={(e) => set('compareAt', e.target.value)} /></Field>
              <Field label="Margin"><div className="flex h-9 items-center text-sm text-slate-500">{p.price ? `${Math.round(((p.price - p.price * 0.45) / p.price) * 100)}% est.` : '—'}</div></Field>
            </div>
          </Card>
          <Card>
            <CardHeader title="Inventory & variants" />
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <Field label="SKU"><Input value={p.sku} onChange={(e) => set('sku', e.target.value)} /></Field>
              <Field label="Quantity"><Input type="number" value={p.inventory} onChange={(e) => set('inventory', e.target.value)} /></Field>
              <Field label="Size options" hint="Comma separated, e.g. S, M, L"><Input value={sizesText} onChange={(e) => setSizesText(e.target.value)} /></Field>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <Field label="Status"><Select value={p.status} onChange={(e) => set('status', e.target.value)} options={['Active', 'Draft']} /></Field>
            <Toggle checked={!!p.featured} onChange={(v) => set('featured', v)} label="Feature on homepage" />
          </Card>
          <Card className="p-5">
            <div className="mb-3 text-sm font-semibold">Collections</div>
            <div className="space-y-2">
              {db.collections.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-brand-600" checked={p.collectionIds.includes(c.id)} onChange={(e) => set('collectionIds', e.target.checked ? [...p.collectionIds, c.id] : p.collectionIds.filter((x) => x !== c.id))} />
                  {c.title}
                </label>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-sm font-semibold">Search engine listing</div>
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <div className="truncate text-xs text-emerald-700">{db.settings.domain}/products/{p.handle || slug(p.title || 'new-product')}</div>
              <div className="truncate text-sm text-sky-700">{p.title || 'Product title'} – {db.settings.storeName}</div>
              <div className="line-clamp-2 text-xs text-slate-500">{p.description || 'Product description will appear here.'}</div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
