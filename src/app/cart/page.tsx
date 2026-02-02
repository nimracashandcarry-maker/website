'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">Your cart is empty</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              // Get the unique key for this cart item
              const itemKey = item.variation
                ? `${item.product.id}::${item.variation.id}`
                : item.product.id
              // Use variation price if available
              const itemPrice = item.variation
                ? item.variation.price
                : item.product.price

              return (
                <div key={itemKey} className="border rounded-lg p-4 flex gap-4">
                  {item.product.image_url ? (
                    <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      {item.product.name}
                      {item.variation && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          ({item.variation.attribute_type}: {item.variation.name})
                        </span>
                      )}
                    </h3>
                    <p className="text-muted-foreground mb-2">€{itemPrice.toFixed(2)}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              Math.max(1, item.quantity - 1),
                              item.variation?.id
                            )
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1
                            updateQuantity(item.product.id, Math.max(1, val), item.variation?.id)
                          }}
                          className="w-16 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateQuantity(item.product.id, item.quantity + 1, item.variation?.id)
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id, item.variation?.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <span className="ml-auto font-semibold">
                        €{(itemPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal (excl. VAT)</span>
                  <span>€{getTotal().toFixed(2)}</span>
                </div>

                {/* VAT Breakdown */}
                {(() => {
                  const vatBreakdown = items.reduce((acc, item) => {
                    const vatRate = item.product.vat_percentage || 0
                    // Use variation price if available
                    const itemPrice = item.variation
                      ? item.variation.price
                      : item.product.price
                    if (vatRate > 0) {
                      const itemTotal = itemPrice * item.quantity
                      const vatAmount = itemTotal * (vatRate / 100)
                      if (!acc[vatRate]) {
                        acc[vatRate] = 0
                      }
                      acc[vatRate] += vatAmount
                    }
                    return acc
                  }, {} as Record<number, number>)

                  const totalVat = Object.values(vatBreakdown).reduce((sum, val) => sum + val, 0)

                  return (
                    <>
                      {Object.entries(vatBreakdown).map(([rate, amount]) => (
                        <div key={rate} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">VAT ({rate}%)</span>
                          <span>€{Number(amount).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total {totalVat > 0 ? '(incl. VAT)' : ''}</span>
                          <span>€{(getTotal() + totalVat).toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
              <Button
                onClick={() => router.push('/checkout')}
                className="w-full mb-2"
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

