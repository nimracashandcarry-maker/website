import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/lib/actions/categories'
import { getProductsByCategorySlug } from '@/lib/actions/products'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { QuickAddToCart } from '@/components/QuickAddToCart'
import {
  ProductGridSkeleton,
  QuickAddToCartSkeleton
} from '@/components/skeletons'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Product, ProductVariation } from '@/types/database'

// Revalidate category pages every 30 minutes
export const revalidate = 1800

// Dynamic rendering - categories are generated on-demand
export const dynamic = 'force-dynamic'

// Helper to get default variation
function getDefaultVariation(product: Product): ProductVariation | null {
  if (!product.variations || product.variations.length === 0) return null
  return product.variations.find((v) => v.is_default) || product.variations[0]
}

// Helper to get display price (without VAT)
function getDisplayPrice(product: Product): { price: number; variation: ProductVariation | null } {
  const defaultVariation = getDefaultVariation(product)
  const basePrice = defaultVariation ? defaultVariation.price : product.price
  return { price: basePrice, variation: defaultVariation }
}

// Products grid component for this category
async function CategoryProductsGrid({ slug }: { slug: string }) {
  const products = await getProductsByCategorySlug(slug)

  if (products.length === 0) {
    return <p className="text-muted-foreground">No products in this category yet.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const { price, variation } = getDisplayPrice(product)
        return (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            <Link href={`/products/${product.slug}`} className="block">
              {product.image_url ? (
                <div className="relative w-full h-48 bg-muted/30">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </Link>
            <CardHeader>
              <Link href={`/products/${product.slug}`}>
                <CardTitle className="text-xl">{product.name}</CardTitle>
              </Link>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between min-h-[52px]">
              <div>
                {variation && (
                  <p className="text-xs text-muted-foreground">{variation.attribute_type}: {variation.name}</p>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-2xl font-bold">€{price.toFixed(2)}</p>
                {product.vat_percentage > 0 && (
                  <p className="text-xs text-muted-foreground">VAT: {product.vat_percentage}%</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Suspense fallback={<QuickAddToCartSkeleton />}>
                <QuickAddToCart product={product} />
              </Suspense>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  return (
    <>
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="text-muted-foreground hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-8">{category.name}</h1>

        <Suspense fallback={<ProductGridSkeleton count={6} />}>
          <CategoryProductsGrid slug={slug} />
        </Suspense>
      </main>

      <Footer />
    </>
  )
}
