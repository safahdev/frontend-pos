'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({ children }) {
    const { token } = useAuthStore()
    const router = useRouter()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Cek authentication setelah component mount
        if (mounted && !token) {
            router.push('/login');
        }
    }, [mounted, token, router]);

    // Show loading saat belum mount atau belum ada token
    if (!mounted || !token) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <div
                className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'
                    }`}
            >
                {/* Navbar */}
                <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>

            <Toaster position="top-right" />
        </div>
    );
}