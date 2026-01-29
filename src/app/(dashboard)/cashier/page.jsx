'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useCartStore } from '../../store/cartStore';
import { CATEGORY_ICONS, getIconByName } from '../../constants/iconMap';
import toast from 'react-hot-toast';
import { useRef } from 'react'
import { Plus, Minus, Trash2, ShoppingCart, X, Tag } from 'lucide-react';

export default function CashierPage() {
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [itemNote, setItemNote] = useState('');
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paidAmount, setPaidAmount] = useState('');
    const [showCheckout, setShowCheckout] = useState(false);
    const [transactionDetail, setTransactionDetail] = useState(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const printRef = useRef(null)

    const {
        items,
        orderType,
        tableNumber,
        customerName,
        note,
        setNote,
        addItem,
        removeItem,
        updateQty,
        setOrderType,
        setTableNumber,
        setCustomerName,
        getTotal,
        clearCart,
    } = useCartStore();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data.data || []);

            if (data.data?.length > 0) {
                selectCategory(data.data[0].id);
            }
        } catch (error) {
            toast.error('Gagal memuat kategori');
        }
    };

    const selectCategory = async (categoryId) => {
        setSelectedCategoryId(categoryId);
        setLoadingProducts(true);

        try {
            const { data } = await api.get(`/api/categories/${categoryId}`);
            setProducts(data.data.products || []);
        } catch (error) {
            toast.error('Gagal memuat produk');
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchTransactionDetail = async (transactionId) => {
        try {
            const { data } = await api.get(`/api/transactions/${transactionId}`);
            setTransactionDetail(data.data);
            setShowTransactionModal(true);
        } catch (error) {
            toast.error('Gagal memuat detail transaksi');
        }
    };

    const handlePrint = () => {
        if (!printRef.current) return;

        const content = printRef.current.innerHTML;
        const win = window.open('', '', 'width=400,height=600');

        win.document.write(`
            <html>
            <head>
                <title>Struk</title>
                <style>
                body { font-family: monospace; padding: 12px; }
                h2 { text-align: center; }
                .line { border-top: 1px dashed #000; margin: 8px 0; }
                </style>
            </head>
            <body>
                <h2>STRUK PEMBAYARAN</h2>
                <div class="line"></div>
                ${content}
                <div class="line"></div>
                <p style="text-align:center">Terima kasih 🙏</p>
            </body>
            </html>`);

        win.document.close();
        win.focus();
        win.print();
        win.close();
    };



    const handleCheckout = async () => {
        // Validasi basic
        if (items.length === 0) {
            toast.error('Keranjang kosong!');
            return;
        }

        if (!customerName || customerName.trim() === '') {
            toast.error('Nama customer harus diisi!');
            return;
        }

        // Validasi untuk dine_in
        if (orderType === 'dine_in') {
            if (!tableNumber || tableNumber.trim() === '') {
                toast.error('Nomor meja harus diisi untuk dine in!');
                return;
            }
        }

        // Validasi untuk cash
        if (paymentMethod === 'cash') {
            if (!paidAmount || paidAmount.trim() === '') {
                toast.error('Jumlah bayar harus diisi!');
                return;
            }
            if (parseFloat(paidAmount) < getTotal()) {
                toast.error('Jumlah bayar kurang!');
                return;
            }
        }

        try {
            const payload = {
                orderType: orderType,
                paymentMethod: paymentMethod,
                customerName: customerName.trim(),
                note: note.trim() || '',
                items: items.map(item => ({
                    productId: parseInt(item.productId),
                    qty: parseInt(item.qty),
                })),
            };
            console.log(payload)

            if (orderType === 'dine_in') {
                payload.tableNumber = parseInt(tableNumber);
            }

            if (paymentMethod === 'cash') {
                payload.paid = parseFloat(paidAmount);
            }

            const { data } = await api.post('/api/transactions', payload);


            // ✅ Handle Midtrans
            if (paymentMethod === 'midtrans') {
                if (!data.snapId) {
                    toast.error('Snap token tidak ditemukan!');
                    return;
                }

                // Cek apakah Snap sudah load
                if (typeof window.snap === 'undefined') {
                    toast.error('Midtrans belum siap. Mohon refresh halaman.');
                    return;
                }

                window.snap.pay(data.snapId, {
                    onSuccess: function (result) {
                        console.log('✅ Payment Success:', result);
                        toast.success('Pembayaran berhasil!');
                        clearCart();
                        setShowCheckout(false);
                        fetchTransactionDetail(data.transactionId)
                    },
                    onPending: function (result) {
                        console.log('⏳ Payment Pending:', result);
                        toast.promise('Anda menutup popup pembayaran');
                    },
                    onError: function (result) {
                        console.error('❌ Payment Error:', result);
                        toast.error('Pembayaran gagal!');
                    },
                    onClose: function () {
                        console.log('🚪 Popup closed');
                        toast.error('Anda menutup popup pembayaran');
                    }
                });
            } else {
                toast.success('Transaksi berhasil!');
                clearCart();
                setPaidAmount('');
                setShowCheckout(false);
                selectCategory(selectedCategoryId)
                fetchTransactionDetail(data.transactionId);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.errors?.[0] ||
                'Transaksi gagal!';
            toast.error(errorMessage);
        }
    };

    const total = getTotal();
    const change = paymentMethod === 'cash' && paidAmount ? parseFloat(paidAmount) - total : 0;

    return (
        <div className="flex gap-4 h-[calc(100vh-8rem)]">
            {/* Left Side - Categories & Products */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Categories */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex gap-2 overflow-x-auto">
                        {categories.map((cat) => {
                            const Icon = getIconByName(cat.icon);

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => selectCategory(cat.id)}
                                    className={`px-6 py-2 rounded-lg whitespace-nowrap font-medium transition-colors flex items-center gap-2
                                        ${selectedCategoryId === cat.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span>{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>


                {/* Products Grid */}
                <div className="flex-1 bg-white p-4 rounded-lg shadow overflow-y-auto">
                    {loadingProducts ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Loading products...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setItemNote('');
                                    }}
                                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden text-left"
                                >
                                    {/* Product Image */}
                                    <div className="relative h-48 bg-gray-200">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <span className="text-sm">No Image</span>
                                            </div>
                                        )}

                                        {/* Stock Badge */}
                                        <div className="absolute top-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${product.stock > 10
                                                    ? 'bg-green-500 text-white'
                                                    : product.stock > 0
                                                        ? 'bg-yellow-500 text-white'
                                                        : 'bg-red-500 text-white'
                                                }`}>
                                                Stock: {product.stock}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-black text-lg mb-1 truncate" title={product.name}>
                                            {product.name}
                                        </h3>

                                        <p className="text-blue-600 font-bold text-xl mb-2">
                                            Rp {Number(product.price).toLocaleString('id-ID')}
                                        </p>

                                        {product.description && (
                                            <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Cart */}
            <div className="w-96 bg-white rounded-lg shadow flex flex-col">
                {/* Header */}
                <div className="p-6 border-b">
                    <h2 className="text-xl text-black font-bold flex items-center gap-2">
                        <ShoppingCart /> Keranjang
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Order Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Tipe Order *</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setOrderType('dine_in')}
                                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${orderType === 'dine_in'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Dine In
                            </button>
                            <button
                                onClick={() => setOrderType('take_away')}
                                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${orderType === 'take_away'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Take Away
                            </button>
                        </div>
                    </div>

                    {/* Table Number (only for dine in) */}
                    {orderType === 'dine_in' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Nomor Meja * <span className="text-red-500">(Required for Dine In)</span>
                            </label>
                            <input
                                type="number"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Contoh: 5"
                                min="1"
                            />
                        </div>
                    )}

                    {/* Customer Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Nama Customer *</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Contoh: Budi"
                        />
                    </div>

                    {/* Cart Items */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Items *</label>
                        {items.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                <ShoppingCart className="mx-auto mb-2" size={40} />
                                <p>Keranjang kosong</p>
                                <p className="text-xs mt-1">Pilih produk untuk memulai</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div key={`${item.productId}-${item.note || ''}`} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                                                {item.note && (
                                                    <p className="text-xs text-gray-600 mt-1">Note: {item.note}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.productId, item.note)}
                                                className="text-red-500 hover:text-red-700 ml-2"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQty(item.productId, item.note, item.qty - 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-black bg-gray-100 rounded hover:bg-gray-200"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center text-black font-medium">{item.qty}</span>
                                                <button
                                                    onClick={() => updateQty(item.productId, item.note, item.qty + 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-black bg-gray-100 rounded hover:bg-gray-200"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <p className="font-semibold text-sm text-gray-900">
                                                Rp {(item.price * item.qty).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Total & Checkout */}
                <div className="border-t p-6">
                    {/* Total */}
                    <div className="flex justify-between items-center text-xl font-bold mb-4">
                        <span className="text-gray-700">Total:</span>
                        <span className="text-blue-600">Rp {total.toLocaleString()}</span>
                    </div>

                    {/* Checkout Button */}
                    {!showCheckout ? (
                        <button
                            onClick={() => setShowCheckout(true)}
                            disabled={items.length === 0}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Checkout
                        </button>
                    ) : (
                        <div className="space-y-4">
                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Metode Pembayaran *</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${paymentMethod === 'cash'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        💵 Cash
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('midtrans')}
                                        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${paymentMethod === 'midtrans'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        💳 Midtrans
                                    </button>
                                </div>
                            </div>

                            {/* Cash Payment Input */}
                            {paymentMethod === 'cash' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">
                                        Jumlah Bayar * <span className="text-red-500">(Min: Rp {total.toLocaleString()})</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Masukkan jumlah bayar"
                                        min={total}
                                    />
                                    {change >= 0 && paidAmount && parseFloat(paidAmount) >= total && (
                                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-700">
                                                💰 Kembalian: <span className="font-bold text-lg">Rp {change.toLocaleString()}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Midtrans Info */}
                            {paymentMethod === 'midtrans' && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        💳 Anda akan diarahkan ke halaman pembayaran Midtrans setelah klik tombol Bayar.
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowCheckout(false);
                                        setPaidAmount('');
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                >
                                    💰 Bayar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Product Note */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">

                        {/* Close */}
                        <div className="flex justify-end mb-2">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Image */}
                        <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                            {selectedProduct.imageUrl ? (
                                <img
                                    src={selectedProduct.imageUrl}
                                    alt={selectedProduct.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">No Image</span>
                            )}
                        </div>

                        {/* Name (left) & Price (right) */}
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                                {selectedProduct.name}
                            </h3>
                            <p className="text-lg font-bold text-blue-600">
                                Rp {Number(selectedProduct.price).toLocaleString()}
                            </p>
                        </div>

                        {/* Description */}
                        {selectedProduct.description && (
                            <p className="text-sm text-gray-600 mb-4">
                                {selectedProduct.description}
                            </p>
                        )}

                        {/* Note */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Catatan Item (Optional)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Contoh: Tidak pakai cabe, extra keju..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    addItem({
                                        product: selectedProduct,
                                        note: note,
                                    })
                                    setSelectedProduct(null)
                                    setItemNote('')
                                    toast.success(`${selectedProduct.name} ditambahkan!`)
                                }}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                                ➕ Tambah ke Keranjang
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {showTransactionModal && transactionDetail && transactionDetail.paymentStatus === 'paid' && (

                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-xl">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">Detail Transaksi</h2>
                            <button
                                onClick={() => setShowTransactionModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div ref={printRef}>
                            {/* Info */}
                            <div className="space-y-1 text-sm mb-4 text-black">
                                <p><b>ID:</b> #{transactionDetail.id}</p>
                                <p><b>Customer:</b> {transactionDetail.customerName}</p>
                                <p><b>Order:</b> {transactionDetail.orderType}</p>
                                {transactionDetail.tableNumber && (
                                    <p><b>Meja:</b> {transactionDetail.tableNumber}</p>
                                )}
                                <p><b>Pembayaran:</b> {transactionDetail.paymentMethod}</p>
                                <p><b>Status:</b> {transactionDetail.paymentStatus}</p>
                            </div>

                            {/* Items */}
                            <div className="border-t pt-3 mb-3">
                                <h3 className="font-semibold mb-2 text-black">Items</h3>
                                <div className="space-y-2">
                                    {transactionDetail.transactionDetails.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm text-black">
                                            <span>{item.productName} × {item.quantity}</span>
                                            <span>Rp {Number(item.subtotal).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t pt-3 flex justify-between font-bold text-lg text-black">
                                <span>Total</span>
                                <span>Rp {Number(transactionDetail.totalAmount).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handlePrint}
                                className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-black"
                            >
                                🖨 Print Struk
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}