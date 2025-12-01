import { useState, useEffect } from 'react';
import { Crown, Coins, Trophy, Star, ArrowUpRight, History } from 'lucide-react';
import { getLoyaltyConfig, getMyCoinTransactions } from '@/services/loyalty.service';
import { formatPrice } from '@/utils';
import { LoadingSpinner } from '@/components/common';
import './LoyaltySection.css';

const TIER_COLORS = {
  none: { bg: '#f3f4f6', text: '#6b7280', icon: '#9ca3af' },
  silver: { bg: '#f3f4f6', text: '#64748b', icon: '#94a3b8' },
  gold: { bg: '#fef3c7', text: '#d97706', icon: '#f59e0b' },
  diamond: { bg: '#dbeafe', text: '#2563eb', icon: '#3b82f6' },
};

const TIER_ICONS = {
  none: Star,
  silver: Trophy,
  gold: Crown,
  diamond: Crown,
};

// Calculate tier from spent amount (fallback if database is out of sync)
const getTierFromSpent = (spentLast12Months) => {
  if (spentLast12Months >= 20_000_000) return 'diamond';
  if (spentLast12Months >= 5_000_000) return 'gold';
  if (spentLast12Months >= 1_000_000) return 'silver';
  return 'none';
};

const LoyaltySection = ({ user }) => {
  const [config, setConfig] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = async () => {
    try {
      setLoading(true);
      const [configRes, txRes] = await Promise.all([
        getLoyaltyConfig(),
        getMyCoinTransactions(20),
      ]);
      setConfig(configRes.data || configRes);
      setTransactions(txRes.data?.transactions || txRes.transactions || []);
    } catch (error) {
      console.error('Failed to load loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-section loyalty-section">
        <div className="section-header">
          <h3>Loyalty Program</h3>
        </div>
        <div className="loyalty-loading">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const spentLast12Months = user?.spentLast12Months || 0;
  
  // Calculate tier from spending if loyaltyRank is missing or out of sync
  const calculatedTier = getTierFromSpent(spentLast12Months);
  const currentTier = calculatedTier; // Use calculated tier for accuracy
  
  const tierColors = TIER_COLORS[currentTier];
  const TierIcon = TIER_ICONS[currentTier];
  const tierConfig = config?.tiers?.find((t) => t.tier === currentTier);
  const nextTierConfig = config?.tiers?.find((t) => {
    const tierOrder = ['none', 'silver', 'gold', 'diamond'];
    const currentIndex = tierOrder.indexOf(currentTier);
    return tierOrder.indexOf(t.tier) === currentIndex + 1;
  });

  const progressToNextTier = nextTierConfig
    ? Math.min((spentLast12Months / nextTierConfig.minSpent) * 100, 100)
    : 100;
  const amountToNextTier = nextTierConfig ? Math.max(0, nextTierConfig.minSpent - spentLast12Months) : 0;

  return (
    <div className="profile-section loyalty-section">
      <div className="section-header">
        <h3>Loyalty Program</h3>
      </div>

      {/* Current Tier Card */}
      <div className="loyalty-tier-card" style={{ background: tierColors.bg }}>
        <div className="tier-icon" style={{ color: tierColors.icon }}>
          <TierIcon size={48} />
        </div>
        <div className="tier-info">
          <span className="tier-label">Current Tier</span>
          <h4 className="tier-name" style={{ color: tierColors.text }}>
            {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
          </h4>
          {tierConfig && (
            <p className="tier-benefit">
              Coin multiplier: <strong>{tierConfig.coinMultiplier}x</strong>
            </p>
          )}
        </div>
        <div className="tier-points">
          <Coins size={24} style={{ color: tierColors.icon }} />
          <span className="points-value">{(user?.loyaltyPoints || 0).toLocaleString()}</span>
          <span className="points-label">Coins</span>
        </div>
      </div>

      {/* Spending Progress */}
      <div className="spending-progress">
        <div className="progress-header">
          <span>Spent in last 12 months</span>
          <span className="progress-amount">{formatPrice(spentLast12Months)}</span>
        </div>
        {nextTierConfig ? (
          <>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressToNextTier}%`, background: TIER_COLORS[nextTierConfig.tier].icon }} />
            </div>
            <div className="progress-footer">
              <span>
                Spend <strong>{formatPrice(amountToNextTier)}</strong> more to reach{' '}
                <strong style={{ color: TIER_COLORS[nextTierConfig.tier].text }}>
                  {nextTierConfig.tier.charAt(0).toUpperCase() + nextTierConfig.tier.slice(1)}
                </strong>
              </span>
              <ArrowUpRight size={16} />
            </div>
          </>
        ) : (
          <p className="tier-max-message">🎉 You've reached the highest tier!</p>
        )}
      </div>

      {/* Tier Benefits */}
      {config?.tiers && (
        <div className="tier-benefits-grid">
          <h5>All Tier Benefits</h5>
          <div className="benefits-cards">
            {config.tiers.map((tier) => (
              <div
                key={tier.tier}
                className={`benefit-card ${tier.tier === currentTier ? 'current' : ''}`}
                style={{
                  borderColor: tier.tier === currentTier ? TIER_COLORS[tier.tier].icon : 'transparent',
                }}
              >
                <div className="benefit-tier-name" style={{ color: TIER_COLORS[tier.tier].text }}>
                  {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
                </div>
                <div className="benefit-min-spent">{tier.minSpent > 0 ? `≥ ${formatPrice(tier.minSpent)}` : 'Default'}</div>
                <div className="benefit-multiplier">{tier.coinMultiplier}x coins</div>
                {tier.tier === currentTier && <span className="current-badge">Current</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coin Transactions */}
      <div className="coin-transactions">
        <button className="transactions-toggle" onClick={() => setShowTransactions(!showTransactions)}>
          <History size={18} />
          <span>Coin History</span>
          <span className="toggle-icon">{showTransactions ? '▲' : '▼'}</span>
        </button>

        {showTransactions && (
          <div className="transactions-list">
            {transactions.length === 0 ? (
              <p className="no-transactions">No coin transactions yet</p>
            ) : (
              transactions.map((tx, index) => (
                <div key={tx._id || index} className="transaction-item">
                  <div className="tx-info">
                    <span className="tx-type">{tx.type === 'earn' ? '🪙 Earned' : '💸 Spent'}</span>
                    <span className="tx-description">{tx.description || tx.reason || 'Transaction'}</span>
                  </div>
                  <div className={`tx-amount ${tx.type === 'earn' ? 'positive' : 'negative'}`}>
                    {tx.type === 'earn' ? '+' : '-'}
                    {tx.amount?.toLocaleString()}
                  </div>
                  <div className="tx-date">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltySection;
