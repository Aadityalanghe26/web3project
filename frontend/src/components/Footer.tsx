import React from 'react';
import { ShieldCheck, HardHat, Database, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CertiChain</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Decentralized, tamper-proof academic and professional credential verification platform powered by Ethereum smart contracts and IPFS content-addressed storage.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Architecture</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-2">
                <HardHat className="w-3.5 h-3.5 text-amber-400" />
                <span>Solidity & Hardhat</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>IPFS & web3.storage</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Express & MongoDB Indexer</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/" className="hover:text-indigo-400 transition-colors">Public Verifier</a></li>
              <li><a href="/issue" className="hover:text-indigo-400 transition-colors">Issuer Portal</a></li>
              <li><a href="/student" className="hover:text-indigo-400 transition-colors">Student Credentials</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CertiChain Platform. All rights reserved.</p>
          <p className="font-mono text-[11px]">EVM Smart Contract: <span className="text-slate-400">CertiChain.sol</span></p>
        </div>
      </div>
    </footer>
  );
};
