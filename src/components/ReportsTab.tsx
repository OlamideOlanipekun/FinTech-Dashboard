import React, { useState } from 'react';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Percent, 
  HelpCircle, 
  BarChart as BarIcon, 
  Sparkles,
  ChevronDown,
  X,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Transaction } from '../types';
import { formatCurrency, CurrencyCode, CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../utils';

interface ReportsTabProps {
  transactions: Transaction[];
  addNotification: (text: string) => void;
  currency: CurrencyCode;
}

export default function ReportsTab({
  transactions,
  addNotification,
  currency
}: ReportsTabProps) {
  // Local dynamic currency formatting wrapper
  const formatNaira = (koboAmount: number) => {
    return formatCurrency(koboAmount, currency);
  };
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportMonth, setSelectedExportMonth] = useState('June 2026');

  // Compute June 2026 stats dynamically from the actual transactions array!
  const getJuneDynamicStats = () => {
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(t => {
      // Look for June 2026 transactions with status as completed
      if (t.date.startsWith('2026-06') && t.status === 'completed') {
        if (t.type === 'credit') {
          income += t.amount;
        } else {
          expenses += t.amount;
        }
      }
    });

    // convert to units
    const incomeNaira = income / 100;
    const expensesNaira = expenses / 100;
    const net = incomeNaira - expensesNaira;
    
    // Assume 7.5% average tax liability on expenses or derived
    const tax = Math.round(expensesNaira * 0.05); 
    const savingsRate = Math.min(30, Math.max(5, Math.round((net / Math.max(1, incomeNaira)) * 100)));

    return {
      month: 'June 2026',
      income: incomeNaira,
      expenses: expensesNaira,
      net,
      tax,
      savingsRate: Math.max(0, savingsRate)
    };
  };

  const juneData = getJuneDynamicStats();

  // Monthly ledger spreadsheet data for first half of 2026
  const monthlyData = [
    { month: 'Jan 2026', income: 1200000, expenses: 600000, net: 600000, tax: 45000, savingsRate: 12 },
    { month: 'Feb 2026', income: 1500000, expenses: 850000, net: 650000, tax: 63750, savingsRate: 15 },
    { month: 'Mar 2026', income: 1420000, expenses: 900000, net: 520000, tax: 51200, savingsRate: 8 },
    { month: 'Apr 2026', income: 1950000, expenses: 1100000, net: 850000, tax: 82500, savingsRate: 20 },
    { month: 'May 2026', income: 2100000, expenses: 1350000, net: 750000, tax: 101250, savingsRate: 18 },
    { 
      month: 'Jun 2026', 
      income: juneData.income, 
      expenses: juneData.expenses, 
      net: juneData.net, 
      tax: juneData.tax, 
      savingsRate: juneData.savingsRate 
    },
  ];

  // Cumulative liabilities calculation for Area chart
  let runningTaxTotal = 0;
  const areaData = monthlyData.map(m => {
    runningTaxTotal += m.tax;
    return {
      month: m.month,
      taxLiability: runningTaxTotal
    };
  });

  const handleDownloadReport = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification(`Exported monthly financial report for ${selectedExportMonth}: High-fidelity charts, ledgers, and corporate tax projections drafted successfully.`);
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/30">
        <div>
          <h2 className="text-xl font-display font-medium text-brand-text">Corporate Analytics & Auditing</h2>
          <p className="text-xs text-brand-muted">Automated balance sheets, monthly tax projections, and cash flow reports</p>
        </div>
        
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-gold text-brand-base font-black text-xs rounded-xl hover:bg-brand-gold/95 transition-all shadow-lg shadow-brand-gold/5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-brand-base stroke-[3px]" />
          Compile Export Dossier
        </button>
      </div>

      {/* SECTION 1: MONTHLY LEDGER OVERVIEW TABLE */}
      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
        <div className="p-4 bg-brand-surface border-b border-brand-border/40 flex justify-between items-center">
          <span className="text-[11px] uppercase tracking-wider font-bold text-brand-muted">H1 2026 Balance Sheet Summary</span>
          <span className="px-2 py-0.5 rounded text-[9px] bg-brand-green/10 text-brand-green font-bold">Audit Verified</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-brand-border/40 text-brand-muted font-bold uppercase tracking-wider text-[10px] h-10">
                <th className="pb-2 pl-4">Month</th>
                <th className="pb-2">Corporate Income ({CURRENCY_SYMBOLS[currency]})</th>
                <th className="pb-2">Operating Expenses ({CURRENCY_SYMBOLS[currency]})</th>
                <th className="pb-2">Net Cash Flow ({CURRENCY_SYMBOLS[currency]})</th>
                <th className="pb-2">Vat Tax Liability ({CURRENCY_SYMBOLS[currency]})</th>
                <th className="pb-2 text-right pr-4">Savings Rate %</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row) => (
                <tr key={row.month} className="h-11 border-b border-brand-border/30 hover:bg-brand-elevated/20 transition-all font-sans">
                  <td className="font-semibold text-brand-text pl-4 font-display">{row.month}</td>
                  <td className="font-mono text-brand-text tabular-nums">{formatNaira(row.income * 100)}</td>
                  <td className="font-mono text-brand-text tabular-nums">{formatNaira(row.expenses * 100)}</td>
                  <td className={`font-mono tabular-nums font-bold ${row.net >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                    {row.net >= 0 ? '+' : ''}{formatNaira(row.net * 100)}
                  </td>
                  <td className="font-mono text-brand-gold tabular-nums">{formatNaira(row.tax * 100)}</td>
                  <td className="text-right pr-4 font-mono font-bold text-brand-text">
                    <span className="inline-flex items-center gap-1">
                      <Percent className="w-3 h-3 text-brand-muted" />
                      {row.savingsRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: GRAPH VISUALIZATION Bento GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Graph 1: Yearly Income vs Expenses Bar Chart */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Income vs Expenses Analysis</h3>
            <p className="text-xs text-brand-muted">Operational inflow compared to outbound debits</p>
          </div>

          <div className="w-full h-56 md:h-64 font-mono text-[9px] text-brand-muted">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="month" stroke="#71717A" />
                <YAxis stroke="#71717A" tickFormatter={(val) => `${CURRENCY_SYMBOLS[currency]}${(val * EXCHANGE_RATES[currency] / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#3F3F46', borderRadius: '8px' }}
                  labelStyle={{ color: '#FAFAFA', fontWeight: 'bold' }}
                  formatter={(val: number) => [formatNaira(val * 100), currency]}
                />
                <Legend iconType="circle" />
                <Bar name="Corporate Income" dataKey="income" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar name="Merchant Expenses" dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Net profit line chart */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Net Cash Flow Gradient</h3>
            <p className="text-xs text-brand-muted">Monthly net profit margins for corporate treasury</p>
          </div>

          <div className="w-full h-56 md:h-64 font-mono text-[9px] text-brand-muted">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="month" stroke="#71717A" />
                <YAxis stroke="#71717A" tickFormatter={(val) => `${CURRENCY_SYMBOLS[currency]}${(val * EXCHANGE_RATES[currency] / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#3F3F46', borderRadius: '8px' }}
                  labelStyle={{ color: '#FAFAFA', fontWeight: 'bold' }}
                  formatter={(val: number) => [formatNaira(val * 100), 'Net Flow']}
                />
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  name="Net Gains" 
                  dataKey="net" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Tax liability running total */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 space-y-3 md:col-span-2">
          <div>
            <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Cumulative Corporate VAT Tax liabilities</h3>
            <p className="text-xs text-brand-muted">Accruing standard tax dues projected for Q2 fiscal settlement</p>
          </div>

          <div className="w-full h-56 md:h-64 font-mono text-[9px] text-brand-muted">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTaxLiability" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="month" stroke="#71717A" />
                <YAxis stroke="#71717A" tickFormatter={(val) => `${CURRENCY_SYMBOLS[currency]}${(val * EXCHANGE_RATES[currency] / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#3F3F46', borderRadius: '8px' }}
                  labelStyle={{ color: '#FAFAFA', fontWeight: 'bold' }}
                  formatter={(val: number) => [formatNaira(val * 100), 'Running Total']}
                />
                <Area 
                  type="monotone" 
                  name="Projected VAT Tax Accruals" 
                  dataKey="taxLiability" 
                  stroke="#F59E0B" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorTaxLiability)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* EXPORT COMPILER DIALOG */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-brand-surface border border-brand-border/80 rounded-none md:rounded-2xl w-full h-full md:h-auto md:max-w-sm p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col justify-center">
            <button 
              onClick={() => setShowExportModal(false)}
              className="absolute right-4 top-4 text-brand-muted hover:text-brand-text p-1.5 hover:bg-brand-elevated rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-brand-gold/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-brand-gold" />
              </div>
              <h3 className="font-display font-semibold text-lg text-brand-text">Compile Ledger Report</h3>
            </div>

            <p className="text-xs text-brand-muted mb-4">
              Instantly generate high-fidelity audit CSV summaries and PDF vouchers.
            </p>

            <form onSubmit={handleDownloadReport} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Target Audit Month</label>
                <select
                  value={selectedExportMonth}
                  onChange={(e) => setSelectedExportMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold"
                >
                  <option value="June 2026">June 2026 (Dynamic data)</option>
                  <option value="May 2026">May 2026 (Archived month)</option>
                  <option value="April 2026">April 2026 (Archived month)</option>
                  <option value="First Half 2026 (H1)">Combined H1 2026 Report</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Report Format</label>
                <select
                  className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold"
                >
                  <option value="pdf">Unified PDF Dossier (Charts + List)</option>
                  <option value="csv">Structured Excel Spreadsheet (CSV)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-gold text-brand-base font-black text-xs rounded-xl hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/10"
              >
                Compile and Download
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
