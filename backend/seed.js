/**
 * seed.js — Populates the database with realistic services, a demo admin user,
 *           and demo professional users so the app works out-of-the-box.
 *
 * Run:  node seed.js
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Service from './models/Service.js'
import User    from './models/User.js'

dotenv.config()

const CITIES = ['ahmedabad','surat','vadodara','rajkot','gandhinagar','mumbai','pune','bengaluru','delhi','hyderabad']

// ── Services ──────────────────────────────────────────────────────────────────
const SERVICES = [

  // ── CLEANING ─────────────────────────────────────────────────────────────
  {
    title: 'Full Home Deep Clean',
    slug:  'full-home-deep-clean',
    category: 'cleaning',
    description: 'Complete home deep-cleaning by trained professionals. Covers kitchen, bathrooms, living areas, and bedrooms. We bring all eco-friendly cleaning supplies.',
    icon: '🧹', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    duration: '4-6 hours', tag: 'Bestseller', rating: 4.80, totalReviews: 5500,
    includes: ['Kitchen scrubbing & de-greasing', 'Bathroom disinfection', 'Floor mopping', 'Dusting all surfaces', 'Window sill cleaning', 'Garbage removal'],
    excludes: ['Sofa/upholstery cleaning', 'Exterior windows', 'Pest control'],
    pricing: [
      { name: '1 BHK', price: 699,  description: 'Up to 500 sq ft' },
      { name: '2 BHK', price: 993,  description: '500–900 sq ft'   },
      { name: '3 BHK', price: 1299, description: '900–1300 sq ft'  },
      { name: '4 BHK', price: 1699, description: '1300+ sq ft'     },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Bathroom Deep Clean',
    slug:  'bathroom-deep-clean',
    category: 'cleaning',
    description: 'Intensive bathroom cleaning covering tiles, grout, fixtures, and drainage. Leaves your bathroom sparkling and disinfected.',
    icon: '🚿', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
    duration: '1.5-2.5 hours', tag: 'Popular', rating: 4.78, totalReviews: 2400,
    includes: ['Tile scrubbing & grout cleaning', 'WC disinfection', 'Basin & mirror polish', 'Floor mopping', 'Exhaust fan cleaning'],
    excludes: ['Plumbing repairs', 'Waterproofing'],
    pricing: [
      { name: '1 Bathroom', price: 299, description: 'Single bathroom' },
      { name: '2 Bathrooms', price: 499, description: 'Two bathrooms'  },
      { name: '3 Bathrooms', price: 699, description: 'Three bathrooms' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Kitchen Deep Clean',
    slug:  'kitchen-deep-clean',
    category: 'cleaning',
    description: 'Professional kitchen deep-cleaning. Removes grease, grime, and bacteria from every surface. Includes chimney external cleaning.',
    icon: '🍳', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    duration: '2-3 hours', tag: null, rating: 4.75, totalReviews: 1800,
    includes: ['Countertop de-greasing', 'Cabinet external cleaning', 'Chimney exterior', 'Sink scrubbing', 'Floor mopping', 'Stove top cleaning'],
    excludes: ['Inside cabinet cleaning', 'Chimney internal filter cleaning'],
    pricing: [
      { name: 'Small Kitchen',  price: 499, description: 'Up to 80 sq ft'  },
      { name: 'Medium Kitchen', price: 699, description: '80–150 sq ft'    },
      { name: 'Large Kitchen',  price: 999, description: '150+ sq ft'      },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Sofa & Upholstery Cleaning',
    slug:  'sofa-upholstery-cleaning',
    category: 'cleaning',
    description: 'Steam-based deep cleaning for sofas, chairs, and other upholstery. Removes dust mites, stains, and odours.',
    icon: '🛋️', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    duration: '1.5-3 hours', tag: 'Trending', rating: 4.82, totalReviews: 980,
    includes: ['Steam cleaning', 'Stain treatment', 'Deodorising', 'Fabric conditioning'],
    excludes: ['Leather conditioning (separate service)', 'Structural repairs'],
    pricing: [
      { name: '2-Seater Sofa', price: 499,  description: ''  },
      { name: '3-Seater Sofa', price: 699,  description: ''  },
      { name: 'L-Shape Sofa',  price: 999,  description: ''  },
      { name: 'Full Set (sofa + chairs)', price: 1399, description: '' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Mattress Cleaning',
    slug:  'mattress-cleaning',
    category: 'cleaning',
    description: 'UV-based mattress sanitisation that eliminates dust mites, bacteria, and allergens. Safe for children and pets.',
    icon: '🛏️', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    duration: '45-90 minutes', tag: null, rating: 4.84, totalReviews: 760,
    includes: ['UV treatment', 'Vacuum cleaning', 'Deodorising spray', 'Stain pre-treatment'],
    excludes: ['Mattress pick-up/drop-off'],
    pricing: [
      { name: 'Single Mattress', price: 299, description: '' },
      { name: 'Double Mattress', price: 399, description: '' },
      { name: 'King Size',       price: 499, description: '' },
    ],
    availableCities: CITIES,
  },

  // ── BEAUTY / SALON ────────────────────────────────────────────────────────
  {
    title: "Women's Facial & Cleanup",
    slug:  'womens-facial-cleanup',
    category: 'beauty',
    description: "Professional facial and skin cleanup at home. Includes cleansing, exfoliation, massage, and a face pack suited to your skin type.",
    icon: '💆‍♀️', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
    duration: '60-90 minutes', tag: 'Bestseller', rating: 4.87, totalReviews: 3200,
    includes: ['Deep cleansing', 'Exfoliation', 'Face massage', 'Face pack', 'Toning & moisturising'],
    excludes: ['Waxing', 'Threading'],
    pricing: [
      { name: 'Classic Cleanup',   price: 349,  description: 'For normal/oily skin' },
      { name: 'Gold Facial',       price: 599,  description: 'Brightening & anti-aging' },
      { name: 'Diamond Facial',    price: 899,  description: 'Premium deep-treatment' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Haircut & Styling for Men',
    slug:  'haircut-styling-men',
    category: 'beauty',
    description: 'Expert haircut, wash, and blow-dry by professional stylists. Includes scalp massage and beard trim.',
    icon: '💈', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    duration: '30-45 minutes', tag: 'Popular', rating: 4.85, totalReviews: 4100,
    includes: ['Hair wash', 'Haircut', 'Blow dry', 'Scalp massage', 'Basic beard trim'],
    excludes: ['Hair colouring', 'Beard shaping (separate)'],
    pricing: [
      { name: 'Regular Haircut',  price: 199, description: ''   },
      { name: 'Haircut + Shave',  price: 299, description: ''   },
      { name: 'Hair + Beard Styling', price: 399, description: '' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Full Body Waxing (Women)',
    slug:  'full-body-waxing-women',
    category: 'beauty',
    description: 'Full body waxing using Rica / chocolate wax. Hygienic, disposable strips. Experienced female professionals only.',
    icon: '✨', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800',
    duration: '90-120 minutes', tag: 'Trending', rating: 4.79, totalReviews: 2100,
    includes: ['Full arms', 'Full legs', 'Underarms', 'Bikini line (optional)'],
    excludes: ['Facial waxing'],
    pricing: [
      { name: 'Full Arms + Legs',      price: 699,  description: '' },
      { name: 'Full Body (Standard)',  price: 999,  description: '' },
      { name: 'Full Body (Rica Wax)',  price: 1299, description: 'Sensitive skin formula' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Manicure & Pedicure Combo',
    slug:  'manicure-pedicure-combo',
    category: 'beauty',
    description: 'Spa-grade manicure and pedicure at home. Softens skin, shapes nails, and leaves hands and feet pampered.',
    icon: '💅', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',
    duration: '60-90 minutes', tag: null, rating: 4.80, totalReviews: 1400,
    includes: ['Nail shaping', 'Cuticle care', 'Scrub & massage', 'Foot soak', 'Nail polish'],
    excludes: ['Gel polish (₹150 extra)', 'Nail art'],
    pricing: [
      { name: 'Basic Mani-Pedi',    price: 499,  description: '' },
      { name: 'Classic Mani-Pedi',  price: 699,  description: '' },
      { name: 'Spa Mani-Pedi',      price: 999,  description: 'With paraffin & mask' },
    ],
    availableCities: CITIES,
  },

  // ── AC REPAIR ────────────────────────────────────────────────────────────
  {
    title: 'AC Service & Gas Refill',
    slug:  'ac-service-gas-refill',
    category: 'ac-repair',
    description: 'Complete AC servicing including deep coil cleaning, filter wash, gas pressure check, and top-up if required. Improves cooling efficiency by up to 30%.',
    icon: '❄️', image: 'https://images.unsplash.com/photo-1631545806609-42d8e8b96a6c?w=800',
    duration: '60-90 minutes', tag: 'Bestseller', rating: 4.76, totalReviews: 2600,
    includes: ['Coil cleaning', 'Filter washing', 'Gas pressure check', 'Drain cleaning', 'Performance test'],
    excludes: ['Gas refill (charged extra if needed)', 'PCB/part replacement'],
    pricing: [
      { name: '1 AC (1.0 Ton)',  price: 599,  description: '' },
      { name: '1 AC (1.5 Ton)',  price: 699,  description: '' },
      { name: '2 ACs',           price: 1099, description: 'Any tonnage' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'AC Installation',
    slug:  'ac-installation',
    category: 'ac-repair',
    description: 'Professional AC installation by certified technicians. Includes indoor/outdoor unit mounting, pipe laying, and electrical connection.',
    icon: '🔩', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
    duration: '2-4 hours', tag: null, rating: 4.73, totalReviews: 890,
    includes: ['Indoor unit mounting', 'Outdoor unit placement', 'Copper pipe fitting (up to 3m)', 'Electrical wiring', 'Trial run'],
    excludes: ['Pipe extension beyond 3m (₹250/m)', 'Stabiliser installation'],
    pricing: [
      { name: 'Standard Installation', price: 1299, description: 'Up to 3m pipe run' },
      { name: 'Complex Installation',  price: 1799, description: 'Ceiling/concealed piping' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Washing Machine Repair',
    slug:  'washing-machine-repair',
    category: 'ac-repair',
    description: 'On-site washing machine diagnosis and repair. Covers all brands — Samsung, LG, Whirlpool, IFB, Bosch.',
    icon: '🫧', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800',
    duration: '1-2 hours', tag: 'Popular', rating: 4.77, totalReviews: 1100,
    includes: ['Diagnosis', 'Repair labour', '30-day service warranty'],
    excludes: ['Spare parts (charged at actuals)', 'Major motor/PCB replacement'],
    pricing: [
      { name: 'Inspection + Minor Repair', price: 299, description: '' },
      { name: 'Standard Repair',           price: 499, description: '' },
      { name: 'Major Repair',              price: 799, description: 'Incl. one spare part' },
    ],
    availableCities: CITIES,
  },

  // ── WELLNESS / MASSAGE ────────────────────────────────────────────────────
  {
    title: 'Full Body Massage',
    slug:  'full-body-massage',
    category: 'wellness',
    description: 'Relaxing full-body massage by trained therapists. Choose from Swedish, deep-tissue, or Ayurvedic massage. We bring premium oils.',
    icon: '💆', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    duration: '60-90 minutes', tag: 'Bestseller', rating: 4.85, totalReviews: 1700,
    includes: ['Back, shoulder & neck massage', 'Arm & leg massage', 'Aromatherapy oils', 'Clean towels'],
    excludes: ['Head massage (₹199 extra)'],
    pricing: [
      { name: 'Swedish (60 min)',       price: 799,  description: '' },
      { name: 'Deep Tissue (60 min)',   price: 999,  description: '' },
      { name: 'Ayurvedic (90 min)',     price: 1299, description: '' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Head & Scalp Massage',
    slug:  'head-scalp-massage',
    category: 'wellness',
    description: 'Therapeutic head, neck, and shoulder massage. Relieves tension headaches and promotes relaxation. Uses natural coconut or almond oil.',
    icon: '🧖', image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800',
    duration: '30-45 minutes', tag: null, rating: 4.81, totalReviews: 640,
    includes: ['Head & scalp massage', 'Neck & shoulder massage', 'Aromatherapy oil'],
    excludes: [],
    pricing: [
      { name: '30 Minutes', price: 299, description: '' },
      { name: '45 Minutes', price: 449, description: '' },
    ],
    availableCities: CITIES,
  },

  // ── ELECTRICAL ────────────────────────────────────────────────────────────
  {
    title: 'Electrician Visit',
    slug:  'electrician-visit',
    category: 'electrical',
    description: 'Certified electrician for all minor and major home electrical repairs. Switch/socket replacement, fan installation, light fitting, and more.',
    icon: '⚡', image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800',
    duration: '1-2 hours', tag: 'Popular', rating: 4.77, totalReviews: 3800,
    includes: ['Inspection', 'Minor repairs', '30-day warranty on labour'],
    excludes: ['Spare parts (charged at actuals)', 'Main line rewiring'],
    pricing: [
      { name: 'Basic Visit (up to 2 tasks)', price: 149, description: '' },
      { name: 'Standard (up to 5 tasks)',    price: 299, description: '' },
      { name: 'Comprehensive',               price: 499, description: 'Unlimited tasks in one visit' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Fan Installation & Repair',
    slug:  'fan-installation-repair',
    category: 'electrical',
    description: 'Ceiling fan installation, replacement, and repair. Includes balancing, capacitor replacement, and speed regulator fitting.',
    icon: '🌀', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    duration: '30-60 minutes', tag: null, rating: 4.78, totalReviews: 1200,
    includes: ['Fan mounting', 'Electrical connection', 'Trial run', 'Old fan removal (if required)'],
    excludes: ['Fan purchase', 'False ceiling work'],
    pricing: [
      { name: 'Fan Installation', price: 249, description: 'New fan fitting' },
      { name: 'Fan Repair',       price: 199, description: 'Repair existing fan' },
      { name: 'Fan Replacement',  price: 349, description: 'Remove old + fit new' },
    ],
    availableCities: CITIES,
  },

  // ── PLUMBING ──────────────────────────────────────────────────────────────
  {
    title: 'Plumber Visit',
    slug:  'plumber-visit',
    category: 'plumbing',
    description: 'Licensed plumber for leakage, tap/faucet repairs, pipe fitting, and drainage issues. Available same-day.',
    icon: '🔧', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
    duration: '1-2 hours', tag: 'Popular', rating: 4.74, totalReviews: 2900,
    includes: ['Inspection', 'Minor repairs & tightening', '7-day warranty on labour'],
    excludes: ['Spare parts', 'Major pipeline work'],
    pricing: [
      { name: 'Basic Visit',    price: 149, description: '' },
      { name: 'Standard',       price: 299, description: 'Up to 3 tasks' },
      { name: 'Comprehensive',  price: 499, description: 'Unlimited tasks' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Tap & Faucet Repair',
    slug:  'tap-faucet-repair',
    category: 'plumbing',
    description: 'Fix dripping taps, replace washers, install new faucets. Quick same-day fix for leaking taps in kitchen and bathroom.',
    icon: '🚰', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800',
    duration: '30-60 minutes', tag: null, rating: 4.72, totalReviews: 870,
    includes: ['Diagnosis', 'Washer/O-ring replacement', 'Tightening & sealing'],
    excludes: ['New faucet purchase'],
    pricing: [
      { name: '1 Tap',   price: 199, description: '' },
      { name: '2 Taps',  price: 349, description: '' },
      { name: '3+ Taps', price: 499, description: '' },
    ],
    availableCities: CITIES,
  },

  // ── PAINTING ──────────────────────────────────────────────────────────────
  {
    title: 'Full Home Painting',
    slug:  'full-home-painting',
    category: 'painting',
    description: 'Interior wall painting by professional painters. Includes wall preparation, primer coat, 2 finish coats. Choose from 1000+ Asian Paints / Berger shades.',
    icon: '🖌️', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
    duration: '2-5 days', tag: 'Popular', rating: 4.80, totalReviews: 740,
    includes: ['Wall putty', 'Primer coat', '2 finish coats', 'Furniture protection sheet', 'Cleaning up after'],
    excludes: ['Exterior painting', 'Waterproofing', 'False ceiling painting'],
    pricing: [
      { name: '1 BHK',  price: 7999,  description: 'Up to 400 sq ft walls' },
      { name: '2 BHK',  price: 12999, description: '400–700 sq ft walls'   },
      { name: '3 BHK',  price: 18999, description: '700–1100 sq ft walls'  },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Single Room Painting',
    slug:  'single-room-painting',
    category: 'painting',
    description: 'Get one room painted in a day. Perfect for bedroom refresh or accent wall. Includes wall prep and 2 coats.',
    icon: '🎨', image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800',
    duration: '6-8 hours', tag: null, rating: 4.77, totalReviews: 510,
    includes: ['Putty & primer', '2 finish coats', 'Masking & protection'],
    excludes: ['Ceiling painting (₹1000 extra)'],
    pricing: [
      { name: 'Small Room (up to 120 sq ft)',  price: 2499, description: '' },
      { name: 'Medium Room (120–180 sq ft)',   price: 3499, description: '' },
      { name: 'Large Room (180+ sq ft)',        price: 4499, description: '' },
    ],
    availableCities: CITIES,
  },

  // ── PEST CONTROL ──────────────────────────────────────────────────────────
  {
    title: 'General Pest Control',
    slug:  'general-pest-control',
    category: 'pest-control',
    description: 'Comprehensive pest control treatment for cockroaches, ants, spiders, and common household pests. Safe for children and pets (after 4-hour drying time).',
    icon: '🪲', image: 'https://images.unsplash.com/photo-1632779977800-74de5e58b64f?w=800',
    duration: '1-2 hours', tag: 'Popular', rating: 4.71, totalReviews: 1600,
    includes: ['Cockroach gel treatment', 'Ant spray', 'Kitchen & bathroom treatment', '30-day re-treatment guarantee'],
    excludes: ['Rodent control', 'Bed bug treatment'],
    pricing: [
      { name: '1 BHK',  price: 699,  description: '' },
      { name: '2 BHK',  price: 999,  description: '' },
      { name: '3 BHK',  price: 1299, description: '' },
      { name: '4+ BHK', price: 1699, description: '' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Termite Treatment',
    slug:  'termite-treatment',
    category: 'pest-control',
    description: 'Chemical-based anti-termite treatment. Drill-fill-seal method for furniture and walls. 1-year warranty against re-infestation.',
    icon: '🐛', image: 'https://images.unsplash.com/photo-1593351415075-3bac9f45c877?w=800',
    duration: '2-4 hours', tag: null, rating: 4.68, totalReviews: 420,
    includes: ['Drill & fill treatment', 'Chemical barrier spray', '1-year warranty'],
    excludes: ['Furniture polishing after treatment'],
    pricing: [
      { name: '1 BHK',  price: 1499, description: '' },
      { name: '2 BHK',  price: 2199, description: '' },
      { name: '3 BHK',  price: 2999, description: '' },
    ],
    availableCities: CITIES,
  },

  // ── CARPENTRY ─────────────────────────────────────────────────────────────
  {
    title: 'Furniture Assembly',
    slug:  'furniture-assembly',
    category: 'carpentry',
    description: 'Professional assembly of flat-pack furniture — IKEA, Pepperfry, Amazon Basics, etc. We bring all required tools.',
    icon: '🪑', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    duration: '1-3 hours', tag: 'Trending', rating: 4.82, totalReviews: 930,
    includes: ['Tool handling', 'Assembly as per manual', 'Waste packaging removal'],
    excludes: ['Wall mounting (separate service)', 'On-site modifications'],
    pricing: [
      { name: 'Small Item (chair/shelf)',  price: 299, description: '' },
      { name: 'Medium (bed/wardrobe)',     price: 599, description: '' },
      { name: 'Large / Multiple Items',   price: 999, description: 'Up to 3 items' },
    ],
    availableCities: CITIES,
  },
  {
    title: 'Drill & Hang',
    slug:  'drill-and-hang',
    category: 'carpentry',
    description: 'Wall drilling and hanging service for pictures, curtain rods, shelves, TVs, and mirrors. Proper anchors used for all wall types.',
    icon: '🔨', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800',
    duration: '30-90 minutes', tag: 'Popular', rating: 4.84, totalReviews: 1100,
    includes: ['Wall type assessment', 'Drill & anchor', 'Item hanging & levelling'],
    excludes: ['Item purchase', 'Large TV mounting (separate)'],
    pricing: [
      { name: '1-2 Items', price: 129, description: '' },
      { name: '3-5 Items', price: 249, description: '' },
      { name: '6+ Items',  price: 399, description: '' },
    ],
    availableCities: CITIES,
  },
]

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected')

    // ── Services ──────────────────────────────────────────────────────────
    const existingCount = await Service.countDocuments()
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing services. Dropping and re-seeding…`)
      await Service.deleteMany({})
    }

    const created = await Service.insertMany(SERVICES)
    console.log(`✅ Seeded ${created.length} services across ${[...new Set(SERVICES.map(s => s.category))].length} categories`)

    // ── Summary ───────────────────────────────────────────────────────────
    const byCat = SERVICES.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1
      return acc
    }, {})
    console.log('\n📦 Services by category:')
    Object.entries(byCat).forEach(([cat, count]) => console.log(`   ${cat.padEnd(14)} ${count} services`))

    console.log('\n🎉 Seed complete! Open http://localhost:5173 to see the app.\n')
  } catch (err) {
    console.error('❌ Seed error:', err.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

seed()
