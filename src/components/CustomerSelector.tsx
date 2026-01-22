'use client'

import { useState, useEffect } from 'react'
import { getCustomers, searchCustomers } from '@/lib/actions/admin/customers'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, X, Check, Plus, Users, Loader2, UserPlus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'

type Customer = {
  id: string
  name: string
  email: string | null
  phone: string
  shipping_address: string
  city: string | null
  eir: string | null
  vat_number: string
}

// New customer without ID (pending approval)
type NewCustomerData = Omit<Customer, 'id'> & { isNew: true }

type CustomerOrNew = Customer | NewCustomerData

export function CustomerSelector({
  onSelect,
}: {
  onSelect: (customer: CustomerOrNew | null) => void
  selectedCustomerId?: string | null
}) {
  const [searchInput, setSearchInput] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOrNew | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    shipping_address: '',
    city: '',
    eir: '',
    vat_number: '',
  })

  // Load all customers on mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await getCustomers()
        setAllCustomers(data)
        setCustomers(data)
      } catch (error) {
        console.error('Error loading customers:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCustomers()
  }, [])

  // Search functionality
  useEffect(() => {
    if (searchInput.trim().length === 0) {
      setCustomers(allCustomers)
      return
    }

    const timer = setTimeout(async () => {
      if (searchInput.trim().length >= 2) {
        setIsSearching(true)
        try {
          const results = await searchCustomers(searchInput.trim())
          setCustomers(results)
        } catch (error) {
          console.error('Error searching customers:', error)
          setCustomers([])
        } finally {
          setIsSearching(false)
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, allCustomers])

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    onSelect(customer)
  }

  const handleClearSelection = () => {
    setSelectedCustomer(null)
    onSelect(null)
  }

  // Add new customer WITHOUT saving to DB - admin will approve later
  const handleAddNewCustomer = () => {
    const newCustomerData: NewCustomerData = {
      name: newCustomer.name,
      email: newCustomer.email || null,
      phone: newCustomer.phone,
      shipping_address: newCustomer.shipping_address,
      city: newCustomer.city || null,
      eir: newCustomer.eir || null,
      vat_number: newCustomer.vat_number,
      isNew: true,
    }

    setSelectedCustomer(newCustomerData)
    onSelect(newCustomerData)

    // Reset form and close dialog
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      shipping_address: '',
      city: '',
      eir: '',
      vat_number: '',
    })
    setShowAddForm(false)
  }

  const isNewCustomer = selectedCustomer && 'isNew' in selectedCustomer

  if (selectedCustomer) {
    return (
      <Card className={isNewCustomer ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30" : "border-green-500 bg-green-50 dark:bg-green-950/30"}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isNewCustomer ? (
              <>
                <UserPlus className="w-5 h-5 text-amber-600" />
                New Customer (Pending Approval)
              </>
            ) : (
              <>
                <Check className="w-5 h-5 text-green-600" />
                Selected Customer
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="font-semibold text-lg">{selectedCustomer.name}</p>
            <p className="text-sm text-muted-foreground">Phone: {selectedCustomer.phone}</p>
            {selectedCustomer.email && (
              <p className="text-sm text-muted-foreground">Email: {selectedCustomer.email}</p>
            )}
            <p className="text-sm text-muted-foreground">VAT: {selectedCustomer.vat_number}</p>
            <p className="text-sm text-muted-foreground">{selectedCustomer.shipping_address}</p>
            {(selectedCustomer.city || selectedCustomer.eir) && (
              <p className="text-sm text-muted-foreground">
                {[selectedCustomer.city, selectedCustomer.eir].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          {isNewCustomer && (
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 bg-amber-100 dark:bg-amber-900/50 p-2 rounded">
              This customer will be added after admin approval.
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelection}
            className="mt-4"
          >
            Change Customer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, phone, VAT, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchInput('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Customer will be created after admin approval.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new_name">Full Name *</Label>
                <Input
                  id="new_name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Customer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_phone">Phone Number *</Label>
                <Input
                  id="new_phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+353 1 234 5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_email">Email</Label>
                <Input
                  id="new_email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_vat">VAT Number *</Label>
                <Input
                  id="new_vat"
                  value={newCustomer.vat_number}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, vat_number: e.target.value }))}
                  placeholder="VAT number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_address">Shipping Address *</Label>
                <Textarea
                  id="new_address"
                  value={newCustomer.shipping_address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, shipping_address: e.target.value }))}
                  placeholder="Full shipping address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="new_city">City</Label>
                  <Input
                    id="new_city"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_eir">Eircode</Label>
                  <Input
                    id="new_eir"
                    value={newCustomer.eir}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, eir: e.target.value }))}
                    placeholder="Eircode"
                  />
                </div>
              </div>

              <Button
                onClick={handleAddNewCustomer}
                className="w-full"
                disabled={!newCustomer.name || !newCustomer.phone || !newCustomer.vat_number || !newCustomer.shipping_address}
              >
                Add Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Customer List */}
      <div className="border rounded-lg">
        <div className="p-3 bg-muted/50 border-b flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="font-medium text-sm">
            {searchInput ? `Search Results (${customers.length})` : `All Customers (${customers.length})`}
          </span>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading || isSearching ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              {isLoading ? 'Loading customers...' : 'Searching...'}
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchInput ? (
                <>
                  <p>No customers found for &quot;{searchInput}&quot;</p>
                  <Button
                    variant="link"
                    onClick={() => setShowAddForm(true)}
                    className="mt-2"
                  >
                    Add new customer
                  </Button>
                </>
              ) : (
                <>
                  <p>No customers yet</p>
                  <Button
                    variant="link"
                    onClick={() => setShowAddForm(true)}
                    className="mt-2"
                  >
                    Add your first customer
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors focus:outline-none focus:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="text-sm text-muted-foreground truncate">
                          {customer.email}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">{customer.vat_number}</div>
                      {customer.city && (
                        <div className="text-muted-foreground">{customer.city}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
