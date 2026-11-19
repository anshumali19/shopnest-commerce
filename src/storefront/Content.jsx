import { Link, useParams } from 'react-router-dom';
import { useDB } from '../kit/db';
import { date } from '../kit/format';

const Body = ({ text }) => (text || '').split(/\n\s*\n/).map((para, i) => <p key={i} className="mb-5 leading-relaxed text-slate-700">{para}</p>);

export function Page() {
  const { handle } = useParams();
  const { db } = useDB();
  const p = db.pages.find((x) => x.handle === handle && x.published);
  if (!p) return <div className="py-32 text-center text-slate-500">Page not found.</div>;
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-8 text-4xl font-semibold tracking-tight">{p.title}</h1>
      <Body text={p.body} />
    </article>
  );
}

export function Blog() {
  const { db } = useDB();
  const posts = db.posts.filter((p) => p.published).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Journal</h1>
      <p className="mt-2 text-slate-600">Stories about craft, care and everyday carry.</p>
      <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.id} to={`/blogs/journal/${p.handle}`} className="group">
            <div className="aspect-[3/2] overflow-hidden rounded-xl bg-slate-100">{p.image && <img src={p.image.replace('w=1200', 'w=700')} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}</div>
            <div className="mt-4 text-xs text-slate-500">{date(p.publishedAt)} · {p.author}</div>
            <h2 className="mt-1 text-xl font-semibold group-hover:underline">{p.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Post() {
  const { handle } = useParams();
  const { db } = useDB();
  const p = db.posts.find((x) => x.handle === handle && x.published);
  if (!p) return <div className="py-32 text-center text-slate-500">Post not found.</div>;
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link to="/blogs/journal" className="text-sm text-slate-500 hover:underline">← Journal</Link>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">{p.title}</h1>
      <div className="mt-3 text-sm text-slate-500">{date(p.publishedAt)} · by {p.author}</div>
      {p.image && <img src={p.image} alt="" className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />}
      <div className="mt-10"><Body text={p.body} /></div>
    </article>
  );
}
