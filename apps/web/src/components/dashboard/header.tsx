'use client'

import { Bell, Calendar, ChevronDown, Search, Settings } from 'lucide-react'

const dateRanges = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom']

export function DashboardHeader() {
    return (
        <header className="h-14 bg-bg-surface border-b border-border px-6 flex items-center justify-between flex-shrink-0">
            {/* Left: breadcrumb / page title */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-text-muted">My Website</span>
                <span className="text-text-muted">/</span>
                <span className="text-text-primary font-medium">Overview</span>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-border 
                           text-sm text-text-muted hover:text-text-secondary transition-all">
                    <Search className="w-4 h-4" />
                    <span className="hidden md:inline">Search...</span>
                    <kbd className="hidden md:inline px-1.5 py-0.5 rounded text-[10px] bg-bg-overlay border border-border font-mono">⌘K</kbd>
                </button>

                {/* Date range picker */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-border 
                           text-sm text-text-secondary hover:text-text-primary transition-all">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    <span>Last 7 days</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Notifications */}
                <button className="relative w-8 h-8 rounded-lg glass border border-border flex items-center 
                           justify-center text-text-muted hover:text-text-secondary transition-all">
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-500" />
                </button>

                {/* User avatar */}
                <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-bg-elevated transition-colors">
                    <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                        S
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>
            </div>
        </header>
    )
}
