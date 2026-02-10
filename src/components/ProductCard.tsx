import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div
            className="group relative bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
        >
            <Link href={`/products/${product.slug}`} className="block relative w-full pt-[100%] bg-muted/30 overflow-hidden">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/50">
                        No Image
                    </div>
                )}

                {/* Badges */}
                {product.is_featured && (
                    <Badge className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md text-white border-0">Featured</Badge>
                )}
            </Link>

            <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                    {product.category && (
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            {product.category.name}
                        </span>
                    )}
                    <Link href={`/products/${product.slug}`}>
                        <h3 className="text-lg font-semibold text-foreground leading-tight mt-1 group-hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="mt-auto pt-4">
                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/products/${product.slug}`}>
                            View
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
