'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const handleAuthCallback = useCallback(async () => {
    // Check for code in URL (PKCE flow)
    const code = searchParams.get('code')
    
    if (code) {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          setIsValidSession(true)
          setCheckingSession(false)
          return true
        }
      } catch (e) {
        console.error('Error exchanging code:', e)
      }
    }

    // Check for hash fragments (implicit flow)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')
      
      if (accessToken && type === 'recovery') {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          })
          if (!error) {
            setIsValidSession(true)
            setCheckingSession(false)
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname)
            return true
          }
        } catch (e) {
          console.error('Error setting session from hash:', e)
        }
      }
    }
    
    return false
  }, [searchParams, supabase.auth])

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      // First, listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return
        
        console.log('Auth event:', event, 'Session:', !!session)
        
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setIsValidSession(true)
          setCheckingSession(false)
          setError('')
        }
      })

      // Try to handle auth callback from URL
      const handled = await handleAuthCallback()
      
      if (!handled && isMounted) {
        // Check existing session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setIsValidSession(true)
          setCheckingSession(false)
        } else {
          // Wait a bit more for any pending auth events
          setTimeout(() => {
            if (isMounted && !isValidSession) {
              setError('Invalid or expired reset link. Please request a new password reset.')
              setCheckingSession(false)
            }
          }, 1500)
        }
      }

      return () => {
        subscription.unsubscribe()
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [supabase, handleAuthCallback, isValidSession])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Sign out and redirect to login after 2 seconds
    setTimeout(async () => {
      await supabase.auth.signOut()
      router.push('/login')
    }, 2000)
  }

  // Handle cancel - sign out and go to login
  const handleCancel = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Simple header without navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-center">
          <Link href="/" className="p-0">
            <Image
              src="/c_logo.png"
              alt="NimraCashAndCarry"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              style={{ background: 'transparent' }}
              priority
            />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold">Set new password</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          {!isValidSession && !success ? (
            <div className="text-center space-y-4">
              <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
                {error || 'Invalid or expired reset link.'}
              </div>
              <Link href="/forgot-password">
                <Button variant="outline">Request new reset link</Button>
              </Link>
            </div>
          ) : success ? (
            <div className="text-center space-y-4">
              <div className="p-4 border border-green-500 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400">
                Password updated successfully! Redirecting to login...
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
              {error && (
                <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      placeholder="Minimum 8 characters"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Confirm your password"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Updating...' : 'Update password'}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-sm font-medium text-muted-foreground hover:text-primary hover:underline"
                >
                  Cancel and return to login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
