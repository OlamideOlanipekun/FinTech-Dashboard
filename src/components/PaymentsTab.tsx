import React, { useState } from 'react';
import { 
  Send, 
  History, 
  CheckCircle, 
  Loader2, 
  ArrowRight, 
  ArrowUpRight, 
  ChevronRight, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { Transaction, Beneficiary } from '../types';
import { MOCK_BENEFICIARIES, NIGERIAN_BANKS, VERIFIED_ACCOUNTS } from '../mockData';
import { formatCurrency, parseNairaInput, CurrencyCode, CURRENCY_SYMBOLS } from '../utils';

interface PaymentsTabProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  addNotification: (text: string) => void;
  currency: CurrencyCode;
}

export default function PaymentsTab({
  transactions,
  onAddTransaction,
  addNotification,
  currency
}: PaymentsTabProps) {
  // Local dynamic currency formatting wrapper
  const formatNaira = (koboAmount: number) => {
    return formatCurrency(koboAmount, currency);
  };
  const [activeSubTab, setActiveSubTab] = useState<'send' | 'history'>('send');

  // Step state for the send flow
  // 1 = Enter Details, 2 = Review, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Field States
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [narration, setNarration] = useState('');
  
  // Submit loading state
  const [isSending, setIsSending] = useState(false);
  const [generatedTxId, setGeneratedTxId] = useState('');

  // Past outbound transfers
  const outboundPayments = transactions.filter(t => t.type === 'debit').slice(0, 15);

  // Quick verify bank account number
  const handleVerifyAccount = (bank: string, acctNum: string) => {
    if (!acctNum || acctNum.length < 10) return;
    
    setIsVerifying(true);
    setVerifiedName('');
    
    setTimeout(() => {
      setIsVerifying(false);
      // Give realistic matched names or generate high-quality random one
      const name = VERIFIED_ACCOUNTS[acctNum] || `${acctNum === '2048591823' ? 'Chioma Chloe Enterprises' : 'Damilola Shittu Logistics & Cargo Ltd'}`;
      setVerifiedName(name);
    }, 1200);
  };

  // Click beneficiary to prefill
  const handleSelectBeneficiary = (ben: Beneficiary) => {
    setSelectedBank(ben.bank);
    setAccountNumber(ben.accountNumber);
    setVerifiedName(ben.name);
    setIsVerifying(false);
    
    // Auto-trigger a short verification simulator to make UI feel incredibly responsive!
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 500);
  };

  // Continue to Review screen
  const handleContinueToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || accountNumber.length < 10 || !verifiedName || !amountInput) {
      addNotification("Validation Blocked: Please ensure you select a destination bank, specify a 10-digit account number, verify owner name, and input a valid transfers sum.");
      return;
    }
    setStep(2);
  };

  // Execute actual transfer
  const handleConfirmAndSend = () => {
    setIsSending(true);
    
    setTimeout(() => {
      const amtKobo = parseNairaInput(amountInput) * 100;
      const refCode = `REF-TX-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedTxId(refCode);

      // Create new transaction
      const newTx: Transaction = {
        id: `tx-dynamic-pay-${Math.random().toString(36).substring(2,9)}`,
        type: 'debit',
        party: verifiedName,
        category: 'Operations',
        account: 'main',
        date: '2026-06-15', // today
        reference: refCode,
        narration: narration || 'Vendor Business Payment Out',
        amount: amtKobo,
        status: 'completed',
        bank: selectedBank
      };

      onAddTransaction(newTx);
      addNotification(`Outbound wire of ${formatNaira(amtKobo)} to ${verifiedName} succeeded.`);
      setIsSending(false);
      setStep(3);
    }, 1500);
  };

  // Reset payment flow
  const handleSendAnother = () => {
    setSelectedBank('');
    setAccountNumber('');
    setVerifiedName('');
    setAmountInput('');
    setNarration('');
    setStep(1);
    setGeneratedTxId('');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER TABS TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/30">
        <div>
          <h2 className="text-xl font-display font-medium text-brand-text">Swift Outbound Payments</h2>
          <p className="text-xs text-brand-muted">Instantly disburse enterprise funds to vendors, salaries and operations partners</p>
        </div>

        {/* Inner page Sub-tabs */}
        <div className="flex bg-brand-elevated/70 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('send')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'send'
                ? 'bg-brand-gold text-brand-base shadow-lg shadow-brand-gold/10'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Send Money (Form)
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'history'
                ? 'bg-brand-gold text-brand-base shadow-lg shadow-brand-gold/10'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Payment History Log
          </button>
        </div>
      </div>

      {activeSubTab === 'send' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: TRANSFER WORKFLOW */}
          <div className="lg:col-span-2 bg-brand-surface border border-brand-border/60 rounded-2xl p-5 md:p-6">
            
            {/* Step Progress indicators */}
            <div className="flex items-center justify-between mb-8 max-w-sm mx-auto">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif font-black ${
                  step >= 1 ? 'bg-brand-gold text-brand-base' : 'bg-brand-elevated text-brand-muted'
                }`}>
                  1
                </div>
                <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">Fill Form</span>
              </div>
              <div className={`flex-1 h-0.5 max-w-[80px] -mt-5 ${step >= 2 ? 'bg-brand-gold' : 'bg-brand-elevated'}`} />
              
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif font-black ${
                  step >= 2 ? 'bg-brand-gold text-brand-base' : 'bg-brand-elevated text-brand-muted'
                }`}>
                  2
                </div>
                <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">Review Info</span>
              </div>
              <div className={`flex-1 h-0.5 max-w-[80px] -mt-5 ${step >= 3 ? 'bg-brand-gold' : 'bg-brand-elevated'}`} />

              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif font-black ${
                  step >= 3 ? 'bg-brand-gold text-brand-base' : 'bg-brand-elevated text-brand-muted'
                }`}>
                  3
                </div>
                <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">Complete</span>
              </div>
            </div>

            {/* STEP 1: FILL FORM */}
            {step === 1 && (
              <form onSubmit={handleContinueToReview} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Beneficiary Bank</label>
                    <select
                      required
                      value={selectedBank}
                      onChange={(e) => { setSelectedBank(e.target.value); setVerifiedName(''); }}
                      className="w-full px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold h-10 font-medium"
                    >
                      <option value="">Select receiver bank...</option>
                      {NIGERIAN_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">NUBAN Account Number</label>
                    <div className="flex gap-1.5">
                      <input
                        required
                        type="tel"
                        maxLength={10}
                        pattern="\d{10}"
                        placeholder="10-digit Account No."
                        value={accountNumber}
                        onChange={(e) => { setAccountNumber(e.target.value); setVerifiedName(''); }}
                        className="flex-1 px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-mono"
                      />
                      <button
                        type="button"
                        disabled={accountNumber.length < 10 || !selectedBank || isVerifying}
                        onClick={() => handleVerifyAccount(selectedBank, accountNumber)}
                        className="px-4 py-2 bg-brand-elevated border border-brand-border text-xs text-brand-gold hover:text-brand-text hover:border-brand-gold rounded-lg font-bold disabled:opacity-40 transition-colors flex items-center gap-1.5"
                      >
                        {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold" /> : 'Name Inquiry'}
                      </button>
                    </div>
                  </div>
                </div>

                {verifiedName && (
                  <div className="p-3 bg-brand-green/5 border border-brand-green/30 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-brand-muted leading-tight">Receiver Account Verified Name</p>
                      <p className="text-xs font-semibold text-brand-text mt-0.5 leading-none">{verifiedName}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Payment Amount ({CURRENCY_SYMBOLS[currency]})</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs font-bold text-brand-muted">{CURRENCY_SYMBOLS[currency]}</span>
                    <input
                      required
                      type="tel"
                      placeholder="0.00"
                      value={amountInput}
                      onChange={(e) => {
                        const parsed = parseNairaInput(e.target.value);
                        setAmountInput(parsed ? parsed.toLocaleString('en-US') : '');
                      }}
                      className="w-full pl-7 pr-3 py-2.5 text-sm bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-mono font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-brand-muted">Limit: Your available business wallet balance can cover this disburse.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Payment Narration Memo</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. June Office Supplies Settlement"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!verifiedName || !amountInput}
                  className="w-full py-2.5 mt-2 bg-brand-gold hover:bg-brand-gold/90 text-brand-base font-black text-xs rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/10"
                >
                  Continue & Review Payment
                  <ArrowRight className="w-4 h-4 stroke-[3px]" />
                </button>
              </form>
            )}

            {/* STEP 2: REVIEW DETAILS */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-brand-elevated/45 border border-brand-border/60">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-3 pb-1 border-b border-brand-border/40">Review Transaction Details</h4>
                  
                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Corporate Source Account:</span>
                      <span className="font-semibold text-brand-text">Swift Main SME Pot ({CURRENCY_SYMBOLS[currency]})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Destination Bank Partner:</span>
                      <span className="font-semibold text-brand-text">{selectedBank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">NUBAN Account Number:</span>
                      <span className="font-mono text-brand-text font-bold leading-none">{accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Verified Owner Name:</span>
                      <span className="font-semibold text-brand-green bg-brand-green/5 px-1.5 py-0.5 rounded leading-none">{verifiedName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Disburse Amount:</span>
                      <span className="font-display font-bold text-sm text-brand-text tabular-nums">{amountInput ? `${CURRENCY_SYMBOLS[currency]}${amountInput}.00` : `${CURRENCY_SYMBOLS[currency]}0`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Settlement Fee:</span>
                      <span className="font-mono text-brand-text text-brand-green">{CURRENCY_SYMBOLS[currency]}0.00 (Promo active)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Reference Narration:</span>
                      <span className="font-semibold text-brand-text italic font-sans">"{narration}"</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 bg-brand-elevated rounded-xl border border-brand-border text-brand-text font-bold text-xs hover:bg-brand-elevated/85 transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={handleConfirmAndSend}
                    className="flex-1 py-2.5 bg-brand-gold text-brand-base font-black text-xs rounded-xl hover:bg-brand-gold/90 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/10 disabled:opacity-40"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-brand-base" />
                        Transmitting wire...
                      </>
                    ) : (
                      <>
                        Confirm & Send Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS CHECKMARK */}
            {step === 3 && (
              <div className="text-center py-8 space-y-6">
                <div className="w-20 h-20 rounded-full bg-brand-green/10 border-2 border-brand-green flex items-center justify-center mx-auto shadow-xl shadow-brand-green/5">
                  <CheckCircle className="w-12 h-12 text-brand-green" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-bold text-xl text-brand-text">Disbursement Succeeded!</h3>
                  <p className="text-xs text-brand-muted max-w-sm mx-auto">
                    The outbound electronic payment of <span className="font-bold text-brand-text font-mono">{CURRENCY_SYMBOLS[currency]}{amountInput}</span> to <span className="font-semibold text-brand-text">{verifiedName}</span> has been processed instantly.
                  </p>
                </div>

                <div className="p-3.5 bg-brand-elevated/45 rounded-xl max-w-sm mx-auto text-xs space-y-2 border border-brand-border/60">
                  <div className="flex justify-between font-mono">
                    <span className="text-brand-muted">Settlement ID:</span>
                    <span className="text-brand-text font-semibold">{generatedTxId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Status:</span>
                    <span className="text-brand-green font-bold">Settled (NIP Core)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Disbursed on:</span>
                    <span className="text-brand-text">Today, 2026-06-15</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendAnother}
                  className="px-6 py-2.5 bg-brand-gold text-brand-base font-black text-xs rounded-lg hover:bg-brand-gold/90 transition-all shadow-md shadow-brand-gold/5"
                >
                  Initiate Another Wire
                </button>
              </div>
            )}

          </div>

          {/* RIGHT 1 COLUMN: BENEFICIARIES */}
          <div className="bg-brand-surface border border-brand-border/60 rounded-2xl p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Saved Beneficiaries</h3>
              <p className="text-xs text-brand-muted">Instantly tap saved contacts to pre-fill transfer bank credentials</p>
            </div>

            <div className="grid grid-cols-2 gap-3" id="beneficiary-grid">
              {MOCK_BENEFICIARIES.map((ben) => (
                <button
                  key={ben.id}
                  onClick={() => {
                    handleSelectBeneficiary(ben);
                    if (step !== 1) setStep(1);
                  }}
                  className="p-3 bg-brand-elevated/40 hover:bg-brand-elevated hover:border-brand-gold/50 rounded-xl border border-brand-border/60 text-left transition-all space-y-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-elevated flex items-center justify-center font-bold text-xs text-brand-gold border border-brand-gold/25">
                    {ben.initials}
                  </div>
                  <div>
                    <h5 className="font-semibold text-brand-text text-[11px] truncate leading-tight">{ben.name}</h5>
                    <p className="text-[10px] text-brand-muted leading-tight mt-0.5 truncate">{ben.bank.split(' ')[0]}</p>
                    <p className="text-[9px] font-mono text-brand-muted leading-none mt-1 truncate">{ben.accountNumber}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-5 p-3 rounded-lg bg-brand-elevated/25 border border-brand-border/40 flex gap-2 items-start text-[11px] leading-relaxed text-brand-muted">
              <HelpCircle className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
              <span>Beneficiaries names are resolving via Central NIBAN standard instantly upon tapping.</span>
            </div>
          </div>

        </div>
      ) : (
        /* OUTBOUND OUTFLOW PAYMENT HISTORY */
        <div className="bg-brand-surface border border-brand-border/60 rounded-2xl p-5 overflow-hidden">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">Outbound Debit Settlements Log</h3>
            <p className="text-xs text-brand-muted">Detailed review of past successful electronic bank wire transfers</p>
          </div>

          {/* Desktop Table outbound payments (Hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-border/40 text-brand-muted font-bold uppercase tracking-wider text-[10px] h-10">
                  <th className="pb-2 pl-3">Date</th>
                  <th className="pb-2">Party Wire</th>
                  <th className="pb-2">Beneficiary Bank Partner</th>
                  <th className="pb-2">Ledger Reference ID</th>
                  <th className="pb-2 text-right">Settled Amount</th>
                  <th className="pb-2 text-right pr-3">Verification</th>
                </tr>
              </thead>
              <tbody>
                {outboundPayments.map((p) => (
                  <tr key={p.id} className="h-11 border-b border-brand-border/30 hover:bg-brand-elevated/30 transition-all">
                    <td className="text-brand-muted pl-3">{p.date}</td>
                    <td>
                      <div>
                        <p className="font-sans font-semibold text-xs text-brand-text">{p.party}</p>
                        <p className="font-mono text-[9px] text-brand-muted italic mt-0.5">{p.narration}</p>
                      </div>
                    </td>
                    <td className="text-brand-muted font-medium">{p.bank || 'CBN Central Wire Network'}</td>
                    <td className="font-mono text-[10px] text-brand-muted">{p.reference}</td>
                    <td className="text-right tabular-nums text-brand-red font-bold">
                      -{formatNaira(p.amount)}
                    </td>
                    <td className="text-right pr-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/20">
                        <span className="w-1 h-1 rounded-full bg-brand-green animate-pulse" />
                        Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile outbound debit card list format */}
          <div className="md:hidden space-y-3 mt-4">
            {outboundPayments.map((p) => (
              <div 
                key={p.id} 
                className="p-3.5 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-elevated flex items-center justify-center font-display font-medium text-[11px] text-brand-gold font-sans uppercase">
                    {p.party.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="block font-sans font-semibold text-xs text-brand-text leading-tight">{p.party}</span>
                    <span className="block font-sans text-[10px] text-brand-muted leading-tight mt-1">{p.date} • {p.bank || 'CBN Wire'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-brand-red block tabular-nums">
                    -{formatNaira(p.amount)}
                  </span>
                  <span className="inline-flex items-center gap-0.5 mt-1 text-[8px] uppercase tracking-wider font-bold text-brand-green bg-emerald-950/20 border border-brand-green/30 px-1.5 py-0.5 rounded">
                    Settled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
