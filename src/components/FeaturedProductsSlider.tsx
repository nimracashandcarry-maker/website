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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-4/5 sm:basis-2/3 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                    <Link href={`/products/${product.slug}`} className="block">
                      {product.image_url ? (
                        <div className="relative w-full h-48 sm:h-56 bg-muted/30">
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 sm:h-56 bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No Image</span>
                        </div>
                      )}
                    </Link>
                    <CardHeader className="p-4">
                      <Link href={`/products/${product.slug}`}>
                        <CardTitle className="text-lg sm:text-xl line-clamp-2">{product.name}</CardTitle>
                      </Link>
                      {product.category && (
                        <CardDescription className="text-sm">{product.category.name}</CardDescription>
                      )}
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 mt-auto">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/products/${product.slug}`}>
                          View
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CarouselItem>
            )
          )}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4 md:-left-12" />
        <CarouselNext className="hidden sm:flex -right-4 md:-right-12" />
      </Carousel>
    </div>
  )
}

