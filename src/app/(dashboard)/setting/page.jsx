'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { User, Lock, Mail, Shield, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Password form states
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const { data } = await api.get('/api/auth/me');
            setUserInfo(data.user);
        } catch (error) {
            toast.error('Gagal memuat informasi user');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        // Validation
        if (!newPassword || !confirmPassword) {
            toast.error('Password baru dan konfirmasi wajib diisi!');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password baru minimal 6 karakter!');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Password baru dan konfirmasi tidak cocok!');
            return;
        }

        setUpdatingPassword(true);

        try {
            await api.post('/api/auth/update-password', {
                email: userInfo?.email,
                password: newPassword
            });

            toast.success('Password berhasil diubah!');
            
            // Reset form
            setNewPassword('');
            setConfirmPassword('');
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengubah password');
            console.error(error);
        } finally {
            setUpdatingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-black mb-8">Settings</h1>

            {/* Account Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-black mb-6">Account</h2>

                {/* Profile Avatar */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Profile Picture</p>
                        <p className="text-xs text-gray-400 mt-1">Avatar automatically generated from username</p>
                    </div>
                </div>

                {/* User Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                            <Mail size={16} className="inline mr-1" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={userInfo?.email || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 text-gray-600 bg-gray-50 rounded-lg cursor-not-allowed"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                            <User size={16} className="inline mr-1" />
                            Username
                        </label>
                        <input
                            type="text"
                            value={userInfo?.username || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 text-gray-600 bg-gray-50 rounded-lg cursor-not-allowed"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                            <Shield size={16} className="inline mr-1" />
                            Role
                        </label>
                        <input
                            type="text"
                            value={userInfo?.role || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 text-gray-600 bg-gray-50 rounded-lg cursor-not-allowed capitalize"
                        />
                    </div>
                </div>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-black mb-6">Password</h2>

                <div className="max-w-md">
                    {/* New Password */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-black">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter new password (min. 6 characters)"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 text-black">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Re-enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handlePasswordUpdate}
                        disabled={updatingPassword}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        <Lock size={18} />
                        {updatingPassword ? 'Updating...' : 'Change Password'}
                    </button>
                </div>
            </div>
        </div>
    );
}