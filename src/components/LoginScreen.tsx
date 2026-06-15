import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Shield, Eye, EyeOff, Building, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppUser } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: AppUser) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('SME Owner');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Default credentials for testing
  const handleQuickLogin = (roleType: 'owner' | 'finance') => {
    setError('');
    if (roleType === 'owner') {
      setEmail('olamide@goldsmith.ng');
      setPassword('secure123');
      setName('Olamide Olan.');
      setCompanyName('Goldsmith SME');
      setRole('SME Owner');
    } else {
      setEmail('chioma@finops.ng');
      setPassword('secure123');
      setName('Chioma Alao');
      setCompanyName('Swift Tech Ops');
      setRole('Finance Manager');
    }
  };

  const validatePassword = (pass: string) => {
    return pass.length >= 6;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate 1.2s API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      if (isLogin) {
        // Simple mock authentication check
        // We first load local custom registered users
        const registeredUsersStr = localStorage.getItem('swiftpay_registered_users');
        const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];

        // Preload default users
        const defaultUsers = [
          { email: 'olamide@goldsmith.ng', password: 'secure123', name: 'Olamide Olan.', companyName: 'Goldsmith SME', role: 'SME Owner' },
          { email: 'chioma@finops.ng', password: 'secure123', name: 'Chioma Alao', companyName: 'Swift Tech Ops', role: 'Finance Manager' },
          { email: 'admin@swiftpay.com', password: 'admin123', name: 'Admin Administrator', companyName: 'SwiftPay Corporate', role: 'Global Admin' }
        ];

        const allUsers = [...registeredUsers, ...defaultUsers];
        const matched = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (matched) {
          const initials = matched.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

          const loggedInUser: AppUser = {
            name: matched.name,
            email: matched.email,
            companyName: matched.companyName,
            role: matched.role,
            avatarInitials: initials || 'SP'
          };

          onLoginSuccess(loggedInUser);
        } else {
          setError('Invalid email or password. Please verify credentials or try Quick Fill links below.');
        }
      } else {
        // Sign Up
        if (!email || !password || !name || !companyName) {
          setError('Please fill in all requested fields.');
          setLoading(false);
          return;
        }

        if (!validatePassword(password)) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        // Save to localStorage
        const registeredUsersStr = localStorage.getItem('swiftpay_registered_users');
        const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];

        // Check duplicates
        const duplicated = registeredUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase()) || 
                           ['olamide@goldsmith.ng', 'chioma@finops.ng', 'admin@swiftpay.com'].includes(email.toLowerCase());

        if (duplicated) {
          setError('A merchant account with this email address already exists.');
          setLoading(false);
          return;
        }

        const newUserObj = {
          name,
          email,
          password,
          companyName,
          role
        };

        registeredUsers.push(newUserObj);
        localStorage.setItem('swiftpay_registered_users', JSON.stringify(registeredUsers));

        // Auto login newly registered user
        const initials = name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);

        const loggedInUser: AppUser = {
          name,
          email,
          companyName,
          role,
          avatarInitials: initials || 'SP'
        };

        onLoginSuccess(loggedInUser);
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRecoverySent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-base flex items-center justify-center p-4 selection:bg-brand-gold/30">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,163,89,0.04),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(34,197,94,0.03),transparent_50% pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-gold to-brand-green flex items-center justify-center shadow-xl shadow-brand-gold/10 mx-auto mb-4"
          >
            <Shield className="w-7 h-7 text-brand-base" />
          </motion.div>
          <h1 className="font-display font-black text-2xl tracking-tight text-brand-text">
            SWIFT<span className="text-brand-gold">PAY</span> AFRICA
          </h1>
          <p className="text-xs text-brand-muted mt-1 uppercase tracking-wider font-mono">
            SECURE MERCHANT PORTAL
          </p>
        </div>

        {/* Auth Box Container */}
        <div className="bg-brand-surface border border-brand-border/60 rounded-2xl shadow-2xl p-6.5 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-gold/40 via-brand-green/30 to-brand-gold/40" />

          <AnimatePresence mode="wait">
            {forgotPassword ? (
              // FORGOT PASSWORD SCREEN
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-lg font-bold text-brand-text">Verify Identity</h2>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    Provide your register corporate email address to receive password self-recovery instructions.
                  </p>
                </div>

                {recoverySent ? (
                  <div className="bg-brand-elevated/40 border border-brand-green/30 rounded-xl p-4 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-brand-green mx-auto" />
                    <p className="text-xs text-brand-text font-semibold">Security Link Dispatched</p>
                    <p className="text-[11px] text-brand-muted leading-relaxed">
                      We have sent an authentication protocol to <span className="text-brand-gold font-mono">{recoveryEmail}</span>. Please verify your spam box if not received in 3 minutes.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPassword(false);
                        setRecoverySent(false);
                        setRecoveryEmail('');
                      }}
                      className="text-xs text-brand-gold font-bold hover:underline"
                    >
                      Return to authentication panel
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-brand-muted">Corporate Email</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-brand-muted"><Mail className="w-4 h-4" /></span>
                        <input
                          type="email"
                          required
                          placeholder="ceo@yourcompany.com"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-semibold font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-brand-base font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-brand-gold/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? 'Transmitting Identity...' : 'Dispatch Reset Link'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setForgotPassword(false)}
                        className="text-xs text-brand-muted hover:text-brand-text font-bold transition-colors"
                      >
                        Never mind, remember password
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            ) : (
              // LOGIN & SIGNUP SCREEN
              <motion.div
                key="auth-fields"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <div className="flex border-b border-brand-border/40 pb-2 mb-2">
                    <button
                      onClick={() => { setIsLogin(true); setError(''); }}
                      className={`flex-1 py-1 text-xs font-extrabold uppercase tracking-widest text-center transition-colors ${
                        isLogin ? 'text-brand-gold border-b-2 border-brand-gold pb-[6px]' : 'text-brand-muted hover:text-brand-text'
                      }`}
                    >
                      Corporate Sign In
                    </button>
                    <button
                      onClick={() => { setIsLogin(false); setError(''); }}
                      className={`flex-1 py-1 text-xs font-extrabold uppercase tracking-widest text-center transition-colors ${
                        !isLogin ? 'text-brand-gold border-b-2 border-brand-gold pb-[6px]' : 'text-brand-muted hover:text-brand-text'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                  <p className="text-[11px] text-brand-muted mt-2">
                    {isLogin 
                      ? 'Securely gain passage into the SwiftPay Corporate SME sandbox.' 
                      : 'Become an authorized Merchant with full virtual payment endpoints.'}
                  </p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex gap-2 p-3 bg-brand-red/10 border border-brand-red/30 rounded-xl text-xs text-brand-red font-medium leading-relaxed"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {/* Additional registration fields */}
                  {!isLogin && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-brand-muted">Merchant Representative Full Name</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-brand-muted"><User className="w-4 h-4" /></span>
                          <input
                            type="text"
                            required
                            placeholder="Alhaji Olamide"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-brand-muted">Registered Company</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-brand-muted"><Building className="w-4 h-4" /></span>
                            <input
                              type="text"
                              required
                              placeholder="Apex Ltd"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-semibold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-brand-muted">Corporate Role</label>
                          <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-semibold"
                          >
                            <option value="SME Owner">SME Owner / CEO</option>
                            <option value="Finance Manager">Finance Manager</option>
                            <option value="Corporate Secretary">Corporate Secretary</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Universal login email & password fields */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-brand-muted">Corporate Email Address</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-brand-muted"><Mail className="w-4 h-4" /></span>
                      <input
                        type="email"
                        required
                        placeholder="ceo@swiftpay.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-semibold font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-brand-muted">Security Access Password</label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setForgotPassword(true)}
                          className="text-[10px] text-brand-gold hover:underline font-extrabold"
                        >
                          Recover Password
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-brand-muted"><Lock className="w-4 h-4" /></span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 text-xs bg-brand-elevated border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-gold font-semibold font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-brand-muted hover:text-brand-text transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {!isLogin && (
                      <p className="text-[9px] text-brand-muted leading-tight mt-1">
                        Must comprise at least 6 characters.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-brand-base font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-md shadow-brand-gold/10 flex items-center justify-center gap-1.5 cursor-pointer mt-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-brand-base/20 border-t-brand-base rounded-full animate-spin" />
                        <span>Verifying Security Protocol...</span>
                      </>
                    ) : (
                      <>
                        <span>{isLogin ? 'Grant Passage' : 'Validate Credentials'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Fill sandbox shortcuts for convenient testing */}
                {isLogin && (
                  <div className="pt-4 border-t border-brand-border/30">
                    <p className="text-[10px] uppercase font-bold text-brand-muted tracking-wider mb-2 text-center">
                      ⚡ Quick-Fill Sandbox Accounts
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('owner')}
                        className="py-1.5 px-2 bg-brand-elevated border border-brand-border hover:border-brand-gold hover:bg-brand-surface rounded-lg text-[10px] text-left transition-all flex flex-col justify-between"
                      >
                        <span className="font-bold text-brand-text">Olamide Olan.</span>
                        <span className="text-brand-gold font-mono text-[9px] mt-0.5">SME Owner ₦</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('finance')}
                        className="py-1.5 px-2 bg-brand-elevated border border-brand-border hover:border-brand-gold hover:bg-brand-surface rounded-lg text-[10px] text-left transition-all flex flex-col justify-between"
                      >
                        <span className="font-bold text-brand-text">Chioma Alao</span>
                        <span className="text-brand-green font-mono text-[9px] mt-0.5">Finance Manager</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Notes */}
        <p className="text-center text-[10px] text-brand-muted mt-8 leading-normal max-w-xs mx-auto">
          SwiftPay corporate encryption is active. Secured with standard SHA-256 protocols under CBN Sandbox Regulations 2026.
        </p>
      </motion.div>
    </div>
  );
}
