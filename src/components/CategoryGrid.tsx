'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Category } from '@/types/database'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface CategoryGridProps {
    categories: (Category & { backgroundImage: string | null })[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
    if (categories.length === 0) return null

    // Special layout for 3 or more categories
    // If fewer, fallback to simple grid

    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Shop by Category
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Explore our wide range of premium collections
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[400px]">
                    {categories.slice(0, 5).map((category) => (
                        <div
                            key={category.id}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500",
                                // First item spans 2 columns on lg screens if we have 3+ items
                                categories.indexOf(category) === 0 && categories.length >= 3 ? "lg:col-span-2" : "col-span-1",
                                // if we have 4 or 5 items, maybe make the 4th item span 2 columns? Let's keep it simple for now, maybe just first one big
                            )}
                        >
                            <Link href={`/category/${category.slug}`} className="block w-full h-full">
                                {category.backgroundImage ? (
                                    <Image
                                        src={category.backgroundImage}
                                        alt={category.name}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                                <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-0 lg:translate-y-2 lg:group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{category.name}</h3>
                                    <div className="flex items-center text-white/90 font-medium opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 gap-2">
                                        Explore Collection <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}

                    {categories.length > 5 && (
                        <div className="flex items-center justify-center col-span-1 md:col-span-2 lg:col-span-3 mt-8">
                            <Link href="/categories" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10">
                                View All Categories
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
