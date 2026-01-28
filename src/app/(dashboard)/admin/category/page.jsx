'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';
import { CATEGORY_ICONS, getIconByName } from '../../../constants/iconMap';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('Coffee');
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data.categories || data.data || []);
        } catch (error) {
            toast.error('Gagal memuat kategori');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('Nama kategori wajib diisi!');
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('name', name.trim());
            formData.append('icon', icon);

            if (isEdit) {
                await api.put(`/api/categories/${selectedCategory.id}`, formData, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                toast.success('Kategori berhasil diupdate!');
            } else {
                await api.post('/api/categories', formData, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                toast.success('Kategori berhasil ditambahkan!');
            }

            // Reset form & refresh
            fetchCategories();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan kategori');
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    }

    const confirmDelete = async () => {
        try {
            await api.delete(`/api/categories/${deleteId}`);
            toast.success('Kategori berhasil dihapus!');
            fetchCategories();

            if (selectedCategory?.id === deleteId) {
                resetForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus kategori');
        } finally {
            setDeleteId(null);
        }
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setName(category.name);
        setIcon(category.icon || 'Coffee');
        setIsEdit(true);
    };

    const resetForm = () => {
        setSelectedCategory(null);
        setName('');
        setIcon('Coffee');
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
            {/* LEFT - Category List */}
            <div className="w-64 bg-white p-4 rounded-lg shadow overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg text-black">List Category</h2>
                    <button
                        onClick={resetForm}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        title="Tambah Baru"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="space-y-2">
                    {categories.map((cat) => {
                        const IconComponent = getIconByName(cat.icon);
                        const isSelected = selectedCategory?.id === cat.id;

                        return (
                            <div
                                key={cat.id}
                                onClick={() => handleEdit(cat)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected
                                    ? 'bg-blur border-2 border-blue-500'
                                    : 'hover:bg-gray-100 border-2 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <IconComponent size={18} className="text-gray-700" />
                                    <span className="font-medium text-black">{cat.name}</span>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(cat.id);
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Hapus"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })}

                    {categories.length === 0 && (
                        <p className="text-center text-gray-400 py-8">Belum ada kategori</p>
                    )}
                </div>
            </div>

            {/* CENTER - Preview */}
            <div className="flex-1 bg-white p-6 rounded-lg shadow flex items-center justify-center">
                {selectedCategory ? (
                    <div className="text-center">
                        {(() => {
                            const IconComponent = getIconByName(selectedCategory.icon);
                            return (
                                <div className="inline-block p-6 bg-blue-50 rounded-full mb-4">
                                    <IconComponent size={64} className="text-blue-600" />
                                </div>
                            );
                        })()}
                        <h3 className="text-2xl font-bold mb-2">{selectedCategory.name}</h3>
                        <p className="text-gray-500 text-sm">
                            Icon: <span className="font-mono">{selectedCategory.icon}</span>
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                            <Plus size={64} className="text-gray-400" />
                        </div>
                        <p className="text-gray-400">Pilih kategori untuk edit<br />atau buat baru</p>
                    </div>
                )}
            </div>

            {/* RIGHT - Form */}
            <div className="w-96 bg-white rounded-lg shadow flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-black">
                        {isEdit ? 'Edit Category' : 'Tambah Category'}
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Name Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-black">Nama Category</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Contoh: Makanan, Minuman..."
                        />
                    </div>

                    {/* Icon Picker */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-black">Pilih Icon</label>
                        <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                            {Object.keys(CATEGORY_ICONS).map((iconName) => {
                                const IconComponent = CATEGORY_ICONS[iconName];
                                const isSelected = icon === iconName;

                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => setIcon(iconName)}
                                        className={`p-3 rounded-lg border-2 transition-all ${isSelected
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                            }`}
                                        title={iconName}
                                    >
                                        <IconComponent size={24} className={isSelected ? 'text-blue-600' : 'text-gray-600'} />
                                    </button>
                                );
                            })}
                        </div>
                        {icon && (
                            <p className="text-xs text-gray-500 mt-2">
                                Selected: <span className="font-mono font-semibold">{icon}</span>
                            </p>
                        )}
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

                {deleteId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                            <h2 className="text-lg font-semibold mb-2 text-black">
                                Hapus Kategori?
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Kategori ini akan dihapus permanen. Yakin?
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
        </div>
    );
}