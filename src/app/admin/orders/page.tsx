import { Suspense } from 'react'
import { getOrders } from '@/lib/actions/orders'
import { OrdersTable } from '@/components/admin/OrdersTable'
import { TableSkeleton } from '@/components/admin/TableSkeleton'

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>
      <Suspense fallback={<TableSkeleton columns={7} />}>
        <OrdersTable orders={orders} />
      </Suspense>
    </div>
  )
}

