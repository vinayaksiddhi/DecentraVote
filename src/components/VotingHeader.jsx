import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Users, BarChart3, Shield } from 'lucide-react';
import { formatTimestamp } from '../utils/formatters';

export default function VotingHeader({
  votingOpen,
  votingDeadline,
  isDeadlinePassed,
  isVotingActive,
  timeRemaining,
  candidateCount,
  totalVotes,
  hasVoted,
  account,
  contractConfigured,
  contractError,
}) {
  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 border border-white/10 bg-gradient-to-b from-[#131b2e] to-[#0c111e] shadow-2xl">
      {/* Decorative background glow circles */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        
        {/* Left Side: Title & Description */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Solidity ^0.8.20 Smart Contract Protocol</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display">
            Decentralized Voting System
          </h1>

          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Cast your vote securely and transparently. All ballots are permanently verified on the blockchain with zero central interference.
          </p>

          {/* Quick Stats */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/5">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">Candidates:</span>
              <span className="font-bold text-white">{candidateCount || 3}</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Total Votes:</span>
              <span className="font-bold text-white">{totalVotes}</span>
            </div>

            {/* Voter Status Pill */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/5">
              {account ? (
                hasVoted ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    You Have Voted
                  </span>
                ) : !isVotingActive ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-400">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Voting Concluded
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Eligible to Vote
                  </span>
                )
              ) : (
                <span className="text-slate-400">Connect wallet to view status</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Status Badge & Live Countdown Timer */}
        <div className="flex flex-col items-start lg:items-end justify-center shrink-0">
          
          {/* Status Badge */}
          <div className="mb-4">
            {!contractConfigured ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <AlertCircle className="w-4 h-4" />
                Waiting for Contract Deployment
              </span>
            ) : contractError ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                <AlertCircle className="w-4 h-4" />
                Contract Unavailable / Connection Error
              </span>
            ) : isVotingActive ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-glow-emerald">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Voting Active & Open
              </span>
            ) : isDeadlinePassed ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <Clock className="w-4 h-4" />
                Voting Deadline Passed
              </span>
            ) : !votingOpen ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                <XCircle className="w-4 h-4" />
                Voting Closed by Admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-500/10 border border-slate-500/30 text-slate-300">
                <Clock className="w-4 h-4" />
                Voting Concluded
              </span>
            )}
          </div>

          {/* Countdown Blocks */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm">
            <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {isDeadlinePassed ? 'Voting Period Ended' : 'Time Remaining'}
              </span>
              {votingDeadline > 0 && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatTimestamp(votingDeadline)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 min-w-[56px]">
                <span className="block text-xl font-bold font-mono text-white">
                  {String(timeRemaining.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Days</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 min-w-[56px]">
                <span className="block text-xl font-bold font-mono text-white">
                  {String(timeRemaining.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Hours</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 min-w-[56px]">
                <span className="block text-xl font-bold font-mono text-white">
                  {String(timeRemaining.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Mins</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 min-w-[56px]">
                <span className="block text-xl font-bold font-mono text-indigo-400">
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Secs</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
