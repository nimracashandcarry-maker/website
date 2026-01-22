import { createClient } from '@/lib/supabase/server'
import { Category } from '@/types/database'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

// Alias for consistency - uses page-level revalidate for caching
export const getCategoriesCached = getCategories

// Optimized query: Get categories with first product image in minimal queries
export type CategoryWithImage = Category & { backgroundImage: string | null }

export async function getCategoriesWithImages(): Promise<CategoryWithImage[]> {
  const supabase = await createClient()

  // Get all categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  if (catError || !categories) {
    console.error('Error fetching categories:', catError)
    return []
  }

  // Get first product with image for each category in a single query
  const categoryIds = categories.map(c => c.id)

  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('category_id, image_url')
    .in('category_id', categoryIds)
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })

  if (prodError) {
    console.error('Error fetching product images:', prodError)
    // Return categories without images on error
    return categories.map(cat => ({ ...cat, backgroundImage: null }))
  }

  // Create a map of category_id -> first image_url
  const categoryImageMap = new Map<string, string>()
  for (const product of products || []) {
    if (product.category_id && product.image_url && !categoryImageMap.has(product.category_id)) {
      categoryImageMap.set(product.category_id, product.image_url)
    }
  }

  // Merge categories with their images
  return categories.map(category => ({
    ...category,
    backgroundImage: categoryImageMap.get(category.id) || null,
  }))
}

// Alias for consistency - uses page-level revalidate for caching
export const getCategoriesWithImagesCached = getCategoriesWithImages

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data
}
