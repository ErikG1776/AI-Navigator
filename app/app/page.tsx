'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { signOutUser } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  const handleSignOut = async () => {
    await signOutUser()
    router.replace('/auth/login')
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm">Loading...</p>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
      <div className="w-full space-y-6 rounded-lg border p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">AI Navigator Dashboard</h1>
        <p className="text-muted-foreground text-sm">Signed in as: {user.email}</p>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    </main>
  )
}
