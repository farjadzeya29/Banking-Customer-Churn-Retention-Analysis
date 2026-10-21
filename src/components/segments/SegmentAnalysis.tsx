import React, { useState } from 'react';
import { CustomerRecord } from '../../types/churn';
import { getRiskSegmentMatrix, RiskSegmentCell } from '../../utils/analytics';
import { 
  Layers, 
  AlertTriangle, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Flame,
  Info
} from 'lucide-react';

interface SegmentAnalysisProps {
  customers: CustomerRecord[];
  onSelectSegmentFilter?: (tenure: string, activity: string, balance: string) => void;
  onNavigateToTab: (tab: 'powerbi' | 'segments' | 'sql' | 'python' | 'strategy' | 'customers') => void;
}

export const SegmentAnalysis: React.FC<SegmentAnalysisProps> = ({
  customers,
  onSelectSegmentFilter,
  onNavigateToTab
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'Critical' | 'Elevated' | 'Moderate' | 'Low'>('All');
  const [sortField, setSortField] = useState<'churnRate' | 'balanceSum' | 'total'>('churnRate');

  const matrix = getRiskSegmentMatrix(customers);

  const filteredMatrix = matrix.filter(cell => {
    if (filterSeverity === 'All') return true;
    return cell.riskSeverity === filterSeverity;
  }).sort((a, b) => {
    if (sortField === 'churnRate') return b.churnRate - a.churnRate;
    if (sortField === 'balanceSum') return b.balanceSum - a.balanceSum;
    return b.total - a.total;
  });

  // Calculate high-risk aggregates
  const criticalCells = matrix.filter(c => c.riskSeverity === 'Critical');
  const criticalBalSum = criticalCells.reduce((sum, c) => sum + c.balanceSum, 0);
  const criticalCustSum = criticalCells.reduce((sum, c) => sum + c.total, 0);

  const getPlaybook = (cell: RiskSegmentCell): string => {
    if (cell.activity === 'Inactive' && cell.balanceClass === 'High ($100k+)') {
      return 'VIP Outreach: Proactive yield upgrade & wealth consultation before funds move';
    }
    if (cell.activity === 'Inactive' && cell.tenureTier === 'New (0-2y)') {
      return 'Digital Onboarding Audit: In-app tutorial, debit card activation incentive';
    }
    if (cell.balanceClass === 'High ($100k+)') {
      return 'Relationship Manager: Quarterly portfolio check-in & fee waiver perks';
    }
    if (cell.activity === 'Inactive') {
      return 'Gamified Re-engagement: Cashback campaign on automatic bill payments';
    }
    return 'Standard Loyalty Maintenance: Annual appreciation rewards';
  };

  return (
    <div className="space-y-6">
      {/* Header & Strategic Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">
                Customer Segmentation: Tenure × Activity × Balance
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              Uncovering hidden churn drivers through multi-dimensional segmentation. 
              While tenure alone shows uniform ~20% churn, cross-tabulating <strong>Tenure</strong> with 
              <strong> Account Activity</strong> and <strong>Deposit Balance</strong> isolates the critical at-risk cohorts that account for the majority of capital attrition.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Critical Capital at Risk</span>
              <span className="text-lg font-bold font-mono text-rose-400">
                ${(criticalBalSum / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <span className="text-slate-400 block">At-Risk Cohort Count</span>
              <span className="text-lg font-bold font-mono text-amber-400">
                {criticalCustSum.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tri-Factor Key Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Factor 1: Tenure Insight */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center space-x-2 mb-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>1. Tenure Driver</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1.5">Tenure Alone Masks Risk</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tenure ranges between 0 to 10 years show modest variance (18% to 22%). However, 
            <strong> New customers (&lt;2 yrs)</strong> who fail to activate within 90 days exhibit a massive 
            <strong> 41.5% churn rate</strong>.
          </p>
        </div>

        {/* Factor 2: Activity Status Insight */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center space-x-2 mb-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>2. Activity Driver</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1.5">The #1 Controllable Driver</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Inactive members churn at <strong>26.8%</strong> versus <strong>14.2%</strong> for active members. 
            When an account transitions to inactive, the probability of churn jumps immediately, making activity status the prime leading indicator.
          </p>
        </div>

        {/* Factor 3: Balance Exposure Insight */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center space-x-2 mb-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            <span>3. Balance Driver</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1.5">High Balances = Highest Flight</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike other retail sectors where high spenders are most loyal, bank customers with 
            <strong> balances &gt;$100,000</strong> churn at <strong>25.4%</strong> due to competitive yield hunting (especially in Germany).
          </p>
        </div>
      </div>

      {/* Interactive Controls & Severity Slicers */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Filter Risk Severity:</span>
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Critical', 'Elevated', 'Moderate', 'Low'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    filterSeverity === sev
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Sort Matrix By:</span>
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-slate-200"
            >
              <option value="churnRate">Highest Churn Rate %</option>
              <option value="balanceSum">Highest Deposit Exposure ($)</option>
              <option value="total">Largest Customer Segment</option>
            </select>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto mt-4 rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Tenure Lifecycle</th>
                <th className="py-3 px-4">Activity Status</th>
                <th className="py-3 px-4">Balance Tier</th>
                <th className="py-3 px-4 text-right">Customers</th>
                <th className="py-3 px-4 text-right">Churned</th>
                <th className="py-3 px-4 text-right">Churn Rate</th>
                <th className="py-3 px-4 text-right">Total Deposits</th>
                <th className="py-3 px-4 text-center">Risk Tier</th>
                <th className="py-3 px-4">Recommended Retention Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60">
              {filteredMatrix.map((cell, idx) => (
                <tr 
                  key={`${cell.tenureTier}_${cell.activity}_${cell.balanceClass}_${idx}`}
                  className="hover:bg-slate-800/60 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-white flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cell.tenureTier}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      cell.activity === 'Active' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {cell.activity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {cell.balanceClass}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-200">
                    {cell.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-rose-400 font-semibold">
                    {cell.churned.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-mono font-bold text-sm ${
                      cell.churnRate >= 35 ? 'text-rose-400' :
                      cell.churnRate >= 22 ? 'text-amber-400' :
                      'text-emerald-400'
                    }`}>
                      {cell.churnRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-300 font-medium">
                    ${(cell.balanceSum / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cell.riskSeverity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      cell.riskSeverity === 'Elevated' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      cell.riskSeverity === 'Moderate' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {cell.riskSeverity === 'Critical' && <Flame className="w-3 h-3 mr-0.5 inline" />}
                      <span>{cell.riskSeverity}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs">
                    {getPlaybook(cell)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Call to Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>
            Explore individual customers within these high-risk cohorts in the <strong>Customer 360</strong> tab or test prevention campaigns in the <strong>ROI Planner</strong>.
          </span>
        </div>
        <button
          onClick={() => onNavigateToTab('strategy')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition flex items-center space-x-1 cursor-pointer shrink-0"
        >
          <span>Calculate Retention ROI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
