'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createProduct, updateProduct } from '@/lib/actions/admin/products'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Product, Category } from '@/types/database'
import { ImageUpload } from './ImageUpload'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a positive number',
  }),
  image_url: z.string().url().optional().or(z.literal('')),
  category_id: z.string().optional(),
  is_featured: z.boolean().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(product?.image_url || null)
  const errorRef = useRef<HTMLDivElement>(null)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      price: product?.price?.toString() || '',
      image_url: product?.image_url || '',
      category_id: product?.category_id || '__none__',
      is_featured: product?.is_featured || false,
    },
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    form.setValue('name', name)
    if (!product) {
      form.setValue('slug', generateSlug(name))
    }
  }

  // Scroll to error when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [error])

  // Scroll to first form field error on validation failure
  useEffect(() => {
    const errors = form.formState.errors
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
      if (errorElement) {
        setTimeout(() => {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          ;(errorElement as HTMLElement).focus()
        }, 100)
      }
    }
  }, [form.formState.errors])

  const onError = (errors: any) => {
    // Scroll to first error field
    const firstErrorField = Object.keys(errors)[0]
    const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
    if (errorElement) {
      setTimeout(() => {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        ;(errorElement as HTMLElement).focus()
      }, 100)
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    setError('')
    startTransition(async () => {
      try {
        let imageUrl = existingImageUrl || ''

        // Upload image if a new file was selected
        if (selectedImageFile) {
          const uploadFormData = new FormData()
          uploadFormData.append('file', selectedImageFile)
          const { uploadProductImage } = await import('@/lib/actions/upload')
          imageUrl = await uploadProductImage(uploadFormData)
        }

        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('slug', data.slug)
        formData.append('description', data.description || '')
        formData.append('price', data.price)
        formData.append('image_url', imageUrl || data.image_url || '')
        // Convert "__none__" back to empty string for no category
        formData.append('category_id', data.category_id === '__none__' ? '' : (data.category_id || ''))
        formData.append('is_featured', data.is_featured ? 'true' : 'false')

        if (product) {
          await updateProduct(product.id, formData, product.image_url)
        } else {
          await createProduct(formData)
        }

        router.push('/admin/products')
        router.refresh()
      } catch (err) {
        console.error('Error creating/updating product:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6 max-w-2xl">
        {error && (
          <div ref={errorRef} className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                URL-friendly identifier (lowercase, hyphens only)
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || '__none__'}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  value={existingImageUrl || field.value}
                  onChange={(file, existingUrl) => {
                    if (file) {
                      setSelectedImageFile(file)
                      setExistingImageUrl(null)
                    } else {
                      setSelectedImageFile(null)
                      setExistingImageUrl(existingUrl || null)
                    }
                    field.onChange(existingUrl || '')
                  }}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                Select an image (will upload on save) or enter a URL below
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Or enter Image URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Product</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Show this product in the featured products section on the home page
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={5}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : product ? 'Update' : 'Create'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

