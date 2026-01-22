import { getCategories } from '@/lib/actions/categories'
import { ProductForm } from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Product</h1>
      <ProductForm categories={categories} />
    </div>
  )
}

