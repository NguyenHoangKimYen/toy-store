import React, { useState } from 'react';

const SettingToggle = ({ label, description, checked, onChange }) => (
  <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition">
    <input
      type="checkbox"
      className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  </label>
);

const Settings = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [orderPush, setOrderPush] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">Admin Settings</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Configuration & Preferences</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Quick switches for store behavior and admin notifications.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/70 px-3 py-2 rounded-full border border-slate-200/60 dark:border-slate-700">
          Changes save automatically
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 shadow-sm">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Store state</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Toggle live status and customer messaging.</p>
            <SettingToggle
              label="Maintenance mode"
              description="Temporarily hide the storefront and show a maintenance banner."
              checked={maintenance}
              onChange={setMaintenance}
            />
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Brand identity</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Name and support email shown across receipts.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                Store name
                <input
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue="MilkyBloom"
                  type="text"
                />
              </label>
              <label className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                Support email
                <input
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue="hello@milkybloom.com"
                  type="email"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Control how the team gets alerted.</p>
            <SettingToggle
              label="Email alerts"
              description="Notify admins when a new order is placed or refunded."
              checked={emailAlerts}
              onChange={setEmailAlerts}
            />
            <SettingToggle
              label="Push for critical orders"
              description="Send push notifications when high-value orders need review."
              checked={orderPush}
              onChange={setOrderPush}
            />
            <SettingToggle
              label="Weekly digest"
              description="Summary of revenue, returns, and low stock items."
              checked={weeklyDigest}
              onChange={setWeeklyDigest}
            />
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Display preferences</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Light/dark follows system. Data refresh is manual.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                Timezone
                <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>GMT+7 (Ho Chi Minh)</option>
                  <option>GMT+9 (Tokyo)</option>
                  <option>GMT+10 (Sydney)</option>
                </select>
              </label>
              <label className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                Currency
                <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>VND</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </label>
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
              API keys and integrations are managed centrally. Contact devs to rotate keys.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
