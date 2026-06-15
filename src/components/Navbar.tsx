import React, { useState } from 'react';
import { Bell, CreditCard, ChevronDown, User, Settings, LogOut, LayoutDashboard, Menu, X, Coins, History, Send, FileText, BarChart3 } from 'lucide-react';
import { CurrencyCode, CURRENCY_SYMBOLS } from '../utils';
import { AppUser } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: string[];
  clearNotifications: () => void;
  onSelectSubAccount: (acc: 'all' | 'main' | 'usd' | 'savings') => void;
  currency: CurrencyCode;
  onChangeCurrency: (currency: CurrencyCode) => void;
  user: AppUser;
  onSignOut: () => void;
  onShowModal: (title: string, content: React.ReactNode) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  notifications,
  clearNotifications,
  onSelectSubAccount,
  currency,
  onChangeCurrency,
  user,
  onSignOut,
  onShowModal
}: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'payments', label: 'Payments' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'cards', label: 'Cards' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <>
      {/* Desktop Top Navbar (Visible on lg and above) */}
      <nav className="hidden lg:block sticky top-0 z-40 bg-brand-surface border-b border-brand-border/60 text-brand-text">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('overview'); onSelectSubAccount('all'); }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-gold to-brand-green flex items-center justify-center shadow-lg shadow-brand-gold/10">
                <span className="font-display font-bold text-lg text-brand-base">S</span>
              </div>
              <div>
                <span className="font-display font-bold text-lg tracking-tight block">SWIFT<span className="text-brand-gold">PAY</span></span>
                <span className="text-[10px] text-brand-muted font-medium -mt-1 block tracking-wider font-mono">FX: {currency}</span>
              </div>
            </div>

            {/* Desktop Nav Links */}
            <div className="flex space-x-1 lg:space-x-4 h-full items-center">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'overview') {
                      onSelectSubAccount('all');
                    }
                  }}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors h-16 flex items-center ${
                    activeTab === item.id 
                      ? 'text-brand-gold' 
                      : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {item.label}
                  {activeTab === item.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Global Currency Switcher */}
              <div className="flex items-center gap-1.5 bg-brand-elevated/45 border border-brand-border rounded-xl px-2.5 py-1.5 focus-within:border-brand-gold/80 transition-colors">
                <Coins className="w-3.5 h-3.5 text-brand-gold" />
                <select
                  id="currency-selector"
                  value={currency}
                  onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
                  className="bg-transparent text-xs font-bold text-brand-text border-none p-0 pr-1 focus:outline-none focus:ring-0 cursor-pointer uppercase font-sans"
                >
                  <option value="NGN" className="bg-brand-surface text-brand-text">NGN (₦)</option>
                  <option value="USD" className="bg-brand-surface text-brand-text">USD ($)</option>
                  <option value="EUR" className="bg-brand-surface text-brand-text">EUR (€)</option>
                  <option value="GBP" className="bg-brand-surface text-brand-text">GBP (£)</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  id="noti-bell"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-elevated transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                  )}
                </button>

                {/* Notification Box */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-brand-surface border border-brand-border rounded-xl shadow-xl z-50 py-2">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-brand-border/60">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Recent alerts</span>
                      {notifications.length > 0 && (
                        <button 
                          onClick={clearNotifications}
                          className="text-[10px] text-brand-gold hover:underline font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto mt-2">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-brand-muted">No new notifications</div>
                      ) : (
                        notifications.map((notif, index) => (
                          <div key={index} className="px-4 py-2.5 border-b border-brand-border/30 last:border-none text-xs leading-relaxed text-brand-text/90 hover:bg-brand-elevated/45 transition-colors">
                            {notif}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar & Dropdown */}
              <div className="relative">
                <button
                  id="profile-dropdown"
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 px-2 rounded-lg hover:bg-brand-elevated transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-elevated border border-brand-gold/30 flex items-center justify-center font-bold text-xs text-brand-gold">
                    {user.avatarInitials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-none">{user.name}</p>
                    <p className="text-[10px] text-brand-muted leading-none mt-1">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-brand-muted" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-brand-surface border border-brand-border rounded-xl shadow-xl z-50 py-1">
                    <div className="p-3 border-b border-brand-border/60">
                      <p className="text-xs font-medium text-brand-muted">Signed in as</p>
                      <p className="text-xs font-semibold truncate text-brand-text">{user.email}</p>
                    </div>
                    {/* My Profile */}
                    <button 
                      onClick={() => { 
                        setShowProfileMenu(false); 
                        onShowModal(
                          "Merchant Profile Protocol",
                          <div className="space-y-4 text-xs text-brand-text">
                            <div className="flex items-center gap-3 pb-3 border-b border-brand-border/40">
                              <div className="w-12 h-12 bg-brand-elevated border border-brand-gold/40 rounded-full flex items-center justify-center font-bold text-sm text-brand-gold">
                                {user.avatarInitials}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-brand-text">{user.name}</h4>
                                <p className="text-brand-muted text-[10px]">{user.role}</p>
                              </div>
                            </div>
                            <div className="space-y-2.5">
                              <div className="flex justify-between py-1 border-b border-brand-border/20">
                                <span className="text-brand-muted font-medium">Corporate Entity:</span>
                                <span className="font-bold text-brand-text text-right">{user.companyName}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-brand-border/20">
                                <span className="text-brand-muted font-medium">Registered Email:</span>
                                <span className="font-mono text-brand-text text-right">{user.email}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-brand-border/20">
                                <span className="text-brand-muted font-medium">Compliance Tier:</span>
                                <span className="font-bold text-brand-green flex items-center gap-1 text-right">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green" /> Tier 3 Verified
                                </span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-brand-border/20">
                                <span className="text-brand-muted font-medium">Liaison Jurisdiction:</span>
                                <span className="text-brand-text text-right">Lagos, Nigeria</span>
                              </div>
                              <div className="flex justify-between py-1">
                                <span className="text-brand-muted font-medium">Corporate RC Number:</span>
                                <span className="font-mono text-brand-text text-right font-bold">RC-7930129</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-brand-text hover:bg-brand-elevated transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-brand-muted" /> My Profile
                    </button>

                    {/* Settings */}
                    <button 
                      onClick={() => { 
                        setShowProfileMenu(false); 
                        // Render custom Settings configuration component
                        onShowModal(
                          "Sandbox Configurations",
                          <SettingsModalFields user={user} currency={currency} />
                        ); 
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-brand-text hover:bg-brand-elevated transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-brand-muted" /> Settings
                    </button>
                    <button 
                      onClick={() => { setShowProfileMenu(false); onSignOut(); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-brand-red hover:bg-brand-elevated transition-colors text-left border-t border-brand-border/30"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header (Visible on < lg screens) */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#09090B] border-b border-brand-border/40 text-brand-text h-14 flex items-center px-4 justify-between">
        {/* Left Small Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab('overview'); onSelectSubAccount('all'); }}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-gold to-brand-green flex items-center justify-center shadow-md">
            <span className="font-display font-black text-sm text-brand-base">S</span>
          </div>
          <span className="font-display font-medium text-sm tracking-tight">SWIFT<span className="text-brand-gold font-bold">PAY</span></span>
        </div>

        {/* Center: Empty */}
        <div className="flex-grow"></div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Global Currency Selector icon representation */}
          <div className="flex items-center gap-1 bg-brand-elevated/45 border border-brand-border rounded-lg px-2 h-8">
            <Coins className="w-3.5 h-3.5 text-brand-gold" />
            <select
              id="currency-selector-mobile"
              value={currency}
              onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
              className="bg-[#09090B] text-[10px] font-bold text-brand-text border-none p-0 pr-1 focus:outline-none focus:ring-0 cursor-pointer uppercase font-sans"
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          {/* Mobile Notifications Button */}
          <div className="relative">
            <button
              id="noti-bell-mobile"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-elevated transition-colors relative h-8 w-8 flex items-center justify-center"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
              )}
            </button>

            {/* Notification Box */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-brand-surface border border-brand-border rounded-xl shadow-xl z-50 py-2">
                <div className="flex items-center justify-between px-3 pb-2 border-b border-brand-border/60">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">Recent alerts</span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearNotifications}
                      className="text-[10px] text-brand-gold hover:underline font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto mt-2">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-center text-xs text-brand-muted">No new notifications</div>
                  ) : (
                    notifications.map((notif, index) => (
                      <div key={index} className="px-3 py-2 border-b border-brand-border/30 last:border-none text-[11px] leading-relaxed text-brand-text/90 hover:bg-brand-elevated/45 transition-colors">
                        {notif}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Trigger */}
          <div className="relative">
            <button
              id="profile-dropdown-mobile"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="w-9 h-9 rounded-full bg-brand-elevated border border-brand-gold/20 flex items-center justify-center font-bold text-xs text-brand-gold"
            >
              {user.avatarInitials}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-brand-surface border border-brand-border rounded-xl shadow-xl z-50 py-1">
                <div className="p-3 border-b border-brand-border/60">
                  <p className="text-xs font-medium text-brand-muted">Signed in as</p>
                  <p className="text-[11px] font-semibold truncate text-brand-text">{user.email}</p>
                </div>
                <button 
                  onClick={() => { 
                    setShowProfileMenu(false); 
                    onShowModal(
                      "Merchant Profile Protocol",
                      <div className="space-y-4 text-xs text-brand-text">
                        <div className="flex items-center gap-3 pb-3 border-b border-brand-border/40">
                          <div className="w-12 h-12 bg-brand-elevated border border-brand-gold/40 rounded-full flex items-center justify-center font-bold text-sm text-brand-gold">
                            {user.avatarInitials}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-brand-text">{user.name}</h4>
                            <p className="text-brand-muted text-[10px]">{user.role}</p>
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex justify-between py-1 border-b border-brand-border/20">
                            <span className="text-brand-muted font-medium">Corporate:</span>
                            <span className="font-bold text-brand-text">{user.companyName}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-brand-border/20">
                            <span className="text-brand-muted font-medium">Clearance:</span>
                            <span className="font-bold text-brand-green flex items-center gap-1">Tier 3 Verified</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-brand-text hover:bg-brand-elevated transition-colors text-left"
                >
                  <User className="w-4 h-4 text-brand-muted" /> My Profile
                </button>
                <button 
                  onClick={() => { 
                    setShowProfileMenu(false); 
                    onShowModal(
                      "Sandbox Configurations",
                      <SettingsModalFields user={user} currency={currency} />
                    ); 
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-brand-text hover:bg-brand-elevated transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-brand-muted" /> Settings
                </button>
                <button 
                  onClick={() => { setShowProfileMenu(false); onSignOut(); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-brand-red hover:bg-brand-elevated transition-colors text-left border-t border-brand-border/30"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Visible on < lg screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#18181B] border-t border-[#3F3F46] flex justify-around items-center z-40 pb-[env(safe-area-inset-bottom)] h-16">
        {navItems.map((item) => {
          let IconComp;
          if (item.id === 'overview') IconComp = LayoutDashboard;
          else if (item.id === 'transactions') IconComp = History;
          else if (item.id === 'payments') IconComp = Send;
          else if (item.id === 'invoices') IconComp = FileText;
          else if (item.id === 'cards') IconComp = CreditCard;
          else IconComp = BarChart3;

          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'overview') {
                  onSelectSubAccount('all');
                }
              }}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center"
            >
              <IconComp className={`w-5 h-5 mb-0.5 ${isActive ? 'text-brand-gold fill-brand-gold/10' : 'text-brand-muted'}`} />
              <span className={`text-[9px] font-medium tracking-tight ${isActive ? 'text-brand-gold font-bold' : 'text-brand-muted'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function SettingsModalFields({ user, currency }: { user: AppUser; currency: string }) {
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [autopayEnabled, setAutopayEnabled] = useState(true);
  const [dailyCap, setDailyCap] = useState("₦5,000,000");

  return (
    <div className="space-y-4 text-xs text-brand-text">
      <div className="space-y-1.5 pb-2.5 border-b border-brand-border/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-brand-text text-[10px] uppercase tracking-wider">Apex Sandbox Authorization</p>
            <p className="text-[10px] text-brand-muted">Authorize third-party ERP channels via API keys</p>
          </div>
          <span className="px-1.5 py-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded text-[9px] font-black uppercase font-mono tracking-wider">sandbox active</span>
        </div>
        <div className="bg-brand-elevated/40 border border-brand-border p-2.5 rounded-lg flex items-center justify-between mt-1.5">
          <code className="font-mono text-[9px] text-brand-muted truncate max-w-[220px]">
            {apiKeyRevealed ? 'sk_sandbox_swiftpay_9023_8x8b_29a1' : 'sk_sandbox_••••••••••••••••••••••••'}
          </code>
          <button
            type="button"
            onClick={() => setApiKeyRevealed(!apiKeyRevealed)}
            className="text-[10px] text-brand-gold font-bold hover:underline select-none ml-2 shrink-0"
          >
            {apiKeyRevealed ? 'Hide' : 'Reveal'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="font-bold text-brand-text text-[10px] uppercase tracking-wider">Gateway Configuration</p>
        
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-semibold text-brand-text">Corporate Tax Shield (VAT)</p>
            <p className="text-[10px] text-brand-muted">Auto-audit 7.5% federal VAT liability on incoming invoices</p>
          </div>
          <span className="font-bold text-brand-text text-right">7.5% Active</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-semibold text-brand-text">Autopay Settlement Limits</p>
            <p className="text-[10px] text-brand-muted font-medium">Bypass manual dual-signature authorization for pre-approved payouts</p>
          </div>
          <button
            type="button"
            onClick={() => setAutopayEnabled(!autopayEnabled)}
            className={`w-8 h-4 rounded-full relative transition-colors duration-200 shrink-0 ${autopayEnabled ? 'bg-brand-green' : 'bg-brand-elevated'}`}
          >
            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-brand-surface transition-all duration-200 ${autopayEnabled ? 'left-4.5' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="space-y-1.5 py-1">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-brand-text">Maximum Daily Outflow Floor</span>
            <span className="font-mono font-bold text-brand-gold">{dailyCap}</span>
          </div>
          <input
            type="range"
            min="1000000"
            max="20000000"
            step="1000000"
            value={parseInt(dailyCap.replace(/[^\d]/g, ''), 10)}
            onChange={(e) => setDailyCap("₦" + Number(e.target.value).toLocaleString())}
            className="w-full accent-brand-gold h-1 bg-brand-elevated rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
