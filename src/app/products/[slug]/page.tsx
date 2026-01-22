import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductBySlug, getFeaturedProducts } from '@/lib/actions/products'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ProductActions } from '@/components/ProductActions'
import { FeaturedProductsSlider } from '@/components/FeaturedProductsSlider'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, featuredProducts] = await Promise.all([
    getProductBySlug(slug),
    getFeaturedProducts(),
  ])

  if (!product) {
    notFound()
  }

  // Filter out current product from featured products
  const otherFeaturedProducts = featuredProducts.filter(p => p.id !== product.id)

  return (
    <>
      <Suspense fallback={<div className="border-b bg-background sticky top-0 z-50"><div className="container mx-auto px-4 py-4"><div className="h-10 w-32 bg-muted animate-pulse rounded" /></div></div>}>
        <Navbar />
      </Suspense>
      <main className="container mx-auto px-4 py-8">
        <Link href="/products" className="text-muted-foreground hover:underline mb-4 inline-block">
          ← Back to Products
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {product.image_url ? (
              <div className="relative w-full h-96 rounded-lg overflow-hidden">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
          </div>
          
          <div>
            {product.category && (
              <Link
                href={`/category/${product.category.slug}`}
                className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-3xl font-bold mb-6">${product.price}</p>
            
            {product.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <Suspense fallback={<div className="w-full h-32 bg-muted animate-pulse rounded" />}>
              <ProductActions product={product} />
            </Suspense>
          </div>
        </div>

        {/* Featured Products Slider */}
        {otherFeaturedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
            <Suspense fallback={<div className="w-full h-64 bg-muted animate-pulse rounded" />}>
              <FeaturedProductsSlider products={otherFeaturedProducts} />
            </Suspense>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

