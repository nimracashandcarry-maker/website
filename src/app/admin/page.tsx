import { getCategories } from '@/lib/actions/categories'
import { getProducts } from '@/lib/actions/products'
import { getOrders } from '@/lib/actions/orders'

export default async function AdminDashboardPage() {
  const [categories, products, orders] = await Promise.all([
    getCategories(),
    getProducts(),
    getOrders(),
  ])

  const pendingOrders = orders.filter((o) => o.status === 'pending').length

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-2">Categories</h2>
          <p className="text-4xl font-bold">{categories.length}</p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-2">Products</h2>
          <p className="text-4xl font-bold">{products.length}</p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-2">Orders</h2>
          <p className="text-4xl font-bold">{orders.length}</p>
          {pendingOrders > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {pendingOrders} pending
            </p>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <ul className="space-y-2">
          <li>• Manage categories and products from the sidebar</li>
          <li>• Create new categories to organize your products</li>
          <li>• Add products with images, descriptions, and prices</li>
          <li>• View and manage orders from the Orders page</li>
        </ul>
      </div>
    </div>
  )
}

