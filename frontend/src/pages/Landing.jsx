import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ChefHat, MessageCircle, MapPin, Star, Clock, Zap, BarChart3,
  Bell, Shield, Users, Store, ArrowRight, Play, Check, ChevronDown,
  Smartphone, Menu as MenuIcon, X, TrendingUp, Package, Coffee,
  UtensilsCrossed, ShoppingBag, Github, Linkedin, Mail, Globe,
  Sparkles, Bot, CheckCircle2, Timer, IndianRupee, Award, Heart
} from 'lucide-react';

// ─── Utility ───────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

// ─── Animated Counter ──────────────────────────────────────────────────────
function Counter({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(target);
    const duration = 1800;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Floating Blob ─────────────────────────────────────────────────────────
function Blob({ className }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`} />
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Campuses', href: '#campuses' },
    { label: 'Contact', href: '#footer' },
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-sm shadow-slate-200/60 border-b border-slate-200/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">SmartFood</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-4 py-2">
            Log in
          </Link>
          <Link to="/register"
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm shadow-blue-200 hover:shadow-blue-300 transition-all">
            Get Started →
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
          {open ? <X className="w-5 h-5 text-slate-700" /> : <MenuIcon className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-5 pb-5"
          >
            <div className="flex flex-col gap-4 pt-4">
              {links.map(l => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                  className="text-sm font-medium text-slate-700 hover:text-blue-600">
                  {l.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <Link to="/login" className="flex-1 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-2.5">
                  Log in
                </Link>
                <Link to="/register" className="flex-1 text-center text-sm font-semibold bg-blue-600 text-white rounded-xl px-4 py-2.5">
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-[#F8FAFC]">
      {/* Background decoration */}
      <Blob className="w-96 h-96 bg-blue-400 top-0 -right-32" />
      <Blob className="w-80 h-80 bg-purple-400 bottom-0 -left-20" />
      <Blob className="w-64 h-64 bg-cyan-400 top-1/2 left-1/3" />

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%232563EB fill-opacity=0.03%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Campus Food Ordering
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">
            Order Food Across{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              LPU Campus
            </span>{' '}
            Without Queues.
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
            Order directly from WhatsApp or SmartFood. Browse nearby campus stalls, skip queues, 
            and track your order in real time — all powered by Gemini AI.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link to="/register"
              className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all">
              Order Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#how-it-works"
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-6 py-3.5 rounded-xl border border-slate-200 shadow-sm transition-all">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Play className="w-2.5 h-2.5 text-white fill-white" />
              </div>
              Watch Demo
            </a>
          </motion.div>

          <motion.div {...fadeUp(0.4)} className="flex items-center gap-6 mt-10">
            <div className="flex -space-x-2">
              {['🎓','👨‍🍳','🧑‍💻','👩‍🎓'].map((e, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm ring-2 ring-white">
                  {e}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-900">1,000+</span> students already ordering
            </p>
          </motion.div>
        </div>

        {/* Right — WhatsApp mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="relative flex justify-center"
        >
          {/* Phone frame */}
          <div className="relative w-72">
            {/* Floating cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -left-16 top-16 bg-white rounded-2xl shadow-xl shadow-slate-200 p-3 z-10 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Order Ready!</p>
                  <p className="text-[10px] text-slate-400">LovelyBakeStudio</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -right-14 bottom-32 bg-white rounded-2xl shadow-xl shadow-slate-200 p-3 z-10 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Timer className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">15 min</p>
                  <p className="text-[10px] text-slate-400">Prep time</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
              className="absolute -right-10 top-10 bg-white rounded-2xl shadow-xl shadow-slate-200 p-3 z-10 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Academic Block</p>
                  <p className="text-[10px] text-slate-400">8 stalls open</p>
                </div>
              </div>
            </motion.div>

            {/* Phone */}
            <div className="bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl shadow-slate-400/30">
              <div className="bg-[#0F172A] rounded-[2rem] overflow-hidden relative">
                {/* Notch */}
                <div className="bg-slate-900 h-6 flex items-center justify-center rounded-b-xl mx-auto w-24 mt-1 mb-2">
                  <div className="w-2 h-2 bg-slate-700 rounded-full" />
                </div>

                {/* WhatsApp header */}
                <div className="bg-[#128C7E] px-4 py-2.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <ChefHat className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">SmartFood LPU</p>
                    <p className="text-green-200 text-[10px]">🟢 Online</p>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="bg-[#0B141A] px-3 py-3 space-y-2.5 min-h-[400px]"
                  style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h200v200H0z' fill='%23111b21'/%3E%3C/svg%3E\")"}}>
                  
                  {[
                    { from: 'user', text: 'Hi' },
                    { from: 'bot', text: '🍔 Welcome to SmartFood LPU!\n\n1️⃣ Order Food\n2️⃣ Track My Order\n4️⃣ Help' },
                    { from: 'user', text: '1' },
                    { from: 'bot', text: '📍 Select Campus:\n\n1️⃣ Academic Block\n2️⃣ BH Area\n3️⃣ Girls Hostel\n4️⃣ Uni Mall' },
                    { from: 'user', text: '1' },
                    { from: 'bot', text: '🏬 Academic Block Stalls:\n\n1️⃣ LovelyBakeStudio\n2️⃣ Basant Icecream\n3️⃣ DimSum Box' },
                    { from: 'bot', text: '✅ Order Confirmed!\n\nOrder #ORD1042\n🟡 Waiting for vendor...' },
                  ].map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.from === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-xl px-3 py-1.5 ${
                        msg.from === 'user'
                          ? 'bg-[#005C4B] text-white rounded-tr-sm'
                          : 'bg-[#202C33] text-slate-100 rounded-tl-sm'
                      }`}>
                        <p className="text-[10px] leading-4 whitespace-pre-line">{msg.text}</p>
                        <p className="text-[8px] text-slate-400 mt-0.5 text-right">
                          {['12:30', '12:30', '12:31', '12:31', '12:32', '12:32', '12:33'][i]}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Input bar */}
                <div className="bg-[#1F2C33] px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 bg-[#2A3942] rounded-full px-3 py-1.5">
                    <p className="text-[10px] text-slate-500">Type a message...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <ChevronDown className="w-5 h-5 text-slate-400" />
      </motion.div>
    </section>
  );
}

// ─── TRUSTED BY ────────────────────────────────────────────────────────────
function TrustedBy() {
  const items = ['🏫 LPU', '📱 WhatsApp', '🤖 Gemini AI', '🍕 50+ Stalls', '🎓 1000+ Students', '📦 MongoDB'];
  return (
    <section className="py-12 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
          Powered by industry-leading technology
        </p>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {items.map((item, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.05)}
              className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-default"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Bot,
    title: 'AI WhatsApp Ordering',
    desc: 'Order food via a natural WhatsApp conversation. Gemini AI understands your request and places your order instantly.',
    gradient: 'from-blue-500 to-cyan-500',
    light: 'bg-blue-50 group-hover:bg-blue-100',
    tag: 'Most Popular',
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    desc: 'Get WhatsApp alerts at every step — order accepted, preparing, ready for pickup. Never miss an update.',
    gradient: 'from-green-500 to-emerald-500',
    light: 'bg-green-50 group-hover:bg-green-100',
    tag: null,
  },
  {
    icon: Store,
    title: 'Vendor Dashboard',
    desc: 'Vendors manage orders, menu, pricing, and availability from a beautiful web dashboard in real time.',
    gradient: 'from-orange-500 to-amber-500',
    light: 'bg-orange-50 group-hover:bg-orange-100',
    tag: null,
  },
  {
    icon: MapPin,
    title: 'Campus Food Discovery',
    desc: 'Browse all stalls by campus — Academic Block, BH Area, Girls Hostel, and Uni Mall. 760+ menu items.',
    gradient: 'from-purple-500 to-violet-500',
    light: 'bg-purple-50 group-hover:bg-purple-100',
    tag: null,
  },
  {
    icon: Shield,
    title: 'LPU Verified Access',
    desc: 'One-time registration with your LPU Registration Number ensures only LPU students can order.',
    gradient: 'from-red-500 to-rose-500',
    light: 'bg-red-50 group-hover:bg-red-100',
    tag: null,
  },
  {
    icon: BarChart3,
    title: 'Admin Analytics',
    desc: 'Complete admin oversight with revenue charts, order trends, campus breakdowns, and vendor performance.',
    gradient: 'from-indigo-500 to-blue-600',
    light: 'bg-indigo-50 group-hover:bg-indigo-100',
    tag: null,
  },
];

function Features() {
  return (
    <section id="features" className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5" /> Packed with Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to <br className="hidden sm:block" />
            <span className="text-blue-600">order smarter</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            SmartFood combines AI, WhatsApp, and a beautiful web app to make campus food ordering effortless.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                {...fadeUp(i * 0.07)}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition-all cursor-default"
              >
                {f.tag && (
                  <span className="inline-block text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full mb-3">
                    {f.tag}
                  </span>
                )}
                <div className={`w-11 h-11 rounded-2xl ${f.light} flex items-center justify-center mb-4 transition-colors`}>
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                <div className={`mt-4 flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r ${f.gradient} bg-clip-text text-transparent`}>
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ──────────────────────────────────────────────────────────
const STEPS = [
  { icon: MessageCircle, title: 'Open WhatsApp', desc: 'Send "Hi" to the SmartFood number', color: 'bg-green-500' },
  { icon: Users, title: 'Quick Registration', desc: 'Enter your LPU Registration Number once', color: 'bg-blue-500' },
  { icon: MapPin, title: 'Choose Campus', desc: 'Pick Academic Block, BH Area, GH, or Uni Mall', color: 'bg-purple-500' },
  { icon: Store, title: 'Select Stall', desc: 'Browse open stalls near your location', color: 'bg-orange-500' },
  { icon: UtensilsCrossed, title: 'Order Food', desc: 'Pick items from a rich menu with prices', color: 'bg-red-500' },
  { icon: CheckCircle2, title: 'Vendor Accepts', desc: 'Vendor confirms your order in seconds', color: 'bg-emerald-500' },
  { icon: ChefHat, title: 'Food Prepared', desc: 'Get notified when your order is being cooked', color: 'bg-amber-500' },
  { icon: Package, title: 'Collect & Enjoy', desc: 'Pick up your fresh food — no queue needed!', color: 'bg-blue-600' },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Smartphone className="w-3.5 h-3.5" /> Simple Flow
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Order in under <span className="text-green-600">60 seconds</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            From opening WhatsApp to collecting your food — it's that simple.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={i} {...fadeUp(i * 0.06)}
                className="relative bg-[#F8FAFC] rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">Step {i + 1}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── CAMPUSES ──────────────────────────────────────────────────────────────
const CAMPUSES = [
  {
    name: 'Academic Block',
    stalls: 8,
    items: 424,
    popular: 'Pizza, Pasta, Coffee',
    emoji: '🏛️',
    gradient: 'from-blue-500 to-blue-700',
    open: true,
  },
  {
    name: 'BH Area',
    stalls: 6,
    items: 334,
    popular: 'Biryani, Momos, Thali',
    emoji: '🏠',
    gradient: 'from-emerald-500 to-green-700',
    open: true,
  },
  {
    name: 'Girls Hostel',
    stalls: 2,
    items: 2,
    popular: 'Chaap, Snacks',
    emoji: '🌸',
    gradient: 'from-purple-500 to-violet-700',
    open: true,
  },
  {
    name: 'Uni Mall',
    stalls: 0,
    items: 0,
    popular: 'Coming Soon',
    emoji: '🏬',
    gradient: 'from-amber-500 to-orange-600',
    open: false,
  },
];

function Campuses() {
  return (
    <section id="campuses" className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <MapPin className="w-3.5 h-3.5" /> Campus Coverage
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Serving all of <span className="text-purple-600">LPU</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Four campus locations, 16 food stalls, and 760+ menu items — all in one app.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CAMPUSES.map((campus, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.08)}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all"
            >
              {/* Top gradient */}
              <div className={`h-28 bg-gradient-to-br ${campus.gradient} flex items-center justify-center relative overflow-hidden`}>
                <span className="text-5xl">{campus.emoji}</span>
                <div className="absolute inset-0 bg-black/10" />
                {campus.open ? (
                  <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    🟢 Open
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⏳ Soon
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-slate-900 mb-1">{campus.name}</h3>
                <div className="flex gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-slate-900">{campus.stalls}</p>
                    <p className="text-[10px] text-slate-400">Stalls</p>
                  </div>
                  <div className="w-px bg-slate-100" />
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-slate-900">{campus.items}</p>
                    <p className="text-[10px] text-slate-400">Items</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">🍽️ {campus.popular}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── POPULAR FOOD ──────────────────────────────────────────────────────────
const FOODS = [
  { name: 'Medium Italian Pizza', vendor: 'LovelyBakeStudio', price: 200, time: '20 min', rating: 4.8, emoji: '🍕' },
  { name: 'Veg Hakka Noodles', vendor: 'LovelyBakeStudio', price: 120, time: '15 min', rating: 4.6, emoji: '🍜' },
  { name: 'Basant Special Sundae', vendor: 'Basant Icecream', price: 90, time: '5 min', rating: 4.9, emoji: '🍨' },
  { name: 'Steamed Momos', vendor: 'DimSum Box', price: 80, time: '12 min', rating: 4.7, emoji: '🥟' },
  { name: 'Penne White Sauce Pasta', vendor: 'LovelyBakeStudio', price: 200, time: '18 min', rating: 4.5, emoji: '🍝' },
  { name: 'Cold Coffee', vendor: 'Nescafe', price: 60, time: '5 min', rating: 4.8, emoji: '☕' },
];

function PopularFood() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <Star className="w-3.5 h-3.5 fill-orange-500" /> Top Rated
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Popular right now 🔥
            </h2>
          </div>
          <Link to="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5">
            View all menu <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FOODS.map((food, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.06)}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-[#F8FAFC] hover:bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/60 transition-all flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
                {food.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">{food.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{food.vendor}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <IndianRupee className="w-3 h-3" /> {food.price}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" /> {food.time}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {food.rating}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHATSAPP DEMO ────────────────────────────────────────────────────────
function WhatsAppDemo() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-[#0F172A] to-slate-900 overflow-hidden relative">
      <Blob className="w-96 h-96 bg-blue-600 top-0 right-0 opacity-10" />
      <Blob className="w-80 h-80 bg-green-600 bottom-0 left-0 opacity-10" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative">
        {/* Left text */}
        <div>
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-green-500/20">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Integration
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Order food by sending a{' '}
              <span className="text-green-400">WhatsApp message</span>
            </h2>
            <p className="mt-5 text-lg text-slate-400 leading-relaxed">
              No app download. No login. Just send "Hi" to the SmartFood WhatsApp number 
              and our AI bot handles the rest — from campus selection to order confirmation.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: Zap, text: 'Instant AI responses powered by Gemini' },
                { icon: Bell, text: 'Real-time order status on WhatsApp' },
                { icon: Shield, text: 'Secure one-time LPU verification' },
                { icon: CheckCircle2, text: 'Vendor confirmation in under 30 seconds' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i} {...fadeIn(0.1 + i * 0.08)} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-sm text-slate-300">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right — demo box */}
        <motion.div {...fadeUp(0.2)} className="flex justify-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">SmartFood LPU</p>
                <p className="text-green-400 text-xs">🟢 Active · AI Powered</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { who: 'You', msg: 'Hi', side: 'right' },
                { who: 'Bot', msg: '🍔 Welcome! Choose:\n1. Order Food\n2. Track Order', side: 'left' },
                { who: 'You', msg: '1', side: 'right' },
                { who: 'Bot', msg: '📍 Campus:\n1. Academic Block\n2. BH Area', side: 'left' },
                { who: 'You', msg: '1', side: 'right' },
                { who: 'Bot', msg: '✅ Order #ORD1042 Confirmed!\n🟡 Waiting for vendor...', side: 'left' },
              ].map((m, i) => (
                <div key={i} className={`flex ${m.side === 'right' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                    m.side === 'right'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white/10 text-slate-100 rounded-tl-sm'
                  }`}>
                    <p className="text-xs leading-relaxed whitespace-pre-line">{m.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── STATISTICS ────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Students Registered', value: 1000, suffix: '+', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { label: 'Food Stalls', value: 16, suffix: '', icon: Store, color: 'text-green-600 bg-green-50' },
  { label: 'Menu Items', value: 760, suffix: '+', icon: UtensilsCrossed, color: 'text-orange-600 bg-orange-50' },
  { label: 'Order Accuracy', value: 99, suffix: '%', icon: Award, color: 'text-purple-600 bg-purple-50' },
];

function Statistics() {
  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Trusted by the <span className="text-blue-600">LPU community</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">Numbers that speak for themselves</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                {...fadeUp(i * 0.08)}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center"
              >
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-4xl font-extrabold text-slate-900">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-slate-500 mt-2 font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ──────────────────────────────────────────────────────────
const REVIEWS = [
  { name: 'Arjun Singh', role: 'B.Tech CSE, Sem 5', text: 'I placed my first order in under a minute on WhatsApp. No app, no login — just message and go. This is exactly what LPU needed!', avatar: '👨‍💻', rating: 5 },
  { name: 'Priya Sharma', role: 'MBA Student', text: 'The Academic Block has so many options now. I ordered from DimSum Box without standing in that long queue. Love it!', avatar: '👩‍💼', rating: 5 },
  { name: 'Ravi Kumar', role: 'Vendor — LovelyBakeStudio', text: 'The vendor dashboard is clean and easy. I see orders come in, accept them, and my customers get notified automatically.', avatar: '👨‍🍳', rating: 5 },
  { name: 'Neha Patel', role: 'B.Sc Biotech, Sem 3', text: 'Got a WhatsApp message the moment my Basant Icecream was ready. No waiting at the counter. Pure bliss!', avatar: '👩‍🔬', rating: 5 },
  { name: 'Mohammed Ali', role: 'B.Tech IT, Sem 7', text: 'The admin dashboard is super detailed — order trends, campus breakdowns, everything. Great for our university management team.', avatar: '🧑‍💼', rating: 5 },
  { name: 'Simran Kaur', role: 'BCA Student', text: 'Ordered Nescafe coffee on WhatsApp. By the time I walked to the stall, it was ready. That is magic!', avatar: '👩‍🎓', rating: 5 },
];

function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Heart className="w-3.5 h-3.5 fill-pink-500" /> Loved by students & vendors
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            What the campus is <span className="text-pink-600">saying</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.06)}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#F8FAFC] hover:bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array(review.rating).fill(0).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-5 italic">"{review.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg">
                  {review.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{review.name}</p>
                  <p className="text-xs text-slate-400">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── COMPARISON ────────────────────────────────────────────────────────────
function Comparison() {
  const rows = [
    { label: 'Ordering Method', old: 'Stand in physical queue', smart: 'WhatsApp message or web app' },
    { label: 'Wait Time', old: '15-30 minutes average', smart: 'Order ready in 10-15 min' },
    { label: 'Live Updates', old: 'No notification system', smart: 'WhatsApp alerts at every step' },
    { label: 'Menu Discovery', old: 'Walk to each stall', smart: 'Browse 760+ items instantly' },
    { label: 'Order Tracking', old: 'Stand and wait', smart: 'Track real-time from anywhere' },
    { label: 'Vendor Management', old: 'Paper & verbal orders', smart: 'Digital dashboard with analytics' },
  ];

  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Traditional vs <span className="text-blue-600">SmartFood</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">See why students are making the switch</p>
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100">
            <div className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Feature</div>
            <div className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <X className="w-3.5 h-3.5 text-red-400" /> Traditional Queue
            </div>
            <div className="px-5 py-4 text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-green-500" /> SmartFood
            </div>
          </div>
          {rows.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 border-b border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
              <div className="px-5 py-4 text-sm font-semibold text-slate-700">{row.label}</div>
              <div className="px-5 py-4 text-sm text-slate-400 flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                {row.old}
              </div>
              <div className="px-5 py-4 text-sm text-slate-700 font-medium flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                {row.smart}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <motion.div
          {...fadeUp(0)}
          className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-12 sm:p-16 text-center overflow-hidden"
        >
          <Blob className="w-72 h-72 bg-white top-0 right-0 opacity-10" />
          <Blob className="w-56 h-56 bg-cyan-400 bottom-0 left-0 opacity-10" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Ready to order smarter?
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Skip the queue.<br />Order from anywhere.
            </h2>
            <p className="mt-5 text-lg text-blue-100 max-w-xl mx-auto">
              Join 1,000+ LPU students who are already ordering food smarter. 
              Get started in 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <Link to="/register"
                className="flex items-center justify-center gap-2 bg-white text-blue-700 text-sm font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login"
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all">
                Log in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer id="footer" className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">SmartFood</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              AI-powered food ordering for Lovely Professional University. 
              Order from WhatsApp. Skip queues. Eat smarter.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://github.com/RATNESH2121" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="mailto:contact@smartfood.lpu" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <div className="space-y-2.5">
              {['Features', 'How it Works', 'Campuses', 'Get Started', 'Login'].map(l => (
                <a key={l} href="#" className="block text-sm hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <div className="space-y-2.5">
              {['Student Portal', 'Vendor Dashboard', 'Admin Panel', 'WhatsApp Bot', 'API Docs'].map(l => (
                <a key={l} href="#" className="block text-sm hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© 2026 SmartFood LPU. Built with ❤️ for LPU students.</p>
          <div className="flex items-center gap-4 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN LANDING PAGE ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="font-inter">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Campuses />
      <PopularFood />
      <WhatsAppDemo />
      <Statistics />
      <Testimonials />
      <Comparison />
      <CTA />
      <Footer />
    </div>
  );
}
