/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CustomerRecord, DashboardFilterState } from './types/churn';
import { BANK_CUSTOMERS } from './data/mockBankData';
import { filterCustomerDataset, computeKpiMetrics } from './utils/analytics';
import { Navbar } from './components/Navbar';
import { PowerBiDashboard } from './components/dashboard/PowerBiDashboard';
import { SegmentAnalysis } from './components/segments/SegmentAnalysis';
import { SqlWorkbench } from './components/sql/SqlWorkbench';
import { PythonMlExplorer } from './components/python/PythonMlExplorer';
import { RetentionStrategyPlanner } from './components/retention/RetentionStrategyPlanner';
import { CustomerTable } from './components/customers/CustomerTable';
import { Database, FileCode, BarChart3, ShieldCheck, Heart } from 'lucide-react';

const initialFilters: DashboardFilterState = {
  geography: 'All',
  gender: 'All',
  activityStatus: 'All',
  tenureBucket: 'All',
  balanceTier: 'All',
  numOfProducts: 'All',
  ageGroup: 'All',
  searchQuery: ''
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'powerbi' | 'segments' | 'sql' | 'python' | 'strategy' | 'customers'>('powerbi');
  const [filters, setFilters] = useState<DashboardFilterState>(initialFilters);

  const allCustomers = BANK_CUSTOMERS;

  // Filtered dataset according to current Power BI slicers
  const filteredCustomers = useMemo(() => {
    return filterCustomerDataset(allCustomers, filters);
  }, [allCustomers, filters]);

  // Executive KPIs
  const kpis = useMemo(() => {
    return computeKpiMetrics(filteredCustomers);
  }, [filteredCustomers]);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filters={filters}
        resetFilters={resetFilters}
        filteredCount={filteredCustomers.length}
        totalCount={allCustomers.length}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'powerbi' && (
          <PowerBiDashboard
            filteredCustomers={filteredCustomers}
            allCustomers={allCustomers}
            kpis={kpis}
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'segments' && (
          <SegmentAnalysis
            customers={filteredCustomers}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'sql' && (
          <SqlWorkbench customers={allCustomers} />
        )}

        {activeTab === 'python' && (
          <PythonMlExplorer />
        )}

        {activeTab === 'strategy' && (
          <RetentionStrategyPlanner customers={filteredCustomers} />
        )}

        {activeTab === 'customers' && (
          <CustomerTable
            customers={filteredCustomers}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </main>

      {/* Enterprise Analytics Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-white">RetainIQ Analytics Platform</span>
            <span>•</span>
            <span>Banking Customer Churn & Retention Architecture</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span className="flex items-center space-x-1">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>SQL ETL Engine</span>
            </span>
            <span className="flex items-center space-x-1">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Python Scikit-Learn</span>
            </span>
            <span className="flex items-center space-x-1">
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Power BI Retention Canvas</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
