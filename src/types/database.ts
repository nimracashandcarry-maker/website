export type Category = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  vat_percentage: number
  image_url: string | null
  category_id: string | null
  stock: number
  is_featured: boolean
  created_at: string
  category?: Category
}

export type Order = {
  id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  shipping_address: string
  city: string | null
  eir: string | null
  vat_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: string
  total_amount: number
  employee_id: string | null
  customer_id: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  vat_percentage: number
  quantity: number
  created_at: string
  product?: Product
}

export type CartItem = {
  product: Product
  quantity: number
}

export type UserDetails = {
  id: string
  user_id: string
  full_name: string
  email: string | null
  phone: string
  shipping_address: string
  city: string | null
  eir: string | null
  vat_number: string
  created_at: string
  updated_at: string
}

export type Employee = {
  id: string
  user_id: string
  employee_id: string
  name: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Customer = {
  id: string
  name: string
  email: string | null
  phone: string
  shipping_address: string
  city: string | null
  eir: string | null
  vat_number: string
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
