'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Search, Download, Calendar, Filter, X, FileSpreadsheet, ChevronDown, ChevronUp, Eye } from 'lucide-react';

export default function TransactionPage() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [expandedCustomers, setExpandedCustomers] = useState(new Set());

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [orderType, setOrderType] = useState('');

    // Export states
    const [exportStartDate, setExportStartDate] = useState('');
    const [exportEndDate, setExportEndDate] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);

    // Detail Modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchTransactions();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data.categories || data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (categoryId) params.categoryId = categoryId;
            if (orderType) params.orderType = orderType;

            const { data } = await api.get('/api/reports/transaction', { params });
            
            // Debug: Log response structure
            console.log('API Response:', data);
            console.log('Transactions data:', data.data);
            if (data.data && data.data.length > 0) {
                console.log('First transaction structure:', data.data[0]);
            }
            
            setTransactions(data.data || []);
        } catch (error) {
            toast.error('Gagal memuat transaksi');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactionDetail = async (transactionId) => {
        setLoadingDetail(true);
        try {
            const { data } = await api.get(`/api/transactions/${transactionId}`);
            setSelectedTransaction(data.data);
            setShowDetailModal(true);
        } catch (error) {
            toast.error('Gagal memuat detail transaksi');
            console.error(error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleViewDetail = (transaction) => {
        console.log('=== handleViewDetail called ===');
        console.log('Received transaction:', transaction);
        console.log('Type of transaction:', typeof transaction);
        console.log('Transaction keys:', Object.keys(transaction));
        
        // Cari ID yang valid dari transaction object
        let transactionId = transaction.id || transaction.transactionId || transaction.orderId;
        
        // Jika tidak ada ID, coba extract dari orderCode (format: "ORDR#123" atau "ORDR# 123")
        if (!transactionId && transaction.orderCode) {
            const match = transaction.orderCode.match(/ORDR#\s*(\d+)/);
            if (match && match[1]) {
                transactionId = parseInt(match[1]);
                console.log('Extracted ID from orderCode:', transactionId);
            }
        }
        
        console.log('Final transactionId:', transactionId);
        
        if (!transactionId) {
            toast.error('ID transaksi tidak ditemukan');
            console.error('Transaction object:', transaction);
            return;
        }
        
        fetchTransactionDetail(transactionId);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedTransaction(null);
    };

    // Group transactions by customer name and date
    const groupedTransactions = useMemo(() => {
        const groups = {};
        
        console.log('Grouping transactions:', transactions);
        
        transactions.forEach(transaction => {
            console.log('Processing transaction:', transaction);
            
            const customerName = transaction.customerName || 'Unknown';
            const orderDate = new Date(transaction.orderDate).toDateString();
            const key = `${customerName}_${orderDate}`;
            
            if (!groups[key]) {
                groups[key] = {
                    customerName,
                    orderDate: transaction.orderDate,
                    category: transaction.category,
                    orderType: transaction.orderType,
                    transactions: [],
                    totalCount: 0
                };
            }
            
            // Store the entire transaction object
            groups[key].transactions.push(transaction);
            groups[key].totalCount++;
        });
        
        // Convert to array and sort by date (newest first)
        return Object.values(groups).sort((a, b) => 
            new Date(b.orderDate) - new Date(a.orderDate)
        );
    }, [transactions]);

    const toggleCustomerExpanded = (key) => {
        const newExpanded = new Set(expandedCustomers);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedCustomers(newExpanded);
    };

    const handleSearch = () => {
        fetchTransactions();
        setShowFilters(false);
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setCategoryId('');
        setOrderType('');
        setTimeout(() => {
            fetchTransactions();
        }, 100);
    };

    const handleExport = async () => {
        if (!exportStartDate || !exportEndDate) {
            toast.error('Start Date dan End Date wajib diisi!');
            return;
        }

        try {
            const response = await api.get('/api/reports/export', {
                params: {
                    startDate: exportStartDate,
                    endDate: exportEndDate
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_${exportStartDate}_to_${exportEndDate}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Excel berhasil didownload!');
            setShowExportModal(false);
            setExportStartDate('');
            setExportEndDate('');
        } catch (error) {
            toast.error('Gagal export Excel');
            console.error(error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getOrderTypeBadge = (type) => {
        if (type === 'dine_in') {
            return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Dine In</span>;
        }
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Take Away</span>;
    };

    const getPaymentStatusBadge = (status) => {
        if (status === 'paid') {
            return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Paid</span>;
        } else if (status === 'pending') {
            return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Pending</span>;
        }
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Failed</span>;
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-black">Transaction History</h1>
                
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Filter size={18} />
                        Filter
                    </button>

                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download size={18} />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-black">Filter Transaksi</h2>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-black">
                                <Calendar size={16} className="inline mr-1" />
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-black">
                                <Calendar size={16} className="inline mr-1" />
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-black">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Order Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-black">Order Type</label>
                            <select
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="dine_in">Dine In</option>
                                <option value="take_away">Take Away</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleSearch}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Search size={18} />
                            Search
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {/* Active Filters Display */}
            {(startDate || endDate || categoryId || orderType) && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-blue-900">Active Filters:</span>
                        {startDate && (
                            <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                                From: {startDate}
                            </span>
                        )}
                        {endDate && (
                            <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                                To: {endDate}
                            </span>
                        )}
                        {categoryId && (
                            <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                                Category: {categories.find(c => c.id === parseInt(categoryId))?.name}
                            </span>
                        )}
                        {orderType && (
                            <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                                Type: {orderType === 'dine_in' ? 'Dine In' : 'Take Away'}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Grouped Transactions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">No</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer Name</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Order Date</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Category</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Order Type</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Transactions</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedTransactions.map((group, index) => {
                                        const groupKey = `${group.customerName}_${new Date(group.orderDate).toDateString()}`;
                                        const isExpanded = expandedCustomers.has(groupKey);

                                        return (
                                            <React.Fragment key={groupKey}>
                                                {/* Main Row - Grouped */}
                                                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6 text-gray-600">{index + 1}</td>
                                                    <td className="py-4 px-6 text-black font-medium">
                                                        {group.customerName}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600 text-sm">
                                                        {formatDateOnly(group.orderDate)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold capitalize">
                                                            {group.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {getOrderTypeBadge(group.orderType)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                                            {group.totalCount} order{group.totalCount > 1 ? 's' : ''}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <button
                                                            onClick={() => toggleCustomerExpanded(groupKey)}
                                                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                                                        >
                                                            {isExpanded ? (
                                                                <>
                                                                    <ChevronUp size={16} />
                                                                    Hide
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown size={16} />
                                                                    Details
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Details */}
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan="7" className="bg-gray-50 p-0">
                                                            <div className="p-4">
                                                                <table className="w-full">
                                                                    <thead className="bg-white">
                                                                        <tr>
                                                                            <th className="text-left py-2 px-4 text-xs font-semibold text-gray-600">Order Code</th>
                                                                            <th className="text-left py-2 px-4 text-xs font-semibold text-gray-600">Time</th>
                                                                            <th className="text-left py-2 px-4 text-xs font-semibold text-gray-600">Detail</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {group.transactions.map((transaction, txIndex) => {
                                                                            // Debug full transaction object
                                                                            console.log(`Transaction ${txIndex}:`, transaction);
                                                                            
                                                                            // Handle case where transaction might be undefined or null
                                                                            if (!transaction) {
                                                                                console.warn('Empty transaction at index:', txIndex);
                                                                                return null;
                                                                            }
                                                                            
                                                                            return (
                                                                                <tr key={`${groupKey}-${txIndex}`} className="border-t border-gray-200">
                                                                                    <td className="py-2 px-4">
                                                                                        <span className="font-semibold text-blue-600 text-sm">
                                                                                            {transaction.orderCode || 'N/A'}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="py-2 px-4 text-gray-600 text-sm">
                                                                                        {transaction.orderDate ? formatDate(transaction.orderDate) : 'N/A'}
                                                                                    </td>
                                                                                    <td className="py-2 px-4">
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                console.log('Button clicked, transaction:', transaction);
                                                                                                handleViewDetail(transaction);
                                                                                            }}
                                                                                            disabled={loadingDetail}
                                                                                            className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-xs disabled:opacity-50"
                                                                                        >
                                                                                            <Eye size={14} />
                                                                                            View
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {groupedTransactions.length === 0 && (
                            <div className="text-center py-12">
                                <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                                    <Search size={48} className="text-gray-400" />
                                </div>
                                <p className="text-gray-400">Tidak ada transaksi ditemukan</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Coba ubah filter pencarian Anda
                                </p>
                            </div>
                        )}

                        {/* Summary Footer */}
                        {groupedTransactions.length > 0 && (
                            <div className="bg-gray-50 px-6 py-4 border-t">
                                <p className="text-sm text-gray-600">
                                    Total: <span className="font-bold text-black">{groupedTransactions.length}</span> customer groups
                                    <span className="mx-2">|</span>
                                    <span className="font-bold text-black">{transactions.length}</span> total transactions
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        {/* Modal Header */}
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileSpreadsheet size={24} className="text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-black">Export to Excel</h2>
                            </div>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Pilih range tanggal untuk export data transaksi ke Excel
                            </p>

                            {/* Start Date */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-black">
                                    <Calendar size={16} className="inline mr-1" />
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    value={exportStartDate}
                                    onChange={(e) => setExportStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            {/* End Date */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-black">
                                    <Calendar size={16} className="inline mr-1" />
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    value={exportEndDate}
                                    onChange={(e) => setExportEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-800">
                                    <strong>Info:</strong> File Excel akan berisi semua transaksi dalam periode yang dipilih
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t flex gap-3">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Detail Modal */}
            {showDetailModal && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-black">Transaction Detail</h2>
                            <button
                                onClick={closeDetailModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Transaction Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Order Date</p>
                                        <p className="text-sm font-medium text-black">
                                            {formatDate(selectedTransaction.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                                        <p className="text-sm font-medium text-black">{selectedTransaction.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Order Type</p>
                                        <div>{getOrderTypeBadge(selectedTransaction.orderType)}</div>
                                    </div>
                                    {selectedTransaction.tableNumber && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Table Number</p>
                                            <p className="text-sm font-medium text-black">Meja {selectedTransaction.tableNumber}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                        <p className="text-sm font-medium text-black capitalize">
                                            {selectedTransaction.paymentMethod}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                                        <div>{getPaymentStatusBadge(selectedTransaction.paymentStatus)}</div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Cashier</p>
                                        <p className="text-sm font-medium text-black">{selectedTransaction.user?.username || '-'}</p>
                                    </div>
                                </div>
                                {/* {selectedTransaction.note && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Note</p>
                                        <p className="text-sm text-black">{selectedTransaction.note}</p>
                                    </div>
                                )} */}
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-black mb-4">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedTransaction.transactionDetails?.map((detail) => (
                                        <div
                                            key={detail.id}
                                            className="bg-white border border-gray-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-black">{detail.productName}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {detail.quantity} x {formatCurrency(detail.price)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-black">
                                                        {formatCurrency(detail.subtotal)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                                <div className="flex items-center justify-between text-lg">
                                    <span className="font-bold text-black">Total</span>
                                    <span className="font-bold text-black text-xl">
                                        {formatCurrency(selectedTransaction.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}