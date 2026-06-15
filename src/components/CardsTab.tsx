import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  SlidersHorizontal, 
  CheckCircle, 
  AlertCircle,
  X,
  EyeOff,
  Coins,
  History,
  TrendingDown
} from 'lucide-react';
import { Card, Transaction } from '../types';
import { formatCurrency, parseNairaInput, CurrencyCode, CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../utils';

interface CardsTabProps {
  cards: Card[];
  transactions: Transaction[];
  onAddCard: (card: Card) => void;
  onToggleFreezeCard: (id: string) => void;
  onSetLimit: (id: string, limit: number) => void;
  addNotification: (text: string) => void;
  currency: CurrencyCode;
}

export default function CardsTab({
  cards,
  transactions,
  onAddCard,
  onToggleFreezeCard,
  onSetLimit,
  addNotification,
  currency
}: CardsTabProps) {
  // Local dynamic currency formatting wrapper
  const formatNaira = (koboAmount: number) => {
    return formatCurrency(koboAmount, currency);
  };
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  
  // Show CVV states
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  const [cvvCountdown, setCvvCountdown] = useState(5);

  // Spend limit modal
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitInput, setLimitInput] = useState('');

  // Issue Card Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [newCardType, setNewCardType] = useState<'virtual' | 'physical'>('virtual');
  const [newCardLabel, setNewCardLabel] = useState('');
  const [newCardBrand, setNewCardBrand] = useState<'visa' | 'mastercard' | 'verve'>('visa');
  const [newCardLimit, setNewCardLimit] = useState('');

  // Handle CVV countdown trigger
  const handleRevealCvv = (cardId: string) => {
    setRevealedCardId(cardId);
    setCvvCountdown(5);
    addNotification("CVV revealed securely. Expires in 5 seconds.");
  };

  useEffect(() => {
    if (revealedCardId) {
      const timer = setInterval(() => {
        setCvvCountdown((prev) => {
          if (prev <= 1) {
            setRevealedCardId(null);
            clearInterval(timer);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [revealedCardId]);

  // Current selected card
  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];

  // Past transactions for the selected card
  // Map specific mock transactions to represent card-based withdrawals
  const getCardTransactions = (cardName: string) => {
    // Generate realistic card-based debits
    if (cardName.toLocaleLowerCase().includes('marketing')) {
      return transactions.filter(t => t.category === 'Marketing').slice(0, 8);
    } else if (cardName.toLocaleLowerCase().includes('corporate')) {
      return transactions.filter(t => t.category === 'Software' || t.category === 'Operations').slice(0, 8);
    } else {
      return transactions.filter(t => t.category === 'Travel' || t.category === 'Operations').slice(0, 8);
    }
  };

  const cardTransactions = selectedCard ? getCardTransactions(selectedCard.label) : [];

  // Update Limit
  const handleUpdateLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitInput || !selectedCard) return;
    const parsedLimitKobo = parseNairaInput(limitInput) * 100;
    onSetLimit(selectedCard.id, parsedLimitKobo);
    addNotification(`Card spending ceiling updated to ${formatNaira(parsedLimitKobo)}`);
    setShowLimitModal(false);
    setLimitInput('');
  };

  // Issue card
  const handleIssueCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardLabel || !newCardLimit) {
      addNotification("Validation Error: Please specify a valid label name and spending ceiling limit.");
      return;
    }

    const brandName = newCardBrand;
    const limitKobo = parseNairaInput(newCardLimit) * 100;
    // Generate random 16 digit masked
    const random16 = '5061' + Array.from({length: 12}, () => Math.floor(Math.random() * 10)).join('');
    const randomCvv = String(Math.floor(100 + Math.random() * 900));
    
    const newCard: Card = {
      id: `card-dynamic-${Math.random().toString(36).substring(2, 9)}`,
      type: newCardType,
      label: newCardLabel,
      number: random16,
      expiry: '06/31',
      cvv: randomCvv,
      cardholderName: 'OLAMIDE OLANIPEKUN',
      brand: brandName,
      frozen: false,
      spendingLimit: limitKobo
    };

    onAddCard(newCard);
    addNotification(`New virtual card "${newCardLabel}" issued successfully.`);
    setSelectedCardId(newCard.id);
    setShowIssueModal(false);
    setNewCardLabel('');
    setNewCardLimit('');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/30">
        <div>
          <h2 className="text-xl font-display font-medium text-brand-text">Corporate Card Manager</h2>
          <p className="text-xs text-brand-muted">Instantly issue corporate virtual cards, freeze physical cards and set budget caps</p>
        </div>
        <button
          onClick={() => setShowIssueModal(true)}
          className="px-4 py-2 bg-brand-gold text-brand-base font-black text-xs rounded-xl hover:bg-brand-gold/90 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/10 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Issue Corporate Card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CARDS RENDERER & ACTIONS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card Selector navigation */}
          <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar scroll-smooth snap-x snap-mandatory flex-nowrap md:flex-wrap">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={`snap-center flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  selectedCardId === card.id
                    ? 'bg-brand-gold/10 text-brand-gold border-brand-gold font-bold shadow-md shadow-brand-gold/5'
                    : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text'
                }`}
              >
                {card.label} ({card.type})
              </button>
            ))}
          </div>

          {selectedCard && (
            <div className="space-y-6">
              
              {/* CARD 3D FLIP CONTAINER */}
              <div className="flex justify-center py-4">
                <div className="w-full max-w-[340px] h-[200px] [perspective:1000px]">
                  
                  {/* Flipper logic */}
                  <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] ${
                    selectedCard.frozen ? '[transform:rotateY(180deg)]' : ''
                  }`}>
                    
                    {/* CARD FRONT FACE */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl p-5 bg-gradient-to-tr from-zinc-950 via-neutral-900 to-zinc-800 text-brand-text flex flex-col justify-between border border-white/10 [backface-visibility:hidden] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
                      {/* Premium gold glow and diagonal glare lines */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none rounded-2xl" />
                      <div className="absolute -right-16 -top-16 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />
                      
                      {/* Top Header Row of Front Face */}
                      <div className="flex items-start justify-between z-10">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest block">Swift Corporate</span>
                          <span className="text-[9px] text-brand-muted font-medium mt-0.5 block">{selectedCard.label}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-brand-elevated text-brand-gold font-bold tracking-wide uppercase border border-brand-border/40">
                          {selectedCard.type}
                        </span>
                      </div>

                      {/* Chip logo spacer */}
                      <div className="w-10 h-8 bg-gradient-to-br from-brand-gold/25 to-brand-gold/5 rounded-md border border-brand-gold/30 flex items-center justify-center shadow-inner z-10">
                        <CreditCard className="w-5 h-5 text-brand-gold animate-pulse" />
                      </div>

                      {/* Card Number masked */}
                      <div className="font-mono text-base tracking-[0.22em] text-brand-text font-bold text-center tabular-nums relative z-10 select-all drop-shadow-md">
                        {/* Mask the first 12 digits, show last 4 */}
                        •••• •••• •••• {selectedCard.number.substring(12)}
                      </div>

                      {/* Bottom row: Cardholder & Expiry & Brand Logo */}
                      <div className="flex justify-between items-end z-10">
                        <div className="space-y-1">
                          <span className="text-[8px] uppercase tracking-wider text-brand-muted font-bold block">Cardholder name</span>
                          <span className="font-mono text-[10px] font-bold text-brand-text/95 block tracking-wide">{selectedCard.cardholderName}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="space-y-1 text-center">
                            <span className="text-[8px] uppercase tracking-wider text-brand-muted font-bold block">Expires</span>
                            <span className="font-mono text-[10px] font-bold block text-brand-text/95">{selectedCard.expiry}</span>
                          </div>
                          
                          <div className="space-y-1 text-right">
                            <span className="text-[8px] uppercase tracking-wider text-brand-muted font-bold block">CVV</span>
                            <span className="font-mono text-[10px] font-bold text-brand-gold block animate-pulse">
                              {revealedCardId === selectedCard.id ? selectedCard.cvv : '•••'}
                            </span>
                          </div>

                          {/* Network icon */}
                          <div className="font-mono text-[10px] font-black uppercase text-brand-gold border border-brand-gold/40 px-1.5 py-0.5 rounded mr-1 bg-brand-base bg-opacity-40">
                            {selectedCard.brand}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* CARD BACK FACE (REPRESENT FROZEN TRANSITION) */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl p-5 bg-gradient-to-tr from-red-950/20 via-neutral-900 to-zinc-950 text-brand-text flex flex-col justify-between border-2 border-brand-red/40 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl">
                      
                      {/* Black magnetic strip */}
                      <div className="w-full h-8 bg-neutral-950 absolute left-0 top-6" />

                      <div className="mt-14 text-center space-y-2">
                        <div className="w-9 h-9 rounded-full bg-brand-red/10 border border-brand-red flex items-center justify-center mx-auto">
                          <Lock className="w-4 h-4 text-brand-red animate-pulse" />
                        </div>
                        <div>
                          <p className="font-display font-bold text-xs text-brand-red tracking-wider">CARD FROZEN</p>
                          <p className="text-[9px] text-brand-muted">This card is locked for all operational expenses.</p>
                        </div>
                      </div>

                      {/* Back Bottom footer */}
                      <div className="flex justify-between items-center text-[8px] text-brand-muted font-mono pt-4 border-t border-brand-border/30">
                        <span>SWIFTPAY SECURITY SYSTEM</span>
                        <span className="text-brand-red font-semibold">TAP UNFREEZE TO ACTIVATE</span>
                      </div>

                    </div>

                  </div>
                </div>
              </div>

              {/* CARD CONTROLS BOX */}
              <div className="bg-brand-surface border border-brand-border rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text pb-1 border-b border-brand-border/30">Security Credentials & Caps</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  
                  {/* Freeze button */}
                  <button
                    onClick={() => {
                      onToggleFreezeCard(selectedCard.id);
                      addNotification(`Card "${selectedCard.label}" status flipped.`);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                      selectedCard.frozen
                        ? 'bg-brand-green/5 border-brand-green/30 text-brand-green hover:bg-brand-green/10'
                        : 'bg-brand-red/5 border-brand-red/30 text-brand-red hover:bg-brand-red/10'
                    }`}
                  >
                    {selectedCard.frozen ? (
                      <>
                        <Unlock className="w-5 h-5 text-brand-green" />
                        <span className="text-xs font-bold">Unfreeze Card</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-brand-red" />
                        <span className="text-xs font-bold">Freeze Card</span>
                      </>
                    )}
                  </button>

                  {/* Set temporary spending limit */}
                  <button
                    onClick={() => {
                      setLimitInput((selectedCard.spendingLimit / 100).toString());
                      setShowLimitModal(true);
                    }}
                    className="p-3 bg-brand-elevated/40 hover:bg-brand-elevated hover:border-brand-gold/60 border border-brand-border rounded-xl text-brand-text flex flex-col items-center justify-center text-center gap-1.5 transition-all"
                  >
                    <SlidersHorizontal className="w-5 h-5 text-brand-gold" />
                    <span className="text-xs font-bold">Update Budget</span>
                  </button>

                  {/* Secret CVV reveal (click to reveal for 5s) */}
                  <button
                    disabled={selectedCard.frozen || revealedCardId === selectedCard.id}
                    onClick={() => handleRevealCvv(selectedCard.id)}
                    className="p-3 bg-brand-elevated/40 hover:bg-brand-elevated hover:border-brand-gold/60 border border-brand-border rounded-xl text-brand-text flex flex-col items-center justify-center text-center gap-1.5 transition-all disabled:opacity-30"
                  >
                    {revealedCardId === selectedCard.id ? (
                      <>
                        <span className="font-mono text-sm text-brand-green font-black">{cvvCountdown}s</span>
                        <span className="text-xs font-bold">Expires Soon</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5 text-brand-gold" />
                        <span className="text-xs font-bold">Reveal CVV</span>
                      </>
                    )}
                  </button>

                </div>

                {/* Spent limit indicators */}
                <div className="p-3.5 bg-brand-elevated/30 rounded-xl space-y-2 border border-brand-border/40 font-mono text-xs">
                  <div className="flex justify-between items-center text-sans text-xs">
                    <span className="text-brand-muted">Monthly Spending Limit:</span>
                    <span className="text-brand-text font-bold tabular-nums">{formatNaira(selectedCard.spendingLimit)}</span>
                  </div>
                  {/* Progress bar simulation inside limit */}
                  <div className="w-full h-1.5 bg-brand-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-brand-gold rounded-full" style={{ width: '42%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-brand-muted">
                    <span>{CURRENCY_SYMBOLS[currency]}0 (Start)</span>
                    <span>42% utilized ({CURRENCY_SYMBOLS[currency]}{(selectedCard.spendingLimit * 0.42 * EXCHANGE_RATES[currency] / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} spent)</span>
                    <span>{CURRENCY_SYMBOLS[currency]}{(selectedCard.spendingLimit * EXCHANGE_RATES[currency] / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} limit</span>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: CARD TRANSACTIONS (5 COLS) */}
        <div className="lg:col-span-5 bg-brand-surface border border-brand-border rounded-2xl p-5 font-sans space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded bg-brand-gold/10 flex items-center justify-center">
              <History className="w-4 h-4 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Card Settlement Logs</h3>
              <p className="text-[11px] text-brand-muted">Recent debits authorized by card</p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[440px] overflow-y-auto">
            {cardTransactions.length === 0 ? (
              <div className="text-center py-10 text-brand-muted text-xs">No corporate card transactions logged.</div>
            ) : (
              cardTransactions.map((tx) => (
                <div key={tx.id} className="p-3 rounded-lg bg-brand-elevated/35 border border-brand-border/40 hover:bg-brand-elevated/65 transition-colors flex justify-between items-center font-sans text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-brand-text truncate max-w-[150px]">{tx.party}</p>
                    <p className="text-[10px] text-brand-muted font-mono">{tx.date}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="font-bold font-mono text-brand-red italic text-xs tabular-nums">
                      -{formatNaira(tx.amount)}
                    </p>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-brand-muted">{tx.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* LIMIT MODAL */}
      {showLimitModal && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-brand-surface border border-brand-border/80 rounded-none md:rounded-xl w-full h-full md:h-auto md:max-w-sm p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col justify-center">
            <button 
              onClick={() => setShowLimitModal(false)}
              className="absolute right-4 top-4 text-brand-muted hover:text-brand-text p-1.5 hover:bg-brand-elevated rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-semibold text-base text-brand-text mb-2">Configure Spending Ceiling</h3>
            <p className="text-xs text-brand-muted mb-4">Update monthly transaction caps for "{selectedCard.label}" immediately.</p>

            <form onSubmit={handleUpdateLimit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Limit Caps ({CURRENCY_SYMBOLS[currency]})</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-brand-muted">{CURRENCY_SYMBOLS[currency]}</span>
                  <input
                    required
                    type="tel"
                    value={limitInput}
                    onChange={(e) => {
                      const parsed = parseNairaInput(e.target.value);
                      setLimitInput(parsed ? parsed.toLocaleString('en-US') : '');
                    }}
                    className="w-full pl-7 pr-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-gold text-brand-base font-black text-xs rounded-lg hover:bg-brand-gold/90 transition-all shadow-md shadow-brand-gold/5"
              >
                Apply Limit ({CURRENCY_SYMBOLS[currency]}{limitInput})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE CARD MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-brand-surface border border-brand-border/80 rounded-none md:rounded-2xl w-full h-full md:h-auto md:max-w-md p-6 relative shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 flex flex-col justify-center">
            <button 
              onClick={() => setShowIssueModal(false)}
              className="absolute right-4 top-4 text-brand-muted hover:text-brand-text p-1.5 hover:bg-brand-elevated rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-brand-gold/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-brand-gold" />
              </div>
              <h3 className="font-display font-semibold text-lg text-brand-text">Issue Corporate Card</h3>
            </div>

            <p className="text-xs text-brand-muted mb-4">
              Equip freelancers or marketing managers with dedicated, self-funding card profiles instantly.
            </p>

            <form onSubmit={handleIssueCard} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Card Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCardType('virtual')}
                    className={`py-2 rounded-lg border font-bold uppercase text-[10px] transition-all ${
                      newCardType === 'virtual' 
                        ? 'bg-brand-gold/10 border-brand-gold text-brand-gold' 
                        : 'bg-brand-elevated/40 border-brand-border text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    Virtual profile (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCardType('physical')}
                    className={`py-2 rounded-lg border font-bold uppercase text-[10px] transition-all ${
                      newCardType === 'physical' 
                        ? 'bg-brand-gold/10 border-brand-gold text-brand-gold' 
                        : 'bg-brand-elevated/40 border-brand-border text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    Physical card (Deliver)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Card nickname / purpose</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Multi-Region Card"
                  value={newCardLabel}
                  onChange={(e) => setNewCardLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Credit Brand Provider</label>
                <select
                  value={newCardBrand}
                  onChange={(e) => setNewCardBrand(e.target.value as any)}
                  className="w-full px-3 py-2 bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold"
                >
                  <option value="visa">Visa Payment Processor</option>
                  <option value="mastercard">Mastercard Worldwide</option>
                  <option value="verve">Verve National Processor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Monthly Spending Limit ({CURRENCY_SYMBOLS[currency]})</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-brand-muted whitespace-nowrap leading-none pt-0.5">{CURRENCY_SYMBOLS[currency]}</span>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 150,000"
                    value={newCardLimit}
                    onChange={(e) => {
                      const parsed = parseNairaInput(e.target.value);
                      setNewCardLimit(parsed ? parsed.toLocaleString('en-US') : '');
                    }}
                    className="w-full pl-7 pr-3 py-2 bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-gold text-brand-base font-black text-xs rounded-xl hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/10"
              >
                Generate Swift Corporate Card
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
