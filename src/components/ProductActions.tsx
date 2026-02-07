'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { createClient } from '@/lib/supabase/client'
import { Product, ProductVariation } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { VariationSelector } from '@/components/VariationSelector'
import type { User } from '@supabase/supabase-js'

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter()
  const supabase = createClient()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [user, setUser] = useState<User | null>(null)

  // Find default variation or use first one
  const defaultVariation = useMemo(() => {
    if (!product.variations || product.variations.length === 0) return null
    return product.variations.find((v) => v.is_default) || product.variations[0]
  }, [product.variations])

  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(defaultVariation)

  // Update selected variation when product changes
  useEffect(() => {
    setSelectedVariation(defaultVariation)
  }, [defaultVariation])

  // Get the effective price (variation price or base price) without VAT
  const effectivePrice = selectedVariation ? selectedVariation.price : product.price

  const hasVariations = product.variations && product.variations.length > 0

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

  const handleAddToCart = () => {
    if (quantity > 0) {
      // If product has variations but none selected, require selection
      if (hasVariations && !selectedVariation) {
        toast({
          title: 'Please select an option',
          description: 'Please select a variation before adding to cart.',
          variant: 'destructive',
        })
        return
      }
      addToCart(product, quantity, selectedVariation || undefined)
      const variationText = selectedVariation ? ` (${selectedVariation.name})` : ''
      toast({
        title: 'Added to cart',
        description: `${quantity} x ${product.name}${variationText} has been added to your cart.`,
        variant: 'success',
      })
    }
  }

  const handleBuyNow = () => {
    if (quantity > 0) {
      // If product has variations but none selected, require selection
      if (hasVariations && !selectedVariation) {
        toast({
          title: 'Please select an option',
          description: 'Please select a variation before proceeding.',
          variant: 'destructive',
        })
        return
      }
      addToCart(product, quantity, selectedVariation || undefined)
      if (!user) {
        router.push('/login?redirect=/checkout')
      } else {
        router.push('/checkout')
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Show variation selector if product has variations */}
      {hasVariations && product.variations && (
        <div className="pb-4 border-b">
          <VariationSelector
            variations={product.variations}
            selectedVariation={selectedVariation}
            onSelect={setSelectedVariation}
          />
        </div>
      )}

      {/* Show price */}
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">€{effectivePrice.toFixed(2)}</span>
          {product.vat_percentage > 0 && (
            <span className="text-sm text-muted-foreground">VAT: {product.vat_percentage}%</span>
          )}
        </div>
        {hasVariations && selectedVariation && (
          <p className="text-sm text-muted-foreground mt-1">
            {selectedVariation.attribute_type}: {selectedVariation.name}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Quantity:</label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => {
            const val = Math.max(1, parseInt(e.target.value) || 1)
            setQuantity(val)
          }}
          className="w-20"
        />
      </div>
      <div className="flex gap-4">
        <Button
          onClick={handleAddToCart}
          variant="outline"
          className="flex-1 cursor-pointer"
          disabled={quantity <= 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
        <Button
          onClick={handleBuyNow}
          className="flex-1 cursor-pointer"
          disabled={quantity <= 0}
        >
          <Zap className="w-4 h-4 mr-2" />
          Buy Now
        </Button>
      </div>
    </div>
  )
}

