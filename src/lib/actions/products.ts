import { createClient } from '@/lib/supabase/server'
import { Product } from '@/types/database'

export async function getProducts(categoryId?: string): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variations:product_variations(*)
    `)
    .order('created_at', { ascending: false })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variations:product_variations(*)
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variations:product_variations(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}

export async function getProductsByCategorySlug(categorySlug: string): Promise<Product[]> {
  const supabase = await createClient()

  // First get the category by slug
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (!category) {
    return []
  }

  // Then get products by category_id
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variations:product_variations(*)
    `)
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products by category:', error)
    return []
  }

  return data || []
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variations:product_variations(*)
    `)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }

  return data || []
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variations:product_variations(*)
    `)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching products:', error)
    return []
  }

  return data || []
}

// Aliases for consistency - uses page-level revalidate for caching
export const getProductsCached = getProducts
export const getFeaturedProductsCached = getFeaturedProducts
export const getProductBySlugCached = getProductBySlug
