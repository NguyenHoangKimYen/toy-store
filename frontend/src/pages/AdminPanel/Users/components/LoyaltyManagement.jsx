import React, { useState, useMemo, useEffect } from 'react';
import { Crown, Coins, TrendingUp, Search, RefreshCw } from 'lucide-react';
import { useUsers } from '@/hooks';
import { formatPrice } from '@/utils';
import { LoadingSpinner } from '@/components/common';

const TIER_CONFIG = {
  none: { label: 'Member', color: 'bg-gray-100 text-gray-600', icon: '👤' },
  silver: { label: 'Silver', color: 'bg-gray-200 text-gray-700', icon: '🥈' },
  gold: { label: 'Gold', color: 'bg-yellow-100 text-yellow-700', icon: '🥇' },
  diamond: { label: 'Diamond', color: 'bg-blue-100 text-blue-700', icon: '💎' },
};

const TIER_THRESHOLDS = {
  none: 0,
  silver: 1_000_000,
  gold: 5_000_000,
  diamond: 20_000_000,
};

const LoyaltyManagement = ({ externalSearchQuery = '' }) => {
  const [tierFilter, setTierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('points-high');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce external search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(externalSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [externalSearchQuery]);

  const { users, loading, error, refetch } = useUsers({
    params: { 
      limit: 1000,
      keyword: debouncedSearch.trim() || undefined
    },
  });

  // Get tier - use backend calculatedTier (virtual) or calculate from spending as fallback
  const getUserTier = (user) => {
    if (user.calculatedTier) return user.calculatedTier;
    const spent = user.spentLast12Months || 0;
    if (spent >= 20_000_000) return 'diamond';
    if (spent >= 5_000_000) return 'gold';
    if (spent >= 1_000_000) return 'silver';
    return 'none';
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let result = [...users];

    // Tier filter - use calculated tier from spending
    if (tierFilter !== 'all') {
      result = result.filter((u) => getUserTier(u) === tierFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'points-high':
          return (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0);
        case 'points-low':
          return (a.loyaltyPoints || 0) - (b.loyaltyPoints || 0);
        case 'spent-high':
          return (b.spentLast12Months || 0) - (a.spentLast12Months || 0);
        case 'spent-low':
          return (a.spentLast12Months || 0) - (b.spentLast12Months || 0);
        case 'tier': {
          const tierOrder = ['diamond', 'gold', 'silver', 'none'];
          return tierOrder.indexOf(getUserTier(a)) - tierOrder.indexOf(getUserTier(b));
        }
        default:
          return 0;
      }
    });

    return result;
  }, [users, tierFilter, sortBy]);

  // Calculate stats - use calculated tier from spending
  const stats = useMemo(() => {
    if (!users) return { total: 0, byTier: {}, totalPoints: 0, totalSpent: 0 };

    const byTier = { none: 0, silver: 0, gold: 0, diamond: 0 };
    let totalPoints = 0;
    let totalSpent = 0;

    users.forEach((u) => {
      const tier = getUserTier(u);
      byTier[tier] = (byTier[tier] || 0) + 1;
      totalPoints += u.loyaltyPoints || 0;
      totalSpent += u.spentLast12Months || 0;
    });

    return { total: users.length, byTier, totalPoints, totalSpent };
  }, [users]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>Failed to load users: {error}</p>
        <button onClick={refetch} className="mt-2 text-purple-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="admin-card bg-white/85 backdrop-blur-md border border-purple-100/70 rounded-2xl shadow-[0_18px_42px_-28px_rgba(124,58,237,0.22)] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl bg-white/85 border border-purple-100/80 text-sm shadow-inner"
          >
            <option value="points-high">Coins: High → Low</option>
            <option value="points-low">Coins: Low → High</option>
            <option value="spent-high">Spent: High → Low</option>
            <option value="spent-low">Spent: Low → High</option>
            <option value="tier">By Tier</option>
          </select>
          <button
            onClick={refetch}
            className="px-3 py-2 rounded-xl bg-white/85 border border-purple-100/80 hover:bg-purple-50 transition"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/85 border border-purple-100/70 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Crown size={16} />
            Total Members
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white/85 border border-purple-100/70 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Coins size={16} />
            Total Coins
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.totalPoints.toLocaleString()}</div>
        </div>
        <div className="bg-white/85 border border-purple-100/70 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TrendingUp size={16} />
            Total Spent (12mo)
          </div>
          <div className="text-2xl font-bold text-green-600">{formatPrice(stats.totalSpent)}</div>
        </div>
        <div className="bg-white/85 border border-purple-100/70 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            💎 Premium Tiers
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.byTier.diamond + stats.byTier.gold + stats.byTier.silver}
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="bg-white/85 border border-purple-100/70 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tier Distribution</h3>
        <div className="flex gap-4 flex-wrap">
          {Object.entries(TIER_CONFIG).map(([tier, config]) => {
            const isSelected = tierFilter === tier;
            return (
              <div
                key={tier}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
                  isSelected 
                    ? 'ring-2 ring-purple-500 ring-offset-2 scale-105 shadow-md' 
                    : 'hover:opacity-80'
                } ${config.color}`}
                onClick={() => setTierFilter(tierFilter === tier ? 'all' : tier)}
              >
                <span>{config.icon}</span>
                <span className="font-medium">{config.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-sm ${isSelected ? 'bg-white/80' : 'bg-white/50'}`}>
                  {stats.byTier[tier] || 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/85 border border-purple-100/70 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-50/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Tier</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Coins</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Spent (12mo)</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Lifetime Spent</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const spentLast12 = user.spentLast12Months || 0;
                  const calculatedTier = getUserTier(user);
                  const tierConfig = TIER_CONFIG[calculatedTier];

                  // Calculate progress to next tier
                  const tierOrder = ['none', 'silver', 'gold', 'diamond'];
                  const currentIndex = tierOrder.indexOf(calculatedTier);
                  const nextTier = tierOrder[currentIndex + 1];
                  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : null;
                  const currentThreshold = TIER_THRESHOLDS[calculatedTier];
                  const progress = nextThreshold
                    ? Math.min(((spentLast12 - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
                    : 100;

                  return (
                    <tr key={user._id} className="hover:bg-purple-50/30 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                              {(user.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tierConfig.color}`}>
                          {tierConfig.icon} {tierConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-amber-600">
                          {(user.loyaltyPoints || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatPrice(spentLast12)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {formatPrice(user.lifetimeSpent || 0)}
                      </td>
                      <td className="px-4 py-3">
                        {nextTier ? (
                          <div className="w-24 mx-auto">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{Math.round(progress)}%</span>
                              <span>→ {TIER_CONFIG[nextTier].icon}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-green-600">Max tier 🎉</div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500 text-center">
        Showing {filteredUsers.length} of {stats.total} users
      </div>
    </div>
  );
};

export default LoyaltyManagement;
