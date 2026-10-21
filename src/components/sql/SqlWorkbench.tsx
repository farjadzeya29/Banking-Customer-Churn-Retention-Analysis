import React, { useState } from 'react';
import { CustomerRecord } from '../../types/churn';
import { SAMPLE_SQL_QUERIES } from '../../data/mockBankData';
import { executeBankingSqlQuery, SqlQueryResult } from '../../utils/sqlEngine';
import { 
  Terminal, 
  Play, 
  Database, 
  Download, 
  Clock, 
  Check, 
  Copy, 
  AlertCircle,
  FileCode,
  Table as TableIcon
} from 'lucide-react';

interface SqlWorkbenchProps {
  customers: CustomerRecord[];
}

export const SqlWorkbench: React.FC<SqlWorkbenchProps> = ({ customers }) => {
  const [selectedQueryId, setSelectedQueryId] = useState<string>(SAMPLE_SQL_QUERIES[0].id);
  const [sqlText, setSqlText] = useState<string>(SAMPLE_SQL_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<SqlQueryResult>(() => 
    executeBankingSqlQuery(SAMPLE_SQL_QUERIES[0].sql, customers)
  );
  const [copied, setCopied] = useState(false);

  const handleSelectQuery = (query: typeof SAMPLE_SQL_QUERIES[0]) => {
    setSelectedQueryId(query.id);
    setSqlText(query.sql);
    const res = executeBankingSqlQuery(query.sql, customers);
    setQueryResult(res);
  };

  const handleRunQuery = () => {
    const res = executeBankingSqlQuery(sqlText, customers);
    setQueryResult(res);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const headers = queryResult.columns.join(',');
    const rows = queryResult.rows.map(r => 
      queryResult.columns.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sql_churn_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const schemaColumns = [
    { name: 'customer_id', type: 'INT (PK)', desc: 'Unique account identifier' },
    { name: 'surname', type: 'VARCHAR(50)', desc: 'Customer family name' },
    { name: 'credit_score', type: 'INT', desc: 'FICO score (350 - 850)' },
    { name: 'geography', type: 'VARCHAR(20)', desc: 'France, Germany, or Spain' },
    { name: 'gender', type: 'VARCHAR(10)', desc: 'Male or Female' },
    { name: 'age', type: 'INT', desc: 'Customer age in years' },
    { name: 'tenure', type: 'INT', desc: 'Years as bank customer (0-10)' },
    { name: 'balance', type: 'NUMERIC(12,2)', desc: 'Current deposit balance in USD' },
    { name: 'num_of_products', type: 'INT', desc: 'Bank products held (1, 2, 3, 4)' },
    { name: 'has_cr_card', type: 'TINYINT', desc: '1 if holding bank credit card' },
    { name: 'is_active_member', type: 'TINYINT', desc: '1 if logged in or transacted in 30d' },
    { name: 'estimated_salary', type: 'NUMERIC(12,2)', desc: 'Annual estimated salary' },
    { name: 'exited', type: 'TINYINT', desc: '1 if churned, 0 if retained' }
  ];

  return (
    <div className="space-y-6">
      {/* Workbench Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">
                SQL Analytics Engine & ETL Pipeline
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              Execute analytical SQL transformations directly against the bank warehouse dataset. 
              These scripts extracted churn rates, tenure cohorts, and balance deciles fed into the Power BI model.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 rounded-lg text-xs font-mono">
              <Database className="w-3.5 h-3.5" />
              <span>Table: customers ({customers.length.toLocaleString()} rows)</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sidebar: Pre-built Queries & Schema */}
        <div className="lg:col-span-4 space-y-4">
          {/* Query Library */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Analytical Query Library</span>
            </h3>

            <div className="space-y-2">
              {SAMPLE_SQL_QUERIES.map(q => {
                const isSelected = selectedQueryId === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuery(q)}
                    className={`w-full text-left p-2.5 rounded-lg border transition text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">{q.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {q.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Schema Accordion */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Data Dictionary: `customers`</span>
            </h3>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/80 pr-1 text-[11px]">
              {schemaColumns.map(col => (
                <div key={col.name} className="py-1.5 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-semibold text-slate-200">{col.name}</span>
                    <span className="text-[10px] text-slate-400 block">{col.desc}</span>
                  </div>
                  <span className="font-mono text-[10px] text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 whitespace-nowrap">
                    {col.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor & Results */}
        <div className="lg:col-span-8 space-y-4">
          {/* SQL Editor Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-slate-200 font-semibold">SQL Query Editor</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopySql}
                  className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition flex items-center space-x-1 cursor-pointer"
                  title="Copy SQL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleRunQuery}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded shadow transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute SQL</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950">
              <textarea
                value={sqlText}
                onChange={e => setSqlText(e.target.value)}
                rows={8}
                className="w-full bg-slate-900/90 text-emerald-300 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
                placeholder="Enter SQL statement here..."
                spellCheck={false}
              />
            </div>

            {/* Execution status banner */}
            <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Query Executed Successfully</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{queryResult.executionTimeMs} ms</span>
                </span>
                <span>•</span>
                <span>{queryResult.rowCount} rows returned</span>
              </div>

              <button
                onClick={handleExportCsv}
                disabled={queryResult.rows.length === 0}
                className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <TableIcon className="w-4 h-4 text-indigo-400" />
                <span>Query Results Table</span>
              </h3>
            </div>

            {queryResult.error ? (
              <div className="p-6 text-center text-rose-400 bg-rose-950/20 text-xs flex items-center justify-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{queryResult.error}</span>
              </div>
            ) : queryResult.rows.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No records returned by query.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-800">
                    <tr>
                      {queryResult.columns.map(col => (
                        <th key={col} className="py-2.5 px-3.5 font-semibold text-slate-300">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 bg-slate-900">
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/50 transition-colors">
                        {queryResult.columns.map(col => {
                          const val = row[col];
                          const isPct = String(val).endsWith('%');
                          const isMoney = String(val).startsWith('$');
                          return (
                            <td 
                              key={`${rIdx}-${col}`} 
                              className={`py-2 px-3.5 whitespace-nowrap text-xs ${
                                isPct ? 'font-bold text-amber-300' :
                                isMoney ? 'font-bold text-emerald-300' :
                                'text-slate-300'
                              }`}
                            >
                              {String(val ?? 'NULL')}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
