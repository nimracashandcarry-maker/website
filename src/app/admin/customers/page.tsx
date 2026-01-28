import { Suspense } from 'react'
import Link from 'next/link'
import { getCustomers, getPendingCustomers } from '@/lib/actions/admin/customers'
import { CustomersTable } from '@/components/admin/CustomersTable'
import { PendingCustomersTable } from '@/components/admin/PendingCustomersTable'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/admin/TableSkeleton'
import { Plus } from 'lucide-react'

export default async function AdminCustomersPage() {
  // Fetch customers - getPendingCustomers might fail if migration hasn't been run
  const customers = await getCustomers()

  let pendingCustomers: Awaited<ReturnType<typeof getPendingCustomers>> = []
  try {
    pendingCustomers = await getPendingCustomers()
  } catch (error) {
    // Migration hasn't been run yet, approval_status column doesn't exist
    console.log('Pending customers feature not available - run migration to enable')
  }

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

      {/* Pending Customers Section */}
      {pendingCustomers.length > 0 && (
        <PendingCustomersTable customers={pendingCustomers} />
      )}

      {/* All Customers Table */}
      <Suspense fallback={<TableSkeleton columns={6} />}>
        <CustomersTable customers={customers} />
      </Suspense>
    </div>
  )
}

