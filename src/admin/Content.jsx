import { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useDB } from '../kit/db';
import { PageHeader, DataTable, Badge, Button, Modal, Field, Input, Textarea, Toggle, useToast } from '../kit/ui';
import { date } from '../kit/format';
import { slug } from '../seed';

function Editor({ open, onClose, initial, onSave, withPost }) {
  const [f, setF] = useState(initial || {});
  const [lastInit, setLastInit] = useState(null);
  if (open && initial !== lastInit) { setF(initial || {}); setLastInit(initial); }
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? `Edit ${withPost ? 'post' : 'page'}` : `New ${withPost ? 'blog post' : 'page'}`} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => f.title && onSave({ ...f, handle: f.handle || slug(f.title) })}>Save</Button></>}>
      <div className="space-y-4">
        <Field label="Title"><Input value={f.title || ''} onChange={(e) => set('title', e.target.value)} /></Field>
        {withPost && <div className="grid gap-4 sm:grid-cols-2"><Field label="Author"><Input value={f.author || ''} onChange={(e) => set('author', e.target.value)} /></Field><Field label="Featured image URL"><Input value={f.image || ''} onChange={(e) => set('image', e.target.value)} /></Field></div>}
        {withPost && <Field label="Excerpt"><Input value={f.excerpt || ''} onChange={(e) => set('excerpt', e.target.value)} /></Field>}
        <Field label="Content" hint="Separate paragraphs with a blank line."><Textarea rows={12} value={f.body || ''} onChange={(e) => set('body', e.target.value)} /></Field>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
          <Toggle checked={f.published !== false} onChange={(v) => set('published', v)} label={f.published !== false ? 'Visible on storefront' : 'Hidden (draft)'} />
          <span className="text-xs text-slate-500">URL: /{withPost ? 'blogs/journal' : 'pages'}/{f.handle || slug(f.title || '')}</span>
        </div>
      </div>
    </Modal>
  );
}

export function PagesAdmin() {
  const { db, add, update, remove } = useDB();
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  return (
    <>
      <PageHeader title="Pages" subtitle="Static content like About, FAQ and policies. Linked automatically in your store footer." actions={<Button icon={Plus} onClick={() => setEdit({ published: true })}>Add page</Button>} />
      <DataTable rows={db.pages} searchKeys={['title']}
        columns={[
          { key: 'title', label: 'Title', render: (r) => <span className="font-medium text-slate-900">{r.title}</span> },
          { key: 'handle', label: 'URL', render: (r) => <span className="font-mono text-xs text-slate-500">/pages/{r.handle}</span> },
          { key: 'published', label: 'Visibility', render: (r) => (r.published ? <Badge tone="green">Visible</Badge> : <Badge>Hidden</Badge>) },
          { key: 'a', label: '', sortable: false, render: (r) => <div className="flex justify-end gap-1"><a href={`/pages/${r.handle}`} target="_blank" rel="noreferrer"><Button size="xs" variant="ghost" icon={ExternalLink} /></a><Button size="xs" variant="ghost" icon={Pencil} onClick={() => setEdit(r)} /><Button size="xs" variant="ghost" icon={Trash2} onClick={() => { remove('pages', r.id); toast('Page deleted'); }} /></div> },
        ]} />
      <Editor open={!!edit} initial={edit} onClose={() => setEdit(null)} onSave={(v) => { v.id ? update('pages', v.id, v) : add('pages', v); toast('Page saved'); setEdit(null); }} />
    </>
  );
}

export function BlogAdmin() {
  const { db, add, update, remove } = useDB();
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  return (
    <>
      <PageHeader title="Blog posts" subtitle="Publish stories to your store's Journal." actions={<Button icon={Plus} onClick={() => setEdit({ published: true, author: 'Riley Brooks' })}>Create post</Button>} />
      <DataTable rows={db.posts} searchKeys={['title', 'author']} initialSort={{ key: 'publishedAt', dir: 'desc' }}
        columns={[
          { key: 'title', label: 'Title', render: (r) => <div className="flex items-center gap-3">{r.image && <img src={r.image.replace('w=1200', 'w=120')} alt="" className="h-10 w-14 rounded object-cover" />}<span className="font-medium text-slate-900">{r.title}</span></div> },
          { key: 'author', label: 'Author' },
          { key: 'publishedAt', label: 'Published', render: (r) => date(r.publishedAt), sortValue: (r) => new Date(r.publishedAt).getTime() },
          { key: 'published', label: 'Visibility', render: (r) => (r.published ? <Badge tone="green">Visible</Badge> : <Badge>Draft</Badge>) },
          { key: 'a', label: '', sortable: false, render: (r) => <div className="flex justify-end gap-1"><a href={`/blogs/journal/${r.handle}`} target="_blank" rel="noreferrer"><Button size="xs" variant="ghost" icon={ExternalLink} /></a><Button size="xs" variant="ghost" icon={Pencil} onClick={() => setEdit(r)} /><Button size="xs" variant="ghost" icon={Trash2} onClick={() => { remove('posts', r.id); toast('Post deleted'); }} /></div> },
        ]} />
      <Editor withPost open={!!edit} initial={edit} onClose={() => setEdit(null)} onSave={(v) => { v.id ? update('posts', v.id, v) : add('posts', { ...v, publishedAt: new Date().toISOString() }); toast('Post saved'); setEdit(null); }} />
    </>
  );
}
