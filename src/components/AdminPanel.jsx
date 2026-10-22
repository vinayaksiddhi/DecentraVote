import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { shortenAddress } from '../utils/formatters';

export default function AdminPanel({
  isOwner,
  ownerAddress,
  votingOpen,
  onCloseVoting,
  txStatus,
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!isOwner) return null;

  const isPending = txStatus === 'preparing' || txStatus === 'pending';

  return (
    <div className="mb-12 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-950/20 via-[#161722] to-amber-950/10 border border-amber-500/30 shadow-2xl relative overflow-hidden">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Control Panel (Owner Detected)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
            Contract Management
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            As the deployer and owner of this <code className="text-amber-300 font-mono">VotingSystem</code> contract ({shortenAddress(ownerAddress)}), you have administrative authority to conclude the election.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {votingOpen ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 active:scale-95 transition disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Closing Voting...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Close Voting Now</span>
                </>
              )}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Voting is already closed</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="close-voting-title"
        >
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#141a29] border border-rose-500/30 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 id="close-voting-title" className="text-lg font-bold font-display">
                Permanent Action: Close Election
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
              Are you sure you want to close this election on-chain?
            </p>
            <div className="p-3 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              <strong>Irreversible:</strong> The <code className="font-mono text-white">VotingSystem</code> smart contract does not support reopening. Once confirmed, no further ballots can ever be submitted.
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  await onCloseVoting();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition shadow shadow-rose-600/30 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                Yes, Close Voting Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
