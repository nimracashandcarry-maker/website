import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductBySlug, getFeaturedProductsCached } from '@/lib/actions/products'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ProductActions } from '@/components/ProductActions'
import { FeaturedProductsSlider } from '@/components/FeaturedProductsSlider'
import { FeaturedProductsSkeleton } from '@/components/skeletons'

// Revalidate product pages every 30 minutes
export const revalidate = 1800

// Separate component for featured products section
async function FeaturedProductsSection({ currentProductId }: { currentProductId: string }) {
  const featuredProducts = await getFeaturedProductsCached()
  const otherFeaturedProducts = featuredProducts.filter(p => p.id !== currentProductId)

  if (otherFeaturedProducts.length === 0) return null

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
      <FeaturedProductsSlider products={otherFeaturedProducts} />
    </div>
  )
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <>
      <Navbar />

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
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
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

        {/* Featured Products Section - Streams in */}
        <Suspense fallback={
          <div className="mt-16">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
            <FeaturedProductsSkeleton count={4} />
          </div>
        }>
          <FeaturedProductsSection currentProductId={product.id} />
        </Suspense>
      </main>

      <Footer />
    </>
  )
}
