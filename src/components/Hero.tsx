'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Hero() {
    return (
        <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-background pt-20 md:pt-0">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/catering-hero.png"
                    alt="Premium Catering Supplies"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto space-y-6"
                >
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-primary/80 backdrop-blur-md text-xs sm:text-sm font-medium tracking-wider uppercase mb-2 sm:mb-4"
                    >
                        Wholesale & Retail Supplier
                    </motion.span>

                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight drop-shadow-lg">
                        Premium Catering & <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-white block sm:inline mt-2 sm:mt-0">
                            Food Packaging Supplies
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-2xl text-white font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-xl px-2">
                        Your trusted partner for high-quality packaging, spices, and catering essentials. Direct from the factory to your door.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mt-8 w-full sm:w-auto px-4 sm:px-0"
                    >
                        <Button asChild size="lg" className="w-full sm:w-auto text-lg h-12 sm:h-14 px-8 rounded-full bg-primary text-white hover:bg-primary/90 transition-all font-semibold border-2 border-primary">
                            <Link href="/products">
                                Shop Catalog
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12 sm:h-14 px-8 rounded-full border-white/50 text-white hover:bg-white/10 hover:text-white hover:border-white transition-all backdrop-blur-sm bg-white/10 sm:bg-transparent">
                            <Link href="/categories">
                                View Categories
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="hidden md:block absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-white/70">Scroll</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
                </div>
            </motion.div>
        </div>
    )
}
