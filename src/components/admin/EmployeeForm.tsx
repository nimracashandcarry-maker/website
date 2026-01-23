'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createEmployee } from '@/lib/actions/admin/employees'
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

const employeeSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export function EmployeeForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const errorRef = useRef<HTMLDivElement>(null)

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_id: '',
      name: '',
      email: '',
      password: '',
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

  const onSubmit = async (data: EmployeeFormValues) => {
    setError('')
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('employee_id', data.employee_id)
        formData.append('name', data.name)
        formData.append('email', data.email)
        formData.append('password', data.password)

        await createEmployee(formData)

        router.push('/admin/employees')
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
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee ID *</FormLabel>
              <FormControl>
                <Input placeholder="EMP001" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Minimum 6 characters" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Employee'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/employees')}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

