import { Suspense } from 'react'
import Link from 'next/link'
import { getCategoriesWithImagesCached } from '@/lib/actions/categories'
import { getFeaturedProductsCached } from '@/lib/actions/products'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { CategoryGrid } from '@/components/CategoryGrid'
import { ProductCard } from '@/components/ProductCard'
import { Footer } from '@/components/Footer'
import {
  CategoryGridSkeleton,
  FeaturedProductsSkeleton
} from '@/components/skeletons'
import { Truck, ShieldCheck, BadgePercent, Headphones } from 'lucide-react'

export const revalidate = 3600 // Revalidate every hour

// Separate async component for categories section
async function CategoriesSection() {
  const categoriesWithImages = await getCategoriesWithImagesCached()
  return <CategoryGrid categories={categoriesWithImages} />
}

// Separate async component for featured products
async function FeaturedProductsSection() {
  const featuredProducts = await getFeaturedProductsCached()

  if (featuredProducts.length === 0) return null

  return (
    <section className="py-20 container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-left">Featured Products</h2>
          <p className="text-lg text-muted-foreground text-left">Hand-picked selections just for you</p>
        </div>
        <Link
          href="/products"
          className="group flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors self-start md:self-end"
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
  )
}

// Features data - static, doesn't need to be fetched
const features = [
  { icon: BadgePercent, title: "Bulk Savings", desc: "Best prices for trade & public" },
  { icon: ShieldCheck, title: "Quality Hygiene", desc: "Certified food packaging" },
  { icon: Truck, title: "Nationwide Delivery", desc: "Fast reliable shipping" },
  { icon: Headphones, title: "Expert Support", desc: "Here to help your business" }
]

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Hero />

        {/* Features Banners - Static content, renders immediately */}
        <div className="py-10 bg-background border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Section - Streams in with skeleton */}
        <Suspense fallback={<CategoryGridSkeleton count={6} />}>
          <CategoriesSection />
        </Suspense>

        {/* Featured Products - Streams in with skeleton */}
        <Suspense fallback={
          <section className="py-20 container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
              <div className="max-w-2xl">
                <div className="h-10 w-64 bg-muted animate-pulse rounded mb-4" />
                <div className="h-5 w-80 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <FeaturedProductsSkeleton count={4} />
          </section>
        }>
          <FeaturedProductsSection />
        </Suspense>

        {/* Newsletter Section - Static content */}
        <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
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
