import { Suspense } from 'react'
import { Navbar } from './Navbar'
import { NavbarSkeleton } from './skeletons'
import { getCategoriesCached } from '@/lib/actions/categories'

// Server component that fetches categories and passes to client Navbar
export async function NavbarServer() {
  const categories = await getCategoriesCached()

  return <Navbar initialCategories={categories} />
}

// Wrapper with Suspense for easy usage
export function NavbarWithSuspense() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <NavbarServer />
    </Suspense>
  )
}
