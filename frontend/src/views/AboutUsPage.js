'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  Sprout,
  PhoneCall,
  Truck,
  CheckCircle2,
  Leaf,
  Users,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  Target,
  Eye,
  Microscope,
  Warehouse,
  MapPin,
  Clock,
  HeartHandshake,
  Check,
  Star,
  ExternalLink,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { buttonTap, EASE } from '../utils/motion';

const stats = [
  { value: '250,000+', label: 'Kisan Families Empowered', subtext: 'Across Punjab & Uttar Pradesh' },
  { value: '98.4%', label: 'Certified Germination Rate', subtext: 'Tested in Seed Act accredited labs' },
  { value: '1,200+', label: 'FPOs & Cooperatives', subtext: 'Bulk input procurement partners' },
  { value: '₹4.8 Cr+', label: 'Direct Input Cost Savings', subtext: 'Eliminating middleman markups' },
];

const pillars = [
  {
    icon: Sprout,
    title: 'Breeder Direct Contracts',
    desc: 'Direct agreements with ICAR institutions, National Seeds Corporation (NSC), and certified hybrid developers. Zero unverified open-market seeds.',
    badge: '100% Genuine',
    color: 'from-emerald-500/10 to-emerald-500/5',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Microscope,
    title: 'Dual Lab Batch Testing',
    desc: 'Every seed and fertilizer lot undergoes rigorous physical purity, moisture (<12%), and vigor tests under Seed Act 1966 & FCO 1985 guidelines.',
    badge: 'Dual Verified',
    color: 'from-amber-500/10 to-amber-500/5',
    iconColor: 'text-amber-600',
  },
  {
    icon: Warehouse,
    title: 'Cold Dark Store Hubs',
    desc: 'Stored at controlled temperatures (<18°C) and under 45% relative humidity to preserve living seed embryos and bio-fertilizer bacterial strains.',
    badge: 'Climate Controlled',
    color: 'from-blue-500/10 to-blue-500/5',
    iconColor: 'text-blue-600',
  },
  {
    icon: Truck,
    title: 'Direct Farm Dispatch',
    desc: 'Dedicated farm delivery vehicles dispatching orders within a 30 km radius directly to village farm gates, tractor roads, and Panchayat centers.',
    badge: 'Doorstep Delivery',
    color: 'from-purple-500/10 to-purple-500/5',
    iconColor: 'text-purple-600',
  },
];

const hubs = [
  {
    id: 'phagwara',
    name: 'AgriMart Kisan Hub #01 (Punjab)',
    location: 'Lovely Professional University Agro Corridor, Phagwara',
    district: 'Kapurthala - 144411',
    coverage: 'Phagwara, Jalandhar, Hoshiarpur, Ludhiana perimeter (&le; 30 km)',
    specialties: 'Basmati Paddy (1121, 1509), High-Yield Wheat (HD-3086), Water Soluble NPK, Bio-Pesticides',
    capacity: '25,000 Quintals Storage with cold-chain seed vault',
    status: 'Operational & Dispatching Daily',
  },
  {
    id: 'etawah',
    name: 'AgriMart Kisan Hub #02 (Uttar Pradesh)',
    location: 'Civil Lines, Near Agriculture Mandi, Etawah',
    district: 'Etawah - 206001',
    coverage: 'Etawah, Bharthana, Jaswantnagar, Saifai (&le; 30 km)',
    specialties: 'Mustard Seeds, Micronutrient Foliar Sprays, Bio-Compost, Potato Crop Protection',
    capacity: '18,000 Quintals Storage with automated packaging',
    status: 'Operational & Dispatching Daily',
  },
];

const testimonials = [
  {
    name: 'Sardar Gurpreet Singh',
    role: 'Basmati Paddy & Wheat Grower',
    village: 'Chachoki, Phagwara, Punjab',
    quote: 'Last season, local shopkeepers sold adulterated hybrid seeds that failed to sprout. With AgriMart, our Basmati 1121 crop stand was 99% uniform. The farm delivery vehicle dropped all 12 bags straight at my tubewell.',
    rating: 5,
    crop: '18 Acres Paddy',
  },
  {
    name: 'Rameshwar Dayal Yadav',
    role: 'Mustard & Vegetable Progressive Farmer',
    village: 'Jaswantnagar, Etawah, UP',
    quote: 'AgriMart saved our cooperative ₹34,000 on bio-stimulants and foliar NPK sprays. Plus, their agronomist hotline helped us time our spray schedule before the winter rains.',
    rating: 5,
    crop: '14 Acres Mustard',
  },
  {
    name: 'Harjit Kaur',
    role: 'FPO Secretary & Organic Farmer',
    village: 'LPU Agro Rural Belt, Punjab',
    quote: 'Having certified vermicompost and neem oil with batch testing certificates gives our organic produce genuine credibility in the mandi. Direct transparent pricing without dealer commissions.',
    rating: 5,
    crop: '25 Acres Organic FPO',
  },
];

const certifications = [
  { title: 'Seed Act 1966 & Rules 1968', desc: 'Government certified germination stand and moisture limits' },
  { title: 'Fertilizer Control Order (FCO) 1985', desc: 'Compliant NPK nutrient ratios and purity benchmarks' },
  { title: 'Insecticides Act 1968', desc: 'Authorized biopesticides approved by Central Insecticides Board' },
  { title: 'NPOP Organic Standards', desc: 'Traceable organic manure, vermicompost & foliar extracts' },
  { title: 'ISO 9001:2015 Accredited', desc: 'International quality management in agricultural supply chain' },
];

export default function AboutUsPage() {
  const [activeHub, setActiveHub] = useState('phagwara');

  return (
    <div className="min-h-screen bg-[#FAF5EB] text-[#263449] flex flex-col selection:bg-[#FF9F43]/30">
      <Navbar />

      <main className="flex-1 w-full overflow-hidden">
        {/* HERO SECTION */}
        <section className="bg-gradient-to-b from-[#0B1B30] via-[#142B4A] to-[#0A223E] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FF9F43]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Mission Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE.out }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <Sprout className="w-4 h-4 text-[#FF9F43]" />
              Direct-to-Farm Agricultural Revolution
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE.out }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none mb-6 text-white"
            >
              Protecting India's Farmers From Counterfeits.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-[#FF9F43]">
                Pure Certified Inputs Direct to Farm.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE.out }}
              className="text-slate-300 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed mb-8"
            >
              AgriMart connects certified seed breeders, FCO-accredited fertilizer producers, and agricultural research institutes directly with farmers. Operating regional dark store hubs in Phagwara and Etawah, we eliminate intermediary markups and deliver verified farm inputs within hours.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: EASE.out }}
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FF9F43] hover:bg-[#e68e3c] text-[#0B1B30] font-extrabold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <span>Browse Certified Inputs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:18002474627"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/20 backdrop-blur-md transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Kisan Helpline: 1800-AGRI-MART</span>
              </a>
            </motion.div>
          </div>
        </section>

        {/* STATS & IMPACT ROW */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-md text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-2xl sm:text-4xl font-black text-[#0B1B30] tracking-tight">{s.value}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">{s.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{s.subtext}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* THE AGRIMART STORY / MISSION & VISION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Story Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#16A34A]">
                <Leaf className="w-4 h-4" />
                Our Origin & Agricultural Purpose
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-[#0B1B30] leading-tight">
                Born in the fertile soil of Punjab to solve the ₹22,000 Crore spurious input crisis.
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                In India, studies estimate that over <strong>30% of fertilizers and hybrid seeds</strong> distributed through unorganized rural dealers are substandard, diluted, or outright counterfeit. A single bag of unviable seed can destroy a farming family’s entire seasonal income.
              </p>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                AgriMart was established to build an airtight, transparent bridge between verified agricultural producers and the farmers who feed the nation. We operate temperature-controlled regional dark stores, conduct independent batch testing under Seed Act 1966 protocols, and dispatch directly to farm roads via dedicated logistics.
              </p>

              {/* Mission & Vision Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Our Mission
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    To make every acre in India sustainably productive by guaranteeing 100% authentic, scientifically tested seeds and fertilizers at transparent fair prices.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                    <Eye className="w-4 h-4 text-amber-600" />
                    Our Vision
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A digitally empowered, self-reliant Indian farming ecosystem with zero spurious inputs and seamless door-to-farm supply chain infrastructure.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Visual Image Card (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-4/5 sm:aspect-square lg:aspect-4/5">
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern agricultural crop inspection"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B30]/90 via-[#0B1B30]/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF9F43] uppercase tracking-wider mb-2">
                    <Award className="w-4 h-4" />
                    Farmer First Commitment
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold leading-snug">
                    Lab-verified germination stand and nutrient purity in every single pack.
                  </h3>
                  <p className="text-xs text-slate-300 mt-2">
                    Batch-inspected at Phagwara Kisan Hub & Etawah Regional Center.
                  </p>
                </div>
              </div>

              {/* Floating Certification Badge */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white rounded-2xl p-4 shadow-xl border border-stone-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Seed Act 1966 & FCO 1985</div>
                  <div className="text-[11px] text-slate-500">Government Quality Certified</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE PILLARS */}
        <section className="bg-white py-16 sm:py-24 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#16A34A] block mb-2">
                Traceability & Quality Promise
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0B1B30]">
                The Four Pillars of AgriMart
              </h2>
              <p className="text-slate-600 text-sm mt-3">
                How we protect farmers and ensure verified crop vigor from breeders to farm gate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className={`rounded-3xl p-6 sm:p-7 border border-stone-200/80 bg-gradient-to-b ${p.color} hover:shadow-lg transition-all flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-white shadow-xs border border-stone-200/60 flex items-center justify-center ${p.iconColor}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-stone-200 shadow-2xs">
                          {p.badge}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-[#0B1B30] text-base mb-2">{p.title}</h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{p.desc}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>100% Traceable</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* REGIONAL DARK STORE HUBS SHOWCASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF9F43] block mb-2">
              Micro-Fulfillment Infrastructure
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0B1B30]">
              Our Regional Dark Store Hubs
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Strategically placed dark store fulfillment centers ensuring same-day or scheduled delivery within 30 km.
            </p>
          </div>

          {/* Hub Switcher Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {hubs.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setActiveHub(h.id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeHub === h.id
                    ? 'bg-[#0B1B30] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {h.name.split(' (')[0]}
              </button>
            ))}
          </div>

          {/* Active Hub Details Card */}
          {hubs
            .filter((h) => h.id === activeHub)
            .map((hub) => (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-md grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
              >
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{hub.status}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#0B1B30]">{hub.name}</h3>

                  <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <span><strong>Address:</strong> {hub.location}, {hub.district}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Truck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <span><strong>Service Radius:</strong> {hub.coverage}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Warehouse className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <span><strong>Capacity:</strong> {hub.capacity}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Sprout className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <span><strong>Key Categories:</strong> {hub.specialties}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <span>Check Serviceability & Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="md:col-span-5 bg-gradient-to-br from-[#0B1B30] to-[#142B4A] rounded-2xl p-6 text-white text-center flex flex-col items-center justify-center min-h-[220px]">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-3 border border-white/20">
                    <Warehouse className="w-8 h-8 text-[#FF9F43]" />
                  </div>
                  <h4 className="font-bold text-base mb-1">Cold Chain Seed Preservation</h4>
                  <p className="text-xs text-slate-300 max-w-xs">
                    Air-tight vacuum sealed storage maintains 98%+ viability until the moment of field application.
                  </p>
                </div>
              </motion.div>
            ))}
        </section>

        {/* GOVERNMENT CERTIFICATIONS & COMPLIANCE */}
        <section className="bg-stone-100/70 py-16 sm:py-20 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#16A34A] block mb-1">
                Legal & Quality Accreditations
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B1B30]">
                Strict Adherence to Indian Agricultural Laws
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certifications.map((c, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">{c.title}</h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FARMER TESTIMONIALS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF9F43] block mb-1">
              Real Impact in the Field
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0B1B30]">
              Voices of India's Progressive Farmers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">{t.name}</h3>
                    <p className="text-[11px] text-slate-500">{t.role} • {t.village}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {t.crop}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="bg-gradient-to-r from-[#0B1B30] via-[#142B4A] to-[#0B1B30] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10 space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-[#FF9F43]" />
              Start Your Next Sowing Season With Confidence
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Ready to Experience 100% Genuine Certified Farm Inputs?
            </h2>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto">
              Join over 250,000 farmers who trust AgriMart for genuine hybrid seeds, balanced NPK nutrition, and direct farm dispatch.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="px-6 py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-sm rounded-xl shadow-lg transition-colors"
              >
                Shop Certified Seeds & Fertilizers
              </Link>
              <a
                href="tel:18002474627"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition-colors"
              >
                Toll-Free Helpline (1800-AGRI-MART)
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
