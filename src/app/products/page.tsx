import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts, searchProducts } from '@/lib/actions/products'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { QuickAddToCart } from '@/components/QuickAddToCart'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type SearchParams = Promise<{ search?: string }>

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const searchQuery = params.search || ''

  const products = searchQuery
    ? await searchProducts(searchQuery)
    : await getProducts()

  return (
    <>
      <Suspense fallback={<div className="border-b bg-background sticky top-0 z-50"><div className="container mx-auto px-4 py-4"><div className="h-10 w-32 bg-muted animate-pulse rounded" /></div></div>}>
        <Navbar />
      </Suspense>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">
          {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
        </h1>
        {searchQuery && (
          <p className="text-muted-foreground mb-6">
            Found {products.length} product{products.length !== 1 ? 's' : ''}
            {' '}
            <Link href="/products" className="text-primary hover:underline">
              Clear search
            </Link>
          </p>
        )}
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery
                ? `No products found matching "${searchQuery}"`
                : 'No products available yet.'}
            </p>
            {searchQuery && (
              <Link
                href="/products"
                className="text-primary hover:underline mt-2 inline-block"
              >
                View all products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                <Link href={`/products/${product.slug}`} className="block">
                  {product.image_url ? (
                    <div className="relative w-full h-48">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
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
                  {product.category && (
                    <CardDescription>{product.category.name}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-2xl font-bold">${product.price}</p>
                </CardContent>
                <CardFooter>
                  <Suspense fallback={<div className="w-full h-8 bg-muted animate-pulse rounded" />}>
                    <QuickAddToCart product={product} />
                  </Suspense>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

