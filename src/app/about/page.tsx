'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, Users, Truck, Globe } from 'lucide-react'

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0 bg-primary/90">
                        {/* Abstract or background pattern can be added here if needed, for now using primary color overlay */}
                        <div className="absolute inset-0 bg-black/40" />
                    </div>
                    <div className="relative z-10 container mx-auto px-4 text-center text-white">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-6xl font-bold mb-6"
                        >
                            About NimraCashAndCarry
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-xl md:text-2xl max-w-2xl mx-auto text-gray-100"
                        >
                            Serving the catering and food service industry with excellence and reliability.
                        </motion.p>
                    </div>
                </section>

                {/* Story Section */}
                <section className="py-20 container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-8 text-primary">Our Story</h2>
                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                            <p>
                                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </p>
                            <p>
                                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-16">Why Choose Us</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: Users,
                                    title: "Customer First",
                                    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                                },
                                {
                                    icon: CheckCircle2,
                                    title: "Quality Assured",
                                    desc: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                },
                                {
                                    icon: Truck,
                                    title: "Fast Logistics",
                                    desc: "Ut enim ad minim veniam, quis nostrud exercitation."
                                },
                                {
                                    icon: Globe,
                                    title: "Global Sourcing",
                                    desc: "Duis aute irure dolor in reprehenderit in voluptate."
                                }
                            ].map((value, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-center"
                                >
                                    <div className="flex justify-center mb-4">
                                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                                            <value.icon className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                                    <p className="text-muted-foreground">{value.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 text-center">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold mb-6">Ready to Partner With Us?</h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Join thousands of satisfied customers who trust NimraCashAndCarry for their business needs.
                        </p>
                        <Button asChild size="lg" className="rounded-full px-8 text-lg">
                            <Link href="/contact">Get in Touch</Link>
                        </Button>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
