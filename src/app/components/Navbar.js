'use client';

import { useState, useEffect } from 'react';
import { Menu, Archive, LogOut, X, Search, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';
import api from '../lib/axios';
import toast from 'react-hot-toast';

// Order Archive Modal Component
function OrderArchiveModal({ isOpen, onClose }) {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [orderTypeFilter, setOrderTypeFilter] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        }
    }, [isOpen]);

    useEffect(() => {
        filterOrders();
    }, [searchQuery, orderTypeFilter, orders]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/reports/transaction');
            setOrders(data.data || []);
            setFilteredOrders(data.data || []);
        } catch (error) {
            toast.error('Gagal memuat order archive');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        // Filter by search query (order code or customer name)
        if (searchQuery.trim()) {
            filtered = filtered.filter(order => 
                order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by order type
        if (orderTypeFilter) {
            filtered = filtered.filter(order => order.orderType === orderTypeFilter);
        }

        setFilteredOrders(filtered);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-black">Order Archive</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="p-6 border-b bg-gray-50">
                    <div className="flex gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter the keyword here..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>

                        {/* Order Type Filter */}
                        <select
                            value={orderTypeFilter}
                            onChange={(e) => setOrderTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                        >
                            <option value="">Select type order</option>
                            <option value="dine_in">Dine-in</option>
                            <option value="take_away">Take Away</option>
                        </select>

                        {/* Search Button */}
                        <button
                            onClick={filterOrders}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        <div className="space-y-3">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.orderCode}
                                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <p className="text-gray-500 text-sm">No Order</p>
                                            <p className="font-semibold text-black">{order.orderCode}</p>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                order.orderType === 'dine_in' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                                {order.orderType === 'dine_in' ? 'Dine-in' : 'Take Away'}
                                            </span>
                                            <p className="text-black">{order.customerName}</p>
                                            <p className="text-gray-500 text-sm">No.{order.orderCode.split('# ')[1]}</p>
                                        </div>
                                        <p className="text-sm text-gray-400">{formatDate(order.orderDate)}</p>
                                    </div>

                                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                        <ChevronRight size={20} className="text-gray-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                                <Search size={48} className="text-gray-400" />
                            </div>
                            <p className="text-gray-400">Tidak ada order ditemukan</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Coba ubah pencarian atau filter Anda
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Navbar Component
export default function Navbar({ onToggleSidebar }) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [showArchiveModal, setShowArchiveModal] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <>
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                {/* Left Side - Logo & Menu Toggle */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* Right Side - Order Archive & User */}
                <div className="flex items-center gap-6">
                    {/* Order Archive - Only for Cashier */}
                    {user?.role === 'cashier' && (
                        <button 
                            onClick={() => setShowArchiveModal(true)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <Archive size={20} />
                            <span className="text-sm">Order Archive</span>
                        </button>
                    )}

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold">{user?.username}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Archive Modal */}
            <OrderArchiveModal 
                isOpen={showArchiveModal} 
                onClose={() => setShowArchiveModal(false)} 
            />
        </>
    );
}