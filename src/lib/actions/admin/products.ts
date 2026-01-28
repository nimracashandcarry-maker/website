'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a positive number',
  }),
  vat_percentage: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: 'VAT must be between 0 and 100',
  }).optional(),
  image_url: z.union([
    z.string().url(),
    z.literal(''),
  ]).optional(),
  category_id: z.union([
    z.string().uuid(),
    z.literal(''),
  ]).optional(),
  is_featured: z.string().optional(),
})

export async function createProduct(formData: FormData) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    name: (formData.get('name') as string) || '',
    slug: (formData.get('slug') as string) || '',
    description: (formData.get('description') as string) || '',
    price: (formData.get('price') as string) || '',
    vat_percentage: (formData.get('vat_percentage') as string) || '0',
    image_url: (formData.get('image_url') as string) || '',
    category_id: (formData.get('category_id') as string) || '',
    is_featured: (formData.get('is_featured') as string) || '',
  }

  let validatedData
  try {
    validatedData = productSchema.parse(rawData)
  } catch (error) {
    console.error('Validation error:', error)
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => issue.message)
        .filter(Boolean)
        .join(', ')
      throw new Error(errorMessages || 'Validation failed')
    }
    throw new Error('Validation failed')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .insert({
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      price: parseFloat(validatedData.price),
      vat_percentage: validatedData.vat_percentage ? parseFloat(validatedData.vat_percentage) : 0,
      image_url: validatedData.image_url && validatedData.image_url !== '' ? validatedData.image_url : null,
      category_id: validatedData.category_id && validatedData.category_id !== '' ? validatedData.category_id : null,
      is_featured: validatedData.is_featured === 'true',
    })

  if (error) {
    console.error('Supabase error:', error)
    throw new Error(error.message || 'Failed to create product')
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
}

export async function updateProduct(id: string, formData: FormData, oldImageUrl?: string | null) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    vat_percentage: (formData.get('vat_percentage') as string) || '0',
    image_url: formData.get('image_url') as string,
    category_id: formData.get('category_id') as string,
    is_featured: formData.get('is_featured') as string,
  }

  const validatedData = productSchema.parse(rawData)

  const supabase = await createClient()
  
  // Get new image URL
  const newImageUrl = validatedData.image_url && validatedData.image_url !== '' ? validatedData.image_url : null

  // Delete old image from storage if it's being replaced or removed
  if (oldImageUrl && oldImageUrl !== newImageUrl && oldImageUrl.includes('supabase.co/storage')) {
    try {
      const { deleteProductImage } = await import('@/lib/actions/upload')
      await deleteProductImage(oldImageUrl)
    } catch (deleteError) {
      console.error('Error deleting old image:', deleteError)
      // Continue even if deletion fails
    }
  }

  const { error } = await supabase
    .from('products')
    .update({
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      price: parseFloat(validatedData.price),
      vat_percentage: validatedData.vat_percentage ? parseFloat(validatedData.vat_percentage) : 0,
      image_url: newImageUrl,
      category_id: validatedData.category_id && validatedData.category_id !== '' ? validatedData.category_id : null,
      is_featured: validatedData.is_featured === 'true',
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
}

export async function deleteProduct(id: string) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()
  
  // Get product to check for image
  const { data: product } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', id)
    .single()

  // Delete image from storage if it exists and is from Supabase
  if (product?.image_url && product.image_url.includes('supabase.co/storage')) {
    try {
      const { deleteProductImage } = await import('@/lib/actions/upload')
      await deleteProductImage(product.image_url)
    } catch (deleteError) {
      console.error('Error deleting product image:', deleteError)
      // Continue with product deletion even if image deletion fails
    }
  }

  // Delete product
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
}

