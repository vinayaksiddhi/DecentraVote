import React, { useState } from 'react';
import { 
  Vote, 
  Wallet, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  HelpCircle, 
  LogOut, 
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress } from '../utils/formatters';
import { DEFAULT_CONFIG } from '../contract/contractConfig';

export default function Navbar({ onOpenRemixGuide, isOwner, contractConfigured }) {
  const {
    account,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isCorrectNetwork,
    contractAddress,
  } = useWeb3();

  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0a0d14]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-glow-brand">
            <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
              <Vote className="w-6 h-6 text-indigo-400 animate-pulse-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-display">
                Decentra<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Vote</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Web3 DApp
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Solidity 0.8.20 On-Chain Voting</p>
          </div>
        </div>

        {/* Center / Action Links */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Remix Guide Quick Link */}
          <button
            onClick={onOpenRemixGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Remix Setup Guide</span>
          </button>

          {/* Contract Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/[0.02] border border-white/5">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Contract:</span>
            {contractConfigured ? (
              <span className="text-emerald-400 font-medium">
                {shortenAddress(contractAddress, 4)}
              </span>
            ) : (
              <span className="text-amber-400 font-medium">Not Configured</span>
            )}
          </div>
        </div>

        {/* Right Actions: Network & Wallet */}
        <div className="flex items-center space-x-3">
          
          {/* Network Switcher Pill */}
          {account && (
            <button
              onClick={() => !isCorrectNetwork && switchNetwork()}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition border ${
                isCorrectNetwork
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 cursor-pointer animate-pulse'
              }`}
              title={isCorrectNetwork ? 'Connected to correct network' : 'Click to switch network'}
            >
              <span className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="hidden sm:inline">
                {isCorrectNetwork ? DEFAULT_CONFIG.networkName : 'Wrong Network (Switch)'}
              </span>
              {!isCorrectNetwork && <AlertTriangle className="w-3.5 h-3.5 ml-1" />}
            </button>
          )}

          {/* Connect / Wallet Account Button */}
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 transition shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-60"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 p-1 pl-3 bg-white/[0.04] border border-white/10 rounded-xl">
              {/* Owner Badge if user is contract owner */}
              {isOwner && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Owner
                </span>
              )}

              {/* Account Address Snippet */}
              <button
                onClick={handleCopyAccount}
                className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-200 hover:text-white transition"
                title="Click to copy address"
              >
                <span>{shortenAddress(account, 4)}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                )}
              </button>

              {/* Disconnect Button */}
              <button
                onClick={disconnectWallet}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Disconnect local session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
