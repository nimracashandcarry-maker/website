'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order status:', error)
    throw new Error(error.message || 'Failed to update order status')
  }

  revalidatePath('/admin/orders')
}

export async function deleteOrder(orderId: string) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  // First delete order items (if any)
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', orderId)

  if (itemsError) {
    console.error('Error deleting order items:', itemsError)
    throw new Error(itemsError.message || 'Failed to delete order items')
  }

  // Then delete the order
  const { error: orderError } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)

  if (orderError) {
    console.error('Error deleting order:', orderError)
    throw new Error(orderError.message || 'Failed to delete order')
  }

  revalidatePath('/admin/orders')
}


