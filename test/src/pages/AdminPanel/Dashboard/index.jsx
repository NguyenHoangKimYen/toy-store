import React from 'react';
import { formatPrice, formatPriceNumber } from '@/utils/formatPrice';
import { useDashboardData } from './hooks';
import BranchMap from './components/BranchMap';
import DashboardHeader from './components/DashboardHeader';
import StatCard from './components/StatCard';
import PieChart from './components/PieChart';
import BarChart from './components/BarChart';
import TinyLegend from './components/TinyLegend';

const Dashboard = () => {
  const {
    loading,
    error,
    isRefreshing,
    overview,
    revenueUpdates,
    topSelling,
    lowStock,
    categoryStats,
    branches,
    paymentSummary,
    revenueMonthData,
    totalRevenueThisYear,
    hasMonthlyRevenue,
    totalRevenue7Days,
    paymentData,
    segmentationData,
    revenue7Data,
    monthColor,
    toNumber,
  } = useDashboardData();

  if (loading && !isRefreshing) {
    return (
      <div className="admin-dashboard-shell page-fade">
        <DashboardHeader />
        <div className="px-4 py-8 text-center text-stone-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-shell page-fade">
      <DashboardHeader />

      <div className="px-4">
        {error ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {isRefreshing && (
              <div className="text-xs text-stone-500 bg-white/70 border border-purple-100 rounded-full inline-flex px-3 py-1 shadow-sm">
                Đang làm mới dữ liệu...
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Tổng người dùng"
                value={overview?.totalUsers || 0}
                pill="User segmentation"
                accent={`High: ${overview?.high || 0} • Medium: ${overview?.medium || 0} • Low: ${overview?.low || 0}`}
              />
              <StatCard
                title="Doanh thu năm nay"
                value={formatPriceNumber(totalRevenueThisYear)}
                pill="Paid orders"
                accent="Cộng dồn 12 tháng"
              />
              <StatCard
                title="7 ngày gần nhất"
                value={formatPrice(totalRevenue7Days)}
                accent={`Đơn: ${revenueUpdates.reduce((s, d) => s + toNumber(d.orders), 0)}`}
              />
              <StatCard
                title="Tổng doanh thu"
                value={formatPrice(
                  toNumber(paymentSummary?.cod) +
                    toNumber(paymentSummary?.momo) +
                    toNumber(paymentSummary?.vietqr ?? paymentSummary?.vnpay) +
                    toNumber(paymentSummary?.zalopay)
                )}
                accent="Gồm COD, MoMo, VietQR, ZaloPay"
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="admin-card">
                <h3 className="text-sm font-semibold text-stone-700 mb-3">
                  User Segmentation Pie Chart
                </h3>
                <div className="flex items-center gap-4">
                  <PieChart data={segmentationData} colors={segmentationData.map((s) => s.color)} />
                  <TinyLegend items={segmentationData} />
                </div>
              </div>

              <div className="lg:col-span-2 admin-card">
                <h3 className="text-sm font-semibold text-stone-700 mb-3">
                  Doanh thu theo cổng thanh toán
                </h3>
                <BarChart data={paymentData} colors={paymentData.map((p) => p.color)} />
                <div className="mt-2 text-[11px] text-stone-500">
                  COD vàng • MoMo hồng • VietQR xanh biển • ZaloPay xanh lá
                </div>
              </div>
            </div>

            {/* Revenue Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="admin-card">
                <h3 className="text-sm font-semibold text-stone-700 mb-3">
                  Doanh thu 7 ngày (Bar)
                </h3>
                <BarChart data={revenue7Data} colors={revenue7Data.map(() => '#6366f1')} />
              </div>

              <div className="admin-card">
                <h3 className="text-sm font-semibold text-stone-700 mb-3">
                  Doanh thu theo tháng (Heatmap)
                </h3>
                {hasMonthlyRevenue ? (
                  <>
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                      {revenueMonthData.map((m) => {
                        const bg = monthColor(m.value);
                        return (
                          <div key={m.label} className="flex flex-col items-center gap-1">
                            <div
                              className="w-9 h-9 rounded border border-slate-200"
                              style={{ background: bg }}
                              title={`${m.label}: ${formatPrice(m.value)}`}
                            />
                            <span className="text-[11px] text-stone-600 font-medium">{m.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-2">
                      <span>Less</span>
                      {['#e5e7eb', '#d1fae5', '#86efac', '#22c55e', '#15803d'].map((c) => (
                        <span
                          key={c}
                          className="w-4 h-3 rounded-[3px] border border-stone-200"
                          style={{ background: c }}
                        />
                      ))}
                      <span>More</span>
                    </div>
                    <div className="mt-2 text-[11px] text-stone-600">
                      Tổng năm: {formatPrice(totalRevenueThisYear)} • Đơn vị: VND
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-stone-500">Chưa có dữ liệu doanh thu theo tháng</div>
                )}
              </div>
            </div>

            {/* Products Tables */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="admin-card">
                <h3 className="text-sm font-semibold text-stone-700 mb-3">Sản phẩm bán chạy</h3>
                <div className="space-y-3">
                  {topSelling.length === 0 && <div className="text-sm text-stone-500">No data</div>}
                  {topSelling.slice(0, 5).map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-stone-100" />
                        )}
                        <div>
                          <div className="text-sm font-semibold text-stone-800">{item.name}</div>
                          <div className="text-xs text-stone-500">
                            Đã bán {item.quantitySold} • Doanh thu {formatPrice(item.revenue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card">
                <h3 className="text-sm font-semibold text-stone-700 mb-3">Sắp hết hàng</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {lowStock.length === 0 && <div className="text-sm text-stone-500">No data</div>}
                  {lowStock.map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <div className="text-sm font-medium text-stone-800">{item.name}</div>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                        {item.totalStock} tồn
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Stats */}
            <div className="admin-card">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">
                Doanh thu theo danh mục
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {categoryStats.map((c) => (
                  <div
                    key={c._id}
                    className="p-3 rounded-lg border border-stone-200 bg-stone-50"
                  >
                    <div className="text-sm font-semibold text-stone-800">{c.name}</div>
                    <div className="text-xs text-stone-500">Bán: {c.totalSold}</div>
                    <div className="text-sm font-medium">{formatPrice(c.revenue)}</div>
                  </div>
                ))}
                {categoryStats.length === 0 && (
                  <div className="text-sm text-stone-500">Chưa có dữ liệu</div>
                )}
              </div>
            </div>

            {/* Branch Map */}
            <div className="admin-card">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">
                Bản đồ chi nhánh (Vietmap)
              </h3>
              <BranchMap branches={branches} />
              <div className="text-[11px] text-stone-500 mt-2">
                Nguồn: /dashboard/branches-map. Có thể cấu hình khóa VietMap qua VITE_VIETMAP_API_KEY.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
