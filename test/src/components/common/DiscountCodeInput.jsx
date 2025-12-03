import React, { useState, useEffect, useRef } from 'react';
import { Tag, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useDiscountCode, useDiscountCodes } from '@/hooks';
import { formatPrice } from '@/utils/formatPrice';
import './DiscountCodeInput.css';

const DiscountCodeInput = ({ orderTotal, onDiscountApplied }) => {
  const {
    updateCode,
    apply,
    remove,
    validating,
    error,
    validationResult,
    appliedCode,
    discountAmount,
    isApplied,
  } = useDiscountCode(orderTotal);

  const { codes, loadCodes } = useDiscountCodes(true);
  const [showAvailableCodes, setShowAvailableCodes] = useState(false);
  const [localCode, setLocalCode] = useState('');
  
  // Use ref to store the callback to avoid it being a dependency
  const onDiscountAppliedRef = useRef(onDiscountApplied);
  
  useEffect(() => {
    onDiscountAppliedRef.current = onDiscountApplied;
  }, [onDiscountApplied]);

  useEffect(() => {
    if (onDiscountAppliedRef.current) {
      onDiscountAppliedRef.current({
        appliedCode,
        discountAmount,
        isApplied,
      });
    }
  }, [appliedCode, discountAmount, isApplied]);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, 12);
    setLocalCode(value);
    updateCode(value);
  };

  const handleApply = async () => {
    const success = await apply();
    if (success) {
      setLocalCode('');
    }
  };

  const handleRemove = () => {
    remove();
    setLocalCode('');
  };

  const handleShowCodes = async () => {
    await loadCodes();
    setShowAvailableCodes(true);
  };

  const handleSelectCode = (selectedCode) => {
    updateCode(selectedCode.code);
    setLocalCode(selectedCode.code);
    setShowAvailableCodes(false);
  };

  const getRemainingUses = (codeObj) => {
    return codeObj.usageLimit - codeObj.usedCount;
  };

  return (
    <div className="discount-code-section">
      {!isApplied ? (
        <Card className="discount-input-card">
          <div className="discount-input-header">
            <Tag size={18} />
            <span className="discount-label">Have a discount code?</span>
          </div>

          <div className="discount-input-group">
            <Input
              type="text"
              placeholder="Enter code"
              value={localCode}
              onChange={handleInputChange}
              disabled={validating}
              maxLength={15}
              className="discount-input"
            />
            <Button
              onClick={handleApply}
              disabled={!localCode.trim() || validating}
              className="apply-button"
            >
              {validating ? 'Checking...' : 'Apply'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="discount-error">
              <AlertCircle size={16} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {validationResult && !isApplied && (
            <Alert className="discount-success">
              <Check size={16} />
              <AlertDescription>
                Valid! Save {formatPrice(validationResult.discountAmount)} on this order
              </AlertDescription>
            </Alert>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowCodes}
            className="view-codes-button"
          >
            <Sparkles size={16} />
            View Available Codes
          </Button>
        </Card>
      ) : (
        <Card className="discount-applied-card">
          <div className="discount-applied-content">
            <div className="discount-applied-info">
              <div className="discount-applied-header">
                <Check size={18} className="check-icon" />
                <span className="discount-applied-label">Discount Applied</span>
              </div>
              <div className="discount-applied-details">
                <Badge variant="secondary" className="discount-code-badge">
                  {appliedCode.code}
                </Badge>
                <span className="discount-amount">
                  -{formatPrice(discountAmount)}
                </span>
              </div>
              {appliedCode.usageLimit && (
                <p className="discount-usage-info">
                  {getRemainingUses(appliedCode)} uses remaining
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="remove-button"
            >
              <X size={16} />
            </Button>
          </div>
        </Card>
      )}

      {/* Available Codes Dialog */}
      <AlertDialog open={showAvailableCodes} onOpenChange={setShowAvailableCodes}>
        <AlertDialogContent className="available-codes-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Sparkles size={20} />
              Available Discount Codes
            </AlertDialogTitle>
            <AlertDialogDescription>
              Select a code to apply it to your order
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="available-codes-list">
            {codes.length === 0 ? (
              <p className="no-codes-message">No discount codes available at the moment.</p>
            ) : (
              codes.map((codeObj) => {
                const discount = typeof codeObj.value === 'object'
                  ? parseFloat(codeObj.value.$numberDecimal || codeObj.value)
                  : parseFloat(codeObj.value);
                const remaining = getRemainingUses(codeObj);

                return (
                  <Card
                    key={codeObj._id}
                    className="code-card"
                    onClick={() => handleSelectCode(codeObj)}
                  >
                    <div className="code-card-content">
                      <div className="code-card-header">
                        <Badge variant="outline" className="code-badge">
                          {codeObj.code}
                        </Badge>
                        <span className="code-value">
                          {formatPrice(discount)} OFF
                        </span>
                      </div>
                      <div className="code-card-footer">
                        <span className="code-remaining">
                          {remaining} use{remaining !== 1 ? 's' : ''} left
                        </span>
                        {codeObj.createdBy && (
                          <span className="code-creator">
                            by {codeObj.createdBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DiscountCodeInput;
