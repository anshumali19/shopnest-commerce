import { Routes, Route, Navigate } from 'react-router-dom';
import { Home, ShoppingBag, Tag, Users, Percent, FileText, Newspaper, Palette, Settings as SettingsIcon, Store, ExternalLink, FolderOpen } from 'lucide-react';
import { Shell, Login, RequireAuth } from '../kit/Shell';
import { useDB } from '../kit/db';
import AdminHome from './AdminHome';
import { Orders, OrderDetail } from './Orders';
import { Products, ProductEditor } from './Products';
import { Collections, Customers, Discounts } from './Catalog';
import { PagesAdmin, BlogAdmin } from './Content';
import ThemeEditor from './ThemeEditor';
import Settings from './Settings';

const brand = {
  name: 'ShopNest',
  tagline: 'Store admin',
  icon: Store,
  base: '/admin',
  sessionKey: 'shopnest-admin',
  headline: 'Everything you need to sell online — storefront, CMS and admin in one.',
  description: 'Manage products, orders, customers, discounts, pages, blog posts and your theme. Every change shows up on the live storefront instantly.',
};

export default function AdminApp() {
  const { db } = useDB();
  const unfulfilled = db.orders.filter((o) => o.fulfillment === 'Unfulfilled' && o.financial === 'Paid').length;
  const lowStock = db.products.filter((p) => p.inventory <= 5);
  const nav = [
    { to: '/admin', label: 'Home', icon: Home },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, badge: unfulfilled || null },
    { to: '/admin/products', label: 'Products', icon: Tag },
    { to: '/admin/collections', label: 'Collections', icon: FolderOpen },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/discounts', label: 'Discounts', icon: Percent },
    { section: 'Content (CMS)' },
    { to: '/admin/pages', label: 'Pages', icon: FileText },
    { to: '/admin/blog', label: 'Blog posts', icon: Newspaper },
    { section: 'Sales channels' },
    { to: '/admin/theme', label: 'Online store · Theme', icon: Palette },
    { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
  ];
  const notifications = [
    ...(unfulfilled ? [{ title: `${unfulfilled} orders ready to fulfill`, to: '/admin/orders' }] : []),
    ...lowStock.map((p) => ({ title: `Low inventory: ${p.title}`, text: `${p.inventory} left`, tone: 'yellow', to: `/admin/products/${p.id}` })),
  ];
  return (
    <Routes>
      <Route path="login" element={<Login brand={brand} demoEmail="owner@northbound.example" highlights={['Live storefront powered by this admin', 'Products, collections, inventory & variants', 'Orders, fulfillment, refunds & discounts', 'Pages, blog & a visual theme editor']} />} />
      <Route path="*" element={
        <RequireAuth sessionKey={brand.sessionKey} base="/admin">
          <Shell brand={brand} nav={nav} user={{ name: 'Riley Brooks', role: 'Store owner' }} notifications={notifications} onSearch={(q, n) => n(`/admin/products?q=${encodeURIComponent(q)}`)}>
            <div className="mb-4 flex justify-end">
              <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                <Store size={14} /> View your store <ExternalLink size={12} />
              </a>
            </div>
            <Routes>
              <Route index element={<AdminHome />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductEditor />} />
              <Route path="collections" element={<Collections />} />
              <Route path="customers" element={<Customers />} />
              <Route path="discounts" element={<Discounts />} />
              <Route path="pages" element={<PagesAdmin />} />
              <Route path="blog" element={<BlogAdmin />} />
              <Route path="theme" element={<ThemeEditor />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Shell>
        </RequireAuth>
      } />
    </Routes>
  );
}
