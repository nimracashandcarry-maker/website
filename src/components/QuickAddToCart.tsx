'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { createClient } from '@/lib/supabase/client'
import { Product, ProductVariation } from '@/types/database'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { User } from '@supabase/supabase-js'

export function QuickAddToCart({ product }: { product: Product }) {
  const router = useRouter()
  const supabase = createClient()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)

  // Get default variation if exists
  const defaultVariation = useMemo<ProductVariation | undefined>(() => {
    if (!product.variations || product.variations.length === 0) return undefined
    return product.variations.find((v) => v.is_default) || product.variations[0]
  }, [product.variations])

  useEffect(() => {
    // Check session first, which is more reliable
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: User | null } | null) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1, defaultVariation)
    const variationText = defaultVariation ? ` (${defaultVariation.name})` : ''
    toast({
      title: 'Added to cart',
      description: `${product.name}${variationText} has been added to your cart.`,
      variant: 'success',
    })
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1, defaultVariation)
    if (!user) {
      router.push('/login?redirect=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddToCart}
          className="flex-1 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
        <Button
          size="sm"
          onClick={handleBuyNow}
          className="flex-1 cursor-pointer"
        >
          <Zap className="w-4 h-4 mr-2" />
          Buy Now
        </Button>
      </div>
    </div>
  )
}

