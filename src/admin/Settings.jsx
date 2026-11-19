import { useState } from 'react';
import { useDB } from '../kit/db';
import { PageHeader, Card, CardHeader, Field, Input, Select, Button, useToast } from '../kit/ui';

export default function Settings() {
  const { db, setKey } = useDB();
  const toast = useToast();
  const [s, setS] = useState(db.settings);
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const save = (e) => { e.preventDefault(); setKey('settings', { ...s, shippingRate: Number(s.shippingRate), freeShippingOver: Number(s.freeShippingOver), taxRate: Number(s.taxRate) }); toast('Settings saved'); };
  return (
    <>
      <PageHeader title="Settings" subtitle="Store details, shipping and taxes." />
      <form onSubmit={save} className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Store details" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Store name"><Input value={s.storeName} onChange={set('storeName')} /></Field>
            <Field label="Tagline"><Input value={s.tagline} onChange={set('tagline')} /></Field>
            <Field label="Contact email"><Input value={s.email} onChange={set('email')} /></Field>
            <Field label="Store currency"><Select value={s.currency} onChange={set('currency')} options={['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']} /></Field>
            <Field label="Domain" className="sm:col-span-2"><Input value={s.domain} onChange={set('domain')} /></Field>
          </div>
        </Card>
        <Card>
          <CardHeader title="Shipping & taxes" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Flat shipping rate ($)"><Input type="number" step="0.01" value={s.shippingRate} onChange={set('shippingRate')} /></Field>
            <Field label="Free shipping over ($)"><Input type="number" value={s.freeShippingOver} onChange={set('freeShippingOver')} /></Field>
            <Field label="Sales tax (%)"><Input type="number" step="0.1" value={s.taxRate} onChange={set('taxRate')} /></Field>
            <Field label="Payment provider"><Select options={['ShopNest Payments (test mode)', 'Stripe', 'PayPal', 'Razorpay']} /></Field>
          </div>
        </Card>
        <div className="flex justify-end xl:col-span-2"><Button type="submit" size="lg">Save settings</Button></div>
      </form>
    </>
  );
}
