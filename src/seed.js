import { rng, pick, int, fullName, emailOf, daysAgo, CITIES, uid } from './kit/format';

export const img = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const P = [
  // title, collection, price, compareAt, [images], sizes, desc
  ['Everyday Pullover Hoodie', 'apparel', 68, 85, ['photo-1556821840-3a63f95609a7', 'photo-1620799140188-3b2a02fd9a77'], ['S', 'M', 'L', 'XL'], 'Heavyweight 400gsm brushed-back fleece with a relaxed fit, double-lined hood and ribbed cuffs. Garment-dyed for a lived-in feel from day one.'],
  ['Midnight Fleece Hoodie', 'apparel', 72, null, ['photo-1579572331145-5e53b299c64e'], ['S', 'M', 'L', 'XL'], 'Our signature hoodie in a deep midnight black. Soft organic cotton, kangaroo pocket and a hood that holds its shape.'],
  ['Classic Denim Jacket', 'apparel', 118, 140, ['photo-1543076447-215ad9ba6923', 'photo-1495105787522-5334e3ffa0ef'], ['S', 'M', 'L', 'XL'], 'A timeless trucker jacket cut from 13oz rigid denim that softens beautifully with wear. Corozo buttons and chest flap pockets.'],
  ['Raw Indigo Trucker', 'apparel', 132, null, ['photo-1611312449408-fcece27cdbb7'], ['M', 'L', 'XL'], 'Unwashed selvedge indigo that fades to your story. Limited run, made in small batches.'],
  ['Essential Crew Tee', 'apparel', 28, null, ['photo-1521572163474-6864f9cf17ab', 'photo-1581655353564-df123a1eb820'], ['XS', 'S', 'M', 'L', 'XL'], 'The tee you will reach for every morning. 180gsm combed cotton, pre-shrunk, with a clean crew neck.'],
  ['Heavyweight Black Tee', 'apparel', 32, 38, ['photo-1583743814966-8936f5b7be1a'], ['S', 'M', 'L', 'XL'], 'Boxy fit, dense 240gsm jersey and a neckline that never stretches out.'],
  ['Pastel Court Sneaker', 'footwear', 110, 135, ['photo-1595950653106-6c9ebd614d3a'], ['7', '8', '9', '10', '11'], 'Low-profile leather court sneaker with a cushioned footbed and a soft pastel colourway.'],
  ['Trail Runner 2', 'footwear', 128, null, ['photo-1560769629-975ec94e6a86', 'photo-1571008887538-b36bb32f4571'], ['7', '8', '9', '10', '11', '12'], 'Responsive foam, grippy lugged outsole and a breathable knit upper built for road-to-trail miles.'],
  ['Commuter Backpack 22L', 'bags', 89, null, ['photo-1553062407-98eeb64c6a62'], [], 'Water-resistant recycled nylon, padded 16" laptop sleeve, hidden passport pocket and a luggage pass-through.'],
  ['Weekender Backpack', 'bags', 96, 120, ['photo-1622560480654-d96214fdc887'], [], 'Roll-top main compartment that expands to 28L, with a clamshell opening for easy packing.'],
  ['City Pack Black', 'bags', 79, null, ['photo-1581605405669-fcdf81165afa'], [], 'Minimal silhouette, magnetic buckle and a quick-access front pocket for your daily carry.'],
  ['Canvas Market Tote', 'bags', 34, null, ['photo-1574365569389-a10d488ca3fb'], [], '12oz natural canvas tote with reinforced handles and an internal zip pocket.'],
  ['Night Tote', 'bags', 38, null, ['photo-1578237493287-8d4d2b03591a'], [], 'Our canvas tote in washed black with tonal embroidery.'],
  ['Field Watch 38mm', 'accessories', 189, 229, ['photo-1524592094714-0f0654e20314', 'photo-1590995505834-e5380bba1865'], [], 'Sapphire crystal, Japanese automatic movement and a 100m water rating on a vegetable-tanned leather strap.'],
  ['Round Acetate Sunglasses', 'accessories', 75, null, ['photo-1511499767150-a48a237f0083'], [], 'Hand-polished acetate frames with polarised, UV400 lenses.'],
  ['Wayfarer Sunglasses', 'accessories', 69, 85, ['photo-1572635196237-14b3f281503f'], [], 'A bold classic in matte black with scratch-resistant polarised lenses.'],
  ['Slim Leather Wallet', 'accessories', 49, null, ['photo-1627123424574-724758594e93', 'photo-1628483211662-9bcc692c46dc'], [], 'Full-grain leather bifold with six card slots. Ages to a rich patina.'],
  ['Studio Wireless Headphones', 'accessories', 179, 219, ['photo-1505740420928-5e560c06d30e', 'photo-1546435770-a3e426bf472b'], [], 'Active noise cancellation, 40-hour battery and memory-foam cushions for all-day listening.'],
  ['Insulated Bottle 750ml', 'accessories', 36, null, ['photo-1602143407151-7111542de6e8'], [], 'Keeps drinks cold for 24 hours or hot for 12. Powder-coated stainless steel with a leak-proof lid.'],
  ['Ribbed Merino Beanie', 'accessories', 32, null, ['photo-1618354691792-d1d42acfd860', 'photo-1576871337632-b9aef4c17ab9'], [], 'Soft, itch-free merino wool in a classic fisherman rib.'],
  ['Six-Panel Cap', 'accessories', 30, null, ['photo-1588850561407-ed78c282e89b', 'photo-1622445275576-721325763afe'], [], 'Unstructured cotton twill cap with an adjustable brass buckle.'],
  ['Washed Dad Cap', 'accessories', 28, 34, ['photo-1521369909029-2afed882baee'], [], 'Garment-washed for a broken-in feel. One size fits most.'],
];

export function seed() {
  const r = rng(99);
  const settings = { storeName: 'Northbound', tagline: 'Everyday goods, built to last.', email: 'hello@northbound.example', currency: 'USD', shippingRate: 6, freeShippingOver: 75, taxRate: 8, domain: 'northbound.shopnest.app' };
  const theme = {
    primary: '#111827', accent: '#059669', announcement: 'Free shipping on orders over $75 · 30-day returns',
    heroTitle: 'Made for the everyday.', heroSubtitle: 'Thoughtfully designed apparel, bags and accessories — crafted to be worn hard and kept for years.',
    heroImage: img('photo-1441984904996-e0b6ba687e04', 1800), heroCta: 'Shop the collection', featuredCollection: 'apparel',
    showTestimonials: true, showNewsletter: true, showBlog: true, radius: 'rounded',
  };
  const collections = [
    { id: 'apparel', handle: 'apparel', title: 'Apparel', description: 'Hoodies, tees and outerwear made from premium cotton and denim.', image: img('photo-1558769132-cb1aea458c5e', 1200) },
    { id: 'footwear', handle: 'footwear', title: 'Footwear', description: 'Sneakers and runners for the city and the trail.', image: img('photo-1595950653106-6c9ebd614d3a', 1200) },
    { id: 'bags', handle: 'bags', title: 'Bags', description: 'Backpacks and totes for every commute.', image: img('photo-1553062407-98eeb64c6a62', 1200) },
    { id: 'accessories', handle: 'accessories', title: 'Accessories', description: 'Watches, eyewear and the little things that finish a look.', image: img('photo-1524592094714-0f0654e20314', 1200) },
  ];
  const products = P.map(([title, col, price, compareAt, imgs, sizes, description], i) => ({
    id: `p${i}`, handle: slug(title), title, description, price, compareAt, images: imgs.map((x) => img(x)), collectionIds: [col],
    sizes, status: i === 21 ? 'Draft' : 'Active', inventory: i % 9 === 4 ? 3 : int(r, 12, 160), sku: `NB-${1000 + i}`, vendor: 'Northbound', tags: [col],
    featured: [0, 2, 7, 8, 13, 17, 6, 14].includes(i), createdAt: daysAgo(int(r, 20, 300)),
  }));

  const customers = Array.from({ length: 46 }, (_, i) => {
    const name = fullName(r);
    return { id: `cu${i}`, name, email: emailOf(name, pick(r, ['gmail.com', 'outlook.com', 'icloud.com'])), city: pick(r, CITIES), acceptsMarketing: r() < 0.6, createdAt: daysAgo(int(r, 5, 300)) };
  });

  const orders = [];
  for (let i = 0; i < 150; i++) {
    const age = Math.pow(r(), 1.2) * 60;
    const cust = pick(r, customers);
    const items = Array.from({ length: int(r, 1, 3) }, () => {
      const p = pick(r, products.filter((x) => x.status === 'Active'));
      return { productId: p.id, title: p.title, image: p.images[0], variant: p.sizes.length ? pick(r, p.sizes) : null, qty: int(r, 1, 2), price: p.price };
    });
    const subtotal = items.reduce((s, x) => s + x.qty * x.price, 0);
    const discount = r() < 0.15 ? Math.round(subtotal * 0.1) : 0;
    const shipping = subtotal - discount >= settings.freeShippingOver ? 0 : settings.shippingRate;
    const tax = Math.round((subtotal - discount) * settings.taxRate) / 100;
    const created = daysAgo(age);
    const fulfilled = age > 2 ? r() < 0.95 : r() < 0.3;
    const refunded = age > 5 && r() < 0.03;
    orders.push({
      id: `o${i}`, number: 1001 + (149 - i), customerId: cust.id, email: cust.email, customerName: cust.name, items, subtotal, discount, discountCode: discount ? 'WELCOME10' : null, shipping, tax, total: subtotal - discount + shipping + tax,
      financial: refunded ? 'Refunded' : 'Paid', fulfillment: fulfilled ? 'Fulfilled' : 'Unfulfilled',
      address: { line1: `${int(r, 10, 999)} ${pick(r, ['Oak', 'Maple', 'Market', 'Pine', 'Elm'])} St`, city: cust.city, zip: String(int(r, 10000, 99999)), country: 'United States' },
      timeline: [{ at: created, text: 'Order placed' }, { at: created, text: 'Payment captured' }, ...(fulfilled ? [{ at: new Date(new Date(created).getTime() + 864e5).toISOString(), text: 'Order fulfilled · tracking sent' }] : [])],
      createdAt: created,
    });
  }
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const discounts = [
    { id: 'dc1', code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 0, active: true, used: 21, createdAt: daysAgo(90) },
    { id: 'dc2', code: 'FREESHIP', type: 'free_shipping', value: 0, minSubtotal: 40, active: true, used: 34, createdAt: daysAgo(60) },
    { id: 'dc3', code: 'SAVE20', type: 'fixed', value: 20, minSubtotal: 120, active: true, used: 9, createdAt: daysAgo(30) },
    { id: 'dc4', code: 'SUMMER25', type: 'percent', value: 25, minSubtotal: 0, active: false, used: 112, createdAt: daysAgo(150) },
  ];

  const pages = [
    { id: 'pg1', handle: 'about', title: 'About us', published: true, body: 'Northbound started in a small studio with a simple idea: make fewer, better things.\n\nEvery piece we design is tested for months before it reaches you. We work with family-run factories, use organic and recycled materials wherever possible, and stand behind everything we sell with a lifetime repair promise.\n\nThanks for being here.' },
    { id: 'pg2', handle: 'shipping-returns', title: 'Shipping & returns', published: true, body: 'We ship worldwide from our warehouse in Portland, OR. Orders over $75 ship free within the US.\n\nNot quite right? Return unworn items within 30 days for a full refund — we will even cover the return label.' },
    { id: 'pg3', handle: 'faq', title: 'FAQ', published: true, body: 'How do your sizes run? True to size with a relaxed fit. Check each product page for measurements.\n\nDo you restock? Yes — core products restock monthly. Sign up to our newsletter to hear first.\n\nCan I change my order? Email us within 2 hours of ordering and we will do our best.' },
  ];
  const posts = [
    { id: 'b1', handle: 'how-we-make-our-hoodies', title: 'How we make our hoodies', excerpt: 'From cotton field to your wardrobe — a look inside the 14-step process behind our best seller.', image: img('photo-1556821840-3a63f95609a7', 1200), author: 'Maya Torres', published: true, publishedAt: daysAgo(6), body: 'Our hoodie took two years and 31 samples to get right.\n\nIt starts with long-staple organic cotton, knitted into a dense 400gsm loopback fleece. Each panel is cut by hand, then garment-dyed so the colour settles into every seam.\n\nThe result is a hoodie that feels broken-in on day one and keeps its shape for years.' },
    { id: 'b2', handle: 'a-guide-to-everyday-carry', title: 'A guide to everyday carry', excerpt: 'The ten things our team never leaves home without, and the bags that hold them.', image: img('photo-1553062407-98eeb64c6a62', 1200), author: 'Jonah Lee', published: true, publishedAt: daysAgo(18), body: 'Everyday carry is personal, but a few essentials make every list: a slim wallet, a good bottle, headphones and a bag that does not get in the way.\n\nHere is how our team packs for a typical day in the city.' },
    { id: 'b3', handle: 'caring-for-raw-denim', title: 'Caring for raw denim', excerpt: 'Wash less, wear more — and other rules for denim that tells your story.', image: img('photo-1611312449408-fcece27cdbb7', 1200), author: 'Maya Torres', published: true, publishedAt: daysAgo(41), body: 'Raw denim rewards patience. Wear it for at least six months before the first wash.\n\nWhen you do wash, turn it inside out, use cold water and hang it to dry.' },
  ];
  const testimonials = [
    { name: 'Hannah W.', text: 'The hoodie is genuinely the best I have owned. Ordered a second colour within a week.', rating: 5 },
    { name: 'Marcus T.', text: 'Fast shipping, beautiful packaging and the backpack fits everything I need for work.', rating: 5 },
    { name: 'Priya S.', text: 'Customer service sorted an exchange in a day. This is how online shopping should feel.', rating: 5 },
  ];
  const sessions = Array.from({ length: 30 }, (_, i) => ({ day: daysAgo(29 - i), count: int(r, 380, 900) + i * 6 }));
  return { settings, theme, collections, products, customers, orders, discounts, pages, posts, testimonials, sessions, cart: [] };
}

export function computeTotals(items, settings, discount) {
  const subtotal = items.reduce((s, x) => s + x.qty * x.price, 0);
  let off = 0;
  let freeShip = false;
  if (discount && subtotal >= (discount.minSubtotal || 0)) {
    if (discount.type === 'percent') off = Math.round(subtotal * discount.value) / 100;
    if (discount.type === 'fixed') off = Math.min(subtotal, discount.value);
    if (discount.type === 'free_shipping') freeShip = true;
  }
  const shipping = items.length === 0 || freeShip || subtotal - off >= settings.freeShippingOver ? 0 : settings.shippingRate;
  const tax = Math.round((subtotal - off) * settings.taxRate) / 100;
  return { subtotal, discount: off, shipping, tax, total: Math.round((subtotal - off + shipping + tax) * 100) / 100 };
}

export { uid };
