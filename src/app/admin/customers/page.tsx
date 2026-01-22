import { Suspense } from 'react'
import Link from 'next/link'
import { getCustomers } from '@/lib/actions/admin/customers'
import { CustomersTable } from '@/components/admin/CustomersTable'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/admin/TableSkeleton'
import { Plus } from 'lucide-react'

export default async function AdminCustomersPage() {
  const customers = await getCustomers()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Link href="/admin/customers/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
        </Link>
      </div>
      <Suspense fallback={<TableSkeleton columns={6} />}>
        <CustomersTable customers={customers} />
      </Suspense>
    </div>
  )
}

