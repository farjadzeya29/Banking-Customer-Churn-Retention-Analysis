import React from 'react';
import { 
  BarChart3, 
  Layers, 
  Terminal, 
  BrainCircuit, 
  Target, 
  Users, 
  RotateCcw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { DashboardFilterState } from '../types/churn';

interface NavbarProps {
  activeTab: 'powerbi' | 'segments' | 'sql' | 'python' | 'strategy' | 'customers';
  setActiveTab: (tab: 'powerbi' | 'segments' | 'sql' | 'python' | 'strategy' | 'customers') => void;
  filters: DashboardFilterState;
  resetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  filters,
  resetFilters,
  filteredCount,
  totalCount
}) => {
  const isFiltered = 
    filters.geography !== 'All' ||
    filters.gender !== 'All' ||
    filters.activityStatus !== 'All' ||
    filters.tenureBucket !== 'All' ||
    filters.balanceTier !== 'All' ||
    filters.numOfProducts !== 'All' ||
    filters.ageGroup !== 'All' ||
    filters.searchQuery !== '';

  const navItems = [
    { id: 'powerbi', label: 'Power BI Dashboard', icon: BarChart3, badge: 'Interactive' },
    { id: 'segments', label: 'Segment Drivers', icon: Layers, badge: 'Tenure • Activity • Balance' },
    { id: 'sql', label: 'SQL Workbench', icon: Terminal, badge: 'ETL & Queries' },
    { id: 'python', label: 'Python ML & SHAP', icon: BrainCircuit, badge: 'RF AUC 0.868' },
    { id: 'strategy', label: 'Retention ROI Planner', icon: Target, badge: 'Action Strategy' },
    { id: 'customers', label: 'Customer 360', icon: Users, badge: `${filteredCount} Records` }
  ] as const;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      {/* Top micro bar */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-400 tracking-wide uppercase text-[11px]">Production BI Workspace</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">Bank Customer Attrition Analytics Portfolio</span>
          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-medium">
            SQL + Python + Power BI
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">At-Risk Segment Focus:</span>
            <span className="font-medium text-rose-300">Tenure, Activity, Balance</span>
          </div>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 bg-amber-950/50 hover:bg-amber-900/50 px-2.5 py-0.5 rounded border border-amber-700/50 transition-colors cursor-pointer"
              title="Reset all applied slicers"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Slicers ({filteredCount}/{totalCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                RetainIQ <span className="text-slate-400 font-normal text-sm hidden md:inline">| Banking Churn Analytics</span>
              </h1>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                v2.4 Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tenure, Activity & Balance Driver Discovery • Retention Strategy Engine
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 border border-indigo-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
