'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 400))
            const formData = new URLSearchParams()
            formData.append('email', email)

            await api.post('/api/auth/forgot-password', formData)

            toast.success('OTP berhasil dikirim ke email Anda!')
            setTimeout(() => router.push('/reset-password'), 2000)
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
                        <p className="text-black">Lupa Password akun Anda?</p>
                    </div>

                    <form onSubmit={handleForgotPassword}>
                        <div className="mb-4">
                            <label className="mb-2 block text-black">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value )}
                                className="w-full rounded-lg border border-gray-300  text-black px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Masukkan Email" required />
                        </div>
                       
                        <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700">{loading ? 'loading...' : 'Send Email'}</button>
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