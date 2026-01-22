import { Suspense } from 'react'
import Link from 'next/link'
import { getEmployees } from '@/lib/actions/admin/employees'
import { EmployeesTable } from '@/components/admin/EmployeesTable'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/admin/TableSkeleton'
import { Plus } from 'lucide-react'

export default async function AdminEmployeesPage() {
  const employees = await getEmployees()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Link href="/admin/employees/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Employee
          </Button>
        </Link>
      </div>
      <Suspense fallback={<TableSkeleton columns={5} />}>
        <EmployeesTable employees={employees} />
      </Suspense>
    </div>
  )
}

