'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, isEmployee } from '@/lib/auth'
import { z } from 'zod'

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

export async function createCustomer(formData: FormData) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    shipping_address: formData.get('shipping_address') as string,
    city: formData.get('city') as string,
    eir: formData.get('eir') as string,
    vat_number: formData.get('vat_number') as string,
    notes: formData.get('notes') as string,
  }

  let validatedData
  try {
    validatedData = customerSchema.parse(rawData)
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      const errorMessages = validationError.issues
        .map(e => e.message)
        .filter(Boolean)
        .join(', ')
      throw new Error(errorMessages || 'Validation failed')
    }
    throw new Error('Validation failed')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('customers')
    .insert({
      name: validatedData.name,
      email: validatedData.email || null,
      phone: validatedData.phone,
      shipping_address: validatedData.shipping_address,
      city: validatedData.city || null,
      eir: validatedData.eir || null,
      vat_number: validatedData.vat_number,
      notes: validatedData.notes || null,
      is_active: true,
    })

  if (error) {
    console.error('Error creating customer:', error)
    throw new Error(error.message || 'Failed to create customer')
  }

  revalidatePath('/admin/customers')
}

export async function updateCustomer(id: string, formData: FormData) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    shipping_address: formData.get('shipping_address') as string,
    city: formData.get('city') as string,
    eir: formData.get('eir') as string,
    vat_number: formData.get('vat_number') as string,
    notes: formData.get('notes') as string,
  }

  let validatedData
  try {
    validatedData = customerSchema.parse(rawData)
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      const errorMessages = validationError.issues
        .map(e => e.message)
        .filter(Boolean)
        .join(', ')
      throw new Error(errorMessages || 'Validation failed')
    }
    throw new Error('Validation failed')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('customers')
    .update({
      name: validatedData.name,
      email: validatedData.email || null,
      phone: validatedData.phone,
      shipping_address: validatedData.shipping_address,
      city: validatedData.city || null,
      eir: validatedData.eir || null,
      vat_number: validatedData.vat_number,
      notes: validatedData.notes || null,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating customer:', error)
    throw new Error(error.message || 'Failed to update customer')
  }

  revalidatePath('/admin/customers')
}

export async function getCustomers() {
  // Allow both admin and employees to view customers
  const admin = await isAdmin()
  const employee = await isEmployee()
  
  if (!admin && !employee) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }

  return data || []
}

export async function getCustomerById(id: string) {
  const admin = await isAdmin()
  const employee = await isEmployee()
  
  if (!admin && !employee) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    return null
  }

  return data
}

export async function deleteCustomer(id: string) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('customers')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    console.error('Error deleting customer:', error)
    throw new Error(error.message || 'Failed to delete customer')
  }

  revalidatePath('/admin/customers')
}

export async function searchCustomers(query: string) {
  const admin = await isAdmin()
  const employee = await isEmployee()

  if (!admin && !employee) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,vat_number.ilike.%${query}%,email.ilike.%${query}%`)
    .order('name', { ascending: true })
    .limit(50)

  if (error) {
    console.error('Error searching customers:', error)
    return []
  }

  return data || []
}

// Allow employees to create customers (returns the created customer)
export async function createCustomerAsEmployee(formData: FormData) {
  const admin = await isAdmin()
  const employee = await isEmployee()

  if (!admin && !employee) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    shipping_address: formData.get('shipping_address') as string,
    city: formData.get('city') as string,
    eir: formData.get('eir') as string,
    vat_number: formData.get('vat_number') as string,
  }

  let validatedData
  try {
    validatedData = customerSchema.parse(rawData)
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      const errorMessages = validationError.issues
        .map(e => e.message)
        .filter(Boolean)
        .join(', ')
      throw new Error(errorMessages || 'Validation failed')
    }
    throw new Error('Validation failed')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .insert({
      name: validatedData.name,
      email: validatedData.email || null,
      phone: validatedData.phone,
      shipping_address: validatedData.shipping_address,
      city: validatedData.city || null,
      eir: validatedData.eir || null,
      vat_number: validatedData.vat_number,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    throw new Error(error.message || 'Failed to create customer')
  }

  revalidatePath('/admin/customers')
  return data
}

