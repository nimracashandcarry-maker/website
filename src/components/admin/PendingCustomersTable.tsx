'use client'

import { useState } from 'react'
import { approveCustomer, rejectCustomer } from '@/lib/actions/admin/customers'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, X, Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type PendingCustomer = {
  id: string
  name: string
  email: string | null
  phone: string
  shipping_address: string
  city: string | null
  eir: string | null
  vat_number: string
  created_at: string
  created_by_employee: {
    name: string
    employee_id: string
  } | null
}

export function PendingCustomersTable({ customers }: { customers: PendingCustomer[] }) {
  const [isApproving, setIsApproving] = useState<string | null>(null)
  const [isRejecting, setIsRejecting] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [customerToReject, setCustomerToReject] = useState<PendingCustomer | null>(null)

  const handleApprove = async (id: string) => {
    setIsApproving(id)
    try {
      await approveCustomer(id)
    } catch (error) {
      console.error('Error approving customer:', error)
      alert('Failed to approve customer')
    } finally {
      setIsApproving(null)
    }
  }

  const handleRejectClick = (customer: PendingCustomer) => {
    setCustomerToReject(customer)
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!customerToReject) return

    setIsRejecting(customerToReject.id)
    try {
      await rejectCustomer(customerToReject.id)
      setRejectDialogOpen(false)
      setCustomerToReject(null)
    } catch (error) {
      console.error('Error rejecting customer:', error)
      alert('Failed to reject customer')
    } finally {
      setIsRejecting(null)
    }
  }

  if (customers.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold">Pending Approvals</h2>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          {customers.length}
        </Badge>
      </div>

      <div className="border rounded-lg border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>VAT Number</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {customer.shipping_address}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{customer.phone}</div>
                    {customer.email && (
                      <div className="text-muted-foreground">{customer.email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{customer.vat_number}</TableCell>
                <TableCell>
                  {customer.created_by_employee ? (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div>{customer.created_by_employee.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {customer.created_by_employee.employee_id}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(customer.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleApprove(customer.id)}
                      disabled={isApproving === customer.id || isRejecting === customer.id}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {isApproving === customer.id ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRejectClick(customer)}
                      disabled={isApproving === customer.id || isRejecting === customer.id}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject &quot;{customerToReject?.name}&quot;? This customer will not be available for orders.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={isRejecting !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={isRejecting !== null}
            >
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
