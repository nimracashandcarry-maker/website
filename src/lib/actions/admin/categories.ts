'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
})

export async function createCategory(formData: FormData) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
  }

  const validatedData = categorySchema.parse(rawData)

  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .insert(validatedData)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
}

export async function updateCategory(id: string, formData: FormData) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
  }

  const validatedData = categorySchema.parse(rawData)

  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .update(validatedData)
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
}

export async function deleteCategory(id: string) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
}

