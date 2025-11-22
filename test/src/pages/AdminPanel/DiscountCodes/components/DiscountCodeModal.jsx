import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const DiscountCodeModal = ({ code, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    code: '',
    value: '',
    usageLimit: 1,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (code) {
      setFormData({
        code: code.code || '',
        value: parseFloat(code.value?.$numberDecimal || code.value || 0).toString(),
        usageLimit: code.usageLimit || 1,
      })
    }
  }, [code])

  const validateForm = () => {
    const newErrors = {}

    // Code validation (5 characters, alphanumeric)
    if (!formData.code) {
      newErrors.code = 'Code is required'
    } else if (!/^[A-Z0-9]{5}$/.test(formData.code.toUpperCase())) {
      newErrors.code = 'Code must be exactly 5 alphanumeric characters'
    }

    // Value validation
    if (!formData.value) {
      newErrors.value = 'Value is required'
    } else if (parseFloat(formData.value) <= 0) {
      newErrors.value = 'Value must be greater than 0'
    }

    // Usage limit validation
    if (!formData.usageLimit) {
      newErrors.usageLimit = 'Usage limit is required'
    } else if (formData.usageLimit < 1 || formData.usageLimit > 10) {
      newErrors.usageLimit = 'Usage limit must be between 1 and 10'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSave({
      code: formData.code.toUpperCase(),
      value: parseFloat(formData.value),
      usageLimit: parseInt(formData.usageLimit),
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {code ? 'Edit Discount Code' : 'Create New Discount Code'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="ABCD1"
              maxLength={5}
              className="font-mono text-lg"
              disabled={!!code} // Can't edit code once created
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code}</p>
            )}
            <p className="text-xs text-muted-foreground">
              5 alphanumeric characters (letters and numbers only)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              Discount Value ($) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="10.00"
            />
            {errors.value && (
              <p className="text-sm text-destructive">{errors.value}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageLimit">
              Usage Limit <span className="text-destructive">*</span>
            </Label>
            <Input
              id="usageLimit"
              type="number"
              min="1"
              max="10"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 1 })}
              placeholder="1"
            />
            {errors.usageLimit && (
              <p className="text-sm text-destructive">{errors.usageLimit}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Maximum 10 uses per code
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {code ? 'Update' : 'Create'} Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DiscountCodeModal
