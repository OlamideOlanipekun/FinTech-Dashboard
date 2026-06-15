import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  SlidersHorizontal, 
  X, 
  Copy, 
  Check, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  User, 
  TrendingUp, 
  RotateCcw, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, exportToCSV, CurrencyCode, CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../utils';

interface TransactionsTabProps {
  transactions: Transaction[];
  selectedSubAccount: 'all' | 'main' | 'usd' | 'savings';
  onSelectSubAccount: (acc: 'all' | 'main' | 'usd' | 'savings') => void;
  currency: CurrencyCode;
  addNotification: (text: string) => void;
}

export default function TransactionsTab({
  transactions,
  selectedSubAccount,
  onSelectSubAccount,
  currency,
  addNotification,
}: TransactionsTabProps) {
  // Local dynamic currency formatting wrapper
  const formatNaira = (koboAmount: number) => {
    return formatCurrency(koboAmount, currency);
  };
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [amountRange, setAmountRange] = useState<number>(1200000); // in Naira (up to 1.2M)
  const [dateRange, setDateRange] = useState<string>('all'); // all | 7d | 30d | 90d

  // Interactive Detail Sidebar / Drawer
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Categories list
  const categoriesList = ['Operations', 'Salaries', 'Marketing', 'Software', 'Travel', 'Tax'];

  // Handle category toggle for multi-select
  const handleToggleCategory = (cat: string) => {
    if (filterCategory.includes(cat)) {
      setFilterCategory(filterCategory.filter(c => c !== cat));
    } else {
      setFilterCategory([...filterCategory, cat]);
    }
  };

  // Filter conditions
  const filteredTransactions = transactions.filter(t => {
    // 1. Search term (party, reference, narration)
    const matchesSearch = 
      t.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.narration.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Account filter
    const matchesAccount = selectedSubAccount === 'all' || t.account === selectedSubAccount;

    // 3. Category filter (multi-select)
    const matchesCategory = filterCategory.length === 0 || filterCategory.includes(t.category);

    // 4. Status filter
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

    // 5. Amount max slider check
    const amountInNaira = t.amount / 100;
    const matchesAmount = amountInNaira <= amountRange;

    // 6. Date range check
    let matchesDate = true;
    if (dateRange !== 'all') {
      const txDate = new Date(t.date);
      const limitDate = new Date(2026, 5, 15); // today is Jun 15, 2026
      if (dateRange === '7d') limitDate.setDate(limitDate.getDate() - 7);
      else if (dateRange === '30d') limitDate.setDate(limitDate.getDate() - 30);
      else if (dateRange === '90d') limitDate.setDate(limitDate.getDate() - 90);
      
      matchesDate = txDate >= limitDate;
    }

    return matchesSearch && matchesAccount && matchesCategory && matchesStatus && matchesAmount && matchesDate;
  });

  // Handle reference copy
  const handleCopyRef = (refNum: string) => {
    navigator.clipboard.writeText(refNum);
    setCopiedId(refNum);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterCategory([]);
    setFilterStatus('all');
    setAmountRange(1200000);
    setDateRange('all');
    onSelectSubAccount('all');
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
            <Clock className="w-3 h-3 text-brand-gold" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-red/10 text-brand-red border border-brand-red/20 animate-pulse">
            <AlertCircle className="w-3 h-3 text-brand-red" />
            Failed
          </span>
        );
      case 'reversed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-elevated text-brand-muted border border-brand-border">
            <RotateCcw className="w-3 h-3 text-brand-muted" />
            Reversed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-medium text-brand-text">Corporate Ledger</h2>
          <p className="text-xs text-brand-muted">Search, filter, inspect and export your spreadsheet ledger files </p>
        </div>
        <button 
          onClick={() => exportToCSV(filteredTransactions)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-elevated border border-brand-border hover:border-brand-muted rounded-xl text-brand-text font-bold text-xs transition-colors self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-brand-gold" />
          Export Ledger (CSV)
        </button>
      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="bg-brand-surface border border-brand-border rounded-xl p-5 space-y-4">
        
        {/* ROW 1: SEARCH & ACCOUNT SELECT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-brand-muted">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Search by vendor, reference or notes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div>
            <select
              value={selectedSubAccount}
              onChange={(e) => onSelectSubAccount(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-semibold"
            >
              <option value="all">Sub Wallet: All Wallets Combined</option>
              <option value="main">Sub Wallet: Main Business ({CURRENCY_SYMBOLS[currency]})</option>
              <option value="usd">Sub Wallet: USD Settled ({CURRENCY_SYMBOLS[currency]} Equiv)</option>
              <option value="savings">Sub Wallet: Automated Savings</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-semibold"
            >
              <option value="all">Status: All Operations</option>
              <option value="completed">Status: Completed Settlement</option>
              <option value="pending">Status: Pending Settlement</option>
              <option value="failed">Status: Failed Authorization</option>
              <option value="reversed">Status: Returned/Reversed</option>
            </select>
          </div>
        </div>

        {/* ROW 2: FILTERS - DATES & AMOUNTS SLIDER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-brand-border/30">
          
          {/* Quick Date selects */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Date Settlement Range</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All History' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: '90d', label: 'Last 90 Days' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDateRange(d.id)}
                  className={`px-3 py-1.5 text-[10px] rounded-lg font-bold transition-all border ${
                    dateRange === d.id
                      ? 'bg-brand-gold/10 text-brand-gold border-brand-gold'
                      : 'bg-brand-elevated/40 border-brand-border text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount range slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Max Amount limit ({CURRENCY_SYMBOLS[currency]})</label>
              <span className="font-mono text-xs text-brand-gold font-semibold">
                Up to {CURRENCY_SYMBOLS[currency]}{(amountRange * EXCHANGE_RATES[currency]).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <input 
              type="range" 
              min={10000} 
              max={1200000} 
              step={10000}
              value={amountRange} 
              onChange={(e) => setAmountRange(parseInt(e.target.value, 10))}
              className="w-full accent-brand-gold bg-brand-elevated h-1 rounded-lg cursor-pointer"
            />
          </div>

        </div>

        {/* ROW 3: CATEGORY MULTI-SELECT */}
        <div className="pt-2 border-t border-brand-border/30 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Operations Category filtering (multi-select)</label>
            {(filterCategory.length > 0 || searchTerm || selectedSubAccount !== 'all' || filterStatus !== 'all' || dateRange !== 'all') && (
              <button 
                onClick={handleResetFilters}
                className="text-[10px] text-brand-red font-bold hover:underline"
              >
                Clear all active filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categoriesList.map((cat) => {
              const active = filterCategory.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => handleToggleCategory(cat)}
                  className={`px-3 py-1.5 text-[10px] rounded-lg font-semibold transition-all border ${
                    active
                      ? 'bg-brand-gold text-brand-base border-brand-gold font-bold'
                      : 'bg-brand-elevated/40 border-brand-border text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* LEDGER TABULATION */}
      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-brand-border/40 bg-brand-surface flex justify-between items-center">
          <span className="text-[11px] uppercase tracking-wider font-bold text-brand-muted">
            Found {filteredTransactions.length} transaction logs
          </span>
          {filteredTransactions.length === 0 && (
            <button 
              onClick={handleResetFilters}
              className="text-xs text-brand-gold hover:underline font-bold"
            >
              Reset search configs
            </button>
          )}
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-10 h-10 text-brand-muted mx-auto" />
            <div>
              <p className="font-semibold text-brand-text">No ledger entries match</p>
              <p className="text-xs text-brand-muted">Try updating your filters or changing the search parameter</p>
            </div>
            <button 
              onClick={handleResetFilters}
              className="px-4 py-2 bg-brand-gold text-brand-base font-bold text-xs rounded-lg hover:bg-brand-gold/90 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Ledger Tabulation (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-border/40 text-brand-muted font-bold uppercase tracking-wider text-[10px] h-10">
                    <th className="pb-2 pl-4">No.</th>
                    <th className="pb-2">Counterparty</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Account</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-2">Reference Code</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, idx) => (
                    <tr 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className={`h-11 border-b border-brand-border/30 hover:bg-brand-elevated/40 cursor-pointer transition-all ${
                        tx.status === 'failed' ? 'shake-element hover:bg-brand-red/5' : ''
                      }`}
                    >
                      <td className="font-mono text-[10px] text-brand-muted pl-4">
                        #{filteredTransactions.length - idx}
                      </td>
                      <td className="font-semibold text-brand-text">
                        <div>
                          <p className="font-sans font-semibold text-xs text-brand-text truncate max-w-[150px] sm:max-w-[200px]">
                            {tx.party}
                          </p>
                          <p className="font-mono text-[9px] text-brand-muted leading-none mt-0.5 mt-1 block truncate max-w-[180px]">
                            {tx.narration}
                          </p>
                        </div>
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-brand-elevated/80 border border-brand-border/40">
                          {tx.category}
                        </span>
                      </td>
                      <td className="uppercase font-mono text-[10px] text-brand-muted">{tx.account}</td>
                      <td className="text-brand-muted truncate max-w-[80px]">{tx.date}</td>
                      <td className="font-mono text-[10px] text-brand-muted">{tx.reference}</td>
                      <td className={`text-right tabular-nums font-bold ${
                        tx.type === 'credit' ? 'text-brand-green' : 'text-brand-red'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}
                      </td>
                      <td className="text-right pr-4">
                        {getStatusBadge(tx.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Ledger tab list format */}
            <div className="md:hidden space-y-3 p-1.5">
              {filteredTransactions.map((tx, idx) => (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTx(tx)}
                  className="p-3.5 bg-brand-surface border border-brand-border rounded-xl flex flex-col gap-2.5 active:bg-brand-elevated/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-brand-elevated flex items-center justify-center font-display font-medium text-xs text-brand-gold font-sans">
                        {tx.party.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="block font-sans font-semibold text-xs text-brand-text leading-tight">{tx.party}</span>
                        <span className="block font-sans text-[10px] text-brand-muted leading-tight mt-1">{tx.date}</span>
                      </div>
                    </div>
                    {/* Right side amount and type status */}
                    <div className="text-right">
                      <span className={`font-mono font-bold text-xs tabular-nums block ${tx.type === 'credit' ? 'text-brand-green' : 'text-brand-red'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}
                      </span>
                      <span className="block mt-1">{getStatusBadge(tx.status)}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-[0.5px] bg-brand-border/30 w-full" />

                  <div className="flex items-center justify-between text-[10px] text-brand-muted">
                    <span className="px-2 py-0.5 rounded bg-brand-elevated text-brand-text border border-brand-border text-[9px] font-medium leading-none">
                      {tx.category}
                    </span>
                    <span className="font-mono uppercase">{tx.account} Wallet</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* BOTTOM SHEET / DETAIL DRAWER MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-brand-surface border-t sm:border border-brand-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in slide-in-from-bottom-20 duration-200">
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute right-4 top-4 text-brand-muted hover:text-brand-text p-1 hover:bg-brand-elevated rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 space-y-1">
              <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block">Transaction Ledger Detail</span>
              <h3 className="font-display font-bold text-lg text-brand-text">Verify Transaction Logs</h3>
            </div>

            {/* Main receipts contents */}
            <div className="space-y-4 font-sans text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-brand-elevated/40 border border-brand-border/60">
                <div>
                  <p className="text-[10px] text-brand-muted uppercase font-bold">Counterparty Name</p>
                  <p className="font-semibold text-sm text-brand-text mt-0.5">{selectedTx.party}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-elevated flex items-center justify-center font-bold text-brand-gold text-sm">
                  {selectedTx.party.substring(0, 2).toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-2.5 rounded-lg bg-brand-elevated/20 border border-brand-border/40">
                  <p className="text-[9px] text-brand-muted uppercase font-bold">Transaction Type</p>
                  <p className={`font-semibold text-xs mt-1 flex items-center gap-1 ${
                    selectedTx.type === 'credit' ? 'text-brand-green' : 'text-brand-red'
                  }`}>
                    {selectedTx.type === 'credit' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    {selectedTx.type === 'credit' ? 'Direct Credit' : 'Business Expense Out'}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-brand-elevated/20 border border-brand-border/40">
                  <p className="text-[9px] text-brand-muted uppercase font-bold">Financial Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTx.status)}</div>
                </div>
              </div>

              {/* Bank Details (Nigerian banks if any) */}
              <div className="p-3 bg-brand-elevated/40 rounded-xl space-y-2 border border-brand-border/60">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Beneficiary Bank:</span>
                  <span className="font-semibold text-brand-text">{selectedTx.bank || 'Swift Central Settlement'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Account Tier/Currency:</span>
                  <span className="font-mono text-brand-text uppercase">{selectedTx.account === 'usd' ? `USD (${CURRENCY_SYMBOLS[currency]} Equiv)` : `${currency} (${CURRENCY_SYMBOLS[currency]})`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Log Date/Time:</span>
                  <span className="text-brand-text">{selectedTx.date} 09:32:00</span>
                </div>
              </div>

              {/* Reference number and Copy Button */}
              <div className="p-3 bg-brand-elevated/40 rounded-xl flex items-center justify-between border border-brand-border/60">
                <div>
                  <p className="text-[10px] text-brand-muted font-semibold uppercase">Settlement Reference ID</p>
                  <p className="font-mono text-brand-text font-semibold text-xs tracking-wider mt-0.5">{selectedTx.reference}</p>
                </div>
                <button
                  onClick={() => handleCopyRef(selectedTx.reference)}
                  className="p-2 bg-brand-elevated hover:bg-brand-elevated/80 rounded-lg text-brand-muted hover:text-brand-text border border-brand-border transition-colors flex items-center gap-1"
                >
                  {copiedId === selectedTx.reference ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-brand-green" />
                      <span className="text-[9px] font-bold text-brand-green">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-brand-gold" />
                      <span className="text-[9px] font-bold">Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-brand-muted">Narration Memo</p>
                <p className="p-2.5 rounded-lg bg-brand-elevated/20 border border-brand-border/40 text-brand-text font-medium leading-relaxed">
                  {selectedTx.narration}
                </p>
              </div>

              {/* Receipt Download button */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { 
                    addNotification(`PDF Settlement receipt for verification ${selectedTx.reference} compiled and downloaded successfully.`); 
                    setSelectedTx(null); 
                  }}
                  className="flex-1 py-2.5 bg-brand-gold text-brand-base font-black text-xs rounded-lg hover:bg-brand-gold/90 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/5"
                >
                  <FileText className="w-4 h-4 text-brand-base" />
                  Download PDF Settlement Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-2.5 bg-brand-elevated text-brand-text font-semibold text-xs rounded-lg hover:bg-brand-elevated/80 border border-brand-border transition-all"
                >
                  Close Detail
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
