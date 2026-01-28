'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Tags,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Sidebar({ isCollapsed, onToggle }) {
    const pathname = usePathname();
    const { user } = useAuthStore();

    // Menu untuk Admin
    const adminMenus = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Categories', href: '/admin/category', icon: Tags },
        { name: 'Products', href: '/admin/product', icon: Package },
        { name: 'Transactions', href: '/transaction', icon: FileText  },
        { name: 'Settings', href: '/setting', icon: Settings },
    ];

    // Menu untuk Cashier
    const cashierMenus = [
        { name: 'Cashier', href: '/cashier', icon: ShoppingCart },
        { name: 'Transactions', href: '/transaction', icon: FileText },
        { name: 'Settings', href: '/setting', icon: Settings },
    ];

    const menus = user?.role === 'admin' ? adminMenus : cashierMenus;

    return (
        <div
            className={`bg-white border-r border-gray-200 h-screen fixed left-0 top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">POS</h1>
                            <p className="text-xs text-gray-500">System</p>
                        </div>
                    </div>
                )}

                {isCollapsed && (
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
                        <span className="text-white font-bold text-xl">P</span>
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Menu */}
            <nav className="p-4">
                {menus.map((menu) => {
                    const Icon = menu.icon;
                    const isActive = pathname === menu.href;

                    return (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            title={isCollapsed ? menu.name : ''}
                        >
                            <Icon size={20} />
                            {!isCollapsed && <span className="font-medium">{menu.name}</span>}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}