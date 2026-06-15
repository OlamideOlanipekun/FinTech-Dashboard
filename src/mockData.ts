import { Transaction, Invoice, Card, Beneficiary } from './types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// List of Nigerian Banks
export const NIGERIAN_BANKS = [
  'Access Bank PLC',
  'Guaranty Trust Bank (GTB)',
  'Zenith Bank PLC',
  'United Bank for Africa (UBA)',
  'First Bank of Nigeria',
  'Wema Bank',
  'Kuda Microfinance Bank',
  'Sterling Bank',
  'Union Bank',
  'Fidelity Bank'
];

// List of sample verified accounts for Nigerian Banks (mock account resolution)
export const VERIFIED_ACCOUNTS: Record<string, string> = {
  '0123456789': 'Aliko Dangote Logistics',
  '2048591823': 'Chioma Chloe Enterprises',
  '1122334455': 'TechStars Africa Hub',
  '5566778899': 'Oluwaseun Farms Ltd',
  '9876543210': 'Funmi Agribusiness',
  '3012019482': 'Aina Consulting Services',
  '4928173461': 'Yoruba Foods Co.',
  '1234567890': 'Tunde Balogun Freelance'
};

// 8 Saved Beneficiaries
export const MOCK_BENEFICIARIES: Beneficiary[] = [
  { id: 'b1', name: 'Chioma Chloe Enterprises', accountNumber: '2048591823', bank: 'Access Bank PLC', initials: 'CC' },
  { id: 'b2', name: 'TechStars Africa Hub', accountNumber: '1122334455', bank: 'Guaranty Trust Bank (GTB)', initials: 'TA' },
  { id: 'b3', name: 'Oluwaseun Farms Ltd', accountNumber: '5566778899', bank: 'Zenith Bank PLC', initials: 'OF' },
  { id: 'b4', name: 'Funmi Agribusiness', accountNumber: '9876543210', bank: 'United Bank for Africa (UBA)', initials: 'FA' },
  { id: 'b5', name: 'Aina Consulting Services', accountNumber: '3012019482', bank: 'First Bank of Nigeria', initials: 'AC' },
  { id: 'b6', name: 'Yoruba Foods Co.', accountNumber: '4928173461', bank: 'Wema Bank', initials: 'YF' },
  { id: 'b7', name: 'Tunde Balogun Freelance', accountNumber: '1234567890', bank: 'Kuda Microfinance Bank', initials: 'TB' },
  { id: 'b8', name: 'Ahmadu & Sons Logistics', accountNumber: '8877665544', bank: 'Sterling Bank', initials: 'AS' },
];

// Categories
export const SPENDING_CATEGORIES = [
  { name: 'Operations', icon: 'Briefcase', color: '#3B82F6' },
  { name: 'Salaries', icon: 'Users', color: '#10B981' },
  { name: 'Marketing', icon: 'Megaphone', color: '#EC4899' },
  { name: 'Software', icon: 'Code', color: '#8B5CF6' },
  { name: 'Travel', icon: 'Plane', color: '#F59E0B' },
  { name: 'Tax', icon: 'FileText', color: '#EF4444' }
];

// Helper to format date relative to today (Jun 15, 2026)
function getOffsetDateString(daysOffset: number): string {
  // Today is Jun 15, 2026
  const date = new Date(2026, 5, 15); // Month is 0-indexed (5 = June)
  date.setDate(date.getDate() - daysOffset);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Generate 100 Transactions with deterministic dates and values
const partiesAndDetails: {
  party: string;
  category: string;
  type: 'credit' | 'debit';
  narration: string;
}[] = [
  { party: 'Paystack Payout', category: 'Operations', type: 'credit', narration: 'Weekly sales disbursement' },
  { party: 'Flutterwave Payout', category: 'Operations', type: 'credit', narration: 'Web store sales payout' },
  { party: 'AWS EMEA Cloud', category: 'Software', type: 'debit', narration: 'Monthly cloud hosting servers' },
  { party: 'Google Workspace', category: 'Software', type: 'debit', narration: 'Email and productivity seats' },
  { party: 'Bolt Rides Nigeria', category: 'Travel', type: 'debit', narration: 'Local transport for sales team' },
  { party: 'Ikeja Electric', category: 'Operations', type: 'debit', narration: 'Office utility electricity bill' },
  { party: 'FIRS Tax Payment', category: 'Tax', type: 'debit', narration: 'VAT filing Q1 2026' },
  { party: 'Interswitch Ltd', category: 'Operations', type: 'debit', narration: 'POS terminal leasing fee' },
  { party: 'MTN Business Subs', category: 'Operations', type: 'debit', narration: 'Internet fiber subscription' },
  { party: 'Office Space Rental', category: 'Operations', type: 'debit', narration: 'Monthly co-working space rental' },
  { party: 'Chioma Chloe (Contractor)', category: 'Salaries', type: 'debit', narration: 'Bi-weekly design consultancy contract' },
  { party: 'Tunde Balogun (Dev)', category: 'Salaries', type: 'debit', narration: 'Development team stipend' },
  { party: 'Facebook Ads (Meta)', category: 'Marketing', type: 'debit', narration: 'SME growth campaign June' },
  { party: 'Mailchimp Email', category: 'Marketing', type: 'debit', narration: 'Marketing automation newsletters' },
  { party: 'Figma Pro Team', category: 'Software', type: 'debit', narration: 'Product prototype workspace' },
  { party: 'Piggyvest Interest', category: 'Operations', type: 'credit', narration: 'Matured treasury bills interest' },
  { party: 'Oluwaseun Farms Ltd', category: 'Operations', type: 'debit', narration: 'Supply chain raw materials' },
  { party: 'Sales Invoice #308', category: 'Operations', type: 'credit', narration: 'Invoiced client payment' },
  { party: 'Chevron Supplier Corp', category: 'Operations', type: 'credit', narration: 'Vendor project milestone deposit' },
  { party: 'Verve Security Fees', category: 'Operations', type: 'debit', narration: 'Card validation standard fee' },
];

export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];

  // Seed with some fixed realistic transactions first
  // E.g. Today's net cashflow changes
  transactions.push({
    id: 'tx-today-1',
    type: 'credit',
    party: 'Chevron Supplier Corp',
    category: 'Operations',
    account: 'main',
    date: '2026-06-15',
    reference: 'REF-TX-88391-239',
    narration: 'Vendor project milestone deposit',
    amount: 32000000, // 320,000.00 Naira
    status: 'completed'
  });

  transactions.push({
    id: 'tx-today-2',
    type: 'debit',
    party: 'AWS EMEA Cloud',
    category: 'Software',
    account: 'main',
    date: '2026-06-15',
    reference: 'REF-TX-42847-190',
    narration: 'Monthly cloud hosting servers',
    amount: 8000000, // 80,000.00 Naira
    status: 'completed'
  });

  // 100 Transactions total
  // Loop to generate 98 more across different dates
  for (let i = 1; i <= 98; i++) {
    // Distribute date over the last 35 days
    // Ensure days are balanced
    const daysOffset = Math.floor(i / 2.8); 
    const dateStr = getOffsetDateString(daysOffset);
    
    // Choose profile randomly
    const profile = partiesAndDetails[i % partiesAndDetails.length];
    
    // Distribute among accounts: 70% main, 20% usd, 10% savings
    let account: 'main' | 'usd' | 'savings' = 'main';
    const randAcc = i % 10;
    if (randAcc === 7 || randAcc === 8) {
      account = 'usd';
    } else if (randAcc === 9) {
      account = 'savings';
    }

    // Set statuses: mainly completed. Let's make some pending, failed, or reversed
    let status: 'completed' | 'pending' | 'failed' | 'reversed' = 'completed';
    if (i === 15 || i === 44) {
      status = 'failed'; // We want standard failed ones
    } else if (i === 9 || i === 31) {
      status = 'pending';
    } else if (i === 62) {
      status = 'reversed';
    }

    // Amounts in kobo (NGN)
    // Range: from 5,000 to 450,000 Naira (500,000 to 45,000,000 kobo)
    let amountKobo = Math.floor((Math.sin(i) * 200000 + 250000) * 10);
    if (profile.type === 'credit') {
      amountKobo = Math.floor((Math.cos(i) * 300000 + 400000) * 10);
    }
    // Prevent negative numbers
    amountKobo = Math.max(8500 * 100, amountKobo); 

    transactions.push({
      id: `tx-gen-${i}`,
      type: profile.type,
      party: profile.party,
      category: profile.category,
      account,
      date: dateStr,
      reference: `REF-TX-${10000 + i}-${Math.floor(Math.sin(i) * 899 + 100)}`,
      narration: `${profile.narration} #${100 + i}`,
      amount: amountKobo,
      status,
      bank: i % 3 === 0 ? NIGERIAN_BANKS[i % NIGERIAN_BANKS.length] : undefined
    });
  }

  // Soft sort by date desc, then by id desc
  return transactions.sort((a, b) => {
    if (b.date !== a.date) {
      return b.date.localeCompare(a.date);
    }
    return b.id.localeCompare(a.id);
  });
};

// Generate 15 Invoices
export const generateMockInvoices = (): Invoice[] => {
  const clients = [
    { name: 'Oando Fuel Retailers', email: 'billing@oando.com' },
    { name: 'Chima Foods Market', email: 'chima@chimafoods.com' },
    { name: 'Konga Web Services', email: 'finance@konga.com.ng' },
    { name: 'Nestoil Logistics', email: 'procurement@nestoil.com' },
    { name: 'Spark Digital West Africa', email: 'hello@sparkagency.ng' },
    { name: 'Ariel Textiles PLC', email: 'ariel.textiles@gmail.com' },
    { name: 'Lagos Creative Agency', email: 'accounts@lagoscreative.co' },
  ];

  const itemsPool = [
    { description: 'Corporate Strategy Consultation', unitPrice: 25000000 }, // 250,000 Naira
    { description: 'Cloud Backup Infrastructure Setup', unitPrice: 18000000 }, // 180,000 Naira
    { description: 'Logistics Operations Training Program', unitPrice: 9500000 },  // 95,000 Naira
    { description: 'Custom software API Integration (V3)', unitPrice: 42000000 },  // 420,000 Naira
    { description: 'Staff Workstations Optimization SLA', unitPrice: 5000000 },   // 50,000 Naira
    { description: 'Social Media Banner Design Suite', unitPrice: 3500000 },    // 35,000 Naira
    { description: 'Enterprise Cybersecurity Assessment', unitPrice: 75000000 },  // 750,000 Naira
  ];

  const invoices: Invoice[] = [];

  // Generate 15 invoices
  for (let i = 1; i <= 15; i++) {
    const client = clients[i % clients.length];
    
    // Setup issue date and due date
    const issueDaysOffset = i * 2;
    const issueDateStr = getOffsetDateString(issueDaysOffset);
    // Due 14 days later
    const issueDate = new Date(2026, 5, 15);
    issueDate.setDate(issueDate.getDate() - issueDaysOffset + 14);
    
    const dY = issueDate.getFullYear();
    const dM = String(issueDate.getMonth() + 1).padStart(2, '0');
    const dD = String(issueDate.getDate()).padStart(2, '0');
    const dueDateStr = `${dY}-${dM}-${dD}`;

    // Item count: 1 to 3 items
    const itemCount = (i % 3) + 1;
    const items = [];
    for (let k = 0; k < itemCount; k++) {
      const pItem = itemsPool[(i + k) % itemsPool.length];
      items.push({
        description: pItem.description,
        qty: (i % 2) + 1,
        unitPrice: pItem.unitPrice
      });
    }

    // Status mapping: Paid, Pending, Overdue, Draft
    let status: 'paid' | 'pending' | 'overdue' | 'draft' = 'pending';
    if (i === 1 || i === 4 || i === 8 || i === 12) {
      status = 'paid';
    } else if (i === 3 || i === 9) {
      status = 'overdue';
    } else if (i === 6 || i === 15) {
      status = 'draft';
    }

    invoices.push({
      id: `inv-${100 + i}`,
      number: `INV-2026-${String(i).padStart(3, '0')}`,
      client,
      issueDate: issueDateStr,
      dueDate: dueDateStr,
      items,
      taxRate: i % 2 === 0 ? 7.5 : 0,
      status,
      notes: `Payment should be made within 14 days of issue to ensure continued service. Thank you for doing business with us!`
    });
  }

  return invoices;
};

// Initial Mock Cards
export const INITIAL_CARDS: Card[] = [
  {
    id: 'card-1',
    type: 'virtual',
    label: 'USD Marketing Card',
    number: '4112884920194832',
    expiry: '11/29',
    cvv: '583',
    cardholderName: 'OLAMIDE OLANIPEKUN',
    brand: 'visa',
    frozen: false,
    spendingLimit: 250000000 // 2.5 million Naira
  },
  {
    id: 'card-2',
    type: 'virtual',
    label: 'Corporate Expense Card',
    number: '5520193847291048',
    expiry: '04/28',
    cvv: '291',
    cardholderName: 'OLAMIDE OLANIPEKUN',
    brand: 'mastercard',
    frozen: true,
    spendingLimit: 120000000 // 1.2 million Naira
  },
  {
    id: 'card-3',
    type: 'physical',
    label: 'Main Business Fuel Card',
    number: '5061928374928172',
    expiry: '08/30',
    cvv: '902',
    cardholderName: 'OLAMIDE OLANIPEKUN',
    brand: 'verve',
    frozen: false,
    spendingLimit: 50000000 // 500,000 Naira
  }
];
