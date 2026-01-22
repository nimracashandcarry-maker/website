'use server'

import { createClient } from '@/lib/supabase/server'
import { UserDetails } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getUserDetails(): Promise<UserDetails | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('user_details')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No user details found
      return null
    }
    console.error('Error fetching user details:', error)
    return null
  }

  return data
}

export async function saveUserDetails(details: {
  full_name: string
  email?: string
  phone: string
  shipping_address: string
  city?: string
  eir?: string
  vat_number: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if user details already exist
  const { data: existing } = await supabase
    .from('user_details')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Update existing details
    const { error } = await supabase
      .from('user_details')
      .update({
        full_name: details.full_name,
        email: details.email || null,
        phone: details.phone,
        shipping_address: details.shipping_address,
        city: details.city || null,
        eir: details.eir || null,
        vat_number: details.vat_number,
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating user details:', error)
      throw new Error(error.message || 'Failed to update user details')
    }
  } else {
    // Insert new details
    const { error } = await supabase
      .from('user_details')
      .insert({
        user_id: user.id,
        full_name: details.full_name,
        email: details.email || null,
        phone: details.phone,
        shipping_address: details.shipping_address,
        city: details.city || null,
        eir: details.eir || null,
        vat_number: details.vat_number,
      })

    if (error) {
      console.error('Error creating user details:', error)
      throw new Error(error.message || 'Failed to save user details')
    }
  }

  // Revalidate profile page to ensure fresh data
  revalidatePath('/profile')
}

