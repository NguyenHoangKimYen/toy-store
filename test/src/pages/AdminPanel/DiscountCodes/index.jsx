import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Tag, Search, Plus, Edit, Trash2, Filter } from 'lucide-react'
import { getAllDiscountCodes, createDiscountCode, updateDiscountCode, deleteDiscountCode } from '@/services/discountCodes.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DiscountCodeModal from './components/DiscountCodeModal'
import DeleteConfirmDialog from './components/DeleteConfirmDialog'

const DiscountCodes = () => {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCode, setSelectedCode] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [codeToDelete, setCodeToDelete] = useState(null)

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      setLoading(true)
      const response = await getAllDiscountCodes()
      setCodes(response.discountCodes || response.data || [])
    } catch (error) {
      toast.error('Failed to fetch discount codes: ' + error.message)
      setCodes([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

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

  const filteredCodes = codes.filter(code =>
    code.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getUsagePercentage = (code) => {
    return ((code.usedCount || 0) / (code.usageLimit || 1)) * 100
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Tag className="w-8 h-8" />
            Discount Codes Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage discount codes for customers
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={16} />
          New Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search discount codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading discount codes...</div>
          ) : filteredCodes.length === 0 ? (
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
                            ${parseFloat(code.value?.$numberDecimal || code.value || 0).toFixed(2)} OFF
                          </p>
                        </div>
                        <div className="flex gap-1">
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
        </CardContent>
      </Card>

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
    </div>
  )
}

export default DiscountCodes
