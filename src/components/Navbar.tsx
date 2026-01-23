'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, Menu, User, LogOut, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Category } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchBar } from '@/components/SearchBar'

interface NavbarProps {
  initialCategories?: Category[]
}

export function Navbar({ initialCategories }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { getUniqueItemCount } = useCart()
  const itemCount = getUniqueItemCount()
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Memoize supabase client to avoid recreating on each render
  const supabase = useMemo(() => createClient(), [])

  // Prevent hydration mismatch by only rendering interactive elements after mount
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(frameId)
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Only fetch categories if not provided from server
    if (!initialCategories || initialCategories.length === 0) {
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => setCategories(data))
        .catch(() => setCategories([]))
    }

    // Get current user session
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: { user: SupabaseUser | null } | null) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase, initialCategories])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Determine if we should force solid background (not on home page)
  const isHome = pathname === '/'
  const showTransparent = isHome && !isScrolled

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out px-4 py-2",
          showTransparent
            ? "bg-transparent border-transparent"
            : "bg-background/80 backdrop-blur-md border-b shadow-sm py-3"
        )}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Image
                  src="/c_logo.png"
                  alt="NimraCashAndCarry"
                  width={240}
                  height={80}
                  className="h-18 w-auto object-contain relative z-10"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col" style={{ fontFamily: 'var(--font-manrope)' }}>
                <span className={cn(
                  "text-2xl font-extrabold tracking-tight leading-none",
                  showTransparent ? "text-white" : "text-foreground"
                )}>
                  Nimra
                </span>
                <span className={cn(
                  "text-xs font-semibold tracking-[0.15em] uppercase",
                  showTransparent ? "text-white/80" : "text-primary"
                )}>
                  Cash & Carry
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  {categories.length > 0 && (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className={cn(
                        "rounded-full bg-transparent hover:bg-primary/10 data-[state=open]:bg-primary/10",
                        showTransparent ? "text-white hover:text-white hover:bg-white/20 data-[state=open]:bg-white/20" : "text-foreground"
                      )}>
                        Categories
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {categories.map((category) => (
                            <NavigationMenuLink key={category.id} asChild>
                              <Link
                                href={`/category/${category.slug}`}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">
                                  {category.name}
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )}

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/products" className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-primary/10",
                        showTransparent ? "text-white hover:text-white hover:bg-white/20" : "text-foreground hover:text-primary"
                      )}>
                        Products
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/about" className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-primary/10",
                        showTransparent ? "text-white hover:text-white hover:bg-white/20" : "text-foreground hover:text-primary"
                      )}>
                        About
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/contact" className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-primary/10",
                        showTransparent ? "text-white hover:text-white hover:bg-white/20" : "text-foreground hover:text-primary"
                      )}>
                        Contact
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <div className="flex items-center gap-2 pl-4 border-l border-border/40">
                <AnimatePresence mode="wait">
                  {isSearchOpen ? (
                    <motion.div
                      key="search-bar"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <SearchBar
                        showTransparent={showTransparent}
                        onClose={() => setIsSearchOpen(false)}
                        className="w-[280px]"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="search-button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "rounded-full",
                          showTransparent ? "text-white hover:bg-white/20 hover:text-white" : ""
                        )}
                        onClick={() => setIsSearchOpen(true)}
                      >
                        <Search className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Link href="/cart">
                  <Button variant="ghost" size="icon" className={cn(
                    "rounded-full relative",
                    showTransparent ? "text-white hover:bg-white/20 hover:text-white" : ""
                  )}>
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {mounted && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn(
                        "rounded-full cursor-pointer",
                        showTransparent ? "text-white hover:bg-white/20 hover:text-white" : ""
                      )}>
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : mounted && !user ? (
                  <Button asChild variant={showTransparent ? "secondary" : "default"} className="rounded-full px-6">
                    <Link href="/login">Login</Link>
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={showTransparent ? "text-white" : ""}
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </Button>
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className={showTransparent ? "text-white" : ""}>
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              {mounted ? (
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className={showTransparent ? "text-white" : ""}>
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle className="text-left">Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-4 mt-8">
                      {/* Mobile Search Bar */}
                      <div className="px-2">
                        <SearchBar onClose={() => setIsOpen(false)} />
                      </div>

                      {categories.length > 0 && (
                        <div className="space-y-2">
                          <div className="px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Categories</div>
                          <div className="flex flex-col gap-1">
                            {categories.map((category) => (
                              <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 rounded-lg hover:bg-muted transition-colors ml-2"
                              >
                                {category.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      <Link
                        href="/products"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 rounded-lg hover:bg-muted transition-colors text-lg font-medium"
                      >
                        Products
                      </Link>

                      <Link
                        href="/about"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 rounded-lg hover:bg-muted transition-colors text-lg font-medium"
                      >
                        About
                      </Link>

                      <Link
                        href="/contact"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 rounded-lg hover:bg-muted transition-colors text-lg font-medium"
                      >
                        Contact
                      </Link>

                      <div className="h-px bg-border my-2" />

                      {user ? (
                        <>
                          <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-3 rounded-lg hover:bg-muted transition-colors text-lg flex items-center gap-3"
                          >
                            <User className="w-5 h-5" />
                            Profile
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout()
                              setIsOpen(false)
                            }}
                            className="px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-lg flex items-center gap-3 text-left w-full"
                          >
                            <LogOut className="w-5 h-5" />
                            Logout
                          </button>
                        </>
                      ) : (
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-3 rounded-lg bg-primary text-primary-foreground text-center font-medium mt-4"
                        >
                          Login
                        </Link>
                      )}
                    </nav>
                  </SheetContent>
                </Sheet>
              ) : (
                <Button variant="ghost" size="icon" className={showTransparent ? "text-white" : ""}>
                  <Menu className="w-6 h-6" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm md:hidden"
          >
            <div className="container mx-auto px-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchBar
                    onClose={() => setIsSearchOpen(false)}
                    className="w-full"
                    inputClassName="h-12 text-base"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(false)}
                  className="h-12 w-12"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("h-20", isHome ? "hidden" : "block")} />
    </>
  )
}
