'use client'

import { Bell, Search, ShieldAlert, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { ThemeToggle } from '../theme-toggle'

export function AdminHeader() {
    const { data: session } = useSession()
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    const initial = session?.user?.name?.charAt(0).toUpperCase()
        || session?.user?.email?.charAt(0).toUpperCase()
        || 'S'

    return (
        <header className="h-16 bg-bg-surface/80 backdrop-blur-xl border-b border-border px-8 flex items-center justify-between flex-shrink-0 z-40 sticky top-0">
            {/* Left: Global Search */}
            <div className="flex items-center flex-1">
                <div className="relative w-96 hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-brand-500" />
                    <input
                        type="text"
                        placeholder="Search tenants, users, or API keys..."
                        className="w-full h-10 pl-10 pr-4 bg-bg-elevated/50 border border-border rounded-xl text-sm 
                                 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50
                                 transition-all placeholder:text-text-muted"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] bg-bg-base border border-border font-mono text-text-muted">⌘K</kbd>
                </div>
            </div>

            {/* Right: Controls & Profile */}
            <div className="flex items-center gap-4">
                {/* System Alerts */}
                <button className="relative w-10 h-10 rounded-xl hover:bg-bg-elevated flex items-center justify-center text-text-muted transition-all group">
                    <ShieldAlert className="w-5 h-5 group-hover:text-amber-500 transition-colors" />
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                </button>

                {/* Standard Notifications */}
                <button className="relative w-10 h-10 rounded-xl hover:bg-bg-elevated flex items-center justify-center text-text-muted transition-all group">
                    <Bell className="w-5 h-5 group-hover:text-text-primary transition-colors" />
                </button>

                <ThemeToggle />

                <div className="w-px h-6 bg-border mx-2" />

                {/* Profile Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-bg-elevated transition-colors border border-transparent hover:border-border/50"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-brand-500/20">
                            {initial}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-medium leading-none text-text-primary">
                                {session?.user?.name || 'Administrator'}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-brand-500 mt-0.5">
                                Super Admin
                            </p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ml-1 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-56 p-1 rounded-2xl glass border border-border shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                            <div className="px-3 py-3 border-b border-border/50 mb-1">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    System Access
                                </p>
                                <p className="text-xs text-text-muted truncate mt-0.5">
                                    {session?.user?.email || ''}
                                </p>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="w-full text-left px-3 py-2 flex items-center gap-2 text-sm text-red-500 font-medium hover:bg-red-500/10 rounded-xl transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out of Platform
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
