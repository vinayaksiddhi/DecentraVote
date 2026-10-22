import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  X, 
  ExternalLink, 
  Radio, 
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';
import { shortenAddress } from '../utils/formatters';
import { DEFAULT_CONFIG, SUPPORTED_NETWORKS } from '../contract/contractConfig';

export default function StatusAlerts({
  account,
  isCorrectNetwork,
  onSwitchNetwork,
  hasVoted,
  isVotingActive,
  votingOpen,
  isDeadlinePassed,
  txStatus,
  txHash,
  txError,
  onResetTx,
  lastVoteEvent,
  contractConfigured,
}) {
  const [copiedTx, setCopiedTx] = useState(false);

  const handleCopyTx = () => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  return (
    <div className="space-y-4 mb-8">
      
      {/* 1. Wrong Network Alert */}
      {account && !isCorrectNetwork && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Unsupported Network Detected</h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Your MetaMask wallet is connected to a different network. Please switch to <strong>{DEFAULT_CONFIG.networkName}</strong> to interact with this voting contract.
              </p>
            </div>
          </div>
          <button
            onClick={onSwitchNetwork}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition shadow shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            Switch to {DEFAULT_CONFIG.networkName}
          </button>
        </div>
      )}

      {/* 2. User Already Voted Banner */}
      {account && hasVoted && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Ballot Successfully Recorded</h4>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Connected address <code className="font-mono text-emerald-300">{shortenAddress(account, 6)}</code> has cast its vote in this election. Each wallet is restricted to one on-chain vote.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
            <Check className="w-3.5 h-3.5" />
            Verified Voter
          </span>
        </div>
      )}

      {/* 3. Real-Time VoteCast Event Toast */}
      {lastVoteEvent && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            <span className="text-white font-medium">Real-Time Event:</span>
            <span>
              Vote confirmed on-chain by <strong className="font-mono text-indigo-300">{shortenAddress(lastVoteEvent.voter, 4)}</strong> for Candidate #{lastVoteEvent.candidateId}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">Just now</span>
        </div>
      )}

      {/* 4. Active Transaction Modal / Notification */}
      {txStatus !== 'idle' && (
        <div className="p-5 rounded-2xl bg-[#141c2e] border border-indigo-500/30 text-white shadow-2xl relative animate-fadeIn">
          <button
            onClick={onResetTx}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Pending: Confirm in MetaMask */}
          {txStatus === 'preparing' && (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Confirm transaction in MetaMask</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Please review and approve the voting transaction in your MetaMask wallet popup.
                </p>
              </div>
            </div>
          )}

          {/* Submitted: Broadcasted to network */}
          {txStatus === 'pending' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-cyan-300">
                    Transaction Submitted
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Broadcast to network. Waiting for block confirmation...
                  </p>
                </div>
              </div>
              {txHash && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-400 shrink-0">Tx Hash:</span>
                    {SUPPORTED_NETWORKS[DEFAULT_CONFIG.expectedChainId]?.blockExplorerUrls?.[0] ? (
                      <a
                        href={`${SUPPORTED_NETWORKS[DEFAULT_CONFIG.expectedChainId].blockExplorerUrls[0]}/tx/${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{txHash}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-indigo-300 truncate" title={txHash}>
                        {txHash}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleCopyTx}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition shrink-0"
                    title="Copy transaction hash"
                  >
                    {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Confirmed: Vote recorded on-chain */}
          {txStatus === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-white">
                    Vote recorded on-chain
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your ballot has been irreversibly confirmed and mined into the blockchain block.
                  </p>
                </div>
              </div>
              {txHash && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-400 shrink-0">Receipt Hash:</span>
                    {SUPPORTED_NETWORKS[DEFAULT_CONFIG.expectedChainId]?.blockExplorerUrls?.[0] ? (
                      <a
                        href={`${SUPPORTED_NETWORKS[DEFAULT_CONFIG.expectedChainId].blockExplorerUrls[0]}/tx/${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{shortenAddress(txHash, 8)}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-emerald-400 truncate" title={txHash}>
                        {txHash}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleCopyTx}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition shrink-0"
                    title="Copy receipt hash"
                  >
                    {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reverted / Failed: Explain clearly without claiming vote succeeded */}
          {txStatus === 'error' && (
            <div className="flex items-start gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-white">Transaction Failed</h4>
                <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                  {txError || 'The transaction was rejected or reverted by the network. No vote was recorded on-chain.'}
                </p>
                <button
                  onClick={onResetTx}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
