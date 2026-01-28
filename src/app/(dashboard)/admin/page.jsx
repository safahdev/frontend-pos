'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { ShoppingCart, DollarSign, Package, Grid, X } from 'lucide-react';

export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryDetail, setCategoryDetail] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const { data } = await api.get('/api/reports/dashboard');
            setDashboardData(data.data);
        } catch (error) {
            toast.error('Gagal memuat data dashboard');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = async (categoryId, categoryName) => {
        setSelectedCategory(categoryName);
        setLoadingDetail(true);
        setCategoryDetail([]);

        try {
            const { data } = await api.get(`/api/reports/category/${categoryId}`);
            setCategoryDetail(data.data || []);
        } catch (error) {
            toast.error('Gagal memuat detail kategori');
            console.error(error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const closeModal = () => {
        setSelectedCategory(null);
        setCategoryDetail([]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-black mb-6">Dashboard</h1>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Orders Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <ShoppingCart className="text-blue-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                    <p className="text-3xl font-bold text-black mt-2">
                        {dashboardData?.totalOrders || 0}
                    </p>
                </div>

                {/* Total Omzet Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <DollarSign className="text-green-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Omzet</h3>
                    <p className="text-2xl font-bold text-black mt-2">
                        {dashboardData?.totalOmzet || 'Rp 0'}
                    </p>
                </div>

                {/* Total Items Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Package className="text-purple-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Items</h3>
                    <p className="text-3xl font-bold text-black mt-2">
                        {dashboardData?.totalItems || 0}
                    </p>
                </div>

                {/* Categories Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Grid className="text-orange-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
                    <p className="text-3xl font-bold text-black mt-2">
                        {Object.keys(dashboardData?.categories || {}).length}
                    </p>
                </div>
            </div>

            {/* Categories Detail Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-black mb-4">Categories Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Object.entries(dashboardData?.categories || {}).map(([categoryName, count], index) => {
                        // Generate categoryId dari index atau nama (sesuaikan dengan struktur API Anda)
                        const categoryId = index + 1; // Atau gunakan mapping yang sesuai

                        return (
                            <div
                                key={categoryName}
                                onClick={() => handleCategoryClick(categoryId, categoryName)}
                                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-blue-200 hover:border-blue-400"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-black capitalize text-lg">
                                        {categoryName}
                                    </h3>
                                    <div className="p-2 bg-blue-200 rounded-full">
                                        <Grid size={20} className="text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-blue-600">{count}</p>
                                <p className="text-sm text-gray-600 mt-1">Total Sales</p>
                            </div>
                        );
                    })}
                </div>

                {Object.keys(dashboardData?.categories || {}).length === 0 && (
                    <p className="text-center text-gray-400 py-8">Belum ada data kategori</p>
                )}
            </div>

            {/* Category Detail Modal */}
            {selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold text-black capitalize">
                                Detail: {selectedCategory}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingDetail ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Loading...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    No
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Menu Name
                                                </th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                                    Total Sales
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categoryDetail.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-b border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="py-3 px-4 text-gray-600">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-3 px-4 text-black font-medium">
                                                        {item.menuName}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                                            {item.totalSales}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {categoryDetail.length === 0 && (
                                        <p className="text-center text-gray-400 py-8">
                                            Tidak ada data untuk kategori ini
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t">
                            <button
                                onClick={closeModal}
                                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}