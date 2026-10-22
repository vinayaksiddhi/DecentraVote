import React from 'react';
import { Check, Vote, Lock, AlertCircle, Loader2, Award } from 'lucide-react';

const CANDIDATE_THEMES = {
  1: {
    accent: 'from-indigo-500 to-violet-600',
    borderHover: 'hover:border-indigo-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    bar: 'from-indigo-500 to-indigo-600',
    initial: 'R',
    role: 'Candidate #1',
  },
  2: {
    accent: 'from-pink-500 to-rose-600',
    borderHover: 'hover:border-rose-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    bar: 'from-pink-500 to-rose-600',
    initial: 'P',
    role: 'Candidate #2',
  },
  3: {
    accent: 'from-emerald-400 to-teal-600',
    borderHover: 'hover:border-emerald-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    bar: 'from-emerald-400 to-teal-600',
    initial: 'A',
    role: 'Candidate #3',
  },
};

export default function CandidateCard({
  candidate,
  totalVotes,
  isVotingActive,
  hasVoted,
  account,
  isCorrectNetwork,
  onVote,
  isVotingThisCandidate,
  isAnyTxPending,
  isLeading,
  contractConfigured,
}) {
  const { id, name, voteCount = 0 } = candidate;
  const theme = CANDIDATE_THEMES[id] || CANDIDATE_THEMES[1];

  const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  // Determine button state and label
  const getButtonConfig = () => {
    if (!contractConfigured) {
      return {
        disabled: true,
        label: 'Contract Not Ready',
        icon: <AlertCircle className="w-4 h-4" />,
        className: 'bg-white/5 text-slate-500 cursor-not-allowed',
      };
    }
    if (!account) {
      return {
        disabled: false,
        label: 'Connect Wallet to Vote',
        icon: <Vote className="w-4 h-4" />,
        className: 'bg-indigo-600/80 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-400',
        action: 'connect',
      };
    }
    if (!isCorrectNetwork) {
      return {
        disabled: false,
        label: 'Switch Network to Vote',
        icon: <AlertCircle className="w-4 h-4" />,
        className: 'bg-amber-600/80 hover:bg-amber-600 text-white focus:outline-none focus:ring-2 focus:ring-amber-400',
        action: 'switch_network',
      };
    }
    if (isVotingThisCandidate) {
      return {
        disabled: true,
        label: 'Confirm transaction in MetaMask',
        icon: <Loader2 className="w-4 h-4 animate-spin text-white" />,
        className: 'bg-indigo-700 text-white cursor-wait animate-pulse',
      };
    }

    // 1. If voting is closed / deadline passed
    if (!isVotingActive) {
      if (hasVoted) {
        return {
          disabled: true,
          label: 'Voting Ended · Vote Recorded',
          icon: <Check className="w-4 h-4 text-emerald-400" />,
          className: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 cursor-not-allowed font-medium',
        };
      }
      return {
        disabled: true,
        label: 'Voting Ended',
        icon: <Lock className="w-4 h-4 text-slate-400" />,
        className: 'bg-white/5 text-slate-400 border border-white/5 cursor-not-allowed',
      };
    }

    // 2. If voting is open and this wallet has voted
    if (hasVoted) {
      return {
        disabled: true,
        label: 'Vote Already Cast',
        icon: <Check className="w-4 h-4 text-emerald-400" />,
        className: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 cursor-not-allowed',
      };
    }

    // 3. If voting is open and this wallet has not voted
    return {
      disabled: isAnyTxPending,
      label: `Vote for ${name}`,
      icon: <Vote className="w-4 h-4" />,
      className: isAnyTxPending
        ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
        : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#12192a]',
    };
  };

  const btn = getButtonConfig();

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 bg-[#12192a]/80 backdrop-blur-md border border-white/10 transition-all duration-300 ${theme.borderHover} ${theme.glow}`}
    >
      {/* Top Banner: Leading Badge if highest votes */}
      {isLeading && voteCount > 0 && (
        <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20">
          <Award className="w-3.5 h-3.5" />
          <span>Current Leader</span>
        </div>
      )}

      {/* Candidate Header */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg border ${theme.badge}`}>
            Candidate #{id}
          </span>
          <span className="text-xs font-mono text-slate-400">ID: {id}</span>
        </div>

        {/* Candidate Profile / Initials Avatar */}
        <div className="flex items-center space-x-4 mb-6">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${theme.accent} p-0.5 shadow-lg flex items-center justify-center shrink-0`}
          >
            <div className="w-full h-full bg-[#12192a] rounded-[14px] flex items-center justify-center font-display font-black text-2xl text-white">
              {theme.initial}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display group-hover:text-indigo-200 transition">
              {name}
            </h3>
            <p className="text-xs text-slate-400">Official Candidate</p>
          </div>
        </div>

        {/* Vote Counts & Progress Bar */}
        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl font-black font-display text-white tracking-tight">
                {voteCount}
              </span>
              <span className="text-xs text-slate-400 ml-1.5">
                {voteCount === 1 ? 'vote' : 'votes'}
              </span>
            </div>
            <span className="text-sm font-bold font-mono text-indigo-300">
              {percentage}%
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${theme.bar} transition-all duration-700 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Vote Button */}
      <div className="pt-2">
        <button
          onClick={() => onVote(candidate, btn.action)}
          disabled={btn.disabled}
          className={`w-full py-3 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${btn.className}`}
        >
          {btn.icon}
          <span>{btn.label}</span>
        </button>
      </div>
    </div>
  );
}
