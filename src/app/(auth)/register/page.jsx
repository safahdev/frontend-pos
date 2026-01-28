'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRegister = async (e) => {
        e.preventDefault()
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Password tidak sama!')
            return
        }
        
        if (formData.password < 6) {
            toast.error('Password tidak sama!')
            return
        }
        
        setLoading(true)
        
        try {
            await new Promise(resolve => setTimeout(resolve, 400))
            const urlEncoded = new URLSearchParams()
            urlEncoded.append('username', formData.username)
            urlEncoded.append('email', formData.email)
            urlEncoded.append('password', formData.password)
            urlEncoded.append('confirmPassword', formData.confirmPassword)

            await api.post('/api/auth/register', urlEncoded)

            toast.success('Login berhasil!')
            setTimeout(() => router.push('/login'), 2000)
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
                        <p className="text-black">Register akun Anda</p>
                    </div>

                    <form onSubmit={handleRegister}>
                        <div className="mb-4">
                            <label className="mb-2 block text-black">Username</label>
                            <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full rounded-lg border border-gray-300  text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Masukkan username" required />
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-black">Email</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full rounded-lg border border-gray-300  text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Masukkan Email" required />
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-black">Password</label>
                            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full rounded-lg border border-gray-300  text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Masukkan password minimal 6 karakter" required />
                        </div>

                        <div className="mb-6">
                            <label className="mb-2 block text-gray-700">Confirm Password</label>
                            <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full rounded-lg border border-gray-300  text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ketik ulang password" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700">{loading ? 'loading...' : 'Register'}</button>
                    </form>

                    <p className="text-center mt-6 text-gray-600">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                            Login dulu!
                        </Link>
                    </p>

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