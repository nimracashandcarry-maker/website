'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (file: File | null, existingUrl?: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  // Update preview when value changes (from props)
  useEffect(() => {
    if (value && !selectedFile) {
      const frameId = requestAnimationFrame(() => {
        setPreview(value)
      })
      return () => cancelAnimationFrame(frameId)
    }
  }, [value, selectedFile])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Notify parent of file selection (but don't upload yet)
    onChange(file, value)
  }

  const handleRemove = () => {
    setPreview(null)
    setSelectedFile(null)
    onChange(null, '')
    setError('')
    // Reset input
    const input = document.getElementById('image-upload') as HTMLInputElement
    if (input) input.value = ''
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Product Image</Label>
        {preview ? (
          <div className="mt-2 relative">
            <div className="relative w-full h-48 border rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Product preview"
                fill
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="mt-2"
            >
              <X className="w-4 h-4 mr-2" />
              Remove Image
            </Button>
          </div>
        ) : (
          <div className="mt-2">
            <Label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  Click to select image
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP up to 5MB (will upload on save)
                </p>
              </div>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={disabled}
                className="hidden"
              />
            </Label>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {value && !preview && (
        <div className="text-sm text-muted-foreground">
          Current image URL: {value.substring(0, 50)}...
        </div>
      )}
    </div>
  )
}

