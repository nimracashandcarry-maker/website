import { Suspense } from 'react'
import Link from 'next/link'
import { getProducts } from '@/lib/actions/products'
import { ProductTable } from '@/components/admin/ProductTable'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/admin/TableSkeleton'
import { Plus } from 'lucide-react'

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Product
          </Button>
        </Link>
      </div>
      <Suspense fallback={<TableSkeleton columns={6} />}>
        <ProductTable products={products} />
      </Suspense>
    </div>
  )
}

