import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Tag, Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react'
import { getAllDiscountCodes, createDiscountCode, updateDiscountCode, deleteDiscountCode } from '@/services/discountCodes.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import Badge from '@/components/ui/badge'
import DiscountCodeModal from './components/DiscountCodeModal'
import DeleteConfirmDialog from './components/DeleteConfirmDialog'
import DiscountOrdersModal from './components/DiscountOrdersModal'
import { AdminContent } from '../components'
import { PageHeader, SearchBar } from '@/components/common'
import { useDebounce } from '@/hooks'

const DiscountCodes = () => {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 400) // Debounce search input
  const [sortBy, setSortBy] = useState('newest')
  const [selectedCode, setSelectedCode] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [codeToDelete, setCodeToDelete] = useState(null)
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [selectedCodeForOrders, setSelectedCodeForOrders] = useState(null)

  const fetchCodes = useCallback(async () => {
    try {
      setLoading(true)
      // Send search and sort params to backend
      const params = {
        search: debouncedSearch.trim() || undefined,
        sortBy: sortBy || 'newest', // Send sort to backend
      }
      const response = await getAllDiscountCodes(params)
      setCodes(response.discountCodes || response.data || [])
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch discount codes'
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        toast.error('Discount codes feature not available yet. Backend endpoint missing.')
      } else if (errorMessage.includes('Invalid token') || errorMessage.includes('401')) {
        toast.error('Session expired. Please login again.')
      } else {
        toast.error('Failed to fetch discount codes: ' + errorMessage)
      }
      setCodes([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, sortBy])

  useEffect(() => {
    fetchCodes()
  }, [fetchCodes])

  const handleCreate = () => {
    setSelectedCode(null)
    setShowModal(true)
  }

  const handleEdit = (code) => {
    setSelectedCode(code)
    setShowModal(true)
  }

  const handleDelete = (code) => {
    setCodeToDelete(code)
    setShowDeleteDialog(true)
  }

  const handleViewOrders = (code) => {
    setSelectedCodeForOrders(code)
    setShowOrdersModal(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteDiscountCode(codeToDelete._id)
      toast.success('Discount code deleted successfully')
      fetchCodes()
    } catch (error) {
      toast.error('Failed to delete discount code: ' + error.message)
    } finally {
      setShowDeleteDialog(false)
      setCodeToDelete(null)
    }
  }

  const handleSave = async (data) => {
    try {
      if (selectedCode) {
        await updateDiscountCode(selectedCode._id, data)
        toast.success('Discount code updated successfully')
      } else {
        await createDiscountCode(data)
        toast.success('Discount code created successfully')
      }
      fetchCodes()
      setShowModal(false)
    } catch (error) {
      toast.error(error.message || 'Failed to save discount code')
    }
  }

  // Sorting and filtering is now done on backend
  const filteredCodes = codes

  const getUsagePercentage = (code) => {
    return ((code.usedCount || 0) / (code.usageLimit || 1)) * 100
  }

  const headerCard = (
    <div className="admin-card bg-white/85 backdrop-blur-md border border-purple-100/70 rounded-2xl shadow-[0_18px_42px_-28px_rgba(124,58,237,0.22)] p-5 md:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-slate-900">Discount Codes</h2>
            <p className="text-sm text-slate-500">Create and manage discount codes for customers</p>
          </div>
          <div className="w-full md:w-auto grid grid-cols-12 gap-3 items-center">
            <label className="col-span-12 md:col-span-7 lg:col-span-8 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/85 border border-purple-100/80 shadow-inner backdrop-blur-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search discount codes..."
                className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </label>
            <div className="col-span-12 md:col-span-5 lg:col-span-4 flex justify-end gap-2">
              <button
                onClick={handleCreate}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-sky-400 text-white shadow-[0_10px_26px_-14px_rgba(124,58,237,0.35)] hover:brightness-105 transition flex items-center gap-2"
              >
                <Plus size={16} />
                <span>New Code</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <AdminContent
        loading={loading}
        header={headerCard}
        filters={null}
      >
        {filteredCodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No discount codes found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCodes.map((code) => {
                const usagePercentage = getUsagePercentage(code)
                const isFullyUsed = code.usedCount >= code.usageLimit

                return (
                  <Card key={code._id} className={`hover:shadow-md transition-shadow ${isFullyUsed ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-bold font-mono">{code.code}</span>
                            {isFullyUsed && <Badge variant="secondary">Expired</Badge>}
                          </div>
                          <p className="text-xl font-semibold text-primary">
                            {parseFloat(code.value?.$numberDecimal || code.value || 0).toLocaleString()}₫ OFF
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrders(code)}
                            title="View orders using this code"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(code)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(code)}
                          >
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Usage</span>
                          <span className="font-medium">
                            {code.usedCount || 0} / {code.usageLimit || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isFullyUsed ? 'bg-gray-400' : 'bg-primary'
                            }`}
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        <p>Created: {new Date(code.createdAt).toLocaleDateString()}</p>
                        <p>By: {code.createdBy?.fullname || code.createdBy?.email || 'Admin'}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
      </AdminContent>

      {showModal && (
        <DiscountCodeModal
          code={selectedCode}
          onClose={() => {
            setShowModal(false)
            setSelectedCode(null)
          }}
          onSave={handleSave}
        />
      )}

      {showDeleteDialog && (
        <DeleteConfirmDialog
          codeName={codeToDelete?.code}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteDialog(false)
            setCodeToDelete(null)
          }}
        />
      )}

      {showOrdersModal && (
        <DiscountOrdersModal
          discountCode={selectedCodeForOrders}
          onClose={() => {
            setShowOrdersModal(false)
            setSelectedCodeForOrders(null)
          }}
        />
      )}
    </>
  )
}

export default DiscountCodes
