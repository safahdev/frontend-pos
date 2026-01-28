'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import { Trash2, Plus, Upload, X } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

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
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex gap-4 h-[calc(100vh-8rem)]">
            {/* LEFT - Product List */}
            <div className="w-64 bg-white p-4 rounded-lg shadow overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg text-black">List Product</h2>
                    <button
                        onClick={resetForm}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Tambah Product Baru"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="space-y-2">
                    {products.map((product) => {
                        const isSelected = selectedProduct?.id === product.id;

                        return (
                            <div
                                key={product.id}
                                onClick={() => handleEdit(product)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected
                                        ? 'bg-blue-100 border-2 border-blue-500'
                                        : 'hover:bg-gray-100 border-2 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                                            No Img
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-black text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-blue-600 font-semibold">
                                            Rp {Number(product.price).toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {product.categoryName}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(product.id);
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1 ml-2"
                                    title="Hapus"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })}

                    {products.length === 0 && (
                        <p className="text-center text-gray-400 py-8">Belum ada produk</p>
                    )}
                </div>
            </div>

            {/* CENTER - Preview */}
            <div className="flex-1 bg-white p-6 rounded-lg shadow flex items-center justify-center">
                {selectedProduct ? (
                    <div className="text-center max-w-md">
                        <div className="inline-block mb-4">
                            {selectedProduct.imageUrl ? (
                                <img
                                    src={selectedProduct.imageUrl}
                                    alt={selectedProduct.name}
                                    className="w-48 h-48 object-cover rounded-lg shadow-md"
                                />
                            ) : (
                                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-400">No Image</span>
                                </div>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-black">{selectedProduct.name}</h3>
                        <p className="text-blue-600 font-bold text-xl mb-2">
                            Rp {Number(selectedProduct.price).toLocaleString('id-ID')}
                        </p>
                        <p className="text-gray-600 text-sm mb-3">
                            {selectedProduct.description || 'Tidak ada deskripsi'}
                        </p>
                        <div className="flex justify-center gap-4 text-sm">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                                Stock: {selectedProduct.stock}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 rounded-full text-blue-700">
                                {selectedProduct.categoryName || 'Unknown'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                            <Plus size={64} className="text-gray-400" />
                        </div>
                        <p className="text-gray-400">Pilih produk untuk edit<br />atau buat baru</p>
                    </div>
                )}
            </div>

            {/* RIGHT - Form */}
            <div className="w-96 bg-white rounded-lg shadow flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-black">
                        {isEdit ? 'Edit Product' : 'Tambah Product'}
                    </h2>
                </div>

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
                        {isEdit && (
                            <button
                                onClick={resetForm}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Batal
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            {isEdit ? 'Update' : 'Simpan'}
                        </button>
                    </div>
                </div>
            </div>

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