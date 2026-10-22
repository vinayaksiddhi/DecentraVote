import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, FileCode, CheckCircle2, ChevronRight, Terminal } from 'lucide-react';

const CONTRACT_SOURCE_SNIPPET = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VotingSystem {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    address public owner;
    bool public votingOpen;
    uint256 public votingDeadline;
    uint256 public candidateCount;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public hasVoted;

    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event VotingClosed(uint256 closedAt);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyWhileOpen() {
        require(votingOpen, "Voting is currently closed");
        require(block.timestamp < votingDeadline, "Voting deadline has passed");
        _;
    }

    constructor(uint256 _durationInSeconds) {
        require(_durationInSeconds > 0, "Duration must be greater than 0");
        owner = msg.sender;
        votingOpen = true;
        votingDeadline = block.timestamp + _durationInSeconds;

        _addCandidate(1, "Rahul");
        _addCandidate(2, "Priya");
        _addCandidate(3, "Aman");
    }

    function _addCandidate(uint256 _id, string memory _name) private {
        candidates[_id] = Candidate({
            id: _id,
            name: _name,
            voteCount: 0
        });
        candidateCount++;
    }

    function vote(uint256 _candidateId) external onlyWhileOpen {
        require(!hasVoted[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }

    function closeVoting() external onlyOwner {
        require(votingOpen, "Voting is already closed");
        votingOpen = false;
        emit VotingClosed(block.timestamp);
    }

    function getCandidateVotes(uint256 _candidateId) external view returns (uint256) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");
        return candidates[_candidateId].voteCount;
    }
}`;

export default function RemixGuideModal({ isOpen, onClose, onSetAddress }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputAddress, setInputAddress] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_SOURCE_SNIPPET);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyAddress = (e) => {
    e.preventDefault();
    if (inputAddress && inputAddress.trim()) {
      onSetAddress(inputAddress.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#111726] border border-white/10 rounded-2xl shadow-2xl p-6 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">Remix Deployment & Setup Guide</h2>
              <p className="text-xs text-slate-400">Deploy VotingSystem in 2 minutes on Sepolia or Remix VM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-6">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Open Remix IDE</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Navigate to <a href="https://remix.ethereum.org" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-1 hover:text-indigo-300">remix.ethereum.org <ExternalLink className="w-3 h-3" /></a> and create a new file named <code className="text-indigo-300 bg-black/40 px-1.5 py-0.5 rounded">VotingSystem.sol</code> under the <code className="text-slate-300">contracts/</code> directory.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">Copy the Solidity Smart Contract</h4>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied to Clipboard!' : 'Copy Contract Code'}
                  </button>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  The contract is already generated in this project at <code className="text-slate-300">contracts/VotingSystem.sol</code> with Rahul (1), Priya (2), and Aman (3).
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Compile in Remix</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Open the <strong>Solidity Compiler</strong> tab in the left sidebar. Select compiler version <code className="text-indigo-300 bg-black/40 px-1 py-0.5 rounded">0.8.20</code> or higher, then click <strong>Compile VotingSystem.sol</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Deploy Contract with Duration</h4>
                <p className="text-sm text-slate-400 mt-1">
                  In the <strong>Deploy & Run Transactions</strong> tab:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-300 mt-2 space-y-1">
                  <li><strong>ENVIRONMENT:</strong> Select <code className="text-cyan-300">Injected Provider - MetaMask</code> (connects to your MetaMask network, e.g. Sepolia) or <code className="text-cyan-300">Remix VM</code>.</li>
                  <li><strong>CONTRACT:</strong> Select <code className="text-cyan-300">VotingSystem - contracts/VotingSystem.sol</code>.</li>
                  <li><strong>CONSTRUCTOR PARAMETER (<code className="text-amber-300">_durationInSeconds</code>):</strong> Enter the duration, e.g.:
                    <span className="block ml-4 mt-0.5 text-slate-400 font-mono">
                      • 86400 (24 hours)<br />
                      • 604800 (7 days)<br />
                      • 3600 (1 hour for quick testing)
                    </span>
                  </li>
                  <li>Click <strong>Deploy</strong> and confirm the transaction in MetaMask!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                5
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Copy Deployed Address & Configure Frontend</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Under <em>Deployed Contracts</em> in Remix, click the copy icon next to <code className="text-slate-300">VotingSystem at 0x...</code>.
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Paste the address into your project's <code className="text-indigo-300">.env</code> file:
                </p>
                <div className="mt-1 p-2 bg-black/60 rounded font-mono text-xs text-emerald-400 border border-white/5">
                  VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
                </div>
                
                {/* Instant paste input */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Or paste your deployed address right here to test immediately:
                  </label>
                  <form onSubmit={handleApplyAddress} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x..."
                      value={inputAddress}
                      onChange={(e) => setInputAddress(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-1.5"
                    >
                      {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : null}
                      {savedSuccess ? 'Saved!' : 'Save & Connect'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
