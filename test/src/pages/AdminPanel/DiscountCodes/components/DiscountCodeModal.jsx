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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const DiscountCodeModal = ({ code, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    code: '',
    value: '',
    usageLimit: 1,
    requiredTier: 'none',
    expiresAt: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (code) {
      setFormData({
        code: code.code || '',
        value: parseFloat(code.value?.$numberDecimal || code.value || 0).toString(),
        usageLimit: code.usageLimit || 1,
        requiredTier: code.requiredTier || 'none',
        expiresAt: code.expiresAt ? new Date(code.expiresAt).toISOString().split('T')[0] : '',
      })
    }
  }, [code])

  const validateForm = () => {
    const newErrors = {}

    // Code validation (8-12 characters, alphanumeric)
    if (!formData.code) {
      newErrors.code = 'Code is required'
    } else if (!/^[A-Z0-9]{8,12}$/.test(formData.code.toUpperCase())) {
      newErrors.code = 'Code must be 8-12 alphanumeric characters'
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

    const saveData = {
      code: formData.code.toUpperCase(),
      value: parseFloat(formData.value),
      usageLimit: parseInt(formData.usageLimit),
      requiredTier: formData.requiredTier,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
    }

    onSave(saveData)
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
              placeholder="DISCOUNT01"
              maxLength={12}
              className="font-mono text-lg"
              disabled={!!code} // Can't edit code once created
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code}</p>
            )}
            <p className="text-xs text-muted-foreground">
              8-12 alphanumeric characters (letters and numbers only)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              Discount Value (₫) <span className="text-destructive">*</span>
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

          <div className="space-y-2">
            <Label htmlFor="requiredTier">
              Required Loyalty Tier
            </Label>
            <Select
              value={formData.requiredTier}
              onValueChange={(value) => setFormData({ ...formData, requiredTier: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Everyone)</SelectItem>
                <SelectItem value="silver">Silver+</SelectItem>
                <SelectItem value="gold">Gold+</SelectItem>
                <SelectItem value="diamond">Diamond Only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Restrict code to specific loyalty tiers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">
              Expiration Date (Optional)
            </Label>
            <Input
              id="expiresAt"
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no expiration
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
