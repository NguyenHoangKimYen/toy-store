import React, { useEffect, useMemo, useState } from 'react';
import {
  getSalesOverview,
  getRevenueUpdates,
  getYearlySales,
  getPaymentSummary,
  getTopSelling,
  getLowStock,
  getCategoryStats,
  getBranchesMap,
} from '@/services';
import { formatPrice, formatPriceNumber } from '@/utils/formatPrice';
import BranchMap from './components/BranchMap';
import DashboardHeader from './components/DashboardHeader';
import StatCard from './components/StatCard';
import PieChart from './components/PieChart';
import BarChart from './components/BarChart';
import TinyLegend from './components/TinyLegend';

const DASHBOARD_CACHE_KEY = 'milkybloom_admin_dashboard_cache_v1';

const toNumber = (v) => {
  if (v == null) return 0;
  if (typeof v === 'object' && '$numberDecimal' in v) return Number(v.$numberDecimal);
  return Number(v) || 0;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [revenueUpdates, setRevenueUpdates] = useState([]);
  const [yearlySales, setYearlySales] = useState({ thisYear: [], lastYear: [] });
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [topSelling, setTopSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setOverview(parsed.overview || null);
        setRevenueUpdates(parsed.revenueUpdates || []);
        setYearlySales(parsed.yearlySales || { thisYear: [], lastYear: [] });
        setPaymentSummary(parsed.paymentSummary || null);
        setTopSelling(parsed.topSelling || []);
        setLowStock(parsed.lowStock || []);
        setCategoryStats(parsed.categoryStats || []);
        setBranches(parsed.branches || []);
        setLoading(false);
      } catch (err) {
        console.warn('Failed to parse dashboard cache', err);
      }
    }

    const load = async () => {
      try {
        setIsRefreshing(true);
        setError(null);

        const [
          overviewRes,
          revenueRes,
          yearlyRes,
          paymentRes,
          topSellingRes,
          lowStockRes,
          branchesRes,
          categoryRes,
        ] = await Promise.all([
          getSalesOverview(),
          getRevenueUpdates(),
          getYearlySales(),
          getPaymentSummary(),
          getTopSelling(),
          getLowStock(),
          getBranchesMap(),
          getCategoryStats(),
        ]);

        setOverview(overviewRes.data);
        setRevenueUpdates(Array.isArray(revenueRes.data) ? revenueRes.data : []);
        setYearlySales(yearlyRes.data || { thisYear: [], lastYear: [] });
        setPaymentSummary(paymentRes.data);
        setTopSelling(topSellingRes.data || []);
        setLowStock(lowStockRes.data || []);
        setBranches(branchesRes.data || []);
        setCategoryStats(categoryRes.data || []);

        localStorage.setItem(
          DASHBOARD_CACHE_KEY,
          JSON.stringify({
            overview: overviewRes.data,
            revenueUpdates: Array.isArray(revenueRes.data) ? revenueRes.data : [],
            yearlySales: yearlyRes.data || { thisYear: [], lastYear: [] },
            paymentSummary: paymentRes.data,
            topSelling: topSellingRes.data || [],
            lowStock: lowStockRes.data || [],
            branches: branchesRes.data || [],
            categoryStats: categoryRes.data || [],
          }),
        );
      } catch (err) {
        console.error('Load dashboard error:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    load();
  }, []);

  const revenueMonthData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      label: `Th${i + 1}`,
      value: 0,
    }));

    (yearlySales?.thisYear || []).forEach((m) => {
      const idx = Number(m._id) - 1;
      if (idx >= 0 && idx < 12) {
        months[idx].value = toNumber(m.revenue);
      }
    });

    return months;
  }, [yearlySales]);

  const totalRevenueThisYear = useMemo(
    () => revenueMonthData.reduce((sum, m) => sum + toNumber(m.value), 0),
    [revenueMonthData],
  );

  const revenueMonthMax = useMemo(
    () => Math.max(1, ...revenueMonthData.map((m) => toNumber(m.value))),
    [revenueMonthData],
  );

  const hasMonthlyRevenue = useMemo(
    () => revenueMonthData.some((m) => toNumber(m.value) > 0),
    [revenueMonthData],
  );

  const monthColor = (value) => {
    const v = toNumber(value) / revenueMonthMax;
    if (v === 0) return '#e5e7eb';
    if (v < 0.25) return '#d1fae5';
    if (v < 0.5) return '#86efac';
    if (v < 0.75) return '#22c55e';
    return '#15803d';
  };

  const totalRevenue7Days = useMemo(
    () => revenueUpdates.reduce((s, d) => s + toNumber(d.total), 0),
    [revenueUpdates],
  );

  const paymentData = useMemo(() => {
    if (!paymentSummary) return [];
    const vietqrValue = paymentSummary.vietqr ?? paymentSummary.vnpay ?? 0;
    return [
      { label: 'COD', value: toNumber(paymentSummary.cod), color: '#facc15' },
      { label: 'MoMo', value: toNumber(paymentSummary.momo), color: '#f472b6' },
      { label: 'VietQR', value: toNumber(vietqrValue), color: '#38bdf8' },
      { label: 'ZaloPay', value: toNumber(paymentSummary.zalopay), color: '#22c55e' },
    ];
  }, [paymentSummary]);

  const segmentationData = useMemo(() => {
    if (!overview) return [];
    return [
      { label: 'High', value: toNumber(overview.high), color: '#4f46e5' },
      { label: 'Medium', value: toNumber(overview.medium), color: '#fb923c' },
      { label: 'Low', value: toNumber(overview.low), color: '#94a3b8' },
    ];
  }, [overview]);

  const revenue7Data = useMemo(
    () =>
      revenueUpdates.map((d) => ({
        label: d._id,
        value: toNumber(d.total),
      })),
    [revenueUpdates],
  );

  return (
    <div className='admin-dashboard-shell page-fade'>
      <DashboardHeader />

      <div className='px-4'>
        {error ? (
          <div className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2'>
            {error}
          </div>
        ) : (
          <div className='space-y-6'>
            {isRefreshing && (
              <div className='text-xs text-stone-500 bg-white/70 border border-purple-100 rounded-full inline-flex px-3 py-1 shadow-sm'>
                Đang làm mới dữ liệu...
              </div>
            )}

            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
              <StatCard
                title='Tổng người dùng'
                value={overview?.totalUsers || 0}
                pill='User segmentation'
                accent={`High: ${overview?.high || 0} • Medium: ${overview?.medium || 0} • Low: ${overview?.low || 0}`}
              />
              <StatCard
                title='Doanh thu năm nay'
                value={formatPriceNumber(totalRevenueThisYear)}
                pill='Paid orders'
                accent='Cộng dồn 12 tháng'
              />
              <StatCard
                title='7 ngày gần nhất'
                value={formatPrice(totalRevenue7Days)}
                accent={`Đơn: ${revenueUpdates.reduce((s, d) => s + toNumber(d.orders), 0)}`}
              />
              <StatCard
                title='Tổng doanh thu'
                value={formatPrice(
                  toNumber(paymentSummary?.cod) +
                    toNumber(paymentSummary?.momo) +
                    toNumber(paymentSummary?.vietqr ?? paymentSummary?.vnpay) +
                    toNumber(paymentSummary?.zalopay),
                )}
                accent='Gồm COD, MoMo, VietQR, ZaloPay'
              />
            </div>

            <div className='grid gap-4 lg:grid-cols-3'>
              <div className='admin-card'>
                <h3 className='text-sm font-semibold text-stone-700 mb-3'>
                  User Segmentation (Pie)
                </h3>
                <div className='flex items-center gap-4'>
                  <PieChart data={segmentationData} colors={segmentationData.map((s) => s.color)} />
                  <TinyLegend items={segmentationData} />
                </div>
              </div>

              <div className='lg:col-span-2 admin-card'>
                <h3 className='text-sm font-semibold text-stone-700 mb-3'>
                  Doanh thu theo cổng thanh toán
                </h3>
                <BarChart data={paymentData} colors={paymentData.map((p) => p.color)} />
                <div className='mt-2 text-[11px] text-stone-500'>
                  COD vàng • MoMo hồng • VietQR xanh biển • ZaloPay xanh lá
                </div>
              </div>
            </div>

            <div className='grid gap-4 lg:grid-cols-2'>
              <div className='admin-card'>
                <h3 className='text-sm font-semibold text-stone-700 mb-3'>
                  Doanh thu 7 ngày (Bar)
                </h3>
                <BarChart data={revenue7Data} colors={revenue7Data.map(() => '#6366f1')} />
              </div>

              <div className='admin-card'>
                <h3 className='text-sm font-semibold text-stone-700 mb-3'>
                  Doanh thu theo tháng (Heatmap)
                </h3>
                {hasMonthlyRevenue ? (
                  <>
                    <div className='grid grid-cols-6 md:grid-cols-12 gap-2'>
                      {revenueMonthData.map((m) => {
                        const bg = monthColor(m.value);
                        return (
                          <div key={m.label} className='flex flex-col items-center gap-1'>
                            <div
                              className='w-9 h-9 rounded border border-purple-100 shadow-[0_6px_18px_-12px_rgba(124,58,237,0.35)]'
                              style={{
                                background: `linear-gradient(145deg, ${bg}, ${bg} 70%, rgba(255,255,255,0.75))`,
                              }}
                              title={`${m.label}: ${formatPrice(m.value)}`}
                            />
                            <span className='text-[11px] text-stone-600 font-semibold'>{m.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className='flex items-center gap-2 text-[11px] text-stone-500 mt-2'>
                      <span>Less</span>
                      {['#e5e7eb', '#d1fae5', '#86efac', '#22c55e', '#15803d'].map((c) => (
                        <span
                          key={c}
                          className='w-4 h-3 rounded-[3px] border border-stone-200'
                          style={{ background: c }}
                        />
                      ))}
                      <span>More</span>
                    </div>
                    <div className='mt-2 text-[11px] text-stone-600'>
                      Tổng năm: {formatPrice(totalRevenueThisYear)} • Đơn vị: VND
                    </div>
                  </>
                ) : (
                  <div className='text-sm text-stone-500'>Chưa có dữ liệu doanh thu theo tháng</div>
                )}
              </div>
            </div>

            <div className='grid gap-4 lg:grid-cols-2'>
              <div className='admin-card'>
                <h3 className='text-sm font-semibold text-stone-700 mb-3'>Sản phẩm bán chạy</h3>
                <div className='space-y-3'>
                  {topSelling.length === 0 && <div className='text-sm text-stone-500'>No data</div>}
                  {topSelling.slice(0, 5).map((item) => (
                    <div key={item._id} className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className='w-10 h-10 rounded object-cover'
                          />
                        ) : (
                          <div className='w-10 h-10 rounded bg-stone-100' />
                        )}
                        <div>
                          <div className='text-sm font-semibold text-stone-800'>{item.name}</div>
                          <div className='text-xs text-stone-500'>
                            Đã bán {item.quantitySold} • Doanh thu {formatPrice(item.revenue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='admin-card'>
                <h3 className='text-sm font-semibold text-stone-700 mb-3'>Sắp hết hàng</h3>
                <div className='space-y-3 max-h-80 overflow-y-auto pr-1'>
                  {lowStock.length === 0 && <div className='text-sm text-stone-500'>No data</div>}
                  {lowStock.map((item) => (
                    <div key={item._id} className='flex items-center justify-between'>
                      <div className='text-sm font-medium text-stone-800'>{item.name}</div>
                      <span className='text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100'>
                        {item.totalStock} tồn
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='p-4 rounded-xl bg-white shadow-sm border border-stone-200'>
              <h3 className='text-sm font-semibold text-stone-700 mb-3'>
                Doanh thu theo danh mục
              </h3>
              <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
                {categoryStats.map((c) => (
                  <div
                    key={c._id}
                    className='p-3 rounded-lg border border-stone-200 bg-stone-50'
                  >
                    <div className='text-sm font-semibold text-stone-800'>{c.name}</div>
                    <div className='text-xs text-stone-500'>Bán: {c.totalSold}</div>
                    <div className='text-sm font-medium'>{formatPrice(c.revenue)}</div>
                  </div>
                ))}
                {categoryStats.length === 0 && (
                  <div className='text-sm text-stone-500'>Chưa có dữ liệu</div>
                )}
              </div>
            </div>

            <div className='p-4 rounded-xl bg-white shadow-sm border border-stone-200'>
              <h3 className='text-sm font-semibold text-stone-700 mb-3'>
                Bản đồ chi nhánh (Vietmap)
              </h3>
              <BranchMap branches={branches} />
              <div className='text-[11px] text-stone-500 mt-2'>
                Nguồn: /dashboard/branches-map. Có thể cấu hình khóa VietMap qua
                VITE_VIETMAP_API_KEY.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
