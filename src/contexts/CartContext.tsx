'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, CartItem, ProductVariation } from '@/types/database'

// Helper to create a unique cart key for a product + variation combo
function getCartItemKey(productId: string, variationId?: string): string {
  return variationId ? `${productId}::${variationId}` : productId
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number, variation?: ProductVariation) => void
  removeFromCart: (productId: string, variationId?: string) => void
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number // Total quantity of all items
  getUniqueItemCount: () => number // Number of unique products
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (error) {
          console.error('Error loading cart from localStorage:', error)
        }
      }
    })
    return () => cancelAnimationFrame(frameId)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product, quantity: number = 1, variation?: ProductVariation) => {
    setItems((prevItems) => {
      const itemKey = getCartItemKey(product.id, variation?.id)
      const existingItem = prevItems.find(
        (item) => getCartItemKey(item.product.id, item.variation?.id) === itemKey
      )
      if (existingItem) {
        return prevItems.map((item) =>
          getCartItemKey(item.product.id, item.variation?.id) === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevItems, { product, quantity, variation }]
    })
  }

  const removeFromCart = (productId: string, variationId?: string) => {
    const itemKey = getCartItemKey(productId, variationId)
    setItems((prevItems) =>
      prevItems.filter(
        (item) => getCartItemKey(item.product.id, item.variation?.id) !== itemKey
      )
    )
  }

  const updateQuantity = (productId: string, quantity: number, variationId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variationId)
      return
    }
    const itemKey = getCartItemKey(productId, variationId)
    setItems((prevItems) =>
      prevItems.map((item) =>
        getCartItemKey(item.product.id, item.variation?.id) === itemKey
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotal = () => {
    return items.reduce((total, item) => {
      // Use variation price if available, otherwise use product price
      const price = item.variation ? item.variation.price : item.product.price
      return total + price * item.quantity
    }, 0)
  }

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  const getUniqueItemCount = () => {
    return items.length
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        getUniqueItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}


