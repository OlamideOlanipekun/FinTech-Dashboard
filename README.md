# 💳 FinTech Dashboard

A high-performance and beautifully responsive Corporate Treasury, Personal Finance, and Business Operations Suite designed specifically for African SMEs, freelancers, and independent builders.

The application combines deep financial transparency, comprehensive cash-flow ledger analytics, digital card issuing, dynamic client invoicing, and outbound wire settlements under an elegant, luxurious dark interface optimized for all modern viewports.

---

## ✨ Features and Modules

### 📉 1. Cashflow Operations (`OverviewTab.tsx`)
*   **Balance & Sub-accounts**: Integrated Sparkline charts demonstrating historical asset trajectories. Track aggregated reserves across Main balance, USD Safe, and Savings vaults.
*   **Fluid Quick Actions**: High-speed payment triggers ("Send Money" & "Add Funds") equipped with full inline numeric validations and 3D overlay windows.
*   **Touch-Responsive Charting**: Multi-axis Area Charts graphing incoming revenue against outbound bills with direct drag/tap action banners for mobile screens.

### 📝 2. Comprehensive Ledger (`TransactionsTab.tsx`)
*   **Multi-View Serialization**: Full tabular interface for power desktop displays, which automatically transforms into a compact, beautiful card stack format on touch viewports.
*   **Granular Filters**: Live, instantaneous ledger filtering based on transaction types (credit vs. debit), wallets (All, Main, USD, Savings), status codes, and search queries.
*   **Receipt Details**: Informative drawer sheet that breaks down fee summaries, currency exchange rates, official reference hashes, and status logs.

### 🏦 3. Local/International Settlements (`PaymentsTab.tsx`)
*   **Instant Electronic Wire Forms**: Multi-bank account wire forms tracking target account numbers, bank codes, and reference parameters.
*   **Automated Verification**: Dynamic mock verification displaying custom security codes and animated status feedback representing bank infrastructure.
*   **Pre-negotiated Exchange Rate Widgets**: Calculates live currency values inside form layouts smoothly.

### 📑 4. Interactive Invoicing & PDF Preview (`InvoicesTab.tsx`)
*   **Flexible Bill Builder**: Configure items, tax modifiers, client tags (e.g., name, business, and email addresses), and currency references effortlessly.
*   **Live Preview Canvas**: Real-time rendering of a compiled professional PDF invoice document, showing layout components synchronously with builder inputs.
*   **Action Hub**: Features to mark invoices as Paid, send automatic reminder alerts, or delete drafted sheets directly.

### 💳 5. Expense Cards Hub (`CardsTab.tsx`)
*   **Dynamic Card Deck**: Visualizes virtual corporate credit and debit cards, featuring physical layout replicas, card network branding, and status locks.
*   **Security Controls**: Interactive toggle configurations to reveal CVV numbers, flip cards dynamically, freeze active items, or calibrate daily spending limits.
*   **Corporate Card Issuing**: Live drawer form to instantly order and brand custom employee cards customized by name, currency, limit, and unique physical styles.

### 📊 6. Analytics & Exports Hub (`ReportsTab.tsx`)
*   **Advanced Recharts Integration**: Elegant data graphs visualizing fiscal summaries (Inflow vs. Outflow bars, net profits margins, and projected tax dues).
*   **Tax Auditing Widgets**: Estimated tax liabilities projected ahead of Q2 fiscal year settlements.
*   **Consolidated Logs Export**: Interactive compiler modal exporting raw data structures instantly to standard format templates (Microsoft Excel CSV, Structured JSON, and Portable PDF documents).

---

## 🎨 Visual Identity & Style System

The suite adopts an elegant, premium **Cosmic Slate Theme** structured entirely on the modern Tailwind framework:

*   **Dark Modern Canvas**: Pure off-black and charcoal backgrounds (`bg-brand-surface`) using luxurious negative space to eliminate visual clutter.
*   **Gilded Accents**: Primary interactive highlights powered by rich golden tones (`text-brand-gold`, `bg-brand-gold`), representing premium finance tools.
*   **High-contrast Status Colors**:
    *   **Inflow Success**: Vibrating emerald greens representing positive asset movements (`text-brand-green`).
    *   **Expense Trajectories**: Energetic crimson red indicating outbound corporate expenditure (`text-[#EF4444]`).
*   **Refinement Typography**: Inter (sans-serif) for high-frequency operations, Space Grotesk for prominent metrics and brand highlights, and JetBrains Mono for transactional ledger dates, IDs, and financial figures.

---

## 🚀 Building & Testing

### Development Server
Run the local Vite compilation system linked to port `3000`:
```bash
npm run dev
```

### Static Build Creation
Bundles React structure efficiently for production:
```bash
npm run build
```

### Type Checking & Linting
Validate codebase constraints using standard type compiles:
```bash
npm run lint
```
