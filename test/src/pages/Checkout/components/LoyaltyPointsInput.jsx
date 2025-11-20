import React, { useState } from 'react';
import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks';
import './LoyaltyPointsInput.css';

const LoyaltyPointsInput = ({ onPointsApplied, currentTotal }) => {
  const { user } = useAuth();
  const [pointsToUse, setPointsToUse] = useState('');
  const [error, setError] = useState('');
  const [appliedPoints, setAppliedPoints] = useState(0);

  const availablePoints = user?.loyaltyPoints || 0;
  const maxUsablePoints = Math.min(availablePoints, Math.floor(currentTotal));

  const handleApplyPoints = () => {
    setError('');
    const points = parseInt(pointsToUse);

    if (!points || points <= 0) {
      setError('Please enter a valid number of points');
      return;
    }

    if (points > availablePoints) {
      setError(`You only have ${availablePoints} points available`);
      return;
    }

    if (points > currentTotal) {
      setError(`Cannot use more points than order total (${Math.floor(currentTotal)} points max)`);
      return;
    }

    setAppliedPoints(points);
    onPointsApplied(points);
    setPointsToUse('');
  };

  const handleRemovePoints = () => {
    setAppliedPoints(0);
    onPointsApplied(0);
    setPointsToUse('');
    setError('');
  };

  const handleUseMax = () => {
    setPointsToUse(maxUsablePoints.toString());
    setError('');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="loyalty-points-input">
      <div className="points-header">
        <Gift size={18} />
        <span className="points-title">Use Loyalty Points</span>
      </div>

      <div className="points-available">
        Available: <strong>{availablePoints.toLocaleString()}</strong> points (1 point = $1)
      </div>

      {appliedPoints > 0 ? (
        <div className="points-applied">
          <div className="applied-info">
            <span className="applied-label">Points Applied:</span>
            <span className="applied-value">-{appliedPoints.toLocaleString()} pts (${appliedPoints})</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemovePoints}
            className="remove-points-btn"
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="points-input-group">
          <div className="input-wrapper">
            <input
              type="number"
              value={pointsToUse}
              onChange={(e) => setPointsToUse(e.target.value)}
              placeholder={`Enter points (max: ${maxUsablePoints})`}
              min="0"
              max={maxUsablePoints}
              className="points-input"
            />
            <Button
              variant="link"
              size="sm"
              onClick={handleUseMax}
              className="use-max-btn"
            >
              Use Max
            </Button>
          </div>
          <Button
            onClick={handleApplyPoints}
            disabled={!pointsToUse}
            className="apply-points-btn"
          >
            Apply
          </Button>
        </div>
      )}

      {error && <div className="points-error">{error}</div>}

      <div className="points-note">
        💡 Earn 10% cashback as loyalty points on every order!
      </div>
    </div>
  );
};

export default LoyaltyPointsInput;
