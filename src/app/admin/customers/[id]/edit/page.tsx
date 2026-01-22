import { notFound } from 'next/navigation'
import { getCustomerById } from '@/lib/actions/admin/customers'
import { CustomerForm } from '@/components/admin/CustomerForm'

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customer = await getCustomerById(id)

  if (!customer) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Customer</h1>
      <CustomerForm customer={customer} />
    </div>
  )
}

