'use server'

import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'

export async function uploadProductImage(formData: FormData): Promise<string> {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only images are allowed.')
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.')
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `products/${fileName}`

  const supabase = await createClient()
  
  // Read file as ArrayBuffer and convert to Uint8Array
  // This is the format Supabase Storage expects
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: '3600',
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error(error.message || 'Failed to upload image')
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get image URL')
  }

  return urlData.publicUrl
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  // Extract file path from URL
  // URL format: https://[project].supabase.co/storage/v1/object/public/product-images/products/filename.jpg
  const urlParts = imageUrl.split('/product-images/')
  if (urlParts.length !== 2) {
    throw new Error('Invalid image URL')
  }

  const filePath = `products/${urlParts[1]}`

  const supabase = await createClient()
  const { error } = await supabase.storage
    .from('product-images')
    .remove([filePath])

  if (error) {
    console.error('Delete error:', error)
    throw new Error(error.message || 'Failed to delete image')
  }
}

