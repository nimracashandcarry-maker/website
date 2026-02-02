'use client'

import { useState, useMemo } from 'react'
import { ProductVariation } from '@/types/database'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  variations: ProductVariation[]
  selectedVariation: ProductVariation | null
  onSelect: (variation: ProductVariation) => void
}

export function VariationSelector({ variations, selectedVariation, onSelect }: Props) {
  // Group variations by attribute type
  const groupedVariations = useMemo(() => {
    const groups: Record<string, ProductVariation[]> = {}
    for (const variation of variations) {
      if (!groups[variation.attribute_type]) {
        groups[variation.attribute_type] = []
      }
      groups[variation.attribute_type].push(variation)
    }
    return groups
  }, [variations])

  const attributeTypes = Object.keys(groupedVariations)

  // If there's only one attribute type, show a simple selector
  if (attributeTypes.length === 1) {
    const type = attributeTypes[0]
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{type}</label>
        <div className="flex flex-wrap gap-2">
          {groupedVariations[type].map((variation) => (
            <Button
              key={variation.id}
              type="button"
              variant={selectedVariation?.id === variation.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelect(variation)}
              className={cn(
                'min-w-[60px]',
                selectedVariation?.id === variation.id && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {variation.name}
              <span className="ml-2 text-xs opacity-75">€{variation.price.toFixed(2)}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  // For multiple attribute types, show grouped selectors
  return (
    <div className="space-y-4">
      {attributeTypes.map((type) => (
        <div key={type} className="space-y-2">
          <label className="text-sm font-medium">{type}</label>
          <div className="flex flex-wrap gap-2">
            {groupedVariations[type].map((variation) => (
              <Button
                key={variation.id}
                type="button"
                variant={selectedVariation?.id === variation.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSelect(variation)}
                className={cn(
                  'min-w-[60px]',
                  selectedVariation?.id === variation.id && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                {variation.name}
                <span className="ml-2 text-xs opacity-75">€{variation.price.toFixed(2)}</span>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
