'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Activity,
    BarChart3,
    Code2,
    Globe,
    MousePointerClick,
    Plug,
    Shield,
    Smartphone,
    Zap,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Box,
    Database,
    FastForward,
    Gauge,
    Network,
    ActivitySquare,
    Layers,
    Search
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import {
    SiWordpress,
    SiWoocommerce,
    SiShopify,
    SiPrestashop,
    SiAndroid,
    SiApple,
    SiReact,
    SiUnity
} from '@icons-pack/react-simple-icons';

// ── Animation variants ──────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
}

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
}

// ── Feature cards data ───────────────────────────────────
const features = [
    {
        icon: MousePointerClick,
        title: 'Zero-Code Autocapture',
        desc: 'Every click, scroll, and form fill captured automatically. No custom events needed — just install and go.',
        color: 'from-brand-500 to-brand-400',
        glow: 'brand',
    },
    {
        icon: Activity,
        title: 'Real-Time Dashboards',
        desc: 'Watch your data flow live with sub-second latency. Apache Kafka and ClickHouse power lightning-fast queries.',
        color: 'from-accent-500 to-brand-500',
        glow: 'accent',
    },
    {
        icon: Globe,
        title: 'Visual Event Tagger',
        desc: 'Click on any element on your website to define a meaningful analytics event — zero code required.',
        color: 'from-purple-500 to-brand-500',
        glow: 'brand',
    },
    {
        icon: Plug,
        title: '9 Platform SDKs',
        desc: 'WordPress, Shopify, Magento, Unity, Android, iOS, React Native — all connected to one unified dashboard.',
        color: 'from-cyan-500 to-accent-500',
        glow: 'accent',
    },
    {
        icon: Shield,
        title: 'Privacy-First by Design',
        desc: 'GDPR & CCPA compliant. No cookies. IP hashing. PII sanitization built into every event pipeline.',
        color: 'from-green-500 to-accent-500',
        glow: 'accent',
    },
    {
        icon: Smartphone,
        title: 'Mobile & Game Analytics',
        desc: 'Track sessions, screen views, crashes, IAP revenue, and player funnels across Android, iOS, and Unity.',
        color: 'from-orange-500 to-brand-500',
        glow: 'brand',
    },
]

// ── Pipeline data ────────────────────────────────────────
const pipelineSteps = [
    {
        title: '1. Autocapture',
        desc: 'SDK tracks every interaction with zero code required.',
        icon: Network,
    },
    {
        title: '2. Ingestion',
        desc: 'Apache Kafka queues billions of events simultaneously.',
        icon: FastForward,
    },
    {
        title: '3. Storage',
        desc: 'ClickHouse executes OLAP aggregations in milliseconds.',
        icon: Database,
    },
    {
        title: '4. Action',
        desc: 'Dashboards update live. Webhooks fire based on rules.',
        icon: Gauge,
    }
]

// ── Supported platforms ──────────────────────────────────
const platforms = [
    { name: 'WordPress', icon: SiWordpress },
    { name: 'WooCommerce', icon: SiWoocommerce },
    { name: 'Shopify', icon: SiShopify },
    { name: 'Magento 2', icon: Box },
    { name: 'PrestaShop', icon: SiPrestashop },
    { name: 'Android', icon: SiAndroid },
    { name: 'iOS Native', icon: SiApple },
    { name: 'React Native', icon: SiReact },
    { name: 'Unity', icon: SiUnity },
]

// ── Pricing tiers ────────────────────────────────────────
const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        events: '10K events/mo',
        features: ['1 project', '30-day retention', 'JS web SDK', 'Basic dashboards', 'Community support'],
        cta: 'Start Free',
        highlighted: false,
    },
    {
        name: 'Starter',
        price: '$29',
        period: 'per month',
        events: '500K events/mo',
        features: ['5 projects', '90-day retention', 'All platform SDKs', 'Funnel & cohort analysis', 'Email support', 'Custom alerts'],
        cta: 'Start Trial',
        highlighted: true,
    },
    {
        name: 'Pro',
        price: '$99',
        period: 'per month',
        events: '5M events/mo',
        features: ['Unlimited projects', '365-day retention', 'Visual Event Tagger', 'API access', 'Priority support', 'Scheduled reports', 'Team seats (10)'],
        cta: 'Start Trial',
        highlighted: false,
    },
]

// ── Stats ────────────────────────────────────────────────
const stats = [
    { label: 'Events Processed Daily', value: '2B+' },
    { label: 'Avg Dashboard Load', value: '<200ms' },
    { label: 'Platforms Supported', value: '9' },
    { label: 'Data Compression', value: '10x' },
]

export default function LandingPage() {
    return (
        <div className="relative min-h-screen overflow-x-hidden">
            {/* ── Navigation ─────────────────────────────────── */}
            <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-border/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-brand text-3xl gradient-brand-text">trusanity</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm">
                        {['Features', 'Platforms', 'Pricing', 'Docs'].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-text-secondary hover:text-text-primary transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>
                        <Link
                            href="/login"
                            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm px-4 py-2 rounded-lg gradient-brand text-white font-medium 
                         hover:opacity-90 transition-opacity shadow-surface"
                        >
                            Start Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ─────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center pt-16">
                {/* Background orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full orb"
                        style={{ background: 'radial-gradient(circle, oklch(0.57 0.26 264 / 0.3), transparent 70%)' }} />
                    <div className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full orb orb-delay-2"
                        style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 198 / 0.25), transparent 70%)' }} />
                    <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full orb orb-delay-4"
                        style={{ background: 'radial-gradient(circle, oklch(0.65 0.22 280 / 0.2), transparent 70%)' }} />
                    {/* Grid */}
                    <div className="absolute inset-0 bg-grid opacity-[0.03]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
                    <motion.div initial="hidden" animate="visible" variants={stagger}>
                        {/* Badge */}
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
              glass border border-brand-500/30 text-sm text-brand-400 mb-8">
                            <span className="w-2 h-2 rounded-full bg-brand-400 pulse-ring" />
                            Real-time analytics — sub-200ms dashboard latency
                        </motion.div>

                        {/* Headline */}
                        <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                            See What Your Users{' '}
                            <span className="gradient-brand-text">Actually Do</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
                            Privacy-first behavioral analytics for web, mobile, and games.
                            Zero-code setup. Real-time data. 9 platform integrations.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 flex-wrap mb-16">
                            <Link href="/register"
                                className="group flex items-center gap-2 px-8 py-4 rounded-xl gradient-brand text-white 
                           font-semibold text-lg hover:opacity-90 transition-all glow-brand shadow-elevated">
                                Start for Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="#features"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl glass text-text-primary 
                           font-semibold text-lg hover:bg-bg-elevated transition-all">
                                <Code2 className="w-5 h-5" />
                                View Demo
                            </Link>
                        </motion.div>

                        {/* Live dashboard preview mockup */}
                        <motion.div variants={fadeUp} className="relative max-w-5xl mx-auto">
                            <div className="glass-strong rounded-2xl p-1 shadow-elevated border border-border">
                                <div className="rounded-xl overflow-hidden bg-bg-surface">
                                    {/* Fake browser bar */}
                                    <div className="flex items-center gap-2 px-4 py-3 bg-bg-elevated border-b border-border">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-danger/70" />
                                            <div className="w-3 h-3 rounded-full bg-warning/70" />
                                            <div className="w-3 h-3 rounded-full bg-success/70" />
                                        </div>
                                        <div className="flex-1 mx-4 h-6 rounded-md bg-bg-overlay flex items-center px-3">
                                            <span className="text-xs text-text-muted">app.trusanity.com/dashboard</span>
                                        </div>
                                    </div>
                                    {/* Dashboard preview */}
                                    <DashboardPreview />
                                </div>
                            </div>
                            {/* Glow under preview */}
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 
                              bg-brand-500/20 blur-3xl rounded-full pointer-events-none" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Stats bar ──────────────────────────────────────── */}
            <section className="relative py-16 border-y border-border/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-4xl font-bold gradient-brand-text mb-2">{stat.value}</div>
                                <div className="text-sm text-text-muted">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ───────────────────────────────────────── */}
            <section id="features" className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <div className="inline-block px-4 py-1 rounded-full glass border border-border text-sm text-text-muted mb-4">
                            Core Features
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Everything You Need to{' '}
                            <span className="gradient-brand-text">Understand Users</span>
                        </h2>
                        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                            From zero-code setup to enterprise-grade OLAP queries — Trusanity covers the full analytics stack.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className="group relative glass rounded-2xl p-6 hover:bg-bg-elevated transition-all duration-300
                           border border-border hover:border-border-strong cursor-default"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} bg-opacity-20 
                                 flex items-center justify-center mb-4 shadow-surface`}>
                                    <f.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-text-primary mb-2">{f.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                                <ChevronRight className="absolute bottom-6 right-6 w-4 h-4 text-text-muted 
                                        opacity-0 group-hover:opacity-100 group-hover:translate-x-1 
                                        transition-all" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works (Pipeline) ────────────────────────── */}
            <section id="how-it-works" className="py-24 relative overflow-hidden bg-bg-surface border-y border-border/50">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            How Data Flows in <span className="gradient-brand-text">Trusanity</span>
                        </h2>
                        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                            Our proprietary pipeline is built to handle millions of events per second, delivering sub-second query latency without breaking a sweat.
                        </p>
                    </motion.div>

                    <div className="relative mt-12">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[48px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-brand-500/10 via-brand-500/50 to-brand-500/10 z-0" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
                            {pipelineSteps.map((step, i) => (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.15 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col items-center text-center group"
                                >
                                    <div className="w-24 h-24 mb-6 rounded-full glass-strong border-2 border-brand-500/20 flex flex-col items-center justify-center relative shadow-surface hover:border-brand-500 transition-all duration-300">
                                        <div className="absolute inset-0 rounded-full bg-brand-500/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <step.icon className="w-10 h-10 text-brand-400 group-hover:text-brand-300 transition-colors z-10" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed px-4">
                                        {step.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Platforms ──────────────────────────────────────── */}
            <section id="platforms" className="py-24 border-y border-border/50 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <h2 className="text-4xl font-bold mb-4">
                            One Dashboard.{' '}
                            <span className="gradient-brand-text">Every Platform.</span>
                        </h2>
                        <p className="text-text-secondary max-w-xl mx-auto">
                            Drop-in plugins and native SDKs for all your platforms — all events flow into one unified analytics workspace.
                        </p>
                    </motion.div>
                </div>

                <div className="relative w-full flex mt-8">
                    {/* Edge shadow fades */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg-base to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg-base to-transparent z-10 pointer-events-none" />

                    {/* Infinite Marquee Track */}
                    <div className="animate-marquee flex gap-6 px-3">
                        {/* Duplicate the array twice so it scrolls seamlessly without breaking */}
                        {[...platforms, ...platforms].map((p, i) => (
                            <div
                                key={`${p.name}-${i}`}
                                className="px-10 py-5 glass rounded-2xl border border-border text-lg font-bold
                               text-text-secondary hover:text-text-primary hover:border-brand-500/50 hover:bg-bg-elevated
                               transition-all flex items-center justify-center gap-4 whitespace-nowrap shadow-sm hover:shadow-brand-500/10 cursor-default group"
                            >
                                <p.icon className="w-8 h-8 text-text-muted group-hover:text-brand-500 transition-colors flex-shrink-0" />
                                {p.name}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Enterprise Infrastructure ────────────────────────── */}
            <section id="infrastructure" className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-block px-4 py-1 rounded-full glass border border-border text-sm text-text-muted mb-4">
                                Built for Scale
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                The <span className="gradient-brand-text">ClickHouse</span> Advantage
                            </h2>
                            <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                                Under the hood, Trusanity bypasses traditional relational databases in favor of a distributed ClickHouse OLAP cluster fronted by Apache Kafka.
                            </p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Zero database locking during high-velocity event ingestion.',
                                    '10x-20x geographic data compression ratios.',
                                    'Sub-second aggregations across billions of rows.',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-text-primary">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Decorative background glow */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-brand-500/20 to-accent-500/20 rounded-3xl blur-2xl z-0" />

                            {/* Code Window */}
                            <div className="relative z-10 rounded-2xl border border-border-strong bg-[#0d0d0d] overflow-hidden shadow-elevated">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-black/40">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                    <span className="ml-2 text-xs text-text-muted font-mono">terminal - @trusanity/sdk</span>
                                </div>
                                <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto text-gray-300">
                                    <p><span className="text-brand-400">import</span> {'{ trusanity }'} <span className="text-brand-400">from</span> <span className="text-green-400">'@trusanity/browser'</span>;</p>
                                    <p className="mt-4"><span className="text-blue-400">trusanity</span>.<span className="text-yellow-300">init</span>({'{'}</p>
                                    <p className="pl-4">public_key: <span className="text-green-400">'ts_live_9f8b7c6...'</span>,</p>
                                    <p className="pl-4">api_host: <span className="text-green-400">'https://ingest.trusanity.com'</span>,</p>
                                    <p className="pl-4">autocapture: <span className="text-orange-400">true</span>,</p>
                                    <p className="pl-4">mask_all_text: <span className="text-orange-400">true</span> <span className="text-text-muted">// Auto-scrubs PII</span></p>
                                    <p className="mt-4">{'}'});</p>
                                    <p className="mt-4"><span className="text-text-muted">{'// Trusanity is now tracking all interactions.'}</span></p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Privacy by Design ──────────────────────────────── */}
            <section id="privacy" className="py-24 border-y border-border/50 bg-bg-surface/50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-start-2 lg:row-start-1"
                        >
                            <div className="inline-block px-4 py-1 rounded-full glass border border-border text-sm text-text-muted mb-4">
                                Compliance First
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Enterprise-Grade <span className="gradient-brand-text">Privacy</span>
                            </h2>
                            <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                                Stop worrying about cookie banners. Trusanity is engineered to provide deep behavioral insights without invading user privacy or storing raw PII.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                                <div className="glass p-5 rounded-xl border border-border">
                                    <Shield className="w-6 h-6 text-brand-500 mb-3" />
                                    <h4 className="font-bold text-text-primary mb-1">GDPR & CCPA Ready</h4>
                                    <p className="text-sm text-text-secondary">Fully compliant data architecture out of the box.</p>
                                </div>
                                <div className="glass p-5 rounded-xl border border-border">
                                    <Code2 className="w-6 h-6 text-accent-500 mb-3" />
                                    <h4 className="font-bold text-text-primary mb-1">Cookieless Tracking</h4>
                                    <p className="text-sm text-text-secondary">Rely on hashed device fingerprints, not fragile third-party cookies.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-start-1 lg:row-start-1 relative"
                        >
                            {/* Abstract safe graphic */}
                            <div className="relative w-full aspect-square max-w-md mx-auto">
                                <div className="absolute inset-0 rounded-full border border-border-strong animate-[spin_60s_linear_infinite]" />
                                <div className="absolute inset-4 rounded-full border border-dashed border-brand-500/30 animate-[spin_40s_linear_infinite_reverse]" />
                                <div className="absolute inset-x-8 inset-y-8 rounded-full bg-gradient-to-br from-brand-500/10 to-transparent glass-strong flex items-center justify-center border border-brand-500/20 shadow-brand-500/20 shadow-2xl">
                                    <Shield className="w-24 h-24 text-brand-400 drop-shadow-lg" />
                                </div>

                                {/* Floating data dots getting scrubbed */}
                                <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                                <div className="absolute bottom-10 right-10 w-4 h-4 rounded-full bg-red-500 animate-pulse delay-1000" />
                                <div className="absolute top-1/2 -right-2 w-4 h-4 rounded-full bg-green-500 animate-pulse delay-500" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Unified Workspace Showcase (Bento Box) ───────────── */}
            <section id="workspace" className="py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-block px-4 py-1 rounded-full glass border border-border text-sm text-text-muted mb-4">
                            The Frontend Experience
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            One <span className="gradient-brand-text">Unified Workspace</span>
                        </h2>
                        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
                            We've abstracted the complexity of data engineering into a beautiful, lightning-fast dashboard designed for modern product teams.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

                        {/* Large Bento Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="md:col-span-2 glass-strong rounded-3xl p-8 border border-border flex flex-col justify-between relative overflow-hidden group hover:border-brand-500/50 transition-colors h-[400px]"
                        >
                            <div className="relative z-10">
                                <ActivitySquare className="w-8 h-8 text-brand-500 mb-4" />
                                <h3 className="text-2xl font-bold mb-2">Live Realtime Ticker</h3>
                                <p className="text-text-secondary w-2/3">Watch individual streams of events fly across your screen globally before they are even stored to disk.</p>
                            </div>
                            {/* Visual representation */}
                            <div className="absolute right-[-10%] bottom-[-20%] w-[80%] h-[70%] glass rounded-tl-2xl border-t border-l border-border/50 p-4 transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500 shadow-2xl">
                                <div className="space-y-3 opacity-60">
                                    <div className="h-6 w-full bg-bg-elevated rounded-md animate-pulse" />
                                    <div className="h-6 w-5/6 bg-bg-elevated rounded-md animate-pulse delay-75" />
                                    <div className="h-6 w-4/6 bg-bg-elevated rounded-md animate-pulse delay-150" />
                                    <div className="h-6 w-full bg-brand-500/20 border border-brand-500/30 rounded-md" />
                                    <div className="h-6 w-3/4 bg-bg-elevated rounded-md animate-pulse delay-300" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Tall Bento Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            viewport={{ once: true }}
                            className="glass-strong rounded-3xl p-8 border border-border flex flex-col relative overflow-hidden group hover:border-accent-500/50 transition-colors h-[400px]"
                        >
                            <div className="relative z-10">
                                <Layers className="w-8 h-8 text-accent-500 mb-4" />
                                <h3 className="text-2xl font-bold mb-2">Multi-tenant Native</h3>
                                <p className="text-text-secondary">Manage hundreds of disparate domains, mobile apps, and side-projects under a single, isolated account architecture.</p>
                            </div>
                            <div className="absolute bottom-6 left-8 right-8 flex gap-2">
                                <div className="w-12 h-12 rounded-full glass border border-border flex items-center justify-center -ml-4 z-30"><SiShopify className="w-5 h-5 text-green-500" /></div>
                                <div className="w-12 h-12 rounded-full glass border border-border flex items-center justify-center -ml-6 z-20"><SiApple className="w-5 h-5 text-gray-300" /></div>
                                <div className="w-12 h-12 rounded-full glass border border-border flex items-center justify-center -ml-6 z-10"><SiReact className="w-5 h-5 text-blue-400" /></div>
                            </div>
                        </motion.div>

                        {/* Wide Bottom Bento Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            className="md:col-span-3 glass-strong rounded-3xl p-8 border border-border flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group hover:border-brand-500/50 transition-colors"
                        >
                            <div className="flex-1 z-10">
                                <Search className="w-8 h-8 text-brand-400 mb-4" />
                                <h3 className="text-2xl font-bold mb-2">The Visual Event Tagger</h3>
                                <p className="text-text-secondary">Stop writing manual `.track()` code blocks. Simply browse your live website through our proxy iframe and point-and-click to name events instantly.</p>
                            </div>
                            <div className="w-full md:w-1/2 h-48 glass rounded-xl border border-border/50 relative flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-x-0 h-[1px] bg-brand-500/30 group-hover:top-1/2 transition-all duration-1000 top-1/4" />
                                <div className="absolute inset-y-0 w-[1px] bg-brand-500/30 group-hover:left-1/2 transition-all duration-1000 left-1/4" />
                                <div className="w-16 h-8 border border-brand-500 rounded bg-brand-500/10 pointer-events-none" />
                                <MousePointerClick className="absolute bottom-1/4 right-1/4 w-6 h-6 text-white group-hover:bottom-1/2 group-hover:right-1/2 group-hover:translate-x-3 group-hover:translate-y-3 transition-all duration-1000" />
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* ── Pricing ────────────────────────────────────────── */}
            <section id="pricing" className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold mb-4">
                            Simple,{' '}
                            <span className="gradient-brand-text">Transparent Pricing</span>
                        </h2>
                        <p className="text-text-secondary">Start free. Scale as you grow. No hidden fees.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={`relative rounded-2xl p-8 flex flex-col ${plan.highlighted
                                    ? 'gradient-border glow-brand bg-bg-surface'
                                    : 'glass border border-border'
                                    }`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-brand text-white text-xs font-semibold">
                                        Most Popular
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-text-primary mb-1">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-text-primary">{plan.price}</span>
                                        <span className="text-text-muted text-sm">/ {plan.period}</span>
                                    </div>
                                    <div className="text-sm text-brand-400 mt-2 font-medium">{plan.events}</div>
                                </div>
                                <ul className="space-y-3 flex-1 mb-8">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/register"
                                    className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-all ${plan.highlighted
                                        ? 'gradient-brand text-white hover:opacity-90 shadow-surface'
                                        : 'glass border border-border text-text-primary hover:bg-bg-elevated'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* ── Final CTA ──────────────────────────────────────── */}
            < section className="py-24" >
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-strong rounded-3xl p-12 border border-brand-500/20 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-accent-500/5 pointer-events-none" />
                        <Zap className="w-12 h-12 text-brand-400 mx-auto mb-6" />
                        <h2 className="text-4xl font-bold mb-4">
                            Ready to See Your Users Clearly?
                        </h2>
                        <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                            Set up in under 5 minutes. No credit card required. Your first 10,000 events every month are always free.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-10 py-4 gradient-brand text-white 
                         font-semibold text-lg rounded-xl hover:opacity-90 transition-opacity 
                         glow-brand shadow-elevated"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section >

            {/* ── Footer ─────────────────────────────────────────── */}
            < footer className="border-t border-border/50 py-12" >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 font-bold">
                            <div className="w-6 h-6 rounded-md gradient-brand flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-brand text-3xl gradient-brand-text">trusanity</span>
                        </div>
                        <p className="text-sm text-text-muted">
                            © {new Date().getFullYear()} Trusanity. Privacy-first analytics platform.
                        </p>
                        <div className="flex gap-6 text-sm text-text-muted">
                            <Link href="/privacy" className="hover:text-text-secondary transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-text-secondary transition-colors">Terms</Link>
                            <Link href="/docs" className="hover:text-text-secondary transition-colors">Docs</Link>
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    )
}

// ── Dashboard Preview Component ──────────────────────────
function DashboardPreview() {
    const barData = [42, 68, 55, 80, 72, 95, 88]
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    return (
        <div className="p-6 bg-bg-surface min-h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="text-xs text-text-muted mb-1">Last 7 days</div>
                    <div className="text-2xl font-bold text-text-primary">24,891 <span className="text-success text-sm font-normal">↑ 12.4%</span></div>
                    <div className="text-xs text-text-muted">unique visitors</div>
                </div>
                <div className="flex gap-3">
                    {[
                        { label: 'Sessions', value: '31.2K', color: 'text-brand-400' },
                        { label: 'Bounce Rate', value: '34.1%', color: 'text-warning' },
                        { label: 'Avg. Duration', value: '3m 22s', color: 'text-accent-500' },
                    ].map((m) => (
                        <div key={m.label} className="glass rounded-lg px-3 py-2 text-center">
                            <div className={`text-sm font-bold ${m.color}`}>{m.value}</div>
                            <div className="text-[10px] text-text-muted">{m.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bar chart visualization */}
            <div className="flex items-end gap-2 h-28 mb-4">
                {barData.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className="w-full rounded-t-sm transition-all"
                            style={{
                                height: `${(val / 100) * 100}%`,
                                background: `linear-gradient(to top, oklch(0.57 0.26 264), oklch(0.72 0.18 198))`,
                                opacity: i === 5 ? 1 : 0.6,
                            }}
                        />
                        <span className="text-[9px] text-text-muted">{days[i]}</span>
                    </div>
                ))}
            </div>

            {/* Top pages mini table */}
            <div className="glass rounded-xl p-3">
                <div className="text-xs text-text-muted mb-2 font-medium">Top Pages</div>
                {[
                    { page: '/dashboard', views: '8,421', pct: 82 },
                    { page: '/pricing', views: '4,102', pct: 40 },
                    { page: '/docs/quickstart', views: '2,891', pct: 28 },
                ].map((row) => (
                    <div key={row.page} className="flex items-center gap-3 py-1.5">
                        <span className="text-xs text-text-secondary w-36 truncate font-mono">{row.page}</span>
                        <div className="flex-1 h-1 rounded-full bg-bg-overlay overflow-hidden">
                            <div className="h-full rounded-full gradient-brand" style={{ width: `${row.pct}%` }} />
                        </div>
                        <span className="text-xs text-text-muted w-12 text-right">{row.views}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
