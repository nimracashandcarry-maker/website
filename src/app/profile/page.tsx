'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { saveUserDetails, getUserDetails } from '@/lib/actions/user-details'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required'),
  shipping_address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  eir: z.string().optional(),
  vat_number: z.string().min(1, 'VAT number is required'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      shipping_address: '',
      city: '',
      eir: '',
      vat_number: '',
    },
  })

  useEffect(() => {
    const loadData = async () => {
      // Check session first, which is more reliable
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session || !session.user) {
        router.push('/login')
        return
      }

      const authUser = session.user
      setUser(authUser)
      
      try {
        const details = await getUserDetails()
        if (details) {
          form.reset({
            full_name: details.full_name || '',
            email: details.email || authUser.email || '',
            phone: details.phone || '',
            shipping_address: details.shipping_address || '',
            city: details.city || '',
            eir: details.eir || '',
            vat_number: details.vat_number || '',
          })
        } else {
          // No saved details, just populate with user email
          form.reset({
            full_name: '',
            email: authUser.email || '',
            phone: '',
            shipping_address: '',
            city: '',
            eir: '',
            vat_number: '',
          })
        }
      } catch (err) {
        console.error('Error loading user details:', err)
        // Still set form with user email even if loading fails
        form.reset({
          full_name: '',
          email: authUser.email || '',
          phone: '',
          shipping_address: '',
          city: '',
          eir: '',
          vat_number: '',
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [router, supabase, form])

  const onSubmit = async (data: ProfileFormValues) => {
    setError('')
    setSuccess('')
    startTransition(async () => {
      try {
        await saveUserDetails(data)
        setSuccess('Profile saved successfully!')
        
        // Reload user details to show updated data
        try {
          const details = await getUserDetails()
          if (details) {
            form.reset({
              full_name: details.full_name || '',
              email: details.email || user?.email || '',
              phone: details.phone || '',
              shipping_address: details.shipping_address || '',
              city: details.city || '',
              eir: details.eir || '',
              vat_number: details.vat_number || '',
            })
          }
        } catch (reloadError) {
          console.error('Error reloading user details:', reloadError)
          // Don't show error to user, data was saved successfully
        }
      } catch (err) {
        console.error('Error saving profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to save profile')
      }
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 border border-green-500 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400">
                  {success}
                </div>
              )}

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipping_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping Address *</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vat_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Number *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eircode</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </>
  )
}

