import React, { useState } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import { useVotingContract } from './hooks/useVotingContract';
import Navbar from './components/Navbar';
import ContractAddressBar from './components/ContractAddressBar';
import VotingHeader from './components/VotingHeader';
import CandidateList from './components/CandidateList';
import AdminPanel from './components/AdminPanel';
import StatusAlerts from './components/StatusAlerts';
import RemixGuideModal from './components/RemixGuideModal';
import { ShieldCheck, Heart, Sparkles, Terminal } from 'lucide-react';

function VotingDashboard() {
  const {
    account,
    connectWallet,
    switchNetwork,
    isCorrectNetwork,
    contractAddress,
    setContractAddress,
  } = useWeb3();

  const {
    candidates,
    candidateCount,
    owner,
    votingOpen,
    votingDeadline,
    hasVoted,
    isLoading,
    contractError,
    isOwner,
    isDeadlinePassed,
    isVotingActive,
    timeRemaining,
    totalVotes,
    isContractConfigured,
    castVote,
    closeVoting,
    txStatus,
    txHash,
    txError,
    resetTxState,
    lastVoteEvent,
  } = useVotingContract();

  const [isRemixGuideOpen, setIsRemixGuideOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const handleVoteAction = async (candidate, action) => {
    if (action === 'connect') {
      await connectWallet();
      return;
    }
    if (action === 'switch_network') {
      await switchNetwork();
      return;
    }

    setSelectedCandidateId(candidate.id);
    await castVote(candidate.id);
  };

  const isAnyTxPending = txStatus === 'preparing' || txStatus === 'pending';

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white bg-mesh-glow">
      
      {/* Top Navigation */}
      <Navbar
        onOpenRemixGuide={() => setIsRemixGuideOpen(true)}
        isOwner={isOwner}
        contractConfigured={isContractConfigured}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* Contract Address Configuration Bar */}
        <ContractAddressBar onOpenRemixGuide={() => setIsRemixGuideOpen(true)} />

        {/* Global Status Alerts & Transaction Notifications */}
        <StatusAlerts
          account={account}
          isCorrectNetwork={isCorrectNetwork}
          onSwitchNetwork={switchNetwork}
          hasVoted={hasVoted}
          isVotingActive={isVotingActive}
          votingOpen={votingOpen}
          isDeadlinePassed={isDeadlinePassed}
          txStatus={txStatus}
          txHash={txHash}
          txError={txError}
          onResetTx={resetTxState}
          lastVoteEvent={lastVoteEvent}
          contractConfigured={isContractConfigured}
        />

        {/* Admin Panel (Only shown if connected wallet is contract owner) */}
        <AdminPanel
          isOwner={isOwner}
          ownerAddress={owner}
          votingOpen={votingOpen}
          onCloseVoting={closeVoting}
          txStatus={txStatus}
        />

        {/* Main Voting Header (Hero, live countdown timer, and election metrics) */}
        <VotingHeader
          votingOpen={votingOpen}
          votingDeadline={votingDeadline}
          isDeadlinePassed={isDeadlinePassed}
          isVotingActive={isVotingActive}
          timeRemaining={timeRemaining}
          candidateCount={candidateCount}
          totalVotes={totalVotes}
          hasVoted={hasVoted}
          account={account}
          contractConfigured={isContractConfigured}
          contractError={contractError}
        />

        {/* Candidate Cards Grid */}
        <CandidateList
          candidates={candidates}
          totalVotes={totalVotes}
          isVotingActive={isVotingActive}
          hasVoted={hasVoted}
          account={account}
          isCorrectNetwork={isCorrectNetwork}
          onVote={handleVoteAction}
          selectedCandidateId={selectedCandidateId}
          isAnyTxPending={isAnyTxPending}
          isLoading={isLoading}
          contractConfigured={isContractConfigured}
        />

      </main>

      {/* Interactive Remix Setup Guide Modal */}
      <RemixGuideModal
        isOpen={isRemixGuideOpen}
        onClose={() => setIsRemixGuideOpen(false)}
        onSetAddress={(addr) => {
          setContractAddress(addr);
          resetTxState();
        }}
      />

      {/* Modern Glass Footer */}
      <footer className="border-t border-white/[0.08] bg-[#0c101c]/90 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">DecentraVote</span>
            <span>•</span>
            <span>Zero Mocking • Direct Blockchain Transactions</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-indigo-300">
              React 19 + Vite
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-cyan-300">
              ethers.js v6
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-emerald-300">
              Tailwind CSS v3
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <VotingDashboard />
    </Web3Provider>
  );
}
