'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, HeartHandshake, Leaf, Truck, Award, Sprout, PhoneCall, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Navbar />

      <main className="w-full">
        {/* Header Hero */}
        <section className="bg-[#142B4A] text-white py-16 sm:py-24 px-6 md:px-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#142B4A] via-[#142B4A]/95 to-[#0F223D]" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F43]/20 text-[#FF9F43] text-xs font-black uppercase tracking-widest mb-4">
              <Sprout className="w-4 h-4" />
              Direct-to-Farm Agritech Mission
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-6">
              Certified Seeds & Quality Fertilizers, Delivered Direct to the Indian Farmer.
            </h1>
            <p className="text-slate-300 text-sm sm:text-lg leading-relaxed">
              AgriMart was founded with a singular purpose: to protect farmers from counterfeit seeds, spurious chemicals, and arbitrary dealer price markups. We supply government-certified hybrid seeds and FCO-compliant crop nutrition straight to village farm gates across India.
            </p>
          </div>
        </section>

        {/* Narrative & Visual Split */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80"
                alt="Modern agricultural farming with lush crops"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142B4A]/80 via-transparent to-transparent flex items-end p-8">
                <div className="text-white">
                  <span className="text-xs font-bold text-[#FF9F43] uppercase tracking-wider">Kisan Pledge</span>
                  <p className="text-xl font-bold">Lab-verified germination and pure active nutrition in every pack.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E27B12]">
                Our Quality Standards
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#142B4A] leading-tight">
                Empowering 250,000+ farmers with genuine crop inputs & agronomist advisory.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                By bridging certified breeders, fertilizer manufacturers, and agricultural research institutes directly with farm gates, AgriMart saves farmers 20% to 35% on input expenses while ensuring maximum stand vigor.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Every seed lot is tested for germination, moisture, and vigor under Seed Act 1966 protocols. All fertilizers strictly conform to Fertilizer Control Order (FCO) 1985 benchmarks.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-[#142B4A] text-white font-bold rounded-xl hover:bg-[#0c1c30] transition text-sm shadow-md"
                >
                  Explore Agri Catalog
                </Link>
                <div className="flex items-center gap-2 text-sm text-slate-700 font-semibold px-4 py-3 bg-white rounded-xl border border-slate-200">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Seed Act 1966 Certified
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars of AgriMart */}
        <section className="bg-white py-16 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
                The Four Pillars of AgriMart
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                How we deliver verified agricultural inputs with complete traceability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-slate-100 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 font-bold">
                  <Sprout className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-[#142B4A] mb-2 text-base">Direct from Breeders</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Direct contracts with ICAR institutions, National Seeds Corporation, Mahyco, Rasi, and IFFCO.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-slate-100 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-[#142B4A] mb-2 text-base">95%+ Lab Germination</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Every batch tested in accredited seed testing laboratories for physical purity and vigor.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-slate-100 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4 font-bold">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-[#142B4A] mb-2 text-base">Free Agronomist Help</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Toll-free 1800-AGRI-MART helpline for customized spray schedules and soil nutrient charts.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-slate-100 text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4 font-bold">
                  <Truck className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-[#142B4A] mb-2 text-base">Doorstep Farm Dispatch</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Serving 18,000+ pin codes right to village panchayat points and farm gates.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
