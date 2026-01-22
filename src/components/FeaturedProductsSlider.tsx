'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/database'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { QuickAddToCart } from './QuickAddToCart'

export function FeaturedProductsSlider({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return null
  }

  return (
    <div className="py-2">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem key={product.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
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
                    <QuickAddToCart product={product} />
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

