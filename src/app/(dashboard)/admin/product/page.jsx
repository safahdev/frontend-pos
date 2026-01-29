'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import { Trash2, Plus, Upload, X, Edit2, Eye } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [detailProduct, setDetailProduct] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/api/categories');
            const allProducts = [];

            // Loop semua category & inject category info ke product
            for (const cat of (data.data || data.categories || [])) {
                try {
                    const res = await api.get(`/api/categories/${cat.id}`);
                    const products = res.data.data?.products || [];

                    // Inject category info ke setiap product
                    const productsWithCategory = products.map(p => ({
                        ...p,
                        categoryId: cat.id,
                        categoryName: cat.name,
                        categoryIcon: cat.icon,
                    }));

                    allProducts.push(...productsWithCategory);
                } catch (err) {
                    console.error(`Error fetching products for category ${cat.id}:`, err);
                }
            }

            setProducts(allProducts);
        } catch (error) {
            toast.error('Gagal memuat produk');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data.categories || data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('Nama produk wajib diisi!');
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            toast.error('Harga harus lebih dari 0!');
            return;
        }
        if (!categoryId) {
            toast.error('Kategori wajib dipilih!');
            return;
        }
        if (!stock || parseInt(stock) < 0) {
            toast.error('Stock tidak valid!');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('price', price);
            formData.append('categoryId', categoryId);
            formData.append('description', description.trim() || '');
            formData.append('stock', stock);

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (isEdit) {
                await api.put(`/api/products/${selectedProduct.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Produk berhasil diupdate!');
            } else {
                await api.post('/api/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Produk berhasil ditambahkan!');
            }

            fetchProducts();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/api/products/${deleteId}`);
            toast.success('Produk berhasil dihapus!');
            fetchProducts();

            if (selectedProduct?.id === deleteId) {
                resetForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus produk');
        } finally {
            setDeleteId(null);
        }
    };

    const handleEdit = async (product) => {
        setSelectedProduct(product);
        setName(product.name);
        setPrice(product.price.toString());
        setCategoryId(product.categoryId || '');
        setDescription(product.description || '');
        setStock(product.stock.toString());
        setImagePreview(product.imageUrl || null);
        setImageFile(null);
        setIsEdit(true);
        setShowForm(true);
    };

    const handleViewDetail = (product) => {
        setDetailProduct(product);
    };

    const resetForm = () => {
        setSelectedProduct(null);
        setName('');
        setPrice('');
        setCategoryId('');
        setDescription('');
        setStock('');
        setImageFile(null);
        setImagePreview(null);
        setIsEdit(false);
        setShowForm(false);
    };

    const openNewProductForm = () => {
        resetForm();
        setShowForm(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-black">Kelola Produk</h1>
                <button
                    onClick={openNewProductForm}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Tambah Produk
                </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
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
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    product.stock > 10 
                                        ? 'bg-green-500 text-white' 
                                        : product.stock > 0 
                                        ? 'bg-yellow-500 text-white' 
                                        : 'bg-red-500 text-white'
                                }`}>
                                    Stock: {product.stock}
                                </span>
                            </div>

                            {/* Action Buttons - Show on Hover */}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleViewDetail(product)}
                                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg"
                                    title="Detail"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg"
                                    title="Hapus"
                                >
                                    <Trash2 size={16} />
                                </button>
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

                            <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                                {product.description || 'Tidak ada deskripsi'}
                            </p>

                            <div className="flex items-center justify-between">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {product.categoryName || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full text-center py-16">
                        <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                            <Plus size={64} className="text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-lg">Belum ada produk</p>
                        <button
                            onClick={openNewProductForm}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Tambah Produk Pertama
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Product Modal */}
            {detailProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold text-black">Detail Produk</h2>
                            <button
                                onClick={() => setDetailProduct(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left: Image */}
                                <div>
                                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                        {detailProduct.imageUrl ? (
                                            <img
                                                src={detailProduct.imageUrl}
                                                alt={detailProduct.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <span>No Image</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Details */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-black mb-2">
                                            {detailProduct.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                {detailProduct.categoryName || 'Unknown'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                detailProduct.stock > 10 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : detailProduct.stock > 0 
                                                    ? 'bg-yellow-100 text-yellow-700' 
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                Stock: {detailProduct.stock}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-3xl font-bold text-blue-600">
                                            Rp {Number(detailProduct.price).toLocaleString('id-ID')}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-black mb-2">Deskripsi</h4>
                                        <p className="text-gray-600 leading-relaxed">
                                            {detailProduct.description || 'Tidak ada deskripsi untuk produk ini.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="border-t p-6">
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setDetailProduct(null);
                                        handleEdit(detailProduct);
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Edit Produk
                                </button>
                                <button
                                    onClick={() => setDetailProduct(null)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Modal/Sidebar */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold text-black">
                                {isEdit ? 'Edit Product' : 'Tambah Product'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Image Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-black">Gambar Produk</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setImageFile(null);
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                            <p className="text-sm text-gray-600">Klik untuk upload gambar</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="imageUpload"
                                    />
                                    <label
                                        htmlFor="imageUpload"
                                        className="mt-2 inline-block px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm"
                                    >
                                        {imagePreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                                    </label>
                                </div>
                            </div>

                            {/* Name Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-black">Nama Produk *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Contoh: Nasi Goreng"
                                />
                            </div>

                            {/* Category Select */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-black">Kategori *</label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-black">Harga *</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Contoh: 15000"
                                    min="0"
                                />
                            </div>

                            {/* Stock Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-black">Stock *</label>
                                <input
                                    type="number"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Contoh: 10"
                                    min="0"
                                />
                            </div>

                            {/* Description Textarea */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-black">Deskripsi (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Deskripsi produk..."
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="border-t p-6">
                            <div className="flex gap-2">
                                <button
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    {isEdit ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h2 className="text-lg font-semibold mb-2 text-black">
                            Hapus Produk?
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Produk ini akan dihapus permanen. Yakin?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-black"
                            >
                                Tidak
                            </button>

                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}