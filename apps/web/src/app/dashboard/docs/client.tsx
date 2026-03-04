'use client';

import { useState } from 'react';
import { Terminal, Copy, CheckCircle2, Globe2, ShoppingBag, ShoppingCart, Code2, Layers, LayoutTemplate, Smartphone, TabletSmartphone, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Platform = 'html' | 'react' | 'shopify' | 'magento' | 'wordpress' | 'woocommerce' | 'reactnative' | 'android' | 'ios' | 'unity';

export default function ApiDocsClient({ newestKey }: { newestKey: string }) {
    const [activeTab, setActiveTab] = useState<Platform>('html');
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

    const handleCopy = (text: string, blockId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [blockId]: true }));
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [blockId]: false })), 2000);
    };

    const platforms = [
        { id: 'html', label: 'HTML / JS', icon: Globe2, desc: 'Any standard website' },
        { id: 'react', label: 'Next.js / React', icon: Code2, desc: 'SPA and Frameworks' },
        { id: 'shopify', label: 'Shopify', icon: ShoppingBag, desc: 'Liquid Themes' },
        { id: 'magento', label: 'Magento', icon: ShoppingCart, desc: 'Adobe Commerce' },
        { id: 'wordpress', label: 'WordPress', icon: LayoutTemplate, desc: 'WP Plugins or Themes' },
        { id: 'woocommerce', label: 'WooCommerce', icon: ShoppingCart, desc: 'WP E-Commerce' },
        { id: 'reactnative', label: 'React Native', icon: Smartphone, desc: 'Cross-platform Mobile' },
        { id: 'android', label: 'Android', icon: Smartphone, desc: 'Native Kotlin/Java' },
        { id: 'ios', label: 'iOS', icon: TabletSmartphone, desc: 'Native Swift/Obj-C' },
        { id: 'unity', label: 'Unity', icon: Gamepad2, desc: 'C# Game Engine' },
    ];

    const generateHtmlSnippet = () => `<!-- Trusanity Analytics SDK -->
<script defer src="${process.env.NEXT_PUBLIC_API_URL || 'https://api.trusanity.com'}/track.js" data-site-id="${newestKey}"></script>`;

    const generateReactSnippet = () => `// In your _app.tsx or root layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="${process.env.NEXT_PUBLIC_API_URL || 'https://api.trusanity.com'}/track.js" 
          strategy="afterInteractive"
          data-site-id="${newestKey}"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}`;

    const generateShopifySnippet = () => `{% comment %}
  Paste this inside your theme.liquid just before the closing </head> tag
{% endcomment %}
<script defer src="${process.env.NEXT_PUBLIC_API_URL || 'https://api.trusanity.com'}/track.js" data-site-id="${newestKey}"></script>`;

    const generateEventHtml = () => `// Firing a Custom Event
window.trusanity = window.trusanity || function(){(trusanity.q=trusanity.q||[]).push(arguments)};

// Example: Tracking a Checkout
trusanity('track', 'Started Checkout', {
  cart_value: 120.50,
  currency: 'USD',
  item_count: 3
});`;

    const generateWordpressSnippet = () => `// 1. Install the Trusanity Analytics Plugin via WP Admin -> Plugins -> Add New
// 2. Activate the plugin
// 3. Navigate to Settings -> Trusanity Analytics Configuration
// 4. Paste your API Key: ${newestKey}`;

    const generateWoocommerceSnippet = () => `// 1. Install & Activate the Trusanity Analytics Plugin
// 2. Navigate to Settings -> Trusanity Analytics Configuration
// 3. Paste your API Key: ${newestKey}

// Note: WooCommerce purchases are automatically tracked via the 'woocommerce_thankyou' hook!`;

    const generateAndroidSnippet = () => `// In your app/build.gradle dependencies
implementation 'com.trusanity.analytics:sdk:1.0.0'

// In your Application class onCreate()
import com.trusanity.analytics.Trusanity

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Trusanity.init(this, "${newestKey}")
    }
}`;

    const generateIosSnippet = () => `// In your Podfile
pod 'TrusanityAnalytics'

// In your AppDelegate.swift
import TrusanityAnalytics

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    TrusanityAnalytics.shared.configure(projectId: "${newestKey}")
    return true
}`;

    const generateUnitySnippet = () => `// Attach TrusanityAnalytics.cs to a persistent GameObject (e.g. GameManager)
// In the Unity Editor Inspector for that GameObject:
// 1. Locate the 'Project Id' field under 'Configuration'
// 2. Paste your Key: ${newestKey}`;

    const generateReactNativeSnippet = () => `// Install via npm or yarn
npm install @trusanity/sdk-react-native

// In your App.tsx or index.js
import { init, track } from '@trusanity/sdk-react-native';

init({ 
    projectId: '${newestKey}',
    autoTrackSessions: true 
});`;


    const CodeBlock = ({ id, code, language = 'html' }: { id: string, code: string, language?: string }) => (
        <div className="relative group rounded-xl bg-bg-base border border-border/50 overflow-hidden shadow-inner my-4">
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => handleCopy(code, id)}
                    className="p-2 bg-surface-muted hover:bg-surface-hover rounded-md border border-border/50 transition-colors backdrop-blur-sm shadow-sm"
                >
                    {copiedStates[id] ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-text-muted" />}
                </button>
            </div>
            <pre className="p-4 pt-8 text-sm font-mono text-blue-400 overflow-x-auto">
                <code className="language-js block">{code}</code>
            </pre>
            <div className="absolute top-0 left-0 px-4 py-1 text-xs font-mono text-text-muted bg-surface-muted rounded-br-lg border-b border-r border-border/50">
                {language}
            </div>
        </div>
    );

    return (
        <div className="space-y-12 animate-fade-in pb-24 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-brand tracking-tight mb-2">API Documentation</h1>
                <p className="text-text-muted text-lg">Integrate the Trusanity SDK to start capturing millions of automated behavioral events in real-time.</p>
            </div>

            {/* Platform Selector Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {platforms.map((p) => {
                    const Icon = p.icon;
                    const isActive = activeTab === p.id;
                    return (
                        <button
                            key={p.id}
                            onClick={() => setActiveTab(p.id as Platform)}
                            className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-200 ${isActive ? 'bg-brand-500/10 border-brand-500/50 shadow-lg shadow-brand-500/10' : 'bg-bg-surface border-border hover:border-brand-500/30 hover:bg-surface-muted'}`}
                        >
                            <div className={`p-3 rounded-full mb-3 ${isActive ? 'bg-brand-500 text-white' : 'bg-bg-elevated text-text-muted'}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={`font-bold ${isActive ? 'text-brand-500' : 'text-text-primary'}`}>{p.label}</span>
                            <span className="text-xs text-text-muted mt-1 text-center">{p.desc}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="glass rounded-2xl p-8 border border-border/50 shadow-sm relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        {/* 1. Installation Instructions */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/20 text-brand-500 font-bold font-mono">1</span>
                                <h2 className="text-2xl font-bold">Install SDK</h2>
                            </div>

                            {activeTab === 'html' && (
                                <>
                                    <p className="text-text-muted text-sm max-w-2xl mb-4">
                                        For standard HTML websites or traditional CMS platforms, place the following script directly before the closing <code>&lt;/head&gt;</code> tag of your global template.
                                    </p>
                                    <CodeBlock id="install-html" code={generateHtmlSnippet()} language="html" />
                                </>
                            )}

                            {activeTab === 'react' && (
                                <>
                                    <p className="text-text-muted text-sm max-w-2xl mb-4">
                                        For Next.js applications, use the optimized <code>next/script</code> component in your root <code>layout.tsx</code> or <code>_app.tsx</code>. Ensure the strategy is set to <code>afterInteractive</code>.
                                    </p>
                                    <CodeBlock id="install-react" code={generateReactSnippet()} language="tsx" />
                                </>
                            )}

                            {activeTab === 'shopify' && (
                                <>
                                    <p className="text-text-muted text-sm max-w-2xl mb-4">
                                        Navigate to your Shopify Admin Dashboard. Go to <strong>Online Store &gt; Themes &gt; Actions &gt; Edit Code</strong>. Find <code>theme.liquid</code> and paste this before the <code>&lt;/head&gt;</code> tag.
                                    </p>
                                    <CodeBlock id="install-shopify" code={generateShopifySnippet()} language="liquid" />
                                    <div className="mt-4 p-4 bg-accent-500/10 border border-accent-500/20 rounded-lg flex gap-3 text-sm text-accent-700 dark:text-accent-300">
                                        <Layers className="w-5 h-5 flex-shrink-0" />
                                        <p><strong>Note:</strong> Trusanity automatically detects Shopify variants and carts via our specialized SDK logic! No extra configuration is needed for standard Pageviews.</p>
                                    </div>
                                </>
                            )}

                            {activeTab === 'magento' && (
                                <>
                                    <p className="text-text-muted text-sm max-w-2xl mb-4">
                                        For Magento 2 instances, it is highly recommended to inject the SDK via a child theme. Navigate to <code>app/design/frontend/Vendor/Theme/Magento_Theme/layout/default_head_blocks.xml</code>.
                                    </p>
                                    <CodeBlock id="install-magento" code={generateHtmlSnippet()} language="html" />
                                    <p className="text-xs text-text-muted mt-2">Alternatively, you can just paste the standard script into the "HTML Head" configuration in the Magento Admin Panel.</p>
                                </>
                            )}
                            {activeTab === 'wordpress' && (
                                <>
                                    <p className="text-text-muted text-sm max-w-2xl mb-4">
                                        For WordPress sites, you don't need to write any code. Simply install our official Plugin and provide your API Key through the WP Admin interface.
                                    </p>
                                    <CodeBlock id="install-wp" code={generateWordpressSnippet()} language="text" />
                                </>
                            )}

                            {activeTab === 'woocommerce' && (
                                <>
                                    <p className="text-text-muted text-sm max-w-2xl mb-4">
                                        The Trusanity WordPress Plugin ships with native WooCommerce support. By installing the plugin, you automatically get E-Commerce tracking!
                                    </p>
                                    <CodeBlock id="install-woo" code={generateWoocommerceSnippet()} language="text" />
                                </>
                            )}

                            {activeTab === 'reactnative' && (
                                <>
                                    <p className="text-text-muted text-sm max-w-2xl mb-4">
                                        Integrate the Trusanity React Native SDK via npm. It handles offline caching via AsyncStorage and automatic AppState session lifecycle tracking.
                                    </p>
                                    <CodeBlock id="install-rn" code={generateReactNativeSnippet()} language="typescript" />
                                </>
                            )}

                            {activeTab === 'android' && (
                                <>
                                    <p className="text-text-muted text-sm max-w-2xl mb-4">
                                        Integrate the Trusanity Android SDK into your Native Kotlin/Java application. It supports SQLite-backed offline caching and automatic Activity lifecycle tracking.
                                    </p>
                                    <CodeBlock id="install-android" code={generateAndroidSnippet()} language="kotlin" />
                                </>
                            )}

                            {activeTab === 'ios' && (
                                <>
                                    <p className="text-text-muted text-sm max-w-2xl mb-4">
                                        Integrate the Trusanity iOS SDK using CocoaPods. It utilizes UserDefaults for persistent queues and hooks into NotificationCenter for session lifecycle.
                                    </p>
                                    <CodeBlock id="install-ios" code={generateIosSnippet()} language="swift" />
                                </>
                            )}

                            {activeTab === 'unity' && (
                                <>
                                    <p className="text-text-muted text-sm max-w-2xl mb-4">
                                        For C# game development, use our Unity package. Attach the <code>TrusanityAnalytics</code> script to a persistent GameManager and configure your Project ID in the Inspector.
                                    </p>
                                    <CodeBlock id="install-unity" code={generateUnitySnippet()} language="csharp" />
                                </>
                            )}
                        </section>

                        <div className="h-px w-full bg-border/50" />

                        {/* 2. Custom Events */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/20 text-brand-500 font-bold font-mono">2</span>
                                <h2 className="text-2xl font-bold">Track Custom Events</h2>
                            </div>

                            <p className="text-text-muted text-sm max-w-3xl mb-4">
                                By default, the Trusanity SDK automatically captures Pageviews, Sessions, and generic clicks (Autocapture). If you want to track specific business logic like checkouts or user signups, use the <code>track</code> method.
                            </p>

                            <CodeBlock id="event-tracking" code={generateEventHtml()} language="javascript" />

                            <h3 className="text-lg font-bold mt-8 mb-4">Payload Structure</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border border-border/50 rounded-lg overflow-hidden">
                                    <thead className="bg-surface-muted text-text-muted">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Method</th>
                                            <th className="px-4 py-3 font-semibold">Event Name</th>
                                            <th className="px-4 py-3 font-semibold">Properties (Optional)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50 text-text-primary">
                                        <tr>
                                            <td className="px-4 py-3 font-mono text-emerald-500">'track'</td>
                                            <td className="px-4 py-3 text-brand-400">string</td>
                                            <td className="px-4 py-3 font-mono text-xs max-w-xs">{`{ [key: string]: string | number | boolean }`}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </motion.div>
                </AnimatePresence>
            </div>

        </div>
    );
}
