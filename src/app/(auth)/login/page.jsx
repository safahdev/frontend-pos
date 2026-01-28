'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { setAuth } = useAuthStore()
    const router = useRouter()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 400))

            const formData = new URLSearchParams()
            formData.append('username', username)
            formData.append('password', password)

            const { data } = await api.post('/api/auth/login', formData)

            setAuth(data.user, data.token)
            toast.success('Login berhasil!')

            setTimeout(() => {
                if (data.user.role === 'admin') {
                    router.push('/admin')
                } else {
                    router.push('/cashier')
                }
            }, 500)
        } catch (error) {
            const message =
                error.response?.data?.errors?.[0] ||
                error.response?.data?.message
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen">
            <div className="flex w-full items-center justify-center bg-white md:w-1/2">
                <div className="w-full max-w-md p-10">
                    <div className="mb-8 text-center">
                        <img
                            src="/logo.png"
                            alt="POS System"
                            className="mx-auto mb-4 h-12 w-auto"
                        />
                        <p className="text-black">Login ke akun Anda</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="mb-2 block text-black">Username</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-lg border border-gray-300  text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Masukkan username" required />
                        </div>

                        <div className="mb-6">
                            <label className="mb-2 block text-gray-700">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300  text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Masukkan password" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700">{loading ? 'loading...' : 'Login'}</button>
                    </form>
                    <div className="mt-8 space-y-2 text-sm text-gray-600">
                        <p className="text-center">
                            Belum punya akun?{' '}
                            <Link
                                href="/register"
                                className="font-semibold text-blue-600 hover:underline hover:text-blue-700"
                            >
                                Register dulu!
                            </Link>
                        </p>

                        <p className="text-center">
                            Lupa Password?{' '}
                            <Link
                                href="/forgot-password"
                                className="font-semibold text-blue-600 hover:underline hover:text-blue-700"
                            >
                                Reset di sini
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 rounded-lg bg-gray-50 p-4">
                        <p className="mb-2 text-sm text-gray-600">Demo Account:</p>
                        <p className="text-xs text-gray-500">Admin: admin / password</p>
                        <p className="text-xs text-gray-500">Cashier: cashier2 / Wa1234567@</p>
                    </div>
                </div>
            </div>

            <div className="hidden bg-cover bg-center md:block md:w-1/2"
                style={{
                    backgroundImage: "url('/image-auth.webp')",
                }}
            >
                <div className="h-full w-full bg-black/30"></div>
            </div>
        </div>
    )
}