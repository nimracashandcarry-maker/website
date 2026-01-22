import { Suspense } from 'react'
import Link from 'next/link'
import { getCategories } from '@/lib/actions/categories'
import { getFeaturedProducts, getProductsByCategorySlug } from '@/lib/actions/products'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { CategoryGrid } from '@/components/CategoryGrid'
import { ProductCard } from '@/components/ProductCard'
import { Footer } from '@/components/Footer'
import { Truck, ShieldCheck, BadgePercent, Headphones } from 'lucide-react'

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ])

  // Get first product image for each category to use as background
  const categoriesWithImages = await Promise.all(
    categories.map(async (category) => {
      const products = await getProductsByCategorySlug(category.slug)
      const firstProductWithImage = products.find(p => p.image_url)
      return {
        ...category,
        backgroundImage: firstProductWithImage?.image_url || null,
      }
    })
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Hero />

        {/* Features Banners */}
        <div className="py-10 bg-background border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: BadgePercent, title: "Bulk Savings", desc: "Best prices for trade & public" },
                { icon: ShieldCheck, title: "Quality Hygiene", desc: "Certified food packaging" },
                { icon: Truck, title: "Nationwide Delivery", desc: "Fast reliable shipping" },
                { icon: Headphones, title: "Expert Support", desc: "Here to help your business" }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <Suspense fallback={<div className="h-96 w-full flex items-center justify-center">Loading Categories...</div>}>
          <CategoryGrid categories={categoriesWithImages} />
        </Suspense>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-20 container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Featured Products</h2>
                <p className="text-lg text-muted-foreground">Hand-picked selections just for you</p>
              </div>
              <Link
                href="/products"
                className="group flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors"
              >
                View All Products
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Newsletter Section - Optional but adds to the "premium" feel */}
        <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
          {/* Abstract background shapes */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

          <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Newsletter</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>

            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="px-8 py-4 rounded-full bg-white text-primary font-bold hover:bg-gray-100 transition-colors shadow-lg">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
