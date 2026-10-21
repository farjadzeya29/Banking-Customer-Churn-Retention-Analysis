import React, { useState } from 'react';
import { CustomerRecord, RetentionCampaign } from '../../types/churn';
import { RETENTION_CAMPAIGNS } from '../../data/mockBankData';
import { 
  Target, 
  DollarSign, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Sliders, 
  Sparkles,
  Download,
  Copy,
  Check,
  Building2,
  Zap,
  Activity
} from 'lucide-react';

interface RetentionStrategyPlannerProps {
  customers: CustomerRecord[];
}

export const RetentionStrategyPlanner: React.FC<RetentionStrategyPlannerProps> = ({ customers }) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(RETENTION_CAMPAIGNS[0].id);
  const [reachPercent, setReachPercent] = useState<number>(75);
  const [retentionSuccessRate, setRetentionSuccessRate] = useState<number>(38);
  const [costPerAccount, setCostPerAccount] = useState<number>(55);
  const [customerLtv, setCustomerLtv] = useState<number>(1950);
  const [copied, setCopied] = useState(false);

  const activeCampaign = RETENTION_CAMPAIGNS.find(c => c.id === selectedCampaignId) || RETENTION_CAMPAIGNS[0];

  // Calculations
  const targetedCustomers = Math.round((activeCampaign.eligibleCustomers * reachPercent) / 100);
  const retainedCustomers = Math.round((targetedCustomers * retentionSuccessRate) / 100);
  const capitalPreserved = retainedCustomers * activeCampaign.avgBalance;
  const campaignBudget = targetedCustomers * costPerAccount;
  const grossRevenueSaved = retainedCustomers * customerLtv;
  const netProfit = grossRevenueSaved - campaignBudget;
  const roiPercent = campaignBudget > 0 ? Math.round((netProfit / campaignBudget) * 100) : 0;

  const handleCopyStrategy = () => {
    const text = `EXECUTIVE RETENTION STRATEGY BRIEF - BANKING ATTRITION PREVENTION
Campaign: ${activeCampaign.name}
Target Segment: ${activeCampaign.targetSegment}
Estimated At-Risk Pool: ${activeCampaign.eligibleCustomers} customers
Campaign Reach: ${reachPercent}% (${targetedCustomers} accounts contacted)
Target Retention Efficiency: ${retentionSuccessRate}%
--------------------------------------------------
PROJECTED BUSINESS IMPACT:
- Retained High-Value Accounts: ${retainedCustomers} accounts
- Deposit Capital Preserved: $${(capitalPreserved / 1000000).toFixed(2)}M
- Campaign Investment: $${campaignBudget.toLocaleString()}
- Gross LTV Preserved: $${grossRevenueSaved.toLocaleString()}
- Net Profit Impact: $${netProfit.toLocaleString()}
- Program ROI: ${roiPercent}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">
                Retention Strategy & Intervention ROI Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              Transforming statistical churn findings into targeted capital-preservation playbooks. 
              Simulate outreach reach, intervention conversion rates, and net financial ROI.
            </p>
          </div>

          <button
            onClick={handleCopyStrategy}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Strategy Brief Copied' : 'Export Executive Brief'}</span>
          </button>
        </div>
      </div>

      {/* Campaign Cards Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {RETENTION_CAMPAIGNS.map(camp => {
          const isSelected = selectedCampaignId === camp.id;
          return (
            <button
              key={camp.id}
              onClick={() => {
                setSelectedCampaignId(camp.id);
                setCostPerAccount(camp.estimatedCostPerCustomer);
                setRetentionSuccessRate(Math.round(camp.expectedRetentionBoost * 100));
              }}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {camp.id.includes('inactive') ? 'Activity Play' : camp.id.includes('multi') ? 'Product Play' : camp.id.includes('german') ? 'Geo Play' : 'Cohort Play'}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
                <h4 className="text-xs font-bold text-white mb-1.5">{camp.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed mb-3">
                  {camp.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Target Pool:</span>
                <span className="font-mono font-bold text-amber-400">{camp.eligibleCustomers} cust</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Financial Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Intervention Levers & Assumptions</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Interactive</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Reach % */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Campaign Reach: <strong>{reachPercent}%</strong></span>
                <span className="font-mono text-indigo-400">{targetedCustomers} accounts contacted</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                value={reachPercent}
                onChange={e => setReachPercent(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Percentage of identified at-risk customer base contacted</span>
            </div>

            {/* Retention Success Rate % */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Retention Success Rate: <strong>{retentionSuccessRate}%</strong></span>
                <span className="font-mono text-emerald-400">{retainedCustomers} accounts saved</span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                value={retentionSuccessRate}
                onChange={e => setRetentionSuccessRate(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Percentage of contacted customers persuaded to remain active</span>
            </div>

            {/* Cost Per Account */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Outreach Cost per Account: <strong>${costPerAccount}</strong></span>
                <span className="font-mono text-amber-400">Budget: ${campaignBudget.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={15}
                max={200}
                step={5}
                value={costPerAccount}
                onChange={e => setCostPerAccount(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Includes direct advisor time, preferential APY bonus, or fee waivers</span>
            </div>

            {/* Customer Lifetime Value (LTV) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Annual Net Value per Account (LTV): <strong>${customerLtv.toLocaleString()}</strong></span>
                <span className="font-mono text-purple-400">Net Interest + Fee Margin</span>
              </div>
              <input
                type="range"
                min={800}
                max={4000}
                step={50}
                value={customerLtv}
                onChange={e => setCustomerLtv(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Annual net interest margin and card interchange revenue generated</span>
            </div>
          </div>
        </div>

        {/* Live Financial Outputs Column */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Simulated Business ROI Impact: {activeCampaign.name}</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Retained Accounts</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  {retainedCustomers}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Saved from attrition</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Deposits Preserved</span>
                <span className="text-2xl font-extrabold font-mono text-amber-400">
                  ${(capitalPreserved / 1000000).toFixed(2)}M
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Direct liquidity protected</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Campaign Cost</span>
                <span className="text-2xl font-extrabold font-mono text-rose-400">
                  ${campaignBudget.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Program budget</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Gross LTV Saved</span>
                <span className="text-2xl font-extrabold font-mono text-indigo-400">
                  ${grossRevenueSaved.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Annual revenue stream</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Net Value Added</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  ${netProfit.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Net profit after costs</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-800/60 bg-emerald-950/20">
                <span className="text-[11px] text-emerald-400 block mb-1">Program ROI</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-300">
                  +{roiPercent}%
                </span>
                <span className="text-[10px] text-emerald-400/80 block mt-1">Net return ratio</span>
              </div>
            </div>

            {/* Strategic Playbook Execution Steps */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <h5 className="font-semibold text-slate-200 mb-2 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Operational Execution Roadmap:</span>
              </h5>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li className="flex items-start space-x-2">
                  <span className="font-mono text-indigo-400 font-bold">1.</span>
                  <span>Extract cohort of {targetedCustomers} flagged customer IDs directly from the SQL workbench.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-mono text-indigo-400 font-bold">2.</span>
                  <span>Distribute high-balance accounts (&gt;$100k) to branch Relationship Managers with customized yield incentives.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-mono text-indigo-400 font-bold">3.</span>
                  <span>Trigger digital push notification series offering 0.50% APY boost for activating automatic debit transactions.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-mono text-indigo-400 font-bold">4.</span>
                  <span>Track weekly retention milestone in Power BI to ensure reach trajectory meets target {retentionSuccessRate}%.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
