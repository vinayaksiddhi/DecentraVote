import React from 'react';
import CandidateCard from './CandidateCard';
import { Loader2 } from 'lucide-react';

const FALLBACK_CANDIDATES = [
  { id: 1, name: 'Rahul', voteCount: 0 },
  { id: 2, name: 'Priya', voteCount: 0 },
  { id: 3, name: 'Aman', voteCount: 0 },
];

export default function CandidateList({
  candidates,
  totalVotes,
  isVotingActive,
  hasVoted,
  account,
  isCorrectNetwork,
  onVote,
  selectedCandidateId,
  isAnyTxPending,
  isLoading,
  contractConfigured,
}) {
  const displayList = candidates && candidates.length > 0 ? candidates : FALLBACK_CANDIDATES;

  // Find max votes to highlight current leader
  const maxVotes = Math.max(...displayList.map((c) => c.voteCount || 0));

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Official Ballot Candidates
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Select one candidate to cast your verifiable vote on-chain.
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Syncing blockchain...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayList.map((candidate) => {
          const isLeading = candidate.voteCount === maxVotes && maxVotes > 0;
          const isVotingThisCandidate = isAnyTxPending && selectedCandidateId === candidate.id;

          return (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              totalVotes={totalVotes}
              isVotingActive={isVotingActive}
              hasVoted={hasVoted}
              account={account}
              isCorrectNetwork={isCorrectNetwork}
              onVote={onVote}
              isVotingThisCandidate={isVotingThisCandidate}
              isAnyTxPending={isAnyTxPending}
              isLeading={isLeading}
              contractConfigured={contractConfigured}
            />
          );
        })}
      </div>
    </div>
  );
}
