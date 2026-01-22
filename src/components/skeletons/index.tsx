'use client'

import { cn } from '@/lib/utils'

// Base shimmer animation component
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]',
        className
      )}
    />
  )
}

// Navbar skeleton
export function NavbarSkeleton() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b shadow-sm px-4 py-3">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shimmer className="w-10 h-10 rounded-lg" />
            <Shimmer className="w-24 h-6 rounded" />
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Shimmer className="w-16 h-8 rounded-full" />
            <Shimmer className="w-20 h-8 rounded-full" />
            <Shimmer className="w-16 h-8 rounded-full" />
            <Shimmer className="w-16 h-8 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Shimmer className="w-10 h-10 rounded-full" />
            <Shimmer className="w-10 h-10 rounded-full" />
            <Shimmer className="w-20 h-10 rounded-full" />
          </div>
        </div>
      </div>
    </nav>
  )
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Shimmer className="w-full h-48" />
      <div className="p-4 space-y-3">
        <Shimmer className="h-6 w-3/4 rounded" />
        <Shimmer className="h-4 w-1/2 rounded" />
        <Shimmer className="h-8 w-1/3 rounded" />
        <div className="flex gap-2 pt-2">
          <Shimmer className="h-9 flex-1 rounded" />
          <Shimmer className="h-9 flex-1 rounded" />
        </div>
      </div>
    </div>
  )
}

// Product grid skeleton
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Featured products skeleton (4 columns)
export function FeaturedProductsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Category card skeleton
export function CategoryCardSkeleton() {
  return (
    <div className="relative h-64 rounded-2xl overflow-hidden">
      <Shimmer className="absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <Shimmer className="h-6 w-32 rounded mb-2" />
        <Shimmer className="h-4 w-24 rounded" />
      </div>
    </div>
  )
}

// Category grid skeleton
export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="py-20 container mx-auto px-4">
      <div className="text-center mb-12">
        <Shimmer className="h-10 w-64 mx-auto rounded mb-4" />
        <Shimmer className="h-5 w-96 mx-auto rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}

// Hero skeleton
export function HeroSkeleton() {
  return (
    <div className="relative h-[80vh] bg-muted flex items-center justify-center">
      <div className="text-center space-y-6">
        <Shimmer className="h-16 w-96 mx-auto rounded" />
        <Shimmer className="h-6 w-80 mx-auto rounded" />
        <div className="flex justify-center gap-4 pt-4">
          <Shimmer className="h-12 w-36 rounded-full" />
          <Shimmer className="h-12 w-36 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Quick add to cart skeleton
export function QuickAddToCartSkeleton() {
  return (
    <div className="w-full flex gap-2">
      <Shimmer className="h-9 flex-1 rounded" />
      <Shimmer className="h-9 flex-1 rounded" />
    </div>
  )
}

// Page loading skeleton (full page)
export function PageSkeleton() {
  return (
    <div className="min-h-screen">
      <NavbarSkeleton />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <Shimmer className="h-10 w-64 rounded mb-8" />
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  )
}

// Footer skeleton
export function FooterSkeleton() {
  return (
    <footer className="bg-muted/30 border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Shimmer className="h-6 w-24 rounded" />
              <Shimmer className="h-4 w-20 rounded" />
              <Shimmer className="h-4 w-28 rounded" />
              <Shimmer className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
