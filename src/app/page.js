'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "./store/authStore"

export default function Home() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  
  useEffect(() => {
    if (!token) {
      router.push('/login')
    } else if (user?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/cashier')
    }
  }, [token, user, router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  )
}
