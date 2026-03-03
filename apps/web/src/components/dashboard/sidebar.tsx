'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Activity,
    BarChart3,
    Bell,
    ChevronDown,
    Cog,
    FileText,
    BookOpenText,
    Filter,
    Globe,
    LayoutDashboard,
    MousePointerClick,
    Plus,
    Smartphone,
    Users,
    Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navSections = [
    {
        label: 'Overview',
        items: [
            { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
            { href: '/dashboard/realtime', icon: Activity, label: 'Live Stream' },
        ],
    },
    {
        label: 'Analytics',
        items: [
            { href: '/dashboard/analytics', icon: BarChart3, label: 'Traffic & Pages' },
            { href: '/dashboard/funnels', icon: Filter, label: 'Funnel Analysis' },
            { href: '/dashboard/retention', icon: Zap, label: 'Cohort Retention' },
        ],
    },
    {
        label: 'Events & Tools',
        items: [
            { href: '/dashboard/events', icon: MousePointerClick, label: 'Event Explorer' },
            { href: '/dashboard/tagger', icon: Globe, label: 'Visual Tagger' },
            { href: '/dashboard/flags', icon: Cog, label: 'Feature Flags' },
        ],
    },
    {
        label: 'Reports & Alerts',
        items: [
            { href: '/dashboard/reports', icon: FileText, label: 'Scheduled Reports' },
            { href: '/dashboard/alerts', icon: Bell, label: 'Active Alerts' },
        ],
    },
    {
        label: 'Configuration',
        items: [
            { href: '/dashboard/settings', icon: Cog, label: 'Project Settings' },
            { href: '/dashboard/docs', icon: BookOpenText, label: 'API Documentation' },
        ],
    },
]

export function DashboardSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 h-full flex flex-col bg-bg-surface border-r border-border flex-shrink-0">
            {/* Logo + project switcher */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-base mb-3">
                    <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-brand text-2xl tracking-wide gradient-brand-text">trusanity</span>
                </div>

                {/* Project selector */}
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg 
                           bg-bg-elevated hover:bg-bg-overlay transition-colors text-sm border border-border">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                            <Globe className="w-3 h-3 text-brand-400" />
                        </div>
                        <span className="text-text-primary truncate">My Website</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 mt-1 rounded-lg 
                           text-xs text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Add project
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {navSections.map((section) => (
                    <div key={section.label}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2 px-2">
                            {section.label}
                        </p>
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const active = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                                            active
                                                ? 'bg-brand-500/15 text-brand-400 font-medium border border-brand-500/20'
                                                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                                        )}
                                    >
                                        <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-brand-400' : 'text-text-muted')} />
                                        {item.label}
                                        {item.label === 'Real-Time' && (
                                            <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Usage meter */}
            <div className="p-4 border-t border-border">
                <div className="glass rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-text-secondary">Monthly Events</span>
                        <span className="text-xs font-medium text-text-primary">6,241 / 10K</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-overlay overflow-hidden">
                        <div className="h-full rounded-full gradient-brand transition-all" style={{ width: '62%' }} />
                    </div>
                    <p className="text-[10px] text-text-muted mt-1.5">62% used · Free plan</p>
                </div>
            </div>
        </aside>
    )
}
