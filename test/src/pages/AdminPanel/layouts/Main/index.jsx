import React, { useEffect, useMemo, useState } from 'react';
import Topbar from './Topbar';
import {
  getSalesOverview,
  getRevenueUpdates,
  getYearlySales,
  getPaymentSummary,
  getTopSelling,
  getLowStock,
  getCategoryStats,
} from '@/services';
import { formatPrice, formatPriceNumber } from '@/utils/formatPrice';

const StatCard = ({ title, value, pill, accent }) => (
  <div className="p-4 rounded-xl bg-white shadow-sm border border-stone-200">
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm text-stone-500">{title}</span>
      {pill && (
        <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-700">
          {pill}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-stone-800">{value}</div>
    {accent && <div className="text-xs text-stone-500 mt-1">{accent}</div>}
  </div>
);

const BarRow = ({ label, value, max }) => {
  const width = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm text-stone-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{formatPrice(value)}</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

const ListCard = ({ title, items, renderItem }) => (
  <div className="p-4 rounded-xl bg-white shadow-sm border border-stone-200">
    <h3 className="text-sm font-semibold text-stone-700 mb-3">{title}</h3>
    <div className="space-y-3">
      {items.length === 0 && (
        <div className="text-sm text-stone-500">No data</div>
      )}
      {items.map(renderItem)}
    </div>
  </div>
);

const Main = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [revenueUpdates, setRevenueUpdates] = useState([]);
  const [yearlySales, setYearlySales] = useState({ thisYear: [], lastYear: [] });
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [topSelling, setTopSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          overviewRes,
          revenueRes,
          yearlyRes,
          paymentRes,
          topSellingRes,
          lowStockRes,
          categoryRes,
        ] = await Promise.all([
          getSalesOverview(),
          getRevenueUpdates(),
          getYearlySales(),
          getPaymentSummary(),
          getTopSelling(),
          getLowStock(),
          getCategoryStats(),
        ]);

        setOverview(overviewRes.data);
        setRevenueUpdates(Array.isArray(revenueRes.data) ? revenueRes.data : []);
        setYearlySales(yearlyRes.data || { thisYear: [], lastYear: [] });
        setPaymentSummary(paymentRes.data);
        setTopSelling(topSellingRes.data || []);
        setLowStock(lowStockRes.data || []);
        setCategoryStats(categoryRes.data || []);
      } catch (err) {
        console.error('Load dashboard error:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalRevenueThisYear = useMemo(() => {
    return (yearlySales?.thisYear || []).reduce(
      (sum, m) => sum + Number(m.revenue || 0),
      0
    );
  }, [yearlySales]);

  const maxPaymentValue = useMemo(() => {
    if (!paymentSummary) return 0;
    return Math.max(
      paymentSummary.momo || 0,
      paymentSummary.vnpay || 0,
      paymentSummary.zalopay || 0,
      paymentSummary.cod || 0
    );
  }, [paymentSummary]);

  return (
    <div className="bg-white rounded-lg pb-6 shadow h-full">
      <Topbar />

      <div className="px-4">
        {loading && (
          <div className="text-sm text-stone-500">Đang tải dashboard...</div>
        )}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
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
                value={formatPrice(
                  revenueUpdates.reduce((s, d) => s + Number(d.total || 0), 0)
                )}
                accent={`Đơn: ${revenueUpdates.reduce(
                  (s, d) => s + Number(d.orders || 0),
                  0
                )}`}
              />
              <StatCard
                title="Thanh toán COD"
                value={formatPrice(paymentSummary?.cod || 0)}
                accent="Gồm cashondelivery/cod"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 p-4 rounded-xl bg-white shadow-sm border border-stone-200">
                <h3 className="text-sm font-semibold text-stone-700 mb-3">
                  Doanh thu theo cổng thanh toán
                </h3>
                {paymentSummary ? (
                  <>
                    <BarRow
                      label="COD"
                      value={paymentSummary.cod || 0}
                      max={maxPaymentValue}
                    />
                    <BarRow
                      label="MoMo"
                      value={paymentSummary.momo || 0}
                      max={maxPaymentValue}
                    />
                    <BarRow
                      label="VNPAY"
                      value={paymentSummary.vnpay || 0}
                      max={maxPaymentValue}
                    />
                    <BarRow
                      label="ZaloPay"
                      value={paymentSummary.zalopay || 0}
                      max={maxPaymentValue}
                    />
                  </>
                ) : (
                  <div className="text-sm text-stone-500">Không có dữ liệu</div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-white shadow-sm border border-stone-200">
                <h3 className="text-sm font-semibold text-stone-700 mb-3">
                  Doanh thu 7 ngày
                </h3>
                <div className="space-y-2">
                  {revenueUpdates.map((d) => (
                    <div
                      key={d._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-stone-600">{d._id}</span>
                      <span className="font-semibold">
                        {formatPrice(Number(d.total || 0))}
                      </span>
                    </div>
                  ))}
                  {revenueUpdates.length === 0 && (
                    <div className="text-sm text-stone-500">Chưa có dữ liệu</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ListCard
                title="Sản phẩm bán chạy"
                items={topSelling.slice(0, 5)}
                renderItem={(item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between"
                  >
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
                        <div className="text-sm font-semibold text-stone-800">
                          {item.name}
                        </div>
                        <div className="text-xs text-stone-500">
                          Đã bán {item.quantitySold} • Doanh thu{' '}
                          {formatPrice(item.revenue)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              />

              <ListCard
                title="Sắp hết hàng"
                items={lowStock.slice(0, 5)}
                renderItem={(item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between"
                  >
                    <div className="text-sm font-medium text-stone-800">
                      {item.name}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                      {item.totalStock} tồn
                    </span>
                  </div>
                )}
              />
            </div>

            <div className="p-4 rounded-xl bg-white shadow-sm border border-stone-200">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">
                Doanh thu theo danh mục
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {categoryStats.map((c) => (
                  <div
                    key={c._id}
                    className="p-3 rounded-lg border border-stone-200 bg-stone-50"
                  >
                    <div className="text-sm font-semibold text-stone-800">
                      {c.name}
                    </div>
                    <div className="text-xs text-stone-500">
                      Bán: {c.totalSold}
                    </div>
                    <div className="text-sm font-medium">
                      {formatPrice(c.revenue)}
                    </div>
                  </div>
                ))}
                {categoryStats.length === 0 && (
                  <div className="text-sm text-stone-500">Chưa có dữ liệu</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
