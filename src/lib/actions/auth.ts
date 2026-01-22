'use server'

import { createClient } from '@/lib/supabase/server'

export async function checkIsEmployee() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data, error } = await supabase
    .from('employees')
    .select('id, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  return !error && !!data
}

