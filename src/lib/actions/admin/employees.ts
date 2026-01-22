'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/auth'
import { z } from 'zod'

const employeeSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function createEmployee(formData: FormData) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    employee_id: formData.get('employee_id') as string,
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  let validatedData
  try {
    validatedData = employeeSchema.parse(rawData)
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

  // Use service role key for admin operations (create user)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set')
  }

  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: validatedData.email,
    password: validatedData.password,
    email_confirm: true,
    user_metadata: {
      role: 'employee',
    },
  })

  if (authError || !authData.user) {
    console.error('Error creating employee user:', authError)
    throw new Error(authError?.message || 'Failed to create employee account')
  }

  // Create employee record
  const { error: employeeError } = await supabase
    .from('employees')
    .insert({
      user_id: authData.user.id,
      employee_id: validatedData.employee_id,
      name: validatedData.name,
      email: validatedData.email,
      is_active: true,
    })

  if (employeeError) {
    console.error('Error creating employee record:', employeeError)
    // Try to delete the auth user if employee creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    throw new Error(employeeError.message || 'Failed to create employee record')
  }

  revalidatePath('/admin/employees')
}

export async function getEmployees() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching employees:', error)
    return []
  }

  return data || []
}

export async function deleteEmployee(id: string) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  // Get employee to find user_id
  const { data: employee } = await supabase
    .from('employees')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!employee) {
    throw new Error('Employee not found')
  }

  // Delete employee record (this will cascade or we can soft delete)
  const { error: deleteError } = await supabase
    .from('employees')
    .update({ is_active: false })
    .eq('id', id)

  if (deleteError) {
    console.error('Error deleting employee:', deleteError)
    throw new Error(deleteError.message || 'Failed to delete employee')
  }

  // Optionally delete the auth user (uncomment if you want to delete the user account)
  // await supabase.auth.admin.deleteUser(employee.user_id)

  revalidatePath('/admin/employees')
}

