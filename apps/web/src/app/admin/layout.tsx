import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export const metadata: Metadata = {
    title: 'Platform Operations | Trusanity Admin',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-bg-base overflow-hidden selection:bg-brand-500/30">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Decorative Background Blob */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

                <AdminHeader />
                <main className="flex-1 overflow-y-auto p-8 lg:p-10 relative z-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
