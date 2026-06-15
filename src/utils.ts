import { Transaction } from './types';

export type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  NGN: 1.0,
  USD: 1 / 1500,
  EUR: 1 / 1600,
  GBP: 1 / 1900
};

/**
 * Formats an amount in kobo (base Naira) to target currency with proper formatting.
 */
export function formatCurrency(koboAmount: number, targetCurrency: CurrencyCode = 'NGN'): string {
  const convertedAmount = (koboAmount / 100) * EXCHANGE_RATES[targetCurrency];
  
  const localeMap: Record<CurrencyCode, string> = {
    NGN: 'en-NG',
    USD: 'en-US',
    EUR: 'en-IE',
    GBP: 'en-GB'
  };

  return new Intl.NumberFormat(localeMap[targetCurrency], {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
    .format(convertedAmount)
    .replace('NGN', '₦')
    .replace('₦ ', '₦'); // Remove spacing if any
}

/**
 * Strips formatting and returns numerical value for inputs
 */
export function parseNairaInput(val: string): number {
  const digits = val.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0; // Value is in units
}

/**
 * Simulates CSV export and downloads it to the browser.
 */
export function exportToCSV(transactions: Transaction[], filename = 'transactions-export.csv') {
  const headers = ['ID', 'Type', 'Party', 'Category', 'Account', 'Date', 'Reference', 'Narration', 'Amount (Naira)', 'Status', 'Bank'];
  
  const rows = transactions.map(t => [
    t.id,
    t.type,
    t.party,
    t.category,
    t.account,
    t.date,
    t.reference,
    t.narration,
    (t.amount / 100).toFixed(2),
    t.status,
    t.bank || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

