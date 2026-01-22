import { Suspense } from 'react'
import Link from 'next/link'
import { getCategories } from '@/lib/actions/categories'
import { CategoryTable } from '@/components/admin/CategoryTable'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/admin/TableSkeleton'
import { Plus } from 'lucide-react'

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        </Link>
      </div>
      <Suspense fallback={<TableSkeleton columns={4} />}>
        <CategoryTable categories={categories} />
      </Suspense>
    </div>
  )
}

