import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Send, 
  Briefcase, 
  Users, 
  Megaphone, 
  Code, 
  Plane, 
  FileText, 
  ChevronRight, 
  Loader2, 
  CheckCircle, 
  X,
  Sparkles,
  Lock,
  Unlock,
  Copy,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import { Transaction } from '../types';
import { formatCurrency, parseNairaInput, CurrencyCode, CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../utils';
import { NIGERIAN_BANKS, SPENDING_CATEGORIES } from '../mockData';

const generateId = () => Math.random().toString(36).substring(2, 11);

interface OverviewTabProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onNavigateToTab: (tab: string) => void;
  selectedSubAccount: 'all' | 'main' | 'usd' | 'savings';
  onSelectSubAccount: (acc: 'all' | 'main' | 'usd' | 'savings') => void;
  addNotification: (text: string) => void;
  currency: CurrencyCode;
}

export default function OverviewTab({
  transactions,
  onAddTransaction,
  onNavigateToTab,
  selectedSubAccount,
  onSelectSubAccount,
  addNotification,
  currency
}: OverviewTabProps) {
  // Viewport width observer for responsive controls
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Local dynamic currency formatting wrapper
  const formatNaira = (koboAmount: number) => {
    return formatCurrency(koboAmount, currency);
  };
  // Modal states
  const [showSendModal, setShowSendModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Quick chart duration filter
  const [chartDuration, setChartDuration] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  // Mobile scroll tracking and category dropdown states
  const [activeStatCardIdx, setActiveStatCardIdx] = useState(0);
  const [tappedChartItem, setTappedChartItem] = useState<any | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleStatScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const idx = Math.round(scrollLeft / (width * 0.75));
    setActiveStatCardIdx(Math.min(2, Math.max(0, idx)));
  };

  // Input states for Send Modal (Quick action)
  const [sendBank, setSendBank] = useState('');
  const [sendAccount, setSendAccount] = useState('');
  const [sendVerifying, setSendVerifying] = useState(false);
  const [sendVerifiedName, setSendVerifiedName] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendNarration, setSendNarration] = useState('');
  const [sendSubmitting, setSendSubmitting] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Input states for Add Modal (Fund Account)
  const [addAccountType, setAddAccountType] = useState<'main' | 'usd' | 'savings'>('main');
  const [addAmount, setAddAmount] = useState('');
  const [addSource, setAddSource] = useState('Card - *1938');
  const [addNarration, setAddNarration] = useState('');
  const [addIsSubmitting, setAddIsSubmitting] = useState(false);

  // Secure virtual receiving accounts unmask countdown
  const [revealedAccountBank, setRevealedAccountBank] = useState<string | null>(null);
  const [accountCountdown, setAccountCountdown] = useState(30);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const handleCopyAccount = (bankName: string, acctNum: string) => {
    navigator.clipboard.writeText(acctNum).then(() => {
      setCopiedBank(bankName);
      addNotification(`Account number ${acctNum} for ${bankName} copied to clipboard!`);
      setTimeout(() => setCopiedBank(null), 2000);
    }).catch(() => {
      setCopiedBank(bankName);
      setTimeout(() => setCopiedBank(null), 2000);
    });
  };

  useEffect(() => {
    if (revealedAccountBank) {
      const timer = setInterval(() => {
        setAccountCountdown((prev) => {
          if (prev <= 1) {
            setRevealedAccountBank(null);
            clearInterval(timer);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [revealedAccountBank]);

  // Live accounts calculations
  const calculateBalances = () => {
    let main = 385000000; // 3,850,000.00 Naira in kobo
    let usd = 150000000;  // 1,500,000.00 Naira in kobo
    let savings = 93234000; // 932,340.00 Naira in kobo

    // Incorporate dynamic user actions
    transactions.forEach(t => {
      // Let's count transactions added dynamically
      if (t.id.startsWith('tx-dynamic-')) {
        const factor = t.type === 'credit' ? 1 : -1;
        if (t.account === 'main') main += t.amount * factor;
        else if (t.account === 'usd') usd += t.amount * factor;
        else if (t.account === 'savings') savings += t.amount * factor;
      }
    });

    const total = main + usd + savings;
    return { main, usd, savings, total };
  };

  const balances = calculateBalances();

  // Selected final balance based on filter
  const getSubAccountBalance = () => {
    switch (selectedSubAccount) {
      case 'main': return balances.main;
      case 'usd': return balances.usd;
      case 'savings': return balances.savings;
      default: return balances.total;
    }
  };

  const targetBalance = getSubAccountBalance();

  // Count-up animation on page load or amount changed
  const [countVal, setCountVal] = useState(0);

  useEffect(() => {
    let start = Math.max(0, targetBalance - 500000 * 100); // start slightly below for high visual count up effect
    if (countVal === 0) start = 0; // count from 0 on fresh load
    const end = targetBalance;
    const duration = 1200; // 1.2 seconds
    const startTime = performance.now();
    
    let animationFrameId: number;
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // quadratic ease out
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(start + (end - start) * easeProgress);
      setCountVal(current);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetBalance]);

  // Today's net cashflow for background gradient shifting
  // Sum today's credits minus debits
  const todayTransactions = transactions.filter(t => t.date === '2026-06-15');
  const todayNet = todayTransactions.reduce((sum, t) => {
    const factor = t.type === 'credit' ? 1 : -1;
    return sum + (t.amount * factor);
  }, 0);

  const isNetPositive = todayNet >= 0;

  // Sparkline data for last 30 days
  const getSparklineData = () => {
    // Generate 30 balance data points scaling to current balance
    const points = [];
    let base = targetBalance;
    for (let i = 29; i >= 0; i--) {
      // Create some variance
      const noise = Math.sin(i * 0.5) * 0.03 * targetBalance;
      const step = (i / 30) * 0.08 * targetBalance;
      points.push({ val: Math.round(base - step + noise) });
    }
    return points;
  };
  const sparklineData = getSparklineData();

  // Recharts Spend / Income last 30 days (daily aggregated)
  const getChartData = () => {
    // Aggregated list of 30 days
    const chartMap: Record<string, { date: string, income: number, expense: number }> = {};
    
    // Seed 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(2026, 5, 15);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const displayKey = d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
      chartMap[key] = { date: displayKey, income: 0, expense: 0 };
    }

    // Populate with real / mock data from transactions
    transactions.forEach(t => {
      if (chartMap[t.date] && t.status === 'completed') {
        const valInNaira = t.amount / 100;
        if (t.type === 'credit') {
          chartMap[t.date].income += valInNaira;
        } else {
          chartMap[t.date].expense += valInNaira;
        }
      }
    });

    // Fallback to avoid complete empty charts if some filters are applied
    const list = Object.keys(chartMap).sort().map(k => chartMap[k]);
    
    // Filter by duration state
    if (chartDuration === '7D') return list.slice(23); // Last 7 days
    if (chartDuration === '90D') {
      // Interpolate larger list slightly or return complete 30
      return list;
    }
    return list; // Max 30
  };

  const chartData = getChartData();

  // Category statistics based on Transactions (Debit)
  const getCategoryStats = () => {
    const totals: Record<string, number> = {
      Operations: 0,
      Salaries: 0,
      Marketing: 0,
      Software: 0,
      Travel: 0,
      Tax: 0
    };

    let totalSpending = 0;

    transactions.forEach(t => {
      if (t.type === 'debit' && t.status === 'completed') {
        const cat = t.category;
        if (totals[cat] !== undefined) {
          const valInNaira = t.amount / 100;
          totals[cat] += valInNaira;
          totalSpending += valInNaira;
        }
      }
    });

    // If total spending is 0, give dummy values prevents division by zero
    if (totalSpending === 0) totalSpending = 1;

    return Object.keys(totals).map(catName => {
      const amt = totals[catName];
      const pct = Math.round((amt / totalSpending) * 100);
      const config = SPENDING_CATEGORIES.find(c => c.name === catName) || { icon: 'Briefcase', color: '#3B82F6' };
      return {
        name: catName,
        amount: amt * 100, // back to kobo for formatting
        percentage: pct,
        color: config.color,
        icon: config.icon
      };
    }).sort((a,b) => b.amount - a.amount);
  };

  const categoryStats = getCategoryStats();

  // Money In / Out this month
  const getMonthStats = () => {
    // Filter June 2026 completed
    let moneyIn = 0;
    let moneyOut = 0;
    let pendingInvoicesAmt = 32000000; // NGN 320,000.00 base from brief

    transactions.forEach(t => {
      if (t.date.startsWith('2026-06') && t.status === 'completed') {
        if (t.type === 'credit') moneyIn += t.amount;
        else moneyOut += t.amount;
      }
    });

    return { moneyIn, moneyOut, pendingInvoicesAmt };
  };

  const monthStats = getMonthStats();

  // Dynamic search list filter
  const filteredRecentTransactions = transactions
    .filter(t => selectedSubAccount === 'all' || t.account === selectedSubAccount)
    .slice(0, 10);

  // Verify Account Number in Send Modal
  const handleVerifyAccount = () => {
    if (sendAccount.length < 10) {
      addNotification("Validation Error: Please enter a valid 10-digit account number.");
      return;
    }
    setSendVerifying(true);
    setSendVerifiedName('');
    setTimeout(() => {
      setSendVerifying(false);
      // Match verified accounts or make up a realistic Nigerian enterprise name
      const name = sendAccount === '0000000000' 
        ? 'Invalid Account Number' 
        : (NIGERIAN_BANKS.indexOf(sendBank) !== -1 ? `${sendBank.split(' ')[0]} Verified Merchant` : 'Alhaji Musa Dangote Foods & Logistics');
      setSendVerifiedName(name);
    }, 1200);
  };

  // Submit Send Money
  const handleQuickSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendBank || !sendAccount || !sendAmount || !sendVerifiedName) {
      addNotification("Disbursement Blocked: Please complete all fields and verify the target account number.");
      return;
    }

    setSendSubmitting(true);
    setTimeout(() => {
      const amountKobo = parseNairaInput(sendAmount) * 100;
      
      const newTx: Transaction = {
        id: `tx-dynamic-send-${generateId()}`,
        type: 'debit',
        party: sendVerifiedName,
        category: 'Operations',
        account: 'main',
        date: '2026-06-15',
        reference: `REF-TX-QUICK-${Math.floor(10000 + Math.random() * 90000)}`,
        narration: sendNarration || 'Quick Transfer Out',
        amount: amountKobo,
        status: 'completed',
        bank: sendBank
      };

      onAddTransaction(newTx);
      addNotification(`Sent ${formatNaira(amountKobo)} to ${sendVerifiedName} successful.`);
      setSendSubmitting(false);
      setSendSuccess(true);
      
      // reset form
      setTimeout(() => {
        setShowSendModal(false);
        setSendSuccess(false);
        setSendBank('');
        setSendAccount('');
        setSendVerifiedName('');
        setSendAmount('');
        setSendNarration('');
      }, 1500);

    }, 1500);
  };

  // Submit Add Money fund account
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAmount) {
      addNotification("Validation Error: Please enter a valid amount to fund.");
      return;
    }

    setAddIsSubmitting(true);
    setTimeout(() => {
      const amountKobo = parseNairaInput(addAmount) * 100;

      const newTx: Transaction = {
        id: `tx-dynamic-add-${generateId()}`,
        type: 'credit',
        party: addSource,
        category: 'Operations',
        account: addAccountType,
        date: '2026-06-15',
        reference: `REF-TX-DEP-${Math.floor(10000 + Math.random() * 90000)}`,
        narration: addNarration || 'Fund Wallets',
        amount: amountKobo,
        status: 'completed'
      };

      onAddTransaction(newTx);
      addNotification(`Received deposit of ${formatNaira(amountKobo)} via ${addSource}`);
      setAddIsSubmitting(false);
      setShowAddModal(false);
      setAddAmount('');
      setAddNarration('');
    }, 1200);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className="w-4 h-4 text-brand-blue" />;
      case 'Users': return <Users className="w-4 h-4 text-brand-green" />;
      case 'Megaphone': return <Megaphone className="w-4 h-4 text-pink-500" />;
      case 'Code': return <Code className="w-4 h-4 text-purple-500" />;
      case 'Plane': return <Plane className="w-4 h-4 text-brand-gold" />;
      case 'FileText': return <FileText className="w-4 h-4 text-brand-red" />;
      default: return <Briefcase className="w-4 h-4 text-brand-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: BALANCE HERO CARD (Desktop Visual Core) */}
      <div 
        id="balance-card-hero-desktop"
        className={`hidden lg:flex relative w-full rounded-2xl p-6 sm:p-8 flex-col justify-between overflow-hidden transition-all duration-1000 border border-brand-border ${
          isNetPositive 
            ? 'bg-gradient-to-br from-brand-surface via-[#1c1c1f] to-[#141d18] shadow-lg shadow-brand-green/5' 
            : 'bg-gradient-to-br from-brand-surface via-[#241e15] to-[#1c160e] shadow-lg shadow-brand-gold/5'
        }`}
      >
        {/* Subtle decorative background sparks */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className={`absolute left-1/3 bottom-0 w-72 h-72 rounded-full blur-3xl pointer-events-none ${isNetPositive ? 'bg-emerald-500/5' : 'bg-brand-red/5'}`} />

        <div className="z-10 w-full flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-brand-muted font-bold font-sans">
                {selectedSubAccount === 'all' && 'Combined Net Balance'}
                {selectedSubAccount === 'main' && 'Main Business Wallet (NGN)'}
                {selectedSubAccount === 'usd' && 'USD Settled Wallet (NGN Equiv)'}
                {selectedSubAccount === 'savings' && 'Automated Savings Pot'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-brand-elevated text-brand-gold font-mono font-medium uppercase">
                Active 2026
              </span>
            </div>

            {/* Huge Clash-Terminal Balance amount */}
            <div className="flex items-baseline flex-wrap gap-2">
              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-brand-text tabular-nums leading-none tracking-tight flex items-center">
                {formatNaira(countVal)}
                <span className="inline-block w-1.5 h-8 md:h-12 bg-brand-gold ml-2 animate-pulse rounded" />
              </h1>
            </div>

            {/* Daily Net change indicators */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isNetPositive 
                  ? 'bg-brand-green/10 text-brand-green' 
                  : 'bg-brand-red/10 text-brand-red'
              }`}>
                {isNetPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {isNetPositive ? '+' : ''}{formatNaira(todayNet / 10).replace('.00', '')} today
                </span>
              </div>
              <span className="text-xs text-brand-muted">
                Based on {todayTransactions.length} operations today
              </span>
            </div>
          </div>

          {/* Sparkline chart of 30 days */}
          <div className="flex flex-col items-end gap-1.5 self-center lg:self-stretch justify-center h-20 w-44">
            <span className="text-[10px] text-brand-muted font-medium uppercase tracking-wider">30D Cash Flow Trend</span>
            <div className="w-full h-12 flex items-end gap-1 justify-between px-1">
              {sparklineData.map((d, idx) => {
                // Normalize height
                const max = Math.max(...sparklineData.map(p => p.val));
                const min = Math.min(...sparklineData.map(p => p.val * 0.98));
                const heightPct = max === min ? 50 : Math.max(15, Math.min(100, ((d.val - min) / (max - min)) * 100));
                return (
                  <div 
                    key={idx} 
                    className={`w-0.5 rounded-full transition-all duration-300 ${
                      isNetPositive ? 'bg-brand-green/30 hover:bg-brand-green' : 'bg-brand-gold/30 hover:bg-brand-gold'
                    }`} 
                    style={{ height: `${heightPct}%` }}
                    title={formatNaira(d.val)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Sub-accounts filter row + action buttons */}
        <div className="mt-8 pt-6 border-t border-brand-border/40 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onSelectSubAccount('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSubAccount === 'all'
                  ? 'bg-brand-gold text-brand-base font-bold shadow-md shadow-brand-gold/10'
                  : 'bg-brand-elevated/60 text-brand-muted hover:text-brand-text'
              }`}
            >
              All Cash
            </button>
            <button
              onClick={() => onSelectSubAccount('main')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSubAccount === 'main'
                  ? 'bg-brand-gold text-brand-base font-bold shadow-md shadow-brand-gold/10'
                  : 'bg-brand-elevated/60 text-brand-muted hover:text-brand-text'
              }`}
            >
              Main {CURRENCY_SYMBOLS[currency]} Wallet
            </button>
            <button
              onClick={() => onSelectSubAccount('usd')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSubAccount === 'usd'
                  ? 'bg-brand-gold text-brand-base font-bold shadow-md shadow-brand-gold/10'
                  : 'bg-brand-elevated/60 text-brand-muted hover:text-brand-text'
              }`}
            >
              USD Account
            </button>
            <button
              onClick={() => onSelectSubAccount('savings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSubAccount === 'savings'
                  ? 'bg-brand-gold text-brand-base font-bold shadow-md shadow-brand-gold/10'
                  : 'bg-brand-elevated/60 text-brand-muted hover:text-brand-text'
              }`}
            >
              Savings Pot
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSendModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-elevated text-brand-text font-bold text-xs hover:bg-brand-elevated/85 transition-colors border border-brand-border hover:border-brand-muted"
            >
              <Send className="w-3.5 h-3.5 text-brand-gold" />
              Send Money
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-gold text-brand-base font-black text-xs hover:bg-brand-gold/90 transition-colors shadow-lg shadow-brand-gold/10"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              Add Money
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Balance Hero Card (Visible on < lg screens) */}
      <div 
        id="balance-card-hero-mobile"
        className={`lg:hidden relative w-full rounded-2xl p-4 flex flex-col justify-between overflow-hidden transition-all duration-1000 border border-brand-border ${
          isNetPositive 
            ? 'bg-gradient-to-br from-[#18181b] via-[#121c17] to-[#18181b]' 
            : 'bg-gradient-to-br from-[#18181b] via-[#221a11] to-[#18181b]'
        }`}
      >
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header row */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-brand-muted mb-3">
          <span className="flex items-center gap-1">
            <span className="text-brand-gold tracking-widest font-black">··</span> Total Balance
          </span>
          <span>Jun 2026</span>
        </div>

        {/* Balance Amount with Blinking Cursor */}
        <div className="mb-2">
          <h2 className="font-display font-bold text-3xl text-brand-text tabular-nums leading-none tracking-tight flex items-center">
            {formatNaira(countVal)}
            <span className="inline-block w-[1.5px] h-6 bg-brand-gold ml-1 animate-pulse" />
          </h2>
        </div>

        {/* Today's Stats */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted mb-4">
          <span className={isNetPositive ? 'text-brand-green font-bold' : 'text-brand-red font-bold'}>
            {isNetPositive ? '▲' : '▼'} {isNetPositive ? '+' : ''}{formatNaira(todayNet / 10).replace('.00', '')}
          </span>
          <span>today</span>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-brand-border/40 w-full mb-3" />

        {/* Sub-accounts Horiz Row */}
        <div className="flex justify-between gap-1 mb-4">
          {[
            { id: 'all', label: 'All' },
            { id: 'main', label: 'Main' },
            { id: 'usd', label: 'USD' },
            { id: 'savings', label: 'Savings' }
          ].map((acc) => (
            <button
              key={acc.id}
              onClick={() => onSelectSubAccount(acc.id as any)}
              className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] font-bold text-center border transition-all ${
                selectedSubAccount === acc.id
                  ? 'bg-brand-gold border-brand-gold text-brand-base'
                  : 'bg-brand-elevated/40 border-brand-border/60 text-brand-muted'
              }`}
            >
              {acc.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-brand-border/40 w-full mb-3" />

        {/* Sparkline trend representation at 100% width, 60px tall */}
        <div className="w-full h-[60px] flex items-end gap-1 px-1 mb-4 justify-between">
          {sparklineData.map((d, idx) => {
            const max = Math.max(...sparklineData.map(p => p.val));
            const min = Math.min(...sparklineData.map(p => p.val * 0.98));
            const heightPct = max === min ? 50 : Math.max(15, Math.min(100, ((d.val - min) / (max - min)) * 100));
            return (
              <div 
                key={idx} 
                className={`flex-1 rounded-sm transition-all ${
                  isNetPositive ? 'bg-brand-green/20' : 'bg-brand-gold/20'
                }`}
                style={{ height: `${Math.round(heightPct * 0.6)}px` }}
              />
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-brand-border/40 w-full mb-4" />

        {/* Action buttons side-by-side, 48px height */}
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => setShowSendModal(true)}
            className="flex-1 h-12 flex items-center justify-center gap-1.5 rounded-xl bg-brand-elevated text-brand-text font-bold text-xs border border-brand-border"
          >
            <Send className="w-3.5 h-3.5 text-brand-gold" />
            Send Money
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 h-12 flex items-center justify-center gap-1.5 rounded-xl bg-brand-gold text-brand-base font-black text-xs shadow-lg shadow-brand-gold/10"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            Add Money
          </button>
        </div>
      </div>

      {/* SECTION 2: QUICK STAT CARDS (3 IN A ROW with mobile snap-scroll style) */}
      <div>
        <div 
          onScroll={handleStatScroll}
          className="md:grid md:grid-cols-3 gap-4 flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 pb-2 select-none px-1 md:px-0"
          style={{ scrollbarWidth: 'none' }}
          id="quick-stats-row"
        >
          {/* Money In */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-green/[0.03] hover:border-brand-green/30 hover:bg-brand-surface/90 group min-w-[260px] md:min-w-0 snap-start flex-1 shrink-0">
            <div className="pointer-events-none absolute right-2 top-2 text-brand-green/5 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand-green/10">
              <ArrowUpRight className="w-12 h-12" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">Money In This Month</p>
              <p className="text-2xl font-display font-bold text-brand-text tabular-nums mt-1.5 transition-colors group-hover:text-brand-green">
                {formatNaira(monthStats.moneyIn)}
              </p>
            </div>
            {/* Progress bar compared to last month target */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-brand-muted mb-1 font-semibold">
                <span>vs Last Month (Target)</span>
                <span className="text-brand-green font-bold">+18.4% ahead</span>
              </div>
              <div className="w-full h-1.5 bg-brand-elevated rounded-full overflow-hidden">
                <div className="h-full bg-brand-green rounded-full transition-all duration-500" style={{ width: '82%' }} />
              </div>
            </div>
          </div>

          {/* Money Out */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-red/[0.03] hover:border-brand-red/30 hover:bg-brand-surface/90 group min-w-[260px] md:min-w-0 snap-start flex-1 shrink-0">
            <div className="pointer-events-none absolute right-2 top-2 text-brand-red/5 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand-red/10">
              <ArrowDownLeft className="w-12 h-12" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">Money Out This Month</p>
              <p className="text-2xl font-display font-bold text-brand-red tabular-nums mt-1.5">
                {formatNaira(monthStats.moneyOut)}
              </p>
            </div>
            {/* Progress bar compared to budget */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-brand-muted mb-1 font-semibold">
                <span>vs Budget: {CURRENCY_SYMBOLS[currency]}{(1500000 * EXCHANGE_RATES[currency]).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-brand-gold font-bold">80% used</span>
              </div>
              <div className="w-full h-1.5 bg-brand-elevated rounded-full overflow-hidden">
                <div className="h-full bg-brand-red rounded-full transition-all duration-500" style={{ width: '80%' }} />
              </div>
            </div>
          </div>

          {/* Pending Invoices */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-gold/[0.04] hover:border-brand-gold/50 hover:bg-brand-surface/90 group min-w-[260px] md:min-w-0 snap-start flex-1 shrink-0" onClick={() => onNavigateToTab('invoices')}>
            <div className="pointer-events-none absolute right-2 top-2 text-brand-gold/5 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand-gold/10">
              <FileText className="w-12 h-12" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-muted uppercase tracking-wider text-brand-muted group-hover:text-brand-gold transition-colors">Pending Invoices</p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <p className="text-2xl font-display font-bold text-brand-gold tabular-nums">
                  {formatNaira(monthStats.pendingInvoicesAmt)}
                </p>
                <span className="px-2 py-0.5 rounded border border-brand-gold/20 bg-brand-gold/5 text-brand-gold text-[9px] font-bold">
                  4 Unpaid
                </span>
              </div>
            </div>
            {/* CTA indicator */}
            <div className="mt-4 flex items-center justify-between text-[10px] text-brand-muted group-hover:text-brand-gold transition-colors pt-2 border-t border-brand-border">
              <span>Collect business revenue</span>
              <span className="flex items-center gap-0.5 font-bold text-brand-blue group-hover:translate-x-0.5 transition-transform">Open Invoices <ChevronRight className="w-3 h-3" /></span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator Dots below on Mobile */}
        <div className="flex justify-center gap-1.5 mt-2.5 md:hidden">
          {[0, 1, 2].map((idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeStatCardIdx === idx ? 'bg-brand-gold w-3.5' : 'bg-brand-border w-1.5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* SECTION 3: CHARTS & CATEGORY COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spend Chart: 2/3 width */}
        <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-xl p-5" id="spend-chart-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Business Cash Flow Area</h3>
              <p className="text-xs text-brand-muted">Income (Incoming payout transfers) vs Expenditures (Outgoing expenses)</p>
            </div>
            {/* Range controls */}
            <div className="flex items-center gap-1 bg-brand-elevated/70 p-1 rounded-lg">
              {(['7D', '30D', '90D', '1Y'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setChartDuration(d)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                    chartDuration === d
                      ? 'bg-brand-gold text-brand-base shadow-sm shadow-brand-gold/10'
                      : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-brand-muted font-mono mt-1 mb-3">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-green" /> Inflow</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-red" /> Expense</span>
          </div>

          <div className="w-full h-[220px] lg:h-80 mt-1 font-mono text-[10px] text-brand-muted">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    setTappedChartItem(state.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717A" 
                  tickLine={false} 
                  interval={isMobile ? 4 : 0}
                  tickFormatter={(val) => isMobile && typeof val === 'string' ? `${val.substring(8, 10)}` : val}
                />
                <YAxis stroke="#71717A" tickLine={false} tickFormatter={(val) => `${CURRENCY_SYMBOLS[currency]}${(val * EXCHANGE_RATES[currency] / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#3F3F46', borderRadius: '8px' }}
                  labelStyle={{ color: '#FAFAFA', fontWeight: 'bold' }}
                  itemStyle={{ paddingBlock: '2px' }}
                  formatter={(val: number, name) => [
                    <span className="font-sans font-semibold text-brand-text">{formatNaira(val * 100)}</span>, 
                    <span className="uppercase text-[10px] text-brand-muted">{name}</span>
                  ]}
                />
                <Area 
                  type="monotone" 
                  name="incoming" 
                  dataKey="income" 
                  stroke="#22C55E" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  name="expenses" 
                  dataKey="expense" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Touch Tooltip Banner (Mobile Only) */}
          {isMobile && tappedChartItem && (
            <div className="mt-3 p-3 bg-brand-elevated/40 border border-brand-border rounded-xl flex items-center justify-between text-xs animate-fadeIn">
              <div>
                <span className="block text-[9px] text-brand-muted uppercase font-bold tracking-wider">Flow on Jun {tappedChartItem.date.substring(8, 10)}</span>
                <span className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                  <span className="font-mono text-brand-text font-bold">{formatNaira(tappedChartItem.income * 100)}</span>
                </span>
              </div>
              <div>
                <span className="block text-[9px] text-right text-brand-muted uppercase font-bold tracking-wider">Expenditure</span>
                <span className="flex items-center gap-1.5 mt-0.5 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                  <span className="font-mono text-brand-text font-bold">{formatNaira(tappedChartItem.expense * 100)}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Categories & Accounts column: 1/3 width */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Categories breakdown list */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm" id="category-breakdown-container">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Spending By Category</h3>
              <p className="text-xs text-brand-muted">Operational outflow distribution</p>
            </div>

            <div className="space-y-4">
              {(showAllCategories ? categoryStats : categoryStats.slice(0, 4)).map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-brand-border bg-brand-elevated/45"
                      >
                        {getIconComponent(cat.icon)}
                      </div>
                      <span className="font-semibold text-brand-text">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-brand-text text-xs tracking-tight tabular-nums block">
                        {formatNaira(cat.amount)}
                      </span>
                      <span className="text-[10px] text-brand-muted font-bold block">{cat.percentage}%</span>
                    </div>
                  </div>
                  {/* Horizontal bar with specific category color */}
                  <div className="w-full h-1.5 bg-brand-elevated rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        backgroundColor: cat.color, 
                        width: `${cat.percentage}%` 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {categoryStats.length > 4 && (
              <button 
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="w-full mt-4 py-2 text-center text-[10px] tracking-wider uppercase font-bold text-brand-gold bg-brand-elevated/45 border border-brand-border hover:border-brand-gold/40 rounded-xl transition-all"
              >
                {showAllCategories ? "Show Less" : "Show All Categories"}
              </button>
            )}
          </div>

          {/* Secure Receiving Virtual Accounts Widget (30s reveal countdown) */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5 flex flex-col space-y-4 shadow-sm" id="virtual-receivables-container">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border/40">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-brand-gold" /> Incoming Accounts
                </h3>
                <p className="text-[10px] text-brand-muted leading-relaxed mt-0.5">SME virtual receiving bank details</p>
              </div>
              <div className="flex items-center">
                {revealedAccountBank ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-brand-green/10 text-brand-green border border-brand-green/20 font-bold animate-pulse flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-brand-green" />
                    {accountCountdown}s
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9px] bg-brand-elevated text-brand-muted font-bold uppercase tracking-wider flex items-center gap-1 border border-brand-border/85">
                    <Lock className="w-2.5 h-2.5 text-brand-muted" /> SECURE (30s)
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {[
                { 
                  bankName: "Providus Bank", 
                  accountNum: "9012391147", 
                  name: "GOLDSMITH TECHNOLOGY AFRICA", 
                  type: "Trade Inflow Primary" 
                },
                { 
                  bankName: "Wema Bank PLC", 
                  accountNum: "7821904503", 
                  name: "GOLDSMITH SME HUB", 
                  type: "E-Commerce Settlement" 
                }
              ].map((acc) => {
                const isRevealed = revealedAccountBank === acc.bankName;
                const isCopied = copiedBank === acc.bankName;
                const maskedNum = `${acc.accountNum.substring(0, 3)} •••• ${acc.accountNum.substring(7)}`;
                const displayNum = isRevealed ? acc.accountNum : maskedNum;

                return (
                  <div key={acc.bankName} className="p-3.5 bg-brand-elevated/20 border border-brand-border/60 rounded-xl space-y-3 hover:bg-brand-elevated/35 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-brand-gold uppercase block">{acc.bankName}</span>
                        <span className="text-[10px] text-brand-muted mt-0.5 block">{acc.type}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded border border-brand-border bg-brand-surface text-[9px] font-mono font-semibold text-brand-muted">
                        NGN
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block">Account number</span>
                        <span className={`font-mono text-base font-black tracking-wider tabular-nums select-all ${isRevealed ? 'text-brand-green' : 'text-brand-text'}`}>
                          {displayNum}
                        </span>
                      </div>

                      <div className="flex gap-1.5 self-end">
                        {/* Reveal button */}
                        <button
                          onClick={() => {
                            if (isRevealed) {
                              setRevealedAccountBank(null);
                            } else {
                              setRevealedAccountBank(acc.bankName);
                              setAccountCountdown(30);
                              addNotification(`Secure account details unlocked for ${acc.bankName} (30s timer active)`);
                            }
                          }}
                          className={`p-2 rounded-lg border transition-all ${
                            isRevealed
                              ? 'bg-brand-green/10 border-brand-green text-brand-green shadow-sm'
                              : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-gold hover:border-brand-gold/50'
                          }`}
                          title={isRevealed ? "Securely mask account number" : "Securely reveal account number for 30s"}
                        >
                          {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        {/* Copy button */}
                        <button
                          disabled={!isRevealed}
                          onClick={() => handleCopyAccount(acc.bankName, acc.accountNum)}
                          className={`p-2 rounded-lg border transition-all disabled:opacity-40 ${
                            isCopied
                              ? 'bg-brand-green/10 border-brand-green text-brand-green'
                              : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-gold hover:border-brand-gold/50'
                          }`}
                          title={isCopied ? "Copied!" : "Copy account number (unmask first)"}
                        >
                          {isCopied ? <CheckCircle className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-brand-border/40">
                      <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block">Account holder name</span>
                      <span className="font-mono text-[10px] font-bold text-brand-text uppercase block truncate mt-0.5">{acc.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 4: RECENT TRANSACTIONS (BOTTOM) */}
      <div className="bg-brand-surface border border-brand-border rounded-xl p-5" id="recent-transactions-container">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-border/30">
          <div>
            <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Recent Money Stream</h3>
            <p className="text-xs text-brand-muted">Latest corporate debits and account settlement credits</p>
          </div>
          <button 
            onClick={() => onNavigateToTab('transactions')}
            className="flex items-center gap-1 text-xs text-brand-gold hover:underline font-bold"
          >
            Open Ledger (100 Entries)
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Recent Stream (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-brand-border/40 text-brand-muted font-bold uppercase tracking-wider text-[10px] h-10">
                <th className="pb-3 pl-2">Party</th>
                <th className="pb-3 text-center sm:text-left">Category</th>
                <th className="pb-3">Account</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Reference Code</th>
                <th className="pb-3 text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecentTransactions.map((tx) => (
                <tr 
                  key={tx.id} 
                  className={`h-11 border-b border-brand-border/30 transition-all hover:bg-brand-elevated/25 ${tx.status === 'failed' ? 'shake-element border-brand-red/20' : ''}`}
                >
                  <td className="font-semibold text-brand-text pl-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        tx.type === 'credit' ? 'bg-brand-green' : 'bg-brand-red'
                      }`} />
                      <div>
                        <span className="block font-sans font-semibold text-xs text-brand-text leading-tight">{tx.party}</span>
                        <span className="block font-mono text-[9px] text-brand-muted leading-tight mt-0.5">{tx.narration}</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-center sm:text-left">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-elevated/80 border border-brand-border/40">
                      {tx.category}
                    </span>
                  </td>
                  <td className="uppercase font-mono text-[10px] text-brand-muted">{tx.account}</td>
                  <td className="text-brand-muted">{tx.date}</td>
                  <td className="font-mono text-[10px] text-brand-muted">{tx.reference}</td>
                  <td className={`text-right tabular-nums pr-2 font-bold ${
                    tx.type === 'credit' ? 'text-brand-green' : 'text-brand-red'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Recent Stream: 5 Compact Cards Format */}
        <div className="md:hidden space-y-3">
          {filteredRecentTransactions.slice(0, 5).map((tx) => (
            <div 
              key={tx.id} 
              className="p-3.5 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-elevated flex items-center justify-center font-display font-medium text-xs text-brand-gold font-sans">
                  {tx.party.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="block font-sans font-semibold text-xs text-brand-text leading-tight">{tx.party}</span>
                  <span className="block font-mono text-[9px] text-brand-muted leading-tight mt-1">{tx.date} • {tx.category}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-mono font-bold text-xs block tabular-nums ${tx.type === 'credit' ? 'text-brand-green' : 'text-brand-red'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-brand-elevated text-[8px] font-mono text-brand-muted uppercase tracking-wider block mt-1 w-max ml-auto">
                  {tx.account}
                </span>
              </div>
            </div>
          ))}

          {/* View All button */}
          <button 
            onClick={() => onNavigateToTab('transactions')}
            className="w-full mt-4 py-3 bg-brand-elevated/30 hover:bg-brand-elevated text-center text-xs text-brand-gold font-bold border border-brand-border rounded-xl transition-all"
          >
            Open Ledger (Full ledger view)
          </button>
        </div>
      </div>

      {/* QUICK MODALS: SEND MONEY */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-surface border border-brand-border/80 md:rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 h-full md:h-auto md:max-h-[90vh] overflow-y-auto max-md:fixed max-md:inset-0 max-md:max-w-none max-md:rounded-none max-md:flex max-md:flex-col justify-center">
            <button 
              onClick={() => setShowSendModal(false)}
              className="absolute right-4 top-4 text-brand-muted hover:text-brand-text p-1 hover:bg-brand-elevated rounded-lg z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                <Send className="w-4 h-4 text-brand-gold" />
              </div>
              <h3 className="font-display font-semibold text-lg text-brand-text">Send Quick Money out</h3>
            </div>
            
            <p className="text-xs text-brand-muted mb-4">
              Transfer funds to any verified banking partner in Nigeria immediately. 
            </p>

            {sendSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-brand-green" />
                </div>
                <div className="space-y-1">
                  <p className="font-display font-semibold text-brand-text">Transfer Initiated!</p>
                  <p className="text-xs text-brand-muted">The receiver wallet is being updated instantly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickSend} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Destination Bank</label>
                  <select 
                    required 
                    value={sendBank} 
                    onChange={(e) => { 
                      setSendBank(e.target.value); 
                      setSendVerifiedName(''); 
                    }}
                    className="w-full px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold"
                  >
                    <option value="">Select receiver bank...</option>
                    {NIGERIAN_BANKS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Account Number (10 digits)</label>
                  <div className="flex gap-2">
                    <input 
                      required
                      type="tel" 
                      maxLength={10}
                      pattern="\d{10}"
                      value={sendAccount}
                      placeholder="e.g. 2048591823"
                      onChange={(e) => {
                        setSendAccount(e.target.value);
                        setSendVerifiedName('');
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-mono"
                    />
                    <button
                      type="button"
                      disabled={sendAccount.length < 10 || sendVerifying}
                      onClick={handleVerifyAccount}
                      className="px-3 bg-brand-elevated border border-brand-border text-xs text-brand-gold hover:bg-brand-elevated/70 rounded-lg font-bold disabled:opacity-40 flex items-center gap-1.5"
                    >
                      {sendVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold" /> : 'Verify'}
                    </button>
                  </div>
                </div>

                {sendVerifiedName && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-brand-green/30 text-xs">
                    <p className="text-[10px] uppercase font-bold text-brand-muted">Account Verified Name</p>
                    <p className="text-brand-green font-semibold mt-0.5 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {sendVerifiedName}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Amount ({CURRENCY_SYMBOLS[currency]})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-brand-muted">{CURRENCY_SYMBOLS[currency]}</span>
                    <input 
                      required
                      type="tel" 
                      placeholder={`Amount in ${currency}`}
                      value={sendAmount}
                      onChange={(e) => {
                        const parsed = parseNairaInput(e.target.value);
                        setSendAmount(parsed ? parsed.toLocaleString('en-US') : '');
                      }}
                      className="w-full pl-7 pr-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Narration</label>
                  <input 
                    type="text" 
                    placeholder="Reference narration details"
                    value={sendNarration}
                    onChange={(e) => setSendNarration(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendSubmitting || !sendVerifiedName}
                  className="w-full py-2.5 bg-brand-gold text-brand-base font-black text-xs rounded-xl hover:bg-brand-gold/90 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/10"
                >
                  {sendSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-base" />
                      Executing Transfer...
                    </>
                  ) : (
                    <>
                      Confirm & Send Out ({sendAmount ? `${CURRENCY_SYMBOLS[currency]}${sendAmount}` : 'Funds'})
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QUICK MODALS: ADD MONEY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-surface border border-brand-border/80 md:rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 h-full md:h-auto md:max-h-[90vh] overflow-y-auto max-md:fixed max-md:inset-0 max-md:max-w-none max-md:rounded-none max-md:flex max-md:flex-col justify-center">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-brand-muted hover:text-brand-text p-1 hover:bg-brand-elevated rounded-lg z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                <Plus className="w-4 h-4 text-brand-gold stroke-[3px]" />
              </div>
              <h3 className="font-display font-semibold text-lg text-brand-text">Fund Swift Wallet</h3>
            </div>

            <p className="text-xs text-brand-muted mb-4">
              Instantly credit your sub-accounts using registered credit cards, bank wire, or USSD code.
            </p>

            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Target Account Pot</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['main', 'usd', 'savings'] as const).map((acc) => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => setAddAccountType(acc)}
                      className={`py-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                        addAccountType === acc 
                          ? 'bg-brand-gold/10 text-brand-gold border-brand-gold' 
                          : 'bg-brand-elevated/40 border-brand-border text-brand-muted hover:text-brand-text'
                      }`}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Funding Source</label>
                <select 
                  value={addSource} 
                  onChange={(e) => setAddSource(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold"
                >
                  <option value="Direct Merchant Card - *1938">Registered Card (Primary Card - Visa)</option>
                  <option value="First Bank Premium Settlement">Access Direct Wire Settlement</option>
                  <option value="Zenith USSD Payment *966#">USSD Quick Authorization</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Amount to Fund ({CURRENCY_SYMBOLS[currency]})</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-brand-muted">{CURRENCY_SYMBOLS[currency]}</span>
                  <input 
                    required
                    type="tel" 
                    placeholder="e.g. 50,000"
                    value={addAmount}
                    onChange={(e) => {
                      const parsed = parseNairaInput(e.target.value);
                      setAddAmount(parsed ? parsed.toLocaleString('en-US') : '');
                    }}
                    className="w-full pl-7 pr-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Narration Memo</label>
                <input 
                  type="text" 
                  placeholder="e.g. Treasury Top-up"
                  value={addNarration}
                  onChange={(e) => setAddNarration(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold"
                />
              </div>

              <button
                type="submit"
                disabled={addIsSubmitting}
                className="w-full py-2.5 bg-brand-gold text-brand-base font-black text-xs rounded-xl hover:bg-brand-gold/90 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/10"
              >
                {addIsSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-brand-base" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Fund with {addAmount ? `${CURRENCY_SYMBOLS[currency]}${addAmount}` : 'Amount'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
