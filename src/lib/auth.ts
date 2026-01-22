import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function isAdmin() {
  const user = await getCurrentUser()
  if (!user) return false
  
  // Check if user has admin role in metadata
  const role = user.user_metadata?.role
  return role === 'admin'
}

export async function isEmployee() {
  const user = await getCurrentUser()
  if (!user) return false
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('id, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()
  
  return !error && !!data
}

export async function getEmployee() {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()
  
  if (error || !data) return null
  return data
}

