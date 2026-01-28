'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import { Trash2, Plus, Edit2, X } from 'lucide-react';
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
    const [showForm, setShowForm] = useState(false);

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

            fetchCategories();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan kategori');
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

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
        setShowForm(true);
    };

    const resetForm = () => {
        setSelectedCategory(null);
        setName('');
        setIcon('Coffee');
        setIsEdit(false);
        setShowForm(false);
    };

    const openNewForm = () => {
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
                <h1 className="text-2xl font-bold text-black">Kelola Kategori</h1>
                <button
                    onClick={openNewForm}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Tambah Kategori
                </button>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {categories.map((category) => {
                    const IconComponent = getIconByName(category.icon);

                    return (
                        <div
                            key={category.id}
                            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
                        >
                            {/* Icon Display */}
                            <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                                <div className="p-4 bg-white rounded-full shadow-md">
                                    <IconComponent size={40} className="text-blue-600" />
                                </div>

                                {/* Action Buttons - Show on Hover */}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg"
                                        title="Hapus"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Category Info */}
                            <div className="p-4 text-center">
                                <h3 className="font-bold text-black text-lg truncate" title={category.name}>
                                    {category.name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1 font-mono">
                                    {category.icon}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {categories.length === 0 && (
                    <div className="col-span-full text-center py-16">
                        <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                            <Plus size={64} className="text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-lg">Belum ada kategori</p>
                        <button
                            onClick={openNewForm}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Tambah Kategori Pertama
                        </button>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold text-black">
                                {isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
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
                            {/* Name Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-black">Nama Kategori *</label>
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
                                <label className="block text-sm font-medium mb-2 text-black">Pilih Icon *</label>
                                <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
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
    );
}