'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createProduct, updateProduct, VariationInput } from '@/lib/actions/admin/products'
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
import { Product, Category, ProductVariation } from '@/types/database'
import { ImageUpload } from './ImageUpload'
import { Plus, Trash2, Package, DollarSign, Image as ImageIcon, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const ATTRIBUTE_TYPES = ['Size', 'Color', 'Volume', 'Weight', 'Style', 'Material', 'Other']

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a positive number',
  }),
  vat_percentage: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: 'VAT must be between 0 and 100',
  }),
  image_url: z.string().url().optional().or(z.literal('')),
  category_id: z.string().optional(),
  is_featured: z.boolean().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

type LocalVariation = {
  id: string
  attribute_type: string
  name: string
  price: string
  is_default: boolean
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(product?.image_url || null)
  const errorRef = useRef<HTMLDivElement>(null)

  // Variations state
  const [variations, setVariations] = useState<LocalVariation[]>(() => {
    if (product?.variations && product.variations.length > 0) {
      return product.variations.map((v) => ({
        id: v.id,
        attribute_type: v.attribute_type,
        name: v.name,
        price: v.price.toString(),
        is_default: v.is_default,
      }))
    }
    return []
  })

  const addVariation = () => {
    // If this is the first variation and no base price is set, set a placeholder
    if (variations.length === 0 && !form.getValues('price')) {
      form.setValue('price', '0.01')
    }
    setVariations([
      ...variations,
      {
        id: `temp-${Date.now()}`,
        attribute_type: 'Size',
        name: '',
        price: '',
        is_default: variations.length === 0,
      },
    ])
  }

  const removeVariation = (index: number) => {
    const newVariations = variations.filter((_, i) => i !== index)
    // If we removed the default, make the first one default
    if (newVariations.length > 0 && !newVariations.some((v) => v.is_default)) {
      newVariations[0].is_default = true
    }
    setVariations(newVariations)
  }

  const updateVariation = (index: number, field: keyof LocalVariation, value: string | boolean) => {
    const newVariations = [...variations]
    if (field === 'is_default' && value === true) {
      // Only one can be default
      newVariations.forEach((v, i) => {
        v.is_default = i === index
      })
    } else {
      newVariations[index] = { ...newVariations[index], [field]: value }
    }
    setVariations(newVariations)
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      price: product?.price?.toString() || '',
      vat_percentage: product?.vat_percentage?.toString() || '0',
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

  const onError = (errors: FieldErrors<ProductFormValues>) => {
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

    // Validate variations
    const validVariations = variations.filter((v) => v.name.trim() && v.price)
    for (const v of validVariations) {
      if (isNaN(parseFloat(v.price)) || parseFloat(v.price) <= 0) {
        setError(`Variation "${v.name}" has an invalid price`)
        return
      }
    }

    // If variations exist, ensure at least one is marked as default
    if (validVariations.length > 0 && !validVariations.some((v) => v.is_default)) {
      validVariations[0].is_default = true
    }

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

        // When variations exist, use the default variation's price as base price
        let priceToSave = data.price
        if (validVariations.length > 0) {
          const defaultVar = validVariations.find((v) => v.is_default) || validVariations[0]
          priceToSave = defaultVar.price
        }

        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('slug', data.slug)
        formData.append('description', data.description || '')
        formData.append('price', priceToSave)
        formData.append('vat_percentage', data.vat_percentage)
        formData.append('image_url', imageUrl || data.image_url || '')
        // Convert "__none__" back to empty string for no category
        formData.append('category_id', data.category_id === '__none__' ? '' : (data.category_id || ''))
        formData.append('is_featured', data.is_featured ? 'true' : 'false')

        // Convert local variations to VariationInput format
        const variationsInput: VariationInput[] = validVariations.map((v) => ({
          attribute_type: v.attribute_type,
          name: v.name,
          price: parseFloat(v.price),
          is_default: v.is_default,
        }))

        if (product) {
          await updateProduct(product.id, formData, product.image_url, variationsInput)
        } else {
          await createProduct(formData, variationsInput)
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
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8 max-w-3xl">
        {error && (
          <div ref={errorRef} className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value)}
                      disabled={isPending}
                      placeholder="Enter product name"
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
                  <FormLabel>URL Slug *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="product-url-slug" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                    <SelectTrigger className="w-full md:w-1/2">
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    disabled={isPending}
                    placeholder="Describe your product..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Pricing</h2>
          </div>

          {/* Pricing Mode Info */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <p className="text-sm font-medium mb-2">
              {variations.length > 0
                ? '📦 Using Variations Mode'
                : '💰 Using Base Price Mode'}
            </p>
            <p className="text-sm text-muted-foreground">
              {variations.length > 0
                ? 'Product price is determined by the default variation. The default variation will be shown on product cards.'
                : 'Add variations below to offer different sizes, colors, or options with their own prices.'}
            </p>
          </div>

          {/* Base Price - Only shown when no variations */}
          {variations.length === 0 && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (€) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      disabled={isPending}
                      className="w-full md:w-48"
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Product Variations */}
          <div className="mt-6 space-y-4 border rounded-xl p-5 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  Product Variations
                  {variations.length > 0 && (
                    <Badge variant="secondary" className="font-normal">
                      {variations.length} {variations.length === 1 ? 'variant' : 'variants'}
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {variations.length > 0
                    ? 'The default variation price will be used on product cards'
                    : 'Add size, color, or other options with different prices'}
                </p>
              </div>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={addVariation}
                disabled={isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {variations.length > 0 ? (
              <div className="space-y-3">
                {variations.map((variation, index) => (
                  <div
                    key={variation.id}
                    className={`relative flex flex-wrap gap-3 p-4 rounded-lg border bg-background ${
                      variation.is_default ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'
                    }`}
                  >
                    {variation.is_default && (
                      <Badge className="absolute -top-2 left-3 text-xs">Default (shown on cards)</Badge>
                    )}

                    <div className="flex-1 min-w-[120px]">
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Type
                      </label>
                      <Select
                        value={variation.attribute_type}
                        onValueChange={(value) => updateVariation(index, 'attribute_type', value)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ATTRIBUTE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-[2] min-w-[150px]">
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Name
                      </label>
                      <Input
                        placeholder="e.g., Large, Blue, 500ml"
                        value={variation.name}
                        onChange={(e) => updateVariation(index, 'name', e.target.value)}
                        disabled={isPending}
                        className="h-10"
                      />
                    </div>

                    <div className="w-28">
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Price (€)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={variation.price}
                        onChange={(e) => updateVariation(index, 'price', e.target.value)}
                        disabled={isPending}
                        className="h-10"
                      />
                    </div>

                    <div className="flex items-end gap-2 pb-1">
                      {!variation.is_default && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateVariation(index, 'is_default', true)}
                          disabled={isPending}
                          className="h-10 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariation(index)}
                        disabled={isPending}
                        className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed rounded-lg bg-background">
                <p className="text-muted-foreground">No variations added</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The base price above will be used for this product
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Product Image</h2>
          </div>

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
        </div>

        {/* Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="vat_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT Percentage (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="e.g., 23"
                      {...field}
                      disabled={isPending}
                      className="w-32"
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Applied to all prices including variations
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
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
                      Show on homepage featured section
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

