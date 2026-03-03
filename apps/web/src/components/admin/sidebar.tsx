'use client'

import { Activity, BarChart3, Building2, CreditCard, Key, Settings, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Organizations', href: '/admin/tenants', icon: Building2 },
    { name: 'Global Billing', href: '/admin/billing', icon: CreditCard },
    { name: 'System Health', href: '/admin/health', icon: Activity },
    { name: 'Platform API Keys', href: '/admin/keys', icon: Key },
    { name: 'Global Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-bg-surface border-r border-border h-full flex flex-col flex-shrink-0 transition-all duration-300">
            {/* Brand Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <span className="text-white font-bold text-lg leading-none">N</span>
                    </div>
                    <div>
                        <span className="font-brand text-2xl text-text-primary tracking-wide">trusanity</span>
                        <span className="text-text-muted font-mono text-[10px] uppercase ml-1 block leading-none">Platform</span>
                    </div>
                </div>
            </div>

            {/* Navigation Menus */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                <div>
                    <h3 className="px-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                        Operations
                    </h3>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                        ${isActive
                                            ? 'bg-brand-500/10 text-brand-500 shadow-sm'
                                            : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                                        }`}
                                >
                                    <item.icon
                                        className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 
                                        ${isActive ? 'text-brand-500' : 'text-text-muted group-hover:text-text-primary'}`}
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-border/50">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-xl transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Tenant App</span>
                </Link>
            </div>
        </aside>
    )
}
