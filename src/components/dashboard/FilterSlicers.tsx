import React from 'react';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { DashboardFilterState } from '../../types/churn';

interface FilterSlicersProps {
  filters: DashboardFilterState;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilterState>>;
  totalRecords: number;
  filteredRecords: number;
  resetFilters: () => void;
}

export const FilterSlicers: React.FC<FilterSlicersProps> = ({
  filters,
  setFilters,
  totalRecords,
  filteredRecords,
  resetFilters
}) => {
  const updateFilter = (key: keyof DashboardFilterState, val: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const isFiltered =
    filters.geography !== 'All' ||
    filters.gender !== 'All' ||
    filters.activityStatus !== 'All' ||
    filters.tenureBucket !== 'All' ||
    filters.balanceTier !== 'All' ||
    filters.numOfProducts !== 'All' ||
    filters.ageGroup !== 'All';

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3.5 mb-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-white tracking-wide uppercase text-[11px]">
            Power BI Slicers & Cohort Filters
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            Showing <strong className="text-white font-mono">{filteredRecords.toLocaleString()}</strong> of <strong className="text-slate-400 font-mono">{totalRecords.toLocaleString()}</strong> customers ({((filteredRecords / totalRecords) * 100).toFixed(0)}%)
          </span>
        </div>

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 px-2.5 py-1 rounded-md border border-rose-800/50 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Slicers</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {/* Geography Slicer */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Country Slicer
          </label>
          <select
            value={filters.geography}
            onChange={e => updateFilter('geography', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="All">All Countries (3)</option>
            <option value="Germany">Germany (High Churn!)</option>
            <option value="France">France</option>
            <option value="Spain">Spain</option>
          </select>
        </div>

        {/* Activity Status Slicer (Core Driver) */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Activity Status
          </label>
          <select
            value={filters.activityStatus}
            onChange={e => updateFilter('activityStatus', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="All">All Activity</option>
            <option value="Inactive">Inactive Member (At-Risk)</option>
            <option value="Active">Active Member</option>
          </select>
        </div>

        {/* Tenure Bucket */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Tenure Lifecycle
          </label>
          <select
            value={filters.tenureBucket}
            onChange={e => updateFilter('tenureBucket', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="All">All Tenures (0-10y)</option>
            <option value="0-2 yrs">New (0 - 2 yrs)</option>
            <option value="3-5 yrs">Mid-Tenure (3 - 5 yrs)</option>
            <option value="6-8 yrs">Established (6 - 8 yrs)</option>
            <option value="9+ yrs">Long-Term (9+ yrs)</option>
          </select>
        </div>

        {/* Balance Tier */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Deposit Balance Tier
          </label>
          <select
            value={filters.balanceTier}
            onChange={e => updateFilter('balanceTier', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="All">All Balances</option>
            <option value="Zero ($0)">Zero ($0)</option>
            <option value="Low (<$50k)">Low (&lt; $50k)</option>
            <option value="Mid ($50k-$100k)">Mid ($50k - $100k)</option>
            <option value="High ($100k-$150k)">High ($100k - $150k)</option>
            <option value="Ultra (>$150k)">Ultra (&gt; $150k)</option>
          </select>
        </div>

        {/* Products Held */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Products Count
          </label>
          <select
            value={filters.numOfProducts}
            onChange={e => updateFilter('numOfProducts', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="All">All Products (1-4)</option>
            <option value="1">1 Product (Standard)</option>
            <option value="2">2 Products (Stickiest)</option>
            <option value="3">3 Products (High Risk)</option>
            <option value="4">4 Products (Extreme Risk)</option>
          </select>
        </div>

        {/* Age Group */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Customer Age Cohort
          </label>
          <select
            value={filters.ageGroup}
            onChange={e => updateFilter('ageGroup', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="All">All Ages</option>
            <option value="<30">Under 30 yrs</option>
            <option value="30-40">30 - 40 yrs</option>
            <option value="40-50">40 - 50 yrs (Peak Risk)</option>
            <option value="50-60">50 - 60 yrs (Peak Risk)</option>
            <option value="60+">60+ yrs</option>
          </select>
        </div>
      </div>
    </div>
  );
};
