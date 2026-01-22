import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-muted-foreground mb-8">Page not found</p>
        <Link
          href="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
      </main>
    </>
  )
}


