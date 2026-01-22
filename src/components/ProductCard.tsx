'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Product } from '@/types/database'
import { QuickAddToCart } from './QuickAddToCart'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="group relative bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
            <Link href={`/products/${product.slug}`} className="block relative w-full pt-[100%] bg-muted/20 overflow-hidden">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
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

                <div className="mt-auto pt-4 flex items-end justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 text-foreground">
                            €{product.price}
                        </span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                    {/* Visible on mobile/tablet, hidden on desktop until hover */}
                    <div className="opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300">
                        <QuickAddToCart product={product} />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
