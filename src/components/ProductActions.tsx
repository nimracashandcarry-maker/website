'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter()
  const supabase = createClient()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [user, setUser] = useState<any>(null)

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleAddToCart = () => {
    if (quantity > 0) {
      addToCart(product, quantity)
      toast({
        title: 'Added to cart',
        description: `${quantity} x ${product.name} has been added to your cart.`,
        variant: 'success',
      })
    }
  }

  const handleBuyNow = () => {
    if (quantity > 0) {
      addToCart(product, quantity)
      if (!user) {
        router.push('/login?redirect=/checkout')
      } else {
        router.push('/checkout')
      }
    }
  }

  return (
    <div className="space-y-4">
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

