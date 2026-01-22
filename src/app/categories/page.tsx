import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/lib/actions/categories'
import { getProductsByCategorySlug } from '@/lib/actions/products'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ArrowRight } from 'lucide-react'

export const revalidate = 3600

export default async function CategoriesPage() {
  const categories = await getCategories()

  // Get first product image for each category to use as background
  const categoriesWithImages = await Promise.all(
    categories.map(async (category) => {
      const products = await getProductsByCategorySlug(category.slug)
      const firstProductWithImage = products.find(p => p.image_url)
      const productCount = products.length
      return {
        ...category,
        backgroundImage: firstProductWithImage?.image_url || null,
        productCount,
      }
    })
  )

  return (
    <>
      <Suspense fallback={<div className="border-b bg-background sticky top-0 z-50"><div className="container mx-auto px-4 py-4"><div className="h-10 w-32 bg-muted animate-pulse rounded" /></div></div>}>
        <Navbar />
      </Suspense>
      <main className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors mb-4 inline-flex items-center gap-1 text-sm">
              <span>←</span> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">All Categories</h1>
            <p className="text-muted-foreground text-lg mt-3 max-w-2xl">
              Explore our complete range of premium catering and food packaging supplies
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="container mx-auto px-4 py-12">
          {categoriesWithImages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No categories available yet.</p>
              <Link href="/products" className="text-primary hover:underline mt-4 inline-block">
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesWithImages.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group relative h-[280px] md:h-[320px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  {/* Background Image */}
                  {category.backgroundImage ? (
                    <Image
                      src={category.backgroundImage}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40" />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {category.name}
                    </h2>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">
                        {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                      </span>
                      <span className="flex items-center text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1">
                        Explore <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
