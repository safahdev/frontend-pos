'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otp: ''
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRegister = async (e) => {
        e.preventDefault()

        if (formData.password.length < 6) {
            toast.error('Password minimal 6 karakter!')
            return
        }

        setLoading(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 400))
            const urlEncoded = new URLSearchParams()
            urlEncoded.append('email', formData.email)
            urlEncoded.append('password', formData.password)
            urlEncoded.append('otp', formData.otp)

            await api.post('/api/auth/reset-password', urlEncoded)

            toast.success('Password berhasil direset!')
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
                        <p className="text-black">Reset Password Anda</p>
                    </div>

                    <form onSubmit={handleRegister}>
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

                        <div className="mb-4">
                            <label className="mb-2 block text-black">OTP</label>
                            <input type="number" value={formData.otp} onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                className="w-full rounded-lg border border-gray-300  text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Masukkan OTP (angka)" required />
                        </div>

                        <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700">{loading ? 'loading...' : 'Reset Password'}</button>
                    </form>

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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}