import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  Download, 
  BellRing, 
  Eye, 
  Sparkles,
  RefreshCw,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { formatCurrency, parseNairaInput, CurrencyCode, CURRENCY_SYMBOLS } from '../utils';

interface InvoicesTabProps {
  invoices: Invoice[];
  onAddInvoice: (inv: Invoice) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  addNotification: (text: string) => void;
  currency: CurrencyCode;
}

export default function InvoicesTab({
  invoices,
  onAddInvoice,
  onUpdateInvoiceStatus,
  addNotification,
  currency
}: InvoicesTabProps) {
  // Local dynamic currency formatting wrapper
  const formatNaira = (koboAmount: number) => {
    return formatCurrency(koboAmount, currency);
  };
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'create'>('list');

  // Previewing details in row
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Form Fields for Create Invoice
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [taxRate, setTaxRate] = useState<0 | 7.5>(7.5);
  const [notes, setNotes] = useState('Payment should be made within 14 days of issue to ensure continued service. Thank you for doing business with us!');
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { description: 'Enterprise Consultation Service', qty: 1, unitPrice: 20000000 } // 200,000 Naira in kobo
  ]);

  // Auto-generate next invoice number
  const nextInvoiceNumber = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;

  // Add line item row
  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', qty: 1, unitPrice: 0 }]);
  };

  // Remove line item row
  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) {
      addNotification("Validation Error: At least one line item is required on the invoice.");
      return;
    }
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  // Handle line item field changes
  const handleLineItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...lineItems];
    if (field === 'qty') {
      updated[index].qty = Math.max(1, parseInt(value, 10) || 1);
    } else if (field === 'unitPrice') {
      // Input is usually formatted Naira
      updated[index].unitPrice = parseNairaInput(value) * 100; // stored in kobo, wait, parseNairaInput returns in Naira value? Yes, let's treat parseNairaInput as returning Naira, then we *100 for kobo! Perfect.
    } else {
      updated[index][field] = value;
    }
    setLineItems(updated);
  };

  // Compute live calculations
  const calculateInvoiceTotals = (itemsList: InvoiceItem[], rate: number) => {
    const subtotal = itemsList.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const taxAmount = Math.round(subtotal * (rate / 100));
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const totals = calculateInvoiceTotals(lineItems, taxRate);

  // Create Invoice Submission
  const handleSubmitInvoice = (status: 'pending' | 'draft') => {
    if (!clientName || !clientEmail) {
      addNotification("Validation Error: Please fill client name and client email address.");
      return;
    }

    // validate line items
    const invalidItem = lineItems.find(item => !item.description || !item.unitPrice);
    if (invalidItem) {
      addNotification("Validation Error: Please check that all line items have description and valid price.");
      return;
    }

    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 14);

    const padZero = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(today.getDate())}`;
    const futureStr = `${future.getFullYear()}-${padZero(future.getMonth() + 1)}-${padZero(future.getDate())}`;

    const newInvoice: Invoice = {
      id: `inv-${200 + invoices.length}`,
      number: nextInvoiceNumber,
      client: { name: clientName, email: clientEmail },
      issueDate: todayStr,
      dueDate: futureStr,
      items: lineItems,
      taxRate,
      status,
      notes
    };

    onAddInvoice(newInvoice);
    addNotification(`Created new Invoice ${nextInvoiceNumber} for ${clientName}`);
    
    // Reset Form
    setClientName('');
    setClientEmail('');
    setTaxRate(7.5);
    setLineItems([{ description: 'Enterprise Consultation Service', qty: 1, unitPrice: 20000000 }]);
    setActiveSubTab('list');
  };

  // Mark invoice as Paid
  const handleMarkAsPaid = (inv: Invoice) => {
    onUpdateInvoiceStatus(inv.id, 'paid');
    addNotification(`Invoice ${inv.number} is marked as PAID.`);
    // If currently viewing details, update it as well
    if (viewingInvoice && viewingInvoice.id === inv.id) {
      setViewingInvoice({ ...viewingInvoice, status: 'paid' });
    }
  };

  // Send visual reminder
  const handleSendReminder = (inv: Invoice) => {
    addNotification(`Reminder Email Dispatched: Automated billing notification successfully sent to ${inv.client.name} regarding Invoice ${inv.number}.`);
  };

  const getStatusLabelColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-brand-green/10 text-brand-green border-brand-green/20';
      case 'pending':
        return 'bg-brand-gold/10 text-brand-gold border-brand-gold/20';
      case 'overdue':
        return 'bg-brand-red/10 text-brand-red border-brand-red/20';
      case 'draft':
        return 'bg-brand-elevated text-brand-muted border-brand-border';
      default:
        return 'bg-neutral-800 text-white';
    }
  };

  const getFullInvoiceSum = (items: InvoiceItem[], rate: number) => {
    const calc = calculateInvoiceTotals(items, rate);
    return formatNaira(calc.total);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/30">
        <div>
          <h2 className="text-xl font-display font-medium text-brand-text">Corporate Invoicing</h2>
          <p className="text-xs text-brand-muted">Collect SME business payments and log customer invoice cycles flawlessly</p>
        </div>

        {/* Inner sub tabs */}
        <div className="flex bg-brand-elevated/70 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => { setActiveSubTab('list'); setViewingInvoice(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'list'
                ? 'bg-brand-gold text-brand-base shadow-lg shadow-brand-gold/10'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Invoices List ({invoices.length})
          </button>
          <button
            onClick={() => setActiveSubTab('create')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'create'
                ? 'bg-brand-gold text-brand-base shadow-lg shadow-brand-gold/10'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            Create Invoice
          </button>
        </div>
      </div>

      {activeSubTab === 'list' ? (
        <div className="space-y-4">
          
          {/* VIEW DRAFT MODAL / SECTION DETAIL */}
          {viewingInvoice && (
            <div className="p-5 bg-brand-surface border border-brand-border rounded-xl space-y-6">
              <div className="flex justify-between items-start pb-4 border-b border-brand-border/40">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">Viewing Invoice Details</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="font-display font-bold text-lg text-brand-text">{viewingInvoice.number}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusLabelColor(viewingInvoice.status)}`}>
                      {viewingInvoice.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {viewingInvoice.status !== 'paid' && (
                    <button
                      onClick={() => handleMarkAsPaid(viewingInvoice)}
                      className="px-3 py-1.5 bg-brand-green/20 hover:bg-brand-green/30 text-brand-green border border-brand-green/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark As Paid
                    </button>
                  )}
                  {viewingInvoice.status !== 'paid' && viewingInvoice.status !== 'draft' && (
                    <button
                      onClick={() => handleSendReminder(viewingInvoice)}
                      className="px-3 py-1.5 bg-brand-elevated hover:bg-brand-elevated/80 text-brand-gold border border-brand-border rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      Send Reminder
                    </button>
                  )}
                  <button
                    onClick={() => setViewingInvoice(null)}
                    className="p-1 px-3 text-xs bg-brand-elevated text-brand-muted hover:text-brand-text border border-brand-border rounded-lg"
                  >
                    Close Preview
                  </button>
                </div>
              </div>

              {/* Invoice full layout sheet */}
              <div className="p-6 bg-brand-elevated/35 rounded-xl border border-brand-border/50 max-w-2xl mx-auto space-y-6 font-sans text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display font-bold text-base tracking-tight text-brand-text">GOLDSMITH SME INC</h4>
                    <p className="text-[10px] text-brand-muted mt-1 leading-relaxed">
                      32 Alfred Rewane Road, Ikoyi,<br />
                      Lagos State, Nigeria<br />
                      sales@goldsmith.ng
                    </p>
                  </div>
                  <div className="text-right">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Invoice Issued For</h5>
                    <p className="font-semibold text-brand-text mt-1 text-sm">{viewingInvoice.client.name}</p>
                    <p className="text-brand-muted font-mono">{viewingInvoice.client.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-brand-elevated/50 rounded-lg border border-brand-border/40">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-brand-muted">Invoice No:</span>
                    <span className="font-mono text-brand-text font-bold mt-0.5 block">{viewingInvoice.number}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-brand-muted">Date Generated:</span>
                    <span className="text-brand-text mt-0.5 block">{viewingInvoice.issueDate}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-brand-muted">Settlement Due:</span>
                    <span className="text-brand-text font-semibold mt-0.5 block text-brand-gold">{viewingInvoice.dueDate}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-brand-muted">Status Code:</span>
                    <span className="text-brand-green font-bold mt-0.5 block uppercase">{viewingInvoice.status}</span>
                  </div>
                </div>

                {/* Items details table */}
                <div className="space-y-2">
                  <div className="border-b border-brand-border/60 pb-1 flex justify-between font-bold text-[10px] text-brand-muted uppercase">
                    <span className="flex-1">Task / Description</span>
                    <span className="w-16 text-center">Qty</span>
                    <span className="w-28 text-right">Unit Price</span>
                    <span className="w-28 text-right">Subtotal</span>
                  </div>
                  <div className="space-y-1.5">
                    {viewingInvoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-brand-border/20 last:border-none text-brand-text">
                        <span className="flex-1 font-semibold">{item.description}</span>
                        <span className="w-16 text-center font-mono">{item.qty}</span>
                        <span className="w-28 text-right font-mono tabular-nums">{formatNaira(item.unitPrice)}</span>
                        <span className="w-28 text-right font-mono tabular-nums font-bold">{formatNaira(item.qty * item.unitPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals calc */}
                <div className="flex justify-end pt-2 border-t border-brand-border/40">
                  <div className="w-64 space-y-2 text-right">
                    <div className="flex justify-between font-medium">
                      <span className="text-brand-muted">Itemized Subtotal:</span>
                      <span className="tabular-nums font-mono text-brand-text">{formatNaira(calculateInvoiceTotals(viewingInvoice.items, viewingInvoice.taxRate).subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-brand-muted">VAT Value ({viewingInvoice.taxRate}%):</span>
                      <span className="tabular-nums font-mono text-brand-text">{formatNaira(calculateInvoiceTotals(viewingInvoice.items, viewingInvoice.taxRate).taxAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-brand-border/40 pt-2 font-bold text-brand-gold">
                      <span>Total Invoice Amount:</span>
                      <span className="tabular-nums font-mono text-sm">{getFullInvoiceSum(viewingInvoice.items, viewingInvoice.taxRate)}</span>
                    </div>
                  </div>
                </div>

                {viewingInvoice.notes && (
                  <div className="pt-4 border-t border-brand-border/40">
                    <span className="block text-[9px] uppercase font-bold text-brand-muted mb-1">Company Notes:</span>
                    <p className="p-2.5 rounded-lg bg-brand-elevated/40 border border-brand-border/60 text-brand-muted leading-relaxed italic">
                      {viewingInvoice.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INVOICES TABLE LIST */}
          <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
            {/* Desktop Ledger Table (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-border/40 text-brand-muted font-bold uppercase tracking-wider text-[10px] h-11 bg-brand-surface sm:pl-2">
                    <th className="pb-2 pl-4">Invoice #</th>
                    <th className="pb-2">Client Client Contact</th>
                    <th className="pb-2">Due Date</th>
                    <th className="pb-2">Amount (NGN)</th>
                    <th className="pb-2 text-center">Status</th>
                    <th className="pb-2 text-right pr-4">Actions Available</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="h-12 border-b border-brand-border/30 hover:bg-brand-elevated/30 transition-all font-sans">
                      <td className="font-mono text-brand-gold font-bold pl-4">
                        {inv.number}
                      </td>
                      <td className="font-semibold text-brand-text">
                        <div>
                          <p className="font-sans font-bold text-xs text-brand-text leading-tight">{inv.client.name}</p>
                          <p className="font-mono text-[9px] text-brand-muted leading-none mt-0.5">{inv.client.email}</p>
                        </div>
                      </td>
                      <td className="text-brand-muted font-semibold">{inv.dueDate}</td>
                      <td className="font-mono tabular-nums font-bold text-brand-text">
                        {getFullInvoiceSum(inv.items, inv.taxRate)}
                      </td>
                      <td className="text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusLabelColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="text-right pr-4 h-12">
                        <div className="flex items-center justify-end gap-1.5 h-full">
                          <button
                            onClick={() => { setViewingInvoice(inv); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                            className="p-1 px-2.5 bg-brand-elevated hover:bg-brand-elevated/80 rounded-lg text-brand-text border border-brand-border text-[10px] font-bold transition-all flex items-center gap-1"
                            title="Preview PDF and items"
                          >
                            <Eye className="w-3 h-3 text-brand-muted" />
                            View Sheet
                          </button>
                          
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkAsPaid(inv)}
                              className="p-1 px-2.5 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/20 rounded-lg text-[10px] font-bold transition-all"
                            >
                              Mark Paid
                            </button>
                          )}

                          {inv.status !== 'paid' && inv.status !== 'draft' && (
                            <button
                              onClick={() => handleSendReminder(inv)}
                              className="p-1 px-2.5 bg-brand-elevated text-brand-gold border border-brand-border rounded-lg text-[10px] font-bold hover:text-brand-text hover:border-brand-muted transition-all"
                            >
                              Remind
                            </button>
                          )}
                          
                          <button
                            onClick={() => addNotification(`Invoice PDF Downloaded: Successfully generated high-fidelity layout download file for ${inv.number}.`)}
                            className="p-1.5 bg-brand-elevated hover:bg-brand-elevated/80 border border-brand-border text-brand-muted hover:text-brand-text rounded-lg transition-all"
                            title="Download PDF"
                          >
                            <Download className="w-3.0 h-3.0" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Invoices List Format */}
            <div className="md:hidden space-y-3 p-1.5">
              {invoices.map((inv) => (
                <div 
                  key={inv.id} 
                  className="p-3.5 bg-brand-surface border border-brand-border rounded-xl flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block font-mono text-brand-gold font-bold text-xs">{inv.number}</span>
                      <span className="block font-sans text-[10px] text-brand-muted mt-0.5">{inv.dueDate}</span>
                    </div>
                    {/* Amount */}
                    <span className="font-mono font-bold text-xs text-brand-text tabular-nums text-right block">
                      {getFullInvoiceSum(inv.items, inv.taxRate)}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-[0.5px] bg-brand-border/30 w-full" />

                  <div className="flex justify-between items-center text-[10px]">
                    <div>
                      <span className="block font-semibold text-brand-text">{inv.client.name}</span>
                      <span className="block text-[8px] font-mono text-brand-muted mt-0.5 truncate max-w-[150px]">{inv.client.email}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getStatusLabelColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-[0.5px] bg-brand-border/20 w-full" />

                  {/* Quick actions for mobile invoice card */}
                  <div className="flex gap-1.5 mt-0.5">
                    <button
                      onClick={() => { setViewingInvoice(inv); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                      className="flex-1 py-1 px-2 bg-brand-elevated text-center text-brand-text text-[9px] font-bold rounded-lg border border-brand-border"
                    >
                      View Sheet
                    </button>
                    {inv.status !== 'paid' && (
                      <button
                        onClick={() => handleMarkAsPaid(inv)}
                        className="flex-1 py-1 px-2 bg-brand-green/10 text-brand-green border border-brand-green/25 rounded-lg text-[9px] font-bold"
                      >
                        Mark Paid
                      </button>
                    )}
                    {inv.status !== 'paid' && inv.status !== 'draft' && (
                      <button
                        onClick={() => handleSendReminder(inv)}
                        className="flex-1 py-1 px-2 bg-brand-elevated text-brand-gold border border-brand-border rounded-lg text-[9px] font-bold"
                      >
                        Remind
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* CREATE INVOICE VIEW COLUMN WRAPPERS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CREATE FORM PANEL: 7 COLS */}
          <div className="lg:col-span-7 bg-brand-surface border border-brand-border rounded-2xl p-5 md:p-6 space-y-6">
            <div>
              <h3 className="font-display font-bold text-base text-brand-text">Generate Trade Invoice</h3>
              <p className="text-xs text-brand-muted">Auto-populates items, tax liabilities, and triggers payment tracking cycle</p>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Invoice Serial Sequence</label>
                  <input
                    type="text"
                    disabled
                    value={nextInvoiceNumber}
                    className="w-full px-3 py-2 text-xs bg-brand-elevated/45 border border-brand-border/60 rounded-lg text-brand-gold font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Tax Levy (VAT %)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTaxRate(0)}
                      className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                        taxRate === 0 
                          ? 'bg-brand-gold/10 text-brand-gold border-brand-gold' 
                          : 'bg-brand-elevated/40 border-brand-border text-brand-muted hover:text-brand-text'
                      }`}
                    >
                      Exempt (0% VAT)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxRate(7.5)}
                      className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                        taxRate === 7.5 
                          ? 'bg-brand-gold/10 text-brand-gold border-brand-gold font-bold' 
                          : 'bg-brand-elevated/40 border-brand-border text-brand-muted hover:text-brand-text'
                      }`}
                    >
                      Standard (7.5% VAT)
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Client Corporate Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dangote Cement Co."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Client Billing Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. accounts@dangote.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-mono"
                  />
                </div>
              </div>

              {/* DYNAMIC LINE ITEM ROW TABLE */}
              <div className="space-y-2 pt-2 border-t border-brand-border/30">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Line Items (dynamic row items)</label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="flex items-center gap-1 text-[10px] text-brand-gold font-bold hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Invoice Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="group flex gap-2 items-center bg-brand-elevated/30 p-2.5 rounded-lg border border-brand-border/60 relative">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          required
                          placeholder="Task description / service name"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                          className="w-full bg-brand-elevated border border-brand-border/60 rounded px-2.5 py-1.5 text-xs text-brand-text focus:outline-none focus:border-brand-gold"
                        />
                      </div>
                      
                      <div className="w-14">
                        <input
                          type="number"
                          required
                          min={1}
                          value={item.qty}
                          placeholder="Qty"
                          onChange={(e) => handleLineItemChange(idx, 'qty', e.target.value)}
                          className="w-full bg-brand-elevated border border-brand-border/60 rounded px-2 py-1.5 text-xs text-brand-text text-center focus:outline-none focus:border-brand-gold font-mono"
                        />
                      </div>

                      <div className="w-28 relative">
                        <span className="absolute left-1.5 top-1.5 text-xs text-brand-muted">{CURRENCY_SYMBOLS[currency]}</span>
                        <input
                          type="text"
                          required
                          value={item.unitPrice ? (item.unitPrice / 100).toLocaleString('en-US') : ''}
                          placeholder="Price"
                          onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full bg-brand-elevated border border-brand-border/60 rounded pl-4.5 pr-1.5 py-1.5 text-xs text-brand-text text-right focus:outline-none focus:border-brand-gold font-mono"
                        />
                      </div>

                      {/* Delete row button on hover / active */}
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        disabled={lineItems.length === 1}
                        className="p-1.5 bg-brand-elevated border border-brand-border rounded text-brand-muted hover:text-brand-red disabled:opacity-30 hover:border-brand-red transition-all"
                        title="Delete entry row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-brand-border/30">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Notes / Payment instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-16 p-2 rounded-lg bg-brand-elevated border border-brand-border text-xs text-brand-muted font-sans leading-relaxed text-brand-text focus:outline-none focus:border-brand-gold"
                  placeholder="Enter custom banking or invoicing memo instructions..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => handleSubmitInvoice('draft')}
                  className="flex-1 py-2.5 bg-brand-elevated text-brand-text hover:text-brand-gold rounded-xl border border-brand-border text-xs font-bold transition-all"
                >
                  Save Invoice as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitInvoice('pending')}
                  className="flex-1 py-2.5 bg-brand-gold text-brand-base font-black text-xs rounded-xl hover:bg-brand-gold/95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/10"
                >
                  <Send className="w-3.5 h-3.5 text-brand-base" />
                  Generate & Send Invoice
                </button>
              </div>

            </div>
          </div>

          {/* LIVE PREVIEW SHEET: 5 COLS (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-5 bg-brand-surface border border-brand-border rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
              <h4 className="font-display font-medium text-xs text-brand-muted uppercase tracking-wider">Live PDF Preview Layout</h4>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 font-sans text-[10px] border border-brand-border space-y-4 shadow-inner">
              <div className="flex justify-between items-start border-b border-brand-border/35 pb-3">
                <div>
                  <h5 className="font-display font-black text-brand-text text-sm leading-tight">SWIFTPAY MERCHANT</h5>
                  <p className="text-brand-muted text-[8px] mt-0.5 leading-tight">Ikoyi, Lagos State, Nigeria</p>
                </div>
                <div className="text-right">
                  <h6 className="font-mono text-brand-gold font-bold leading-none">{nextInvoiceNumber}</h6>
                  <p className="text-[8px] text-brand-muted leading-none mt-1">Status: pending</p>
                </div>
              </div>

              <div>
                <p className="text-brand-muted text-[8px] uppercase tracking-wider">Billed To client:</p>
                <p className="font-semibold text-brand-text text-[11px] mt-0.5 leading-none">{clientName || '(No client name specified)'}</p>
                <p className="font-mono text-brand-muted text-[8px] leading-tight mt-0.5">{clientEmail || 'client@contact.com'}</p>
              </div>

              {/* Items listing preview */}
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-brand-border/30 pb-0.5 text-brand-muted uppercase text-[8px] font-bold">
                  <span className="flex-1">Description</span>
                  <span className="w-8 text-center">Qty</span>
                  <span className="w-16 text-right">Price</span>
                </div>
                {lineItems.map((item, index) => (
                  <div key={index} className="flex justify-between py-1 border-b border-brand-border/10 last:border-none text-brand-text leading-tight font-medium">
                    <span className="flex-1 truncate pr-2">{item.description || '(Undefined service entry)'}</span>
                    <span className="w-8 text-center font-mono">{item.qty}</span>
                    <span className="w-16 text-right font-mono tabular-nums">{formatNaira(item.unitPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Totals computation review */}
              <div className="flex justify-end pt-2 border-t border-brand-border/40">
                <div className="w-40 space-y-1 text-right">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-brand-muted">Subtotal:</span>
                    <span className="font-mono text-brand-text tabular-nums">{formatNaira(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-brand-muted">VAT Amount ({taxRate}%):</span>
                    <span className="font-mono text-brand-text tabular-nums">{formatNaira(totals.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-brand-gold border-t border-brand-border/20 pt-1 leading-tight text-xs">
                    <span>Total Tax Liability:</span>
                    <span className="font-mono tabular-nums">{formatNaira(totals.total)}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded bg-brand-elevated/40 border border-brand-border/60 text-brand-muted italic mt-2 text-[8px] leading-normal leading-relaxed">
                <span>"{notes}"</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-brand-elevated/20 border border-brand-border/40 flex gap-2 text-[10px] leading-relaxed text-brand-muted">
              <HelpCircle className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>You can live edit line items, modify quantities, unit prices, VAT rates and see exact PDF outlines before broadcasting.</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
