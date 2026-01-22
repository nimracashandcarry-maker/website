import { Navbar } from './Navbar'
import { getCategoriesCached } from '@/lib/actions/categories'

// Server component that fetches categories and passes to client Navbar
export async function NavbarServer() {
  const categories = await getCategoriesCached()

  return <Navbar initialCategories={categories} />
}

// Direct export - navbar renders immediately, categories load dynamically if needed
export function NavbarWithSuspense() {
  return <Navbar />
}
