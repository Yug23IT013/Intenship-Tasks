const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const Review  = require('./models/Review');
const User    = require('./models/User');
const bcrypt  = require('bcryptjs');

const PRODUCTS = [
  { category:'groceries',   name:'Basmati Rice (5 kg)',          brand:'India Gate',      price:349, originalPrice:420, inStock:true,  tags:['Organic','Premium'],     image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', description:'Premium aged basmati rice with long, slender grains and a distinctive aroma. Perfect for biryanis and pulaos.' },
  { category:'groceries',   name:'Toor Dal (1 kg)',               brand:'Fortune',         price:145, originalPrice:160, inStock:true,  tags:['High Protein'],          image:'https://images.unsplash.com/photo-1585996875082-c8c3ae03eb35?w=400&h=400&fit=crop', description:'High-quality split pigeon peas sourced from Maharashtra. Rich in protein and fibre.' },
  { category:'groceries',   name:'Refined Sunflower Oil (1 L)',   brand:'Saffola',         price:132, originalPrice:150, inStock:true,  tags:['Heart Healthy'],         image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', description:'Light and healthy refined sunflower oil, ideal for everyday cooking. Low cholesterol.' },
  { category:'groceries',   name:'Whole Wheat Atta (10 kg)',      brand:'Aashirvaad',      price:340, originalPrice:380, inStock:true,  tags:['Whole Grain','No Maida'],image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop', description:'Stone-ground whole wheat flour packed with nutrients. Makes soft rotis and healthy bread.' },
  { category:'groceries',   name:'Sugar (1 kg)',                  brand:'Local Brand',     price:48,  originalPrice:55,  inStock:true,  tags:[],                        image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', description:'Pure refined white sugar. Essential kitchen staple for cooking, baking and beverages.' },
  { category:'dairy',       name:'Full Cream Milk (1 L)',         brand:'Amul',            price:68,  originalPrice:68,  inStock:true,  tags:['Fresh','Daily'],         image:'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', description:'Fresh full cream milk with 6% fat. Homogenised and pasteurised for safety.' },
  { category:'dairy',       name:'Paneer (200 g)',                brand:'Amul',            price:89,  originalPrice:95,  inStock:true,  tags:['Fresh'],                 image:'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop', description:'Soft and fresh cottage cheese made from pure cow milk. Perfect for curries.' },
  { category:'dairy',       name:'Dahi / Curd (400 g)',           brand:'Mother Dairy',    price:45,  originalPrice:50,  inStock:true,  tags:['Probiotic'],             image:'https://images.unsplash.com/photo-1571212515416-fca988083c30?w=400&h=400&fit=crop', description:'Thick, creamy curd made from fresh cow milk. Rich in probiotics for gut health.' },
  { category:'dairy',       name:'Butter (100 g)',                brand:'Amul',            price:56,  originalPrice:60,  inStock:true,  tags:[],                        image:'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop', description:'Creamy salted table butter made from fresh cream. Great for bread and cooking.' },
  { category:'snacks',      name:'Aloo Bhujia (400 g)',           brand:"Haldiram's",      price:79,  originalPrice:90,  inStock:true,  tags:['Bestseller'],            image:'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop', description:'Crispy, spicy potato sev snack — a classic Indian namkeen loved by all age groups.' },
  { category:'snacks',      name:'Cream Biscuits (300 g)',        brand:'Britannia',       price:40,  originalPrice:45,  inStock:true,  tags:[],                        image:'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop', description:'Light vanilla cream-filled biscuits. Perfect for tea time and kids\' snack boxes.' },
  { category:'snacks',      name:'Mixed Nuts (250 g)',            brand:'Nutraj',          price:299, originalPrice:349, inStock:true,  tags:['Healthy','High Protein'],image:'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop', description:'Premium roasted mixed nuts — almonds, cashews, walnuts and pistachios.' },
  { category:'snacks',      name:'Masala Chips (80 g)',           brand:'Lays',            price:20,  originalPrice:20,  inStock:true,  tags:[],                        image:'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop', description:'Crispy potato chips with a tangy masala coating. A go-to snack for movie time.' },
  { category:'beverages',   name:'Masala Chai Blend (250 g)',     brand:'Wagh Bakri',      price:120, originalPrice:140, inStock:true,  tags:['Bestseller'],            image:'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop', description:'Aromatic blend of Assam CTC tea with ginger, cardamom and cinnamon.' },
  { category:'beverages',   name:'Instant Coffee (200 g)',        brand:'Nescafé',         price:260, originalPrice:300, inStock:true,  tags:[],                        image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop', description:'Rich dark-roasted instant coffee with a bold flavour. Ready in seconds.' },
  { category:'beverages',   name:'Mango Juice (1 L)',             brand:'Real',            price:85,  originalPrice:95,  inStock:false, tags:['No Preservatives'],      image:'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&h=400&fit=crop', description:'Thick and pulpy Alphonso mango juice with no added artificial colours.' },
  { category:'beverages',   name:'Mineral Water (5 L)',           brand:'Bisleri',         price:55,  originalPrice:60,  inStock:true,  tags:[],                        image:'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop', description:'Pure natural mineral water with essential minerals.' },
  { category:'personal',    name:'Neem Soap (100 g × 4)',         brand:'Dettol',          price:99,  originalPrice:120, inStock:true,  tags:['Antibacterial'],         image:'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&h=400&fit=crop', description:'Antibacterial neem soap with natural extracts. Fights germs and keeps skin fresh.' },
  { category:'personal',    name:'Shampoo (340 ml)',              brand:'Head & Shoulders',price:179, originalPrice:199, inStock:true,  tags:['Anti-Dandruff'],         image:'https://images.unsplash.com/photo-1585232351009-aa87a1b73a60?w=400&h=400&fit=crop', description:'Anti-dandruff shampoo with Zinc Pyrithione. Removes dandruff in 2 washes.' },
  { category:'personal',    name:'Toothpaste (150 g)',            brand:'Colgate',         price:89,  originalPrice:100, inStock:true,  tags:['Cavity Protection'],     image:'https://images.unsplash.com/photo-1559591937-abc0c0e5f7c9?w=400&h=400&fit=crop', description:'Complete cavity protection toothpaste with fluoride.' },
  { category:'household',   name:'Detergent Powder (2 kg)',       brand:'Ariel',           price:189, originalPrice:220, inStock:true,  tags:['Stain Removal'],         image:'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&h=400&fit=crop', description:'Powerful detergent powder that removes tough stains in a single wash.' },
  { category:'household',   name:'Floor Cleaner (2 L)',           brand:'Phenyl',          price:145, originalPrice:160, inStock:true,  tags:['Disinfectant'],          image:'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop', description:'Pine-scented floor cleaner that disinfects and leaves floors sparkling clean.' },
  { category:'household',   name:'LED Bulb 9W (Pack of 2)',       brand:'Philips',         price:149, originalPrice:180, inStock:true,  tags:['Energy Saving'],         image:'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=400&fit=crop', description:'Energy-saving 9W LED bulb. 3-year warranty, saves up to 85% energy.' },
  { category:'electronics', name:'USB-C Charging Cable (1 m)',    brand:'Anker',           price:199, originalPrice:299, inStock:true,  tags:['Fast Charging'],         image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', description:'Durable braided nylon USB-C cable supporting 3A fast charging.' },
  { category:'electronics', name:'Earphones with Mic',            brand:'boAt',            price:349, originalPrice:499, inStock:true,  tags:['Bass+'],                 image:'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop', description:'Wired in-ear earphones with enhanced bass and built-in microphone.' },
  { category:'electronics', name:'Power Bank 10000 mAh',          brand:'Mi',              price:899, originalPrice:1299,inStock:false, tags:['Fast Charging','Slim'],  image:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop', description:'Slim 10000 mAh power bank with dual USB output and fast charging support.' },
];

const SEED_REVIEWS = [
  { productIndex: 0,  name:'Ramesh K.',  rating:5, comment:'Best basmati rice! Grains are long and the aroma is amazing!' },
  { productIndex: 0,  name:'Sunita P.',  rating:4, comment:'Good quality but slightly expensive. Will still buy again.' },
  { productIndex: 5,  name:'Deepak M.',  rating:5, comment:'Fresh milk delivered on time. My family\'s favourite.' },
  { productIndex: 5,  name:'Kavitha R.', rating:5, comment:'Excellent quality and consistent supply. Highly recommended.' },
  { productIndex: 9,  name:'Mohan L.',   rating:4, comment:'Perfectly crispy and spicy. Great with chai!' },
  { productIndex: 9,  name:'Preethi S.', rating:5, comment:'Kids love it. Good value for the price.' },
  { productIndex: 13, name:'Anjali T.',  rating:5, comment:'The masala blend is perfect. Makes exactly the chai I love.' },
  { productIndex: 13, name:'Vikram S.',  rating:5, comment:'Best tea I\'ve had. Will keep ordering.' },
  { productIndex: 23, name:'Rohit B.',   rating:4, comment:'Cable works well and charges fast. Seems durable.' },
  { productIndex: 23, name:'Sneha D.',   rating:5, comment:'Great quality cable at this price. Definitely worth it.' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log('🗑️  Cleared products and reviews');

    // Create demo user if not exists
    let demoUser = await User.findOne({ email: 'demo@localmart.in' });
    if (!demoUser) {
      const hashed = await bcrypt.hash('demo1234', 12);
      demoUser = await User.create({ name: 'Demo User', email: 'demo@localmart.in', password: hashed });
      console.log('👤 Created demo user: demo@localmart.in / demo1234');
    }

    // Insert products
    const inserted = await Product.insertMany(PRODUCTS);
    console.log(`📦 Seeded ${inserted.length} products`);

    // Insert reviews
    for (const r of SEED_REVIEWS) {
      const prod = inserted[r.productIndex];
      await Review.create({ product: prod._id, user: demoUser._id, name: r.name, rating: r.rating, comment: r.comment });
    }
    console.log(`⭐ Seeded ${SEED_REVIEWS.length} reviews`);

    // Summary
    console.log('\n📊 Category breakdown:');
    const cats = {};
    PRODUCTS.forEach(p => { cats[p.category] = (cats[p.category]||0)+1; });
    Object.entries(cats).forEach(([c,n]) => console.log(`   ${c.padEnd(14)} ${n}`));

    console.log('\n🔑 Demo credentials:');
    console.log('   Email:    demo@localmart.in');
    console.log('   Password: demo1234\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    process.exit(0);
  }
};

seed();
