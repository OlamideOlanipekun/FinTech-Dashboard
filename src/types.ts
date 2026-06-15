export type Transaction = {
  id: string;
  type: 'credit' | 'debit';
  party: string;
  category: string;
  account: 'main' | 'usd' | 'savings';
  date: string; // YYYY-MM-DD
  reference: string;
  narration: string;
  amount: number; // in NGN kobo (amount * 100 for NGN Naira equivalent)
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  bank?: string;
};

export type InvoiceItem = {
  description: string;
  qty: number;
  unitPrice: number; // in NGN kobo
};

export type Invoice = {
  id: string;
  number: string; // INV-2026-001
  client: { name: string; email: string };
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number; // 0 or 7.5
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  notes: string;
};

export type Card = {
  id: string;
  type: 'virtual' | 'physical';
  label: string;
  number: string;
  expiry: string;
  cvv: string;
  cardholderName: string;
  brand: 'visa' | 'mastercard' | 'verve';
  frozen: boolean;
  spendingLimit: number; // in NGN kobo
};

export type Beneficiary = {
  id: string;
  name: string;
  accountNumber: string;
  bank: string;
  initials: string;
};

export interface AppUser {
  name: string;
  email: string;
  companyName: string;
  role: string;
  avatarInitials: string;
}

