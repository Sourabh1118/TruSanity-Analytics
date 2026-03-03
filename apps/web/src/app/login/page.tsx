'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart3, Eye, EyeOff, Github, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ email: '', password: '' })

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const result = await signIn('credentials', {
            email: form.email,
            password: form.password,
            redirect: false,
        })

        if (result?.error) {
            setLoading(false)
            alert("Invalid credentials") // Simple error handling for MVP
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full orb"
                    style={{ background: 'radial-gradient(circle, oklch(0.57 0.26 264 / 0.2), transparent 70%)' }} />
                <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full orb orb-delay-2"
                    style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 198 / 0.15), transparent 70%)' }} />
                <div className="absolute inset-0 bg-grid opacity-[0.03]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-6">
                        <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-brand text-3xl gradient-brand-text">trusanity</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-text-primary mt-4">Welcome back</h1>
                    <p className="text-text-muted text-sm mt-1">Sign in to your workspace</p>
                </div>

                <div className="glass-strong rounded-2xl p-8 border border-border">
                    {/* OAuth */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 glass border border-border 
                               rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary 
                               hover:bg-bg-elevated transition-all">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 glass border border-border 
                               rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary 
                               hover:bg-bg-elevated transition-all">
                            <Github className="w-4 h-4" />
                            GitHub
                        </button>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-text-muted">or continue with email</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="you@company.com"
                                className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border 
                           text-text-primary placeholder:text-text-muted text-sm
                           focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30
                           transition-all"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-sm font-medium text-text-secondary">Password</label>
                                <Link href="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 pr-11 rounded-xl bg-bg-elevated border border-border 
                             text-text-primary placeholder:text-text-muted text-sm
                             focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30
                             transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl gradient-brand text-white font-semibold text-sm
                         hover:opacity-90 disabled:opacity-60 transition-all shadow-surface
                         flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-text-muted mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                            Create one free
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
