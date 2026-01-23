'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCustomer, updateCustomer } from '@/lib/actions/admin/customers'
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

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required'),
  shipping_address: z.string().min(1, 'Shipping address is required'),
  city: z.string().optional(),
  eir: z.string().optional(),
  vat_number: z.string().min(1, 'VAT number is required'),
  notes: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

type Customer = {
  id: string
  name: string
  email: string | null
  phone: string
  shipping_address: string
  city: string | null
  eir: string | null
  vat_number: string
  notes: string | null
}

export function CustomerForm({ customer }: { customer?: Customer }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const errorRef = useRef<HTMLDivElement>(null)

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      shipping_address: customer?.shipping_address || '',
      city: customer?.city || '',
      eir: customer?.eir || '',
      vat_number: customer?.vat_number || '',
      notes: customer?.notes || '',
    },
  })

  // Scroll to error when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [error])

  // Scroll to first form field error on validation failure
  useEffect(() => {
    const errors = form.formState.errors
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
      if (errorElement) {
        setTimeout(() => {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          ;(errorElement as HTMLElement).focus()
        }, 100)
      }
    }
  }, [form.formState.errors])

  const onError = (errors: any) => {
    // Scroll to first error field
    const firstErrorField = Object.keys(errors)[0]
    const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
    if (errorElement) {
      setTimeout(() => {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        ;(errorElement as HTMLElement).focus()
      }, 100)
    }
  }

  const onSubmit = async (data: CustomerFormValues) => {
    setError('')
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('email', data.email || '')
        formData.append('phone', data.phone)
        formData.append('shipping_address', data.shipping_address)
        formData.append('city', data.city || '')
        formData.append('eir', data.eir || '')
        formData.append('vat_number', data.vat_number)
        formData.append('notes', data.notes || '')

        if (customer) {
          await updateCustomer(customer.id, formData)
        } else {
          await createCustomer(formData)
        }

        router.push('/admin/customers')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6 max-w-2xl">
        {error && (
          <div ref={errorRef} className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} disabled={isPending} />
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
                <Input type="email" placeholder="john@example.com" {...field} disabled={isPending} />
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
                <Input type="tel" placeholder="+1234567890" {...field} disabled={isPending} />
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
                <Textarea rows={3} placeholder="123 Main St, City, Country" {...field} disabled={isPending} />
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
                <Input placeholder="VAT123456" {...field} disabled={isPending} />
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
                  <Input placeholder="Dublin" {...field} disabled={isPending} />
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
                  <Input placeholder="D02 AF30" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Additional notes about this customer..." {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? (customer ? 'Updating...' : 'Creating...') : (customer ? 'Update Customer' : 'Create Customer')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/customers')}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

