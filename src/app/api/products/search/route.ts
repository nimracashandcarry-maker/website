import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json([])
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        image_url,
        category:categories(name, slug)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(8)

    if (error) {
      console.error('Error searching products:', error)
      return NextResponse.json([], { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in search:', error)
    return NextResponse.json([], { status: 500 })
  }
}
