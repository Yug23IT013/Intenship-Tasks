// ─── Product Catalogue (mock data) ───────────────────────────────────────────
// Images sourced from Unsplash (free-to-use)

export const CATEGORIES = [
  { id: 'all',         label: 'All',         icon: '🏪' },
  { id: 'groceries',   label: 'Groceries',   icon: '🛒' },
  { id: 'dairy',       label: 'Dairy',       icon: '🥛' },
  { id: 'snacks',      label: 'Snacks',      icon: '🍿' },
  { id: 'beverages',   label: 'Beverages',   icon: '☕' },
  { id: 'personal',    label: 'Personal Care',icon: '🧴' },
  { id: 'household',   label: 'Household',   icon: '🏠' },
  { id: 'electronics', label: 'Electronics', icon: '📱' },
];

export const PRODUCTS = [
  // Groceries
  {
    id: 1, category: 'groceries', name: 'Basmati Rice (5 kg)',
    price: 349, originalPrice: 420, rating: 4.5, reviews: 128, inStock: true,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
    description: 'Premium aged basmati rice with long, slender grains and a distinctive aroma. Perfect for biryanis and pulaos.',
    brand: 'India Gate', tags: ['Organic', 'Premium'],
  },
  {
    id: 2, category: 'groceries', name: 'Toor Dal (1 kg)',
    price: 145, originalPrice: 160, rating: 4.3, reviews: 86, inStock: true,
    image: 'https://images.unsplash.com/photo-1585996875082-c8c3ae03eb35?w=400&h=400&fit=crop',
    description: 'High-quality split pigeon peas sourced from Maharashtra. Rich in protein and fibre.',
    brand: 'Fortune', tags: ['High Protein'],
  },
  {
    id: 3, category: 'groceries', name: 'Refined Sunflower Oil (1 L)',
    price: 132, originalPrice: 150, rating: 4.2, reviews: 64, inStock: true,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
    description: 'Light and healthy refined sunflower oil, ideal for everyday cooking. Low cholesterol.',
    brand: 'Saffola', tags: ['Heart Healthy'],
  },
  {
    id: 4, category: 'groceries', name: 'Whole Wheat Atta (10 kg)',
    price: 340, originalPrice: 380, rating: 4.6, reviews: 201, inStock: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
    description: 'Stone-ground whole wheat flour packed with nutrients. Makes soft rotis and healthy bread.',
    brand: 'Aashirvaad', tags: ['Whole Grain', 'No Maida'],
  },
  {
    id: 5, category: 'groceries', name: 'Sugar (1 kg)',
    price: 48, originalPrice: 55, rating: 4.0, reviews: 43, inStock: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    description: 'Pure refined white sugar. Essential kitchen staple for cooking, baking and beverages.',
    brand: 'Local Brand', tags: [],
  },

  // Dairy
  {
    id: 6, category: 'dairy', name: 'Full Cream Milk (1 L)',
    price: 68, originalPrice: 68, rating: 4.7, reviews: 312, inStock: true,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
    description: 'Fresh full cream milk with 6% fat. Homogenised and pasteurised for safety and longer shelf life.',
    brand: 'Amul', tags: ['Fresh', 'Daily'],
  },
  {
    id: 7, category: 'dairy', name: 'Paneer (200 g)',
    price: 89, originalPrice: 95, rating: 4.5, reviews: 178, inStock: true,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop',
    description: 'Soft and fresh cottage cheese made from pure cow milk. Perfect for curries and snacks.',
    brand: 'Amul', tags: ['Fresh'],
  },
  {
    id: 8, category: 'dairy', name: 'Dahi / Curd (400 g)',
    price: 45, originalPrice: 50, rating: 4.4, reviews: 95, inStock: true,
    image: 'https://images.unsplash.com/photo-1571212515416-fca988083c30?w=400&h=400&fit=crop',
    description: 'Thick, creamy curd made from fresh cow milk. Rich in probiotics for gut health.',
    brand: 'Mother Dairy', tags: ['Probiotic'],
  },
  {
    id: 9, category: 'dairy', name: 'Butter (100 g)',
    price: 56, originalPrice: 60, rating: 4.6, reviews: 141, inStock: true,
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop',
    description: 'Creamy salted table butter made from fresh cream. Great for bread, rotis and cooking.',
    brand: 'Amul', tags: [],
  },

  // Snacks
  {
    id: 10, category: 'snacks', name: 'Aloo Bhujia (400 g)',
    price: 79, originalPrice: 90, rating: 4.4, reviews: 223, inStock: true,
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop',
    description: 'Crispy, spicy potato sev snack — a classic Indian namkeen loved by all age groups.',
    brand: 'Haldiram\'s', tags: ['Bestseller'],
  },
  {
    id: 11, category: 'snacks', name: 'Cream Biscuits (300 g)',
    price: 40, originalPrice: 45, rating: 4.1, reviews: 187, inStock: true,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
    description: 'Light vanilla cream-filled biscuits. Perfect for tea time and kids\' snack boxes.',
    brand: 'Britannia', tags: [],
  },
  {
    id: 12, category: 'snacks', name: 'Mixed Nuts (250 g)',
    price: 299, originalPrice: 349, rating: 4.8, reviews: 96, inStock: true,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop',
    description: 'Premium roasted mixed nuts — almonds, cashews, walnuts and pistachios. Healthy and filling.',
    brand: 'Nutraj', tags: ['Healthy', 'High Protein'],
  },
  {
    id: 13, category: 'snacks', name: 'Masala Chips (80 g)',
    price: 20, originalPrice: 20, rating: 3.9, reviews: 340, inStock: true,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop',
    description: 'Crispy potato chips with a tangy masala coating. A go-to snack for movie time.',
    brand: 'Lays', tags: [],
  },

  // Beverages
  {
    id: 14, category: 'beverages', name: 'Masala Chai Blend (250 g)',
    price: 120, originalPrice: 140, rating: 4.7, reviews: 267, inStock: true,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
    description: 'Aromatic blend of Assam CTC tea with ginger, cardamom and cinnamon. Brews a perfect kadak chai.',
    brand: 'Wagh Bakri', tags: ['Bestseller'],
  },
  {
    id: 15, category: 'beverages', name: 'Instant Coffee (200 g)',
    price: 260, originalPrice: 300, rating: 4.3, reviews: 154, inStock: true,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    description: 'Rich dark-roasted instant coffee with a bold flavour. Ready in seconds, tastes like brewed.',
    brand: 'Nescafé', tags: [],
  },
  {
    id: 16, category: 'beverages', name: 'Mango Juice (1 L)',
    price: 85, originalPrice: 95, rating: 4.2, reviews: 198, inStock: false,
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&h=400&fit=crop',
    description: 'Thick and pulpy Alphonso mango juice with no added artificial colours or flavours.',
    brand: 'Real', tags: ['No Preservatives'],
  },
  {
    id: 17, category: 'beverages', name: 'Mineral Water (5 L)',
    price: 55, originalPrice: 60, rating: 4.5, reviews: 421, inStock: true,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop',
    description: 'Pure natural mineral water with essential minerals. Ideal for home, office and travel.',
    brand: 'Bisleri', tags: [],
  },

  // Personal Care
  {
    id: 18, category: 'personal', name: 'Neem Soap (100 g × 4)',
    price: 99, originalPrice: 120, rating: 4.5, reviews: 311, inStock: true,
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&h=400&fit=crop',
    description: 'Antibacterial neem soap with natural extracts. Fights germs and keeps skin fresh all day.',
    brand: 'Dettol', tags: ['Antibacterial'],
  },
  {
    id: 19, category: 'personal', name: 'Shampoo (340 ml)',
    price: 179, originalPrice: 199, rating: 4.3, reviews: 214, inStock: true,
    image: 'https://images.unsplash.com/photo-1585232351009-aa87a1b73a60?w=400&h=400&fit=crop',
    description: 'Anti-dandruff shampoo with Zinc Pyrithione. Removes dandruff in 2 washes, leaves hair fresh.',
    brand: 'Head & Shoulders', tags: ['Anti-Dandruff'],
  },
  {
    id: 20, category: 'personal', name: 'Toothpaste (150 g)',
    price: 89, originalPrice: 100, rating: 4.4, reviews: 456, inStock: true,
    image: 'https://images.unsplash.com/photo-1559591937-abc0c0e5f7c9?w=400&h=400&fit=crop',
    description: 'Complete cavity protection toothpaste with fluoride. Whitens teeth and freshens breath.',
    brand: 'Colgate', tags: ['Cavity Protection'],
  },

  // Household
  {
    id: 21, category: 'household', name: 'Detergent Powder (2 kg)',
    price: 189, originalPrice: 220, rating: 4.2, reviews: 178, inStock: true,
    image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&h=400&fit=crop',
    description: 'Powerful detergent powder that removes tough stains in a single wash. Fresh floral fragrance.',
    brand: 'Ariel', tags: ['Stain Removal'],
  },
  {
    id: 22, category: 'household', name: 'Floor Cleaner (2 L)',
    price: 145, originalPrice: 160, rating: 4.1, reviews: 93, inStock: true,
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop',
    description: 'Pine-scented floor cleaner that disinfects and leaves floors sparkling clean. Safe for all tiles.',
    brand: 'Phenyl', tags: ['Disinfectant'],
  },
  {
    id: 23, category: 'household', name: 'LED Bulb 9W (Pack of 2)',
    price: 149, originalPrice: 180, rating: 4.6, reviews: 267, inStock: true,
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=400&fit=crop',
    description: 'Energy-saving 9W LED bulb with 6500K cool white light. 3-year warranty, saves up to 85% energy.',
    brand: 'Philips', tags: ['Energy Saving'],
  },

  // Electronics
  {
    id: 24, category: 'electronics', name: 'USB-C Charging Cable (1 m)',
    price: 199, originalPrice: 299, rating: 4.3, reviews: 512, inStock: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    description: 'Durable braided nylon USB-C cable supporting 3A fast charging and 480Mbps data transfer.',
    brand: 'Anker', tags: ['Fast Charging'],
  },
  {
    id: 25, category: 'electronics', name: 'Earphones with Mic',
    price: 349, originalPrice: 499, rating: 4.0, reviews: 389, inStock: true,
    image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
    description: 'Wired in-ear earphones with enhanced bass and built-in microphone. Compatible with all devices.',
    brand: 'boAt', tags: ['Bass+'],
  },
  {
    id: 26, category: 'electronics', name: 'Power Bank 10000 mAh',
    price: 899, originalPrice: 1299, rating: 4.5, reviews: 231, inStock: false,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',
    description: 'Slim 10000 mAh power bank with dual USB output and fast charging support. LED indicator included.',
    brand: 'Mi', tags: ['Fast Charging', 'Slim'],
  },
];

export const REVIEWS = {
  1:  [{ id: 1, user: 'Ramesh K.',   rating: 5, date: '2024-05-10', comment: 'Best basmati rice I\'ve ever had. Grains are long and the aroma is amazing!' },
       { id: 2, user: 'Sunita P.',   rating: 4, date: '2024-04-22', comment: 'Good quality but slightly expensive. Will still buy again.' }],
  6:  [{ id: 3, user: 'Deepak M.',   rating: 5, date: '2024-05-18', comment: 'Fresh milk, delivered on time. My family\'s favourite.' },
       { id: 4, user: 'Kavitha R.',  rating: 5, date: '2024-05-01', comment: 'Excellent quality and consistent supply. Highly recommended.' }],
  10: [{ id: 5, user: 'Mohan L.',    rating: 4, date: '2024-06-02', comment: 'Perfectly crispy and spicy. Great with chai!' },
       { id: 6, user: 'Preethi S.',  rating: 5, date: '2024-05-25', comment: 'Kids love it. Good value for the price.' }],
  14: [{ id: 7, user: 'Anjali T.',   rating: 5, date: '2024-06-01', comment: 'The masala blend is perfect. Makes exactly the kind of chai I love.' },
       { id: 8, user: 'Vikram S.',   rating: 5, date: '2024-05-12', comment: 'Best tea I\'ve had. Will keep ordering.' }],
  24: [{ id: 9, user: 'Rohit B.',    rating: 4, date: '2024-05-20', comment: 'Cable works well and charges fast. Seems durable.' },
       { id: 10, user: 'Sneha D.',   rating: 5, date: '2024-04-30', comment: 'Great quality cable at this price. Definitely worth buying.' }],
};

export const ORDERS = [
  {
    id: 'LM20240601', date: '2024-06-01', status: 'Delivered',
    items: [{ name: 'Basmati Rice (5 kg)', qty: 2, price: 349 }, { name: 'Toor Dal (1 kg)', qty: 1, price: 145 }],
    total: 843, address: '12, MG Road, Bengaluru',
    timeline: [
      { step: 'Order Placed',    done: true,  date: '01 Jun, 10:30 AM' },
      { step: 'Payment Confirmed', done: true, date: '01 Jun, 10:31 AM' },
      { step: 'Packed',          done: true,  date: '01 Jun, 01:00 PM' },
      { step: 'Out for Delivery',done: true,  date: '01 Jun, 04:00 PM' },
      { step: 'Delivered',       done: true,  date: '01 Jun, 06:20 PM' },
    ],
  },
];
