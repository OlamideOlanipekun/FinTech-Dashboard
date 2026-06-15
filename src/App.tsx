import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, CheckCircle2, Sliders } from 'lucide-react';
import Navbar from './components/Navbar';
import OverviewTab from './components/OverviewTab';
import TransactionsTab from './components/TransactionsTab';
import PaymentsTab from './components/PaymentsTab';
import InvoicesTab from './components/InvoicesTab';
import CardsTab from './components/CardsTab';
import ReportsTab from './components/ReportsTab';
import LoginScreen from './components/LoginScreen';

import { Transaction, Invoice, Card, AppUser } from './types';
import { 
  generateMockTransactions, 
  generateMockInvoices, 
  INITIAL_CARDS 
} from './mockData';
import { CurrencyCode } from './utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedSubAccount, setSelectedSubAccount] = useState<'all' | 'main' | 'usd' | 'savings'>('all');
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const stored = localStorage.getItem('swiftpay_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Master States
  const [transactions, setTransactions] = useState<Transaction[]>(() => generateMockTransactions());
  const [invoices, setInvoices] = useState<Invoice[]>(() => generateMockInvoices());
  const [cards, setCards] = useState<Card[]>(() => INITIAL_CARDS);

  const [notifications, setNotifications] = useState<string[]>([
    "SME Wire payout: Zenith Bank disbursed NGN 320,000.00 settled successfully.",
    "Invoice INV-2026-004 has been marked as Paid by Oando Fuel Retailers.",
    "Primary Marketing Card budget cap updated to ₦2.5M successfully.",
    "System Alert: Security token verification for Access Bank wire is active."
  ]);

  // Custom Reusable Modal state for premium non-alert information delivery
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
  }>({
    isOpen: false,
    title: '',
    content: null,
  });

  const triggerModal = (title: string, content: React.ReactNode) => {
    setInfoModal({
      isOpen: true,
      title,
      content,
    });
  };

  // Master operations
  const addNotification = (text: string) => {
    setNotifications((prev) => [text, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('swiftpay_current_user', JSON.stringify(user));
    addNotification(`Access Granted: Welcome back, ${user.name} (${user.companyName})!`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('swiftpay_current_user');
    addNotification("Session terminated. Signed out of SwiftPay Corporate.");
  };

  const handleOpenTerms = () => {
    triggerModal(
      "Merchant Terms & Agreement",
      <div className="space-y-4 text-xs">
        <div className="space-y-1">
          <h5 className="font-bold text-brand-text">1. Sandbox Regulatory Authorization</h5>
          <p className="text-brand-muted leading-relaxed">
            SwiftPay Technology Africa provides a CBN (Central Bank of Nigeria) regulated digital financial testbed environment. All balances, virtual cards, electronic payouts, and API collections are for strict simulation, compliance auditing, and sandbox evaluation protocols.
          </p>
        </div>
        <div className="space-y-1">
          <h5 className="font-bold text-brand-text">2. Settlement Guarantees & Cleardown</h5>
          <p className="text-brand-muted leading-relaxed">
            Inbound and outbound transactions executed are automatically routed through our sandbox settlement rails. Real disbursements will only occur upon verification of this corporate account into live production tier.
          </p>
        </div>
        <div className="space-y-1">
          <h5 className="font-bold text-brand-text">3. virtual Card Liabilities & Spending Limits</h5>
          <p className="text-brand-muted leading-relaxed">
            All virtual card issues are subject to corporate funding. Sub-accounts can allocate spending boundaries under corporate safety guidelines. SwiftPay is not accountable for unverified manual API queries.
          </p>
        </div>
        <div className="space-y-1">
          <h5 className="font-bold text-brand-text">4. Information Security & Compliance</h5>
          <p className="text-brand-muted leading-relaxed">
            Information transmitted aligns with standard secure merchant encryption guidelines. No credential information is shared with unauthorized third-party providers. Protected with standard SSL / SHA-256 protocols.
          </p>
        </div>
      </div>
    );
  };

  const handleOpenSecurity = () => {
    triggerModal(
      "Security & CBN Compliance Checklist",
      <div className="space-y-4 text-xs">
        <div className="flex gap-3 bg-brand-elevated/45 border border-brand-green/30 p-3 rounded-xl items-start">
          <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-brand-green" />
          </div>
          <div>
            <h5 className="font-bold text-brand-text">Central Bank Sandbox Regulatory Compliance</h5>
            <p className="text-brand-muted text-[10px] leading-relaxed mt-1">
              This portal conforms to the CBN Circular on sandbox financial portals, guaranteeing zero legal liability for real-world merchant operations. Secure routing parameters are active 24/7.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between py-1 border-b border-brand-border/20">
            <span className="text-brand-muted font-medium">Encryption Standard</span>
            <span className="font-mono text-brand-text">AES-256 Transport Layer</span>
          </div>
          <div className="flex justify-between py-1 border-b border-brand-border/20">
            <span className="text-brand-muted font-medium">Compliance Auditing</span>
            <span className="font-bold text-brand-text">NDPR Compliant</span>
          </div>
          <div className="flex justify-between py-1 border-b border-brand-border/20">
            <span className="text-brand-muted font-medium">Two-Factor Dual Signature</span>
            <span className="text-brand-green font-bold">Enabled for transfers &gt; ₦5M</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-brand-muted font-medium">Disaster Recovery Node</span>
            <span className="font-mono text-brand-text">Primary Lagos-South Node</span>
          </div>
        </div>
      </div>
    );
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleAddInvoice = (newInv: Invoice) => {
    setInvoices((prev) => [newInv, ...prev]);
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices((prev) => 
      prev.map(inv => {
        if (inv.id === id) {
          // If marked paid, let's auto-generate a matching credit transaction for realism!
          if (status === 'paid' && inv.status !== 'paid') {
            const subtotal = inv.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
            const taxAmount = Math.round(subtotal * (inv.taxRate / 100));
            const totalVal = subtotal + taxAmount;

            const credTx: Transaction = {
              id: `tx-invoice-paid-${Math.random().toString(36).substring(2, 9)}`,
              type: 'credit',
              party: inv.client.name,
              category: 'Operations',
              account: 'main',
              date: '2026-06-15',
              reference: `REF-INV-SET-${inv.number.split('-')[2]}`,
              narration: `Settlement payout for ${inv.number}`,
              amount: totalVal,
              status: 'completed'
            };
            setTimeout(() => handleAddTransaction(credTx), 100);
          }
          return { ...inv, status };
        }
        return inv;
      })
    );
  };

  const handleAddCard = (newCard: Card) => {
    setCards((prev) => [...prev, newCard]);
  };

  const handleToggleFreezeCard = (id: string) => {
    setCards((prev) => 
      prev.map(c => c.id === id ? { ...c, frozen: !c.frozen } : c)
    );
  };

  const handleSetLimit = (id: string, limit: number) => {
    setCards((prev) => 
      prev.map(c => c.id === id ? { ...c, spendingLimit: limit } : c)
    );
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-brand-base text-brand-text selection:bg-brand-gold/30 selection:text-brand-text flex flex-col font-sans">
      
      {/* Top sticky Navigation Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        notifications={notifications}
        clearNotifications={clearNotifications}
        onSelectSubAccount={setSelectedSubAccount}
        currency={currency}
        onChangeCurrency={setCurrency}
        user={currentUser}
        onSignOut={handleSignOut}
        onShowModal={triggerModal}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 mb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <OverviewTab 
                transactions={transactions} 
                onAddTransaction={handleAddTransaction}
                onNavigateToTab={setActiveTab}
                selectedSubAccount={selectedSubAccount}
                onSelectSubAccount={setSelectedSubAccount}
                addNotification={addNotification}
                currency={currency}
              />
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <TransactionsTab 
                transactions={transactions}
                selectedSubAccount={selectedSubAccount}
                onSelectSubAccount={setSelectedSubAccount}
                currency={currency}
                addNotification={addNotification}
              />
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <PaymentsTab 
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                addNotification={addNotification}
                currency={currency}
              />
            </motion.div>
          )}

          {activeTab === 'invoices' && (
            <motion.div
              key="invoices"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <InvoicesTab 
                invoices={invoices}
                onAddInvoice={handleAddInvoice}
                onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                addNotification={addNotification}
                currency={currency}
              />
            </motion.div>
          )}

          {activeTab === 'cards' && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <CardsTab 
                cards={cards}
                transactions={transactions}
                onAddCard={handleAddCard}
                onToggleFreezeCard={handleToggleFreezeCard}
                onSetLimit={handleSetLimit}
                addNotification={addNotification}
                currency={currency}
              />
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <ReportsTab 
                transactions={transactions}
                addNotification={addNotification}
                currency={currency}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Design Accents - Minimal design with NO clutter */}
      <footer className="border-t border-brand-border/40 py-6 text-center text-xs text-brand-muted mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p>© 2026 SwiftPay Technology Africa. All rights reserved.</p>
          <div className="flex gap-4 justify-center">
            <span className="hover:text-brand-gold cursor-pointer transition-colors" onClick={handleOpenTerms}>Merchant Terms</span>
            <span className="hover:text-brand-gold cursor-pointer transition-colors" onClick={handleOpenSecurity}>Security & Compliance</span>
          </div>
        </div>
      </footer>

      {/* Global Dialog system replacing primitive alerts with premium custom views */}
      <AnimatePresence>
        {infoModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-brand-base/85 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              {/* Premium top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-gold/60 via-brand-green/40 to-brand-gold/60" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-brand-border/60 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                  <h3 className="font-display font-bold text-xs text-brand-text uppercase tracking-widest leading-none">
                    {infoModal.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-1 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-elevated transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto min-h-0 text-sm">
                {infoModal.content}
              </div>

              {/* Footer CTA */}
              <div className="pt-4 border-t border-brand-border/40 mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-brand-elevated hover:bg-brand-elevated/80 text-brand-text border border-brand-border text-xs font-bold rounded-lg transition-all"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
