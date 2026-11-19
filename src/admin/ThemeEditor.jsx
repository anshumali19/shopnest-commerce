import { useRef, useState } from 'react';
import { Monitor, Smartphone, RefreshCw, ExternalLink } from 'lucide-react';
import { useDB } from '../kit/db';
import { Card, Field, Input, Textarea, Select, Toggle, Button, cx, useToast } from '../kit/ui';

const PRESETS = [
  { name: 'Classic', primary: '#111827', accent: '#059669' },
  { name: 'Ocean', primary: '#0c4a6e', accent: '#0ea5e9' },
  { name: 'Sunset', primary: '#7c2d12', accent: '#f97316' },
  { name: 'Berry', primary: '#4c1d95', accent: '#db2777' },
];

export default function ThemeEditor() {
  const { db, setKey } = useDB();
  const toast = useToast();
  const [device, setDevice] = useState('desktop');
  const frame = useRef();
  const t = db.theme;
  const set = (k, v) => setKey('theme', (th) => ({ ...th, [k]: v }));
  return (
    <div className="-mx-4 -mb-4 flex flex-col overflow-hidden rounded-t-xl border-t border-slate-200 sm:-mx-6 sm:-mb-6 lg:-mx-8 lg:-mb-8 xl:h-[calc(100vh-64px-60px)] xl:flex-row">
      <aside className="w-full shrink-0 space-y-5 overflow-y-auto border-r border-slate-200 bg-white p-5 xl:w-96">
        <div>
          <h1 className="text-lg font-semibold">Theme editor</h1>
          <p className="text-xs text-slate-500">Changes save automatically and appear on your live storefront.</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Colors</h2>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => { setKey('theme', (th) => ({ ...th, primary: p.primary, accent: p.accent })); toast(`${p.name} palette applied`); }} className="rounded-lg border border-slate-200 p-1.5 text-[10px] hover:border-slate-400 cursor-pointer">
                <div className="flex h-6 overflow-hidden rounded"><span className="flex-1" style={{ background: p.primary }} /><span className="flex-1" style={{ background: p.accent }} /></div>{p.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary"><Input type="color" className="p-1" value={t.primary} onChange={(e) => set('primary', e.target.value)} /></Field>
            <Field label="Accent / buttons"><Input type="color" className="p-1" value={t.accent} onChange={(e) => set('accent', e.target.value)} /></Field>
          </div>
          <Field label="Corner style"><Select value={t.radius} onChange={(e) => set('radius', e.target.value)} options={[{ value: 'rounded', label: 'Rounded' }, { value: 'sharp', label: 'Sharp' }, { value: 'pill', label: 'Pill' }]} /></Field>
        </section>
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Announcement bar</h2>
          <Input value={t.announcement} onChange={(e) => set('announcement', e.target.value)} placeholder="Leave empty to hide" />
        </section>
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hero banner</h2>
          <Field label="Heading"><Input value={t.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} /></Field>
          <Field label="Subheading"><Textarea rows={3} value={t.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)} /></Field>
          <Field label="Button label"><Input value={t.heroCta} onChange={(e) => set('heroCta', e.target.value)} /></Field>
          <Field label="Background image URL"><Input value={t.heroImage} onChange={(e) => set('heroImage', e.target.value)} /></Field>
        </section>
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Homepage sections</h2>
          <Field label="Featured collection"><Select value={t.featuredCollection} onChange={(e) => set('featuredCollection', e.target.value)} options={db.collections.map((c) => ({ value: c.id, label: c.title }))} /></Field>
          <Toggle checked={t.showTestimonials} onChange={(v) => set('showTestimonials', v)} label="Customer testimonials" />
          <Toggle checked={t.showBlog} onChange={(v) => set('showBlog', v)} label="Latest from the journal" />
          <Toggle checked={t.showNewsletter} onChange={(v) => set('showNewsletter', v)} label="Newsletter signup" />
        </section>
      </aside>
      <div className="flex min-h-[600px] flex-1 flex-col bg-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <button onClick={() => setDevice('desktop')} className={cx('rounded-md px-2 py-1 cursor-pointer', device === 'desktop' && 'bg-white shadow')} aria-label="Desktop preview"><Monitor size={16} /></button>
            <button onClick={() => setDevice('mobile')} className={cx('rounded-md px-2 py-1 cursor-pointer', device === 'mobile' && 'bg-white shadow')} aria-label="Mobile preview"><Smartphone size={16} /></button>
          </div>
          <span className="text-xs text-slate-500">Live preview · {db.settings.domain}</span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" icon={RefreshCw} onClick={() => frame.current?.contentWindow?.location.reload()} />
            <a href="/" target="_blank" rel="noreferrer"><Button size="sm" variant="ghost" icon={ExternalLink} /></a>
          </div>
        </div>
        <div className="flex flex-1 justify-center overflow-hidden p-4">
          <iframe ref={frame} title="Store preview" src="/?preview=1" className={cx('h-full min-h-[560px] rounded-lg border border-slate-300 bg-white shadow-xl transition-all', device === 'mobile' ? 'w-[390px]' : 'w-full')} />
        </div>
      </div>
    </div>
  );
}
