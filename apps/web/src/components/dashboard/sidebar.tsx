'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Activity, BarChart3, Bell, ChevronDown, Cog, FileText,
    BookOpenText, Filter, Globe, LayoutDashboard, MousePointerClick,
    Smartphone, Users, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { getTenantProjects } from '@/actions/projects'
import CreateProjectModal from './CreateProjectModal'

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
    const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
    const [activeProject, setActiveProject] = useState<{ id: string; name: string } | null>(null)
    const [showProjectList, setShowProjectList] = useState(false)

    const loadProjects = async () => {
        try {
            const all = await getTenantProjects()
            setProjects(all)
            if (all.length > 0 && !activeProject) {
                setActiveProject({ id: all[0].id, name: all[0].name })
            }
        } catch { }
    }

    useEffect(() => { loadProjects() }, [])

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
                <div className="relative">
                    <button
                        onClick={() => setShowProjectList(!showProjectList)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                                   bg-bg-elevated hover:bg-bg-overlay transition-colors text-sm border border-border"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5 h-5 rounded-md bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                                <Globe className="w-3 h-3 text-brand-400" />
                            </div>
                            <span className="text-text-primary truncate">
                                {activeProject?.name ?? (projects.length === 0 ? 'No projects yet' : 'Select project')}
                            </span>
                        </div>
                        <ChevronDown className={cn('w-4 h-4 text-text-muted flex-shrink-0 transition-transform', showProjectList && 'rotate-180')} />
                    </button>

                    {/* Dropdown list */}
                    {showProjectList && projects.length > 0 && (
                        <div className="absolute top-full mt-1 left-0 right-0 z-20 glass border border-border rounded-lg shadow-xl overflow-hidden">
                            {projects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => { setActiveProject(p); setShowProjectList(false); }}
                                    className={cn(
                                        'w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors text-left',
                                        activeProject?.id === p.id
                                            ? 'bg-brand-500/15 text-brand-400'
                                            : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                                    )}
                                >
                                    <Globe className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{p.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add project modal button */}
                <CreateProjectModal onCreated={(id, name) => {
                    setActiveProject({ id, name });
                    loadProjects();
                }} />
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
                                        {item.label === 'Live Stream' && (
                                            <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Usage meter — real project count */}
            <div className="p-4 border-t border-border">
                <div className="glass rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-text-secondary">Projects</span>
                        <span className="text-xs font-medium text-text-primary">{projects.length}</span>
                    </div>
                    <p className="text-[10px] text-text-muted">
                        {projects.length === 0
                            ? 'Add your first project above'
                            : `${projects.length} active tracking project${projects.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
            </div>
        </aside>
    )
}
