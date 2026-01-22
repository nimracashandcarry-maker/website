'use server'

import { createClient } from '@/lib/supabase/server'
import { Order, OrderItem } from '@/types/database'
import { sendOrderConfirmationEmail, sendNewOrderNotificationEmail } from '@/lib/email'

export async function createOrder(orderData: {
  customer_name: string
  customer_email?: string
  customer_phone: string
  shipping_address: string
  city?: string
  eir?: string
  vat_number: string
  items: Array<{ product_id: string; product_name: string; product_price: number; quantity: number }>
  employee_id?: string
  customer_id?: string
}): Promise<string> {
  const supabase = await createClient()
  const { getEmployee } = await import('@/lib/auth')

  // Get employee if exists (for employee orders)
  const employee = await getEmployee()
  const employeeId = orderData.employee_id || employee?.id || null

  // Calculate total
  const total_amount = orderData.items.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  )

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email || null,
      customer_phone: orderData.customer_phone,
      shipping_address: orderData.shipping_address,
      city: orderData.city || null,
      eir: orderData.eir || null,
      vat_number: orderData.vat_number,
      total_amount,
      status: 'pending',
      payment_method: 'cash_on_delivery',
      employee_id: employeeId,
      customer_id: orderData.customer_id || null,
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Order creation error:', orderError)
    throw new Error(orderError?.message || 'Failed to create order')
  }

  // Create order items
  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_price: item.product_price,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Order items creation error:', itemsError)
    // Try to delete the order if items failed
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error(itemsError.message || 'Failed to create order items')
  }

  // Send email notifications (don't block on failure)
  const emailData = {
    orderId: order.id,
    customerName: orderData.customer_name,
    customerEmail: orderData.customer_email,
    customerPhone: orderData.customer_phone,
    shippingAddress: orderData.shipping_address,
    city: orderData.city,
    items: orderData.items.map(item => ({
      productName: item.product_name,
      productPrice: item.product_price,
      quantity: item.quantity,
    })),
    totalAmount: total_amount,
  }

  // Send emails asynchronously (don't await to not block the response)
  Promise.all([
    sendOrderConfirmationEmail(emailData),
    sendNewOrderNotificationEmail(emailData),
  ]).catch(error => {
    console.error('Failed to send order emails:', error)
  })

  return order.id
}

export async function getOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data || []
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data
}

