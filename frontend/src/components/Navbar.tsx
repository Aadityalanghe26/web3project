import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Wallet, LogOut, Award, UserCheck, Search, Network } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { account, networkName, isConnecting, hasIssuerRole, connectWallet, disconnectWallet } = useWeb3();

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                CertiChain
              </span>
              <span className="block text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-semibold">
                Decentralized Verification
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4" />
              Verify Certificate
            </Link>

            <Link
              to="/issue"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/issue')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-4 h-4" />
              Issuer Portal
              {hasIssuerRole && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  Authorized
                </span>
              )}
            </Link>

            <Link
              to="/student"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/student')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Student Portal
            </Link>
          </nav>

          {/* Wallet Actions */}
          <div className="flex items-center gap-3">
            {account ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                  <Network className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{networkName}</span>
                </div>

                <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-slate-900/90 border border-indigo-500/30 rounded-xl shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-semibold text-indigo-200">
                    {truncateAddress(account)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    title="Disconnect Wallet"
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
