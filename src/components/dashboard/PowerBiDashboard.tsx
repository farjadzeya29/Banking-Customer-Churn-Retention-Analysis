import React from 'react';
import { 
  CustomerRecord, 
  DashboardFilterState, 
  KpiMetrics 
} from '../../types/churn';
import { 
  getTenureChurnDistribution, 
  getBalanceTierDistribution, 
  getActivityChurnDistribution, 
  getProductCountDistribution, 
  getGeographyDistribution,
  getAgeCohortDistribution
} from '../../utils/analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  ComposedChart,
  Line,
  CartesianGrid,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Zap, 
  ChevronRight,
  Info,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { FilterSlicers } from './FilterSlicers';

interface PowerBiDashboardProps {
  filteredCustomers: CustomerRecord[];
  allCustomers: CustomerRecord[];
  kpis: KpiMetrics;
  filters: DashboardFilterState;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilterState>>;
  resetFilters: () => void;
  onNavigateToTab: (tab: 'powerbi' | 'segments' | 'sql' | 'python' | 'strategy' | 'customers') => void;
}

export const PowerBiDashboard: React.FC<PowerBiDashboardProps> = ({
  filteredCustomers,
  allCustomers,
  kpis,
  filters,
  setFilters,
  resetFilters,
  onNavigateToTab
}) => {
  const tenureData = getTenureChurnDistribution(filteredCustomers);
  const balanceData = getBalanceTierDistribution(filteredCustomers);
  const activityData = getActivityChurnDistribution(filteredCustomers);
  const productData = getProductCountDistribution(filteredCustomers);
  const geoData = getGeographyDistribution(filteredCustomers);
  const ageData = getAgeCohortDistribution(filteredCustomers);

  // Cross-filter handlers when user clicks chart elements
  const handleTenureClick = (data: any) => {
    if (!data) return;
    const t = data.tenure;
    let bucket = 'All';
    if (t <= 2) bucket = '0-2 yrs';
    else if (t <= 5) bucket = '3-5 yrs';
    else if (t <= 8) bucket = '6-8 yrs';
    else bucket = '9+ yrs';
    setFilters(prev => ({ ...prev, tenureBucket: bucket }));
  };

  const handleCountryClick = (data: any) => {
    if (!data || !data.country) return;
    setFilters(prev => ({ ...prev, geography: data.country }));
  };

  const handleProductClick = (data: any) => {
    if (!data || !data.products) return;
    setFilters(prev => ({ ...prev, numOfProducts: String(data.products) }));
  };

  const handleActivityClick = (data: any) => {
    if (!data || !data.status) return;
    const status = data.status.includes('Active Member') ? 'Active' : 'Inactive';
    setFilters(prev => ({ ...prev, activityStatus: status }));
  };

  const handleBalanceClick = (data: any) => {
    if (!data || !data.tier) return;
    setFilters(prev => ({ ...prev, balanceTier: data.tier }));
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-700 p-2.5 rounded-lg shadow-2xl text-xs text-white">
          <p className="font-bold text-slate-200 mb-1 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="flex items-center justify-between gap-3 my-0.5" style={{ color: entry.color || entry.fill }}>
              <span className="text-slate-400">{entry.name}:</span>
              <span className="font-mono font-bold">
                {typeof entry.value === 'number' 
                  ? entry.name.toLowerCase().includes('rate') || entry.name.toLowerCase().includes('pct')
                    ? `${entry.value.toFixed(1)}%`
                    : entry.name.toLowerCase().includes('balance') || entry.name.toLowerCase().includes('capital')
                      ? `$${entry.value.toLocaleString()}`
                      : entry.value.toLocaleString()
                  : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const pieColors = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-6">
      {/* Slicers Ribbon */}
      <FilterSlicers
        filters={filters}
        setFilters={setFilters}
        totalRecords={allCustomers.length}
        filteredRecords={filteredCustomers.length}
        resetFilters={resetFilters}
      />

      {/* Power BI Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Churn Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none transition group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Churn Rate</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${
              kpis.churnRate > 25 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              kpis.churnRate > 18 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              Target &lt; 15%
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{kpis.churnRate}%</span>
            <span className="text-xs text-rose-400 flex items-center font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
              +5.4% vs benchmark
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{kpis.churnedCustomers.toLocaleString()} of {kpis.totalCustomers.toLocaleString()} customers lost</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (kpis.churnRate / 40) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* KPI 2: Capital Attrition (Deposits Lost) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Deposits Lost</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight text-amber-400 font-mono">
              ${(kpis.totalBalanceAtRisk / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Avg churned bal:</span>
            <span className="font-mono text-slate-300 font-semibold">${Math.round(kpis.avgBalanceChurned).toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-amber-300/80 mt-1">Direct deposit flight from departed accounts</p>
        </div>

        {/* KPI 3: Inactivity Churn Impact */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inactive Churn Rate</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight text-rose-300 font-mono">
              {kpis.inactiveChurnRate}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              vs {kpis.activeChurnRate}% active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span className="text-rose-400 font-semibold">1.9x Attrition Multiplier</span> for dormant users
          </div>
          <div className="flex gap-1 mt-2.5">
            <div className="h-1.5 rounded-full bg-emerald-500 flex-1" title="Active Churn"></div>
            <div className="h-1.5 rounded-full bg-rose-500 flex-2" title="Inactive Churn"></div>
          </div>
        </div>

        {/* KPI 4: German Market Anomaly */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">German Market Churn</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight text-indigo-300 font-mono">
              {kpis.germanyChurnRate}%
            </span>
            <span className="text-[11px] text-rose-400 font-semibold">
              Highest Risk
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Avg balance: <strong className="text-slate-200 font-mono">$119k</strong> per account
          </div>
          <p className="text-[10px] text-indigo-300/80 mt-1">2x higher churn than France/Spain</p>
        </div>

        {/* KPI 5: 3+ Product Risk Trap */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">3+ Products Risk</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight text-purple-300 font-mono">
              {kpis.multiProductRiskRate}%
            </span>
            <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800">
              Critical
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            2 Products = <strong className="text-emerald-400 font-mono">7.5%</strong> (Optimal)
          </div>
          <p className="text-[10px] text-purple-300/80 mt-1">Customer friction with 3+ products</p>
        </div>
      </div>

      {/* Main Visuals Grid - Modeled after Power BI Executive Report Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Visual 1: Churn by Tenure (0-10 Years) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Customer Tenure vs Churn Rate (%) & Retained Volume</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Slicer Interactive
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Measures customer lifetime attrition. Click any bar to cross-filter the dashboard.
              </p>
            </div>
            <button 
              onClick={() => onNavigateToTab('segments')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tenureData} onClick={handleTenureClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis 
                  dataKey="tenure" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickFormatter={(val) => `Yr ${val}`}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickFormatter={(val) => `${val}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#f43f5e" 
                  fontSize={11} 
                  unit="%" 
                  domain={[0, 40]}
                />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar 
                  yAxisId="left" 
                  dataKey="retained" 
                  name="Retained Customers" 
                  fill="#3b82f6" 
                  radius={[3, 3, 0, 0]} 
                  cursor="pointer"
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="churned" 
                  name="Churned Customers" 
                  fill="#f43f5e" 
                  radius={[3, 3, 0, 0]} 
                  cursor="pointer"
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="churnRate" 
                  name="Churn Rate %" 
                  stroke="#fbbf24" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#fbbf24' }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>Insight: Churn is steady around 19-22% across tenure, with slight elevation in year 1 onboarding and year 9-10 maturity.</span>
            </span>
          </div>
        </div>

        {/* Visual 2: Churn by Activity Status */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Active vs Inactive Member Churn</span>
                <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                  Top Driver
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Engagement status directly halves customer attrition.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            {activityData.map((act, i) => (
              <div 
                key={act.status}
                onClick={() => handleActivityClick(act)}
                className={`p-3 rounded-lg border cursor-pointer transition hover:scale-[1.02] ${
                  act.status === 'Active Member' 
                    ? 'bg-emerald-950/30 border-emerald-800/60' 
                    : 'bg-rose-950/30 border-rose-800/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">{act.status}</span>
                  <span className="text-[10px] font-mono text-slate-400">{act.total} cust</span>
                </div>
                <div className="text-2xl font-extrabold font-mono" style={{ color: i === 0 ? '#10b981' : '#f43f5e' }}>
                  {act.churnRate}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {act.churned} churned / {act.total - act.churned} retained
                </div>
              </div>
            ))}
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} layout="vertical" onClick={handleActivityClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 40]} />
                <YAxis dataKey="status" type="category" stroke="#94a3b8" fontSize={11} width={110} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="churnRate" name="Churn Rate %" radius={[0, 4, 4, 0]} cursor="pointer">
                  {activityData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={idx === 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Clicking an activity tile slices all other Power BI visuals by Active or Inactive.
          </div>
        </div>

        {/* Visual 3: Balance Tier Distribution & Exposure */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Churn Rate by Balance Tier & Deposit Flight</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                  Balance Segment
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Notice high churn in $100k-$150k and &gt;$150k balance tiers representing heavy deposit risk.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={balanceData} onClick={handleBalanceClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="tier" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 35]} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="churnRate" name="Churn Rate %" fill="#ec4899" radius={[4, 4, 0, 0]} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-5 gap-1.5 mt-3 pt-2 border-t border-slate-800 text-[10px]">
            {balanceData.map(b => (
              <div key={b.tier} className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                <span className="text-slate-400 block truncate">{b.tier}</span>
                <span className="font-bold text-white font-mono block mt-0.5">{b.churnRate}%</span>
                <span className="text-[9px] text-amber-400 block">${(b.balanceSum / 1000000).toFixed(1)}M bal</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual 4: Product Count Attrition Anomaly */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Number of Products Held vs Churn Likelihood</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono">
                  Crucial Metric
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                2 Products is the "Sweet Spot" (7.5% churn). 3 and 4 products see catastrophic churn &gt;80%.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} onClick={handleProductClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="products" stroke="#94a3b8" fontSize={11} tickFormatter={p => `${p} Product${p > 1 ? 's' : ''}`} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 100]} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="churnRate" name="Churn Rate %" radius={[4, 4, 0, 0]} cursor="pointer">
                  {productData.map((entry, idx) => (
                    <Cell 
                      key={`p-cell-${idx}`} 
                      fill={entry.products === 2 ? '#10b981' : entry.products === 1 ? '#f59e0b' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recommendation: Cross-sell to 2 products, but audit 3+ product service friction.</span>
            </span>
          </div>
        </div>

        {/* Visual 5: Geography Breakdown (Germany vs France vs Spain) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Geographic Churn & Regional Deposits</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Market Variance
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Germany experiences 2x churn compared to France & Spain due to aggressive fintech alternatives.
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoData} onClick={handleCountryClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="country" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 45]} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar yAxisId="left" dataKey="churnRate" name="Churn Rate %" radius={[4, 4, 0, 0]} cursor="pointer">
                  {geoData.map((entry, idx) => (
                    <Cell 
                      key={`geo-cell-${idx}`} 
                      fill={entry.country === 'Germany' ? '#f43f5e' : entry.country === 'France' ? '#3b82f6' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-xs">
            {geoData.map(g => (
              <div key={g.country} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-300">{g.country}</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-extrabold font-mono text-white">{g.churnRate}%</span>
                  <span className="text-[10px] text-slate-400 font-mono">${(g.totalBalance / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual 6: Age Cohort Churn Dynamics */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Age Cohort Risk Distribution</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono">
                  Demographic Driver
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ages 40-59 show peak churn hazard (&gt;45%), indicating wealth transfer and retirement reallocations.
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="ageRange" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 60]} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="churnRate" name="Churn Rate %" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {ageData.map((entry, idx) => (
                    <Cell 
                      key={`age-cell-${idx}`} 
                      fill={entry.churnRate > 40 ? '#ef4444' : entry.churnRate > 20 ? '#f59e0b' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Peak Attrition: <strong>40-59 age group</strong> holds significant capital but exhibits 2.5x churn compared to younger cohorts.</span>
          </div>
        </div>

      </div>

      {/* Strategic Retention Recommendations Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-800/50 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Executive Action Strategy: Key Retention Priorities
              </h4>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Based on the SQL ETL segmentation and Machine Learning drivers, our retention strategy focuses on 
              <strong> Inactive High-Balance savers in Germany</strong> and rationalizing the <strong>3+ product portfolio</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateToTab('strategy')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Launch ROI Simulator</span>
            </button>
            <button
              onClick={() => onNavigateToTab('sql')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs px-4 py-2.5 rounded-lg border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>View SQL Queries</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
