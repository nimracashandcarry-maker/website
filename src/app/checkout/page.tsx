'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { createClient } from '@/lib/supabase/client'
import { createOrder } from '@/lib/actions/orders'
import { getUserDetails, saveUserDetails } from '@/lib/actions/user-details'
import { checkIsEmployee } from '@/lib/actions/auth'
import { Navbar } from '@/components/Navbar'
import { CustomerSelector } from '@/components/CustomerSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import { Plus, Minus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

type Customer = {
  id: string
  name: string
  email: string | null
  phone: string
  shipping_address: string
  city: string | null
  eir: string | null
  vat_number: string
}

type NewCustomerData = Omit<Customer, 'id'> & { isNew: true }
type CustomerOrNew = Customer | NewCustomerData

const checkoutSchema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  customer_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  customer_phone: z.string().min(1, 'Phone number is required'),
  shipping_address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  eir: z.string().optional(),
  vat_number: z.string().min(1, 'VAT number is required'),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { items, getTotal, clearCart, updateQuantity } = useCart()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [isEmployee, setIsEmployee] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOrNew | null>(null)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  })

  // Check authentication and redirect if not logged in
  useEffect(() => {
    const checkAuth = async () => {
      // Check session first, which is more reliable
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session || !session.user) {
        router.push('/login?redirect=/checkout')
        return
      }

      const user = session.user
      
      // Check if user is an employee
      try {
        const employeeCheck = await checkIsEmployee()
        if (employeeCheck) {
          setIsEmployee(true)
          setLoading(false)
          return // Don't load user details for employees
        }
      } catch (err) {
        console.error('Error checking employee status:', err)
      }
      
      // Load user details if available (for regular users)
      try {
        const userDetails = await getUserDetails()
        if (userDetails) {
          form.reset({
            customer_name: userDetails.full_name || '',
            customer_email: userDetails.email || user.email || '',
            customer_phone: userDetails.phone || '',
            shipping_address: userDetails.shipping_address || '',
            city: userDetails.city || '',
            eir: userDetails.eir || '',
            vat_number: userDetails.vat_number || '',
          })
        } else if (user.email) {
          form.reset({
            customer_name: '',
            customer_email: user.email,
            customer_phone: '',
            shipping_address: '',
            city: '',
            eir: '',
            vat_number: '',
          })
        }
      } catch (err) {
        console.error('Error loading user details:', err)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router, supabase, form])

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router, loading])

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

  if (items.length === 0) {
    return null
  }

  const handleCustomerSelect = (customer: CustomerOrNew | null) => {
    if (customer) {
      setSelectedCustomer(customer)
      form.reset({
        customer_name: customer.name,
        customer_email: customer.email || '',
        customer_phone: customer.phone,
        shipping_address: customer.shipping_address,
        city: customer.city || '',
        eir: customer.eir || '',
        vat_number: customer.vat_number,
      })
    } else {
      setSelectedCustomer(null)
      form.reset()
    }
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    setError('')
    
    // For employees, require customer selection
    if (isEmployee && !selectedCustomer) {
      setError('Please select a customer')
      return
    }

    startTransition(async () => {
      try {
        const orderItems = items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: item.product.price,
          quantity: item.quantity,
        }))

        // Create the order
        const orderId = await createOrder({
          ...data,
          items: orderItems,
          customer_id: selectedCustomer && 'id' in selectedCustomer ? selectedCustomer.id : undefined,
        })

        // Save user details for future use (only for regular users, not employees)
        if (!isEmployee) {
          try {
            // Get user email from auth if form email is empty
            const { data: { user: authUser } } = await supabase.auth.getUser()
            const emailToSave = data.customer_email || authUser?.email || undefined
            
            await saveUserDetails({
              full_name: data.customer_name,
              email: emailToSave,
              phone: data.customer_phone,
              shipping_address: data.shipping_address,
              city: data.city || undefined,
              eir: data.eir || undefined,
              vat_number: data.vat_number,
            })
          } catch (saveError) {
            // Log error but don't fail the order if saving user details fails
            console.error('Error saving user details:', saveError)
          }
        }

        clearCart()
        router.push(`/order-confirmation/${orderId}`)
        router.refresh()
      } catch (err) {
        console.error('Checkout error:', err)
        setError(err instanceof Error ? err.message : 'Failed to place order')
      }
    })
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {isEmployee ? 'Select Customer' : 'Shipping Information'}
            </h2>
            {isEmployee ? (
              <div className="space-y-4">
                <CustomerSelector
                  onSelect={handleCustomerSelect}
                  selectedCustomerId={selectedCustomer && 'id' in selectedCustomer ? selectedCustomer.id : undefined}
                />
                {selectedCustomer && (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                    {error && (
                      <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
                        {error}
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Name:</span> {selectedCustomer.name}</p>
                        <p><span className="font-semibold">Phone:</span> {selectedCustomer.phone}</p>
                        {selectedCustomer.email && (
                          <p><span className="font-semibold">Email:</span> {selectedCustomer.email}</p>
                        )}
                        <p><span className="font-semibold">VAT:</span> {selectedCustomer.vat_number}</p>
                        <p><span className="font-semibold">Address:</span> {selectedCustomer.shipping_address}</p>
                        {(selectedCustomer.city || selectedCustomer.eir) && (
                          <p><span className="font-semibold">Location:</span> {[selectedCustomer.city, selectedCustomer.eir].filter(Boolean).join(', ')}</p>
                        )}
                      </div>
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Payment Method: <span className="font-semibold">Cash on Delivery</span>
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="customer_name">Full Name *</Label>
                <Input
                  id="customer_name"
                  {...form.register('customer_name')}
                  disabled={isPending}
                />
                {form.formState.errors.customer_name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.customer_name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customer_email">Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  {...form.register('customer_email')}
                  disabled={isPending}
                />
                {form.formState.errors.customer_email && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.customer_email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customer_phone">Phone Number *</Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  {...form.register('customer_phone')}
                  disabled={isPending}
                />
                {form.formState.errors.customer_phone && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.customer_phone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="shipping_address">Shipping Address *</Label>
                <Textarea
                  id="shipping_address"
                  rows={3}
                  {...form.register('shipping_address')}
                  disabled={isPending}
                />
                {form.formState.errors.shipping_address && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.shipping_address.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="vat_number">VAT Number *</Label>
                <Input
                  id="vat_number"
                  {...form.register('vat_number')}
                  disabled={isPending}
                />
                {form.formState.errors.vat_number && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.vat_number.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...form.register('city')}
                    disabled={isPending}
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="eir">Eircode</Label>
                  <Input
                    id="eir"
                    {...form.register('eir')}
                    disabled={isPending}
                  />
                  {form.formState.errors.eir && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.eir.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Payment Method: <span className="font-semibold">Cash on Delivery</span>
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Placing Order...' : 'Place Order'}
              </Button>
            </form>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="border rounded-lg p-6">
              <div className="space-y-4 mb-4">
                {items.map((item) => (
                    <div key={item.product.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex gap-4 mb-3">
                        {item.product.image_url ? (
                          <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-muted-foreground">No Image</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.product.name}</h3>
                          <p className="text-muted-foreground text-sm">${item.product.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Quantity:</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1
                                updateQuantity(item.product.id, Math.max(1, val))
                              }}
                              className="w-16 text-center"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateQuantity(item.product.id, item.quantity + 1)
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <span className="font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

