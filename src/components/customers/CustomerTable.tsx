import React, { useState, useMemo } from 'react';
import { CustomerRecord, DashboardFilterState } from '../../types/churn';
import { 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  ExternalLink, 
  X, 
  Building2, 
  CreditCard, 
  Clock, 
  DollarSign, 
  Activity,
  UserCheck
} from 'lucide-react';

interface CustomerTableProps {
  customers: CustomerRecord[];
  filters: DashboardFilterState;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilterState>>;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  filters,
  setFilters
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<keyof CustomerRecord>('churnProbability');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const pageSize = 15;

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
  }, [customers, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / pageSize));
  const paginatedCustomers = sortedCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof CustomerRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">
                Customer 360: At-Risk Account Directory
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Drill down into individual customer records, examine machine-learning churn probabilities, and review personalized retention triggers.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={e => {
                setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Search surname, ID, country..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('customerId')}>
                  Customer ID {sortField === 'customerId' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('surname')}>
                  Surname {sortField === 'surname' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('geography')}>
                  Country {sortField === 'geography' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('age')}>
                  Age {sortField === 'age' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('tenure')}>
                  Tenure {sortField === 'tenure' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('balance')}>
                  Balance {sortField === 'balance' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:text-white" onClick={() => handleSort('numOfProducts')}>
                  Products {sortField === 'numOfProducts' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:text-white" onClick={() => handleSort('isActiveMember')}>
                  Activity {sortField === 'isActiveMember' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('churnProbability')}>
                  Risk Score {sortField === 'churnProbability' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 bg-slate-900/60 font-mono">
              {paginatedCustomers.map(c => {
                const isCritical = c.riskTier === 'Critical';
                const isHigh = c.riskTier === 'High';
                return (
                  <tr key={c.customerId} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-300">
                      {c.customerId}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-medium text-white">
                      {c.surname}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-300">
                      {c.geography}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {c.age}y
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {c.tenure}y
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-amber-300">
                      ${c.balance.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        c.numOfProducts >= 3 ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        c.numOfProducts === 2 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {c.numOfProducts}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        c.isActiveMember === 1 
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' 
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                      }`}>
                        {c.isActiveMember === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold">
                      <span className={
                        isCritical ? 'text-rose-400' :
                        isHigh ? 'text-amber-400' :
                        'text-emerald-400'
                      }>
                        {((c.churnProbability) * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.exited === 1 
                          ? 'bg-rose-600 text-white shadow-sm' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {c.exited === 1 ? 'Churned' : 'Retained'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/50 px-2 py-1 rounded border border-indigo-800/60 transition cursor-pointer"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white font-mono">{((currentPage - 1) * pageSize) + 1}</strong> to <strong className="text-white font-mono">{Math.min(currentPage * pageSize, sortedCustomers.length)}</strong> of <strong className="text-white font-mono">{sortedCustomers.length.toLocaleString()}</strong> accounts
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-white text-xs px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer 360 Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg">
                {selectedCustomer.surname.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedCustomer.surname} (ID: #{selectedCustomer.customerId})
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedCustomer.geography} • {selectedCustomer.gender} • {selectedCustomer.age} years old
                </p>
              </div>
            </div>

            {/* Risk Gauge Bar */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Predicted Churn Probability</span>
                <span className={`text-xl font-bold font-mono ${
                  selectedCustomer.churnProbability > 0.5 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {((selectedCustomer.churnProbability) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    selectedCustomer.churnProbability > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedCustomer.churnProbability * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5">
                <span>Safe Threshold (&lt;25%)</span>
                <span>Critical Risk (&gt;65%)</span>
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Deposit Balance</span>
                <span className="font-bold text-amber-300 text-sm">${selectedCustomer.balance.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Bank Tenure</span>
                <span className="font-bold text-white text-sm">{selectedCustomer.tenure} years</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Credit Score</span>
                <span className="font-bold text-white text-sm">{selectedCustomer.creditScore}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Products Held</span>
                <span className="font-bold text-indigo-300 text-sm">{selectedCustomer.numOfProducts} products</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Activity Status</span>
                <span className={`font-bold text-sm ${selectedCustomer.isActiveMember === 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedCustomer.isActiveMember === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Credit Card</span>
                <span className="font-bold text-white text-sm">{selectedCustomer.hasCrCard === 1 ? 'Has Card' : 'No Card'}</span>
              </div>
            </div>

            {/* Key Risk Drivers for this account */}
            <div className="mb-4">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Detected Attrition Risk Factors</span>
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedCustomer.keyRiskFactors.map((rf, i) => (
                  <span 
                    key={i}
                    className="text-[11px] bg-rose-950/60 text-rose-300 border border-rose-800/80 px-2.5 py-1 rounded-md"
                  >
                    • {rf}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Retention Action */}
            <div className="bg-indigo-950/30 border border-indigo-800/50 p-3.5 rounded-xl text-xs">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Relationship Manager Playbook:</span>
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {selectedCustomer.balance > 100000 
                  ? 'Assign dedicated private banker for high-yield term deposit onboarding and fee waiver consultation.'
                  : selectedCustomer.isActiveMember === 0
                  ? 'Schedule direct branch re-engagement outreach with 30-day debit reward incentive.'
                  : 'Conduct annual service satisfaction review and consolidate secondary products.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
