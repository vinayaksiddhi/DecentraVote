import React, { useState } from 'react';
import { Settings, Check, ExternalLink, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress } from '../utils/formatters';
import { ethers } from 'ethers';

export default function ContractAddressBar({ onOpenRemixGuide }) {
  const { contractAddress, setContractAddress } = useWeb3();
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(contractAddress || '');
  const [errorMsg, setErrorMsg] = useState('');

  const isValid = Boolean(contractAddress && ethers.isAddress(contractAddress));

  const handleSave = (e) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) {
      setErrorMsg('Please enter a valid Ethereum address');
      return;
    }
    if (!ethers.isAddress(clean)) {
      setErrorMsg('Invalid Ethereum address format (must start with 0x and be 42 characters)');
      return;
    }
    setErrorMsg('');
    setContractAddress(clean);
    setIsEditing(false);
  };

  if (!isValid && !isEditing) {
    return (
      <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-amber-200 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Contract Address Required</h3>
              <p className="text-xs text-amber-200/80 mt-0.5 max-w-2xl">
                The frontend is not yet linked to a deployed <code className="text-amber-300 font-mono">VotingSystem</code> smart contract.
                Deploy the contract using Remix or configure your deployed address below or in <code className="text-amber-300 font-mono">.env</code>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={onOpenRemixGuide}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition border border-white/10"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              Remix Guide
            </button>
            <button
              onClick={() => {
                setInputVal(contractAddress || '');
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow"
            >
              Set Contract Address
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="mb-8 p-5 rounded-2xl bg-[#111726] border border-indigo-500/30 text-slate-200 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white">Configure Smart Contract Address</span>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. 0x5FbDB2315678afecb367f032d93F642f64180aa3"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
            >
              Save Address
            </button>
          </div>
          {errorMsg && <p className="text-xs text-rose-400 mt-1">{errorMsg}</p>}
          <p className="text-[11px] text-slate-400">
            Tip: You can also set this in <code className="text-indigo-300">.env</code> as <code className="text-slate-300 font-mono">VITE_CONTRACT_ADDRESS</code>.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="mb-8 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-slate-400">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-emerald-400 font-medium shrink-0 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active Contract:
        </span>
        <span className="font-mono text-slate-300 truncate" title={contractAddress}>
          {contractAddress}
        </span>
      </div>
      <button
        onClick={() => {
          setInputVal(contractAddress);
          setIsEditing(true);
        }}
        className="text-[11px] text-indigo-400 hover:text-indigo-300 underline shrink-0 ml-4"
      >
        Change
      </button>
    </div>
  );
}
