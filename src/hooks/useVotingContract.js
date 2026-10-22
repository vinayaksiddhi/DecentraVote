import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { VotingSystemABI } from '../contract/contractConfig';
import { parseContractError } from '../utils/formatters';

export function useVotingContract() {
  const {
    account,
    provider,
    signer,
    isCorrectNetwork,
    contractAddress,
  } = useWeb3();

  const [candidates, setCandidates] = useState([]);
  const [candidateCount, setCandidateCount] = useState(0);
  const [owner, setOwner] = useState(null);
  const [votingOpen, setVotingOpen] = useState(false);
  const [votingDeadline, setVotingDeadline] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contractError, setContractError] = useState(null);

  // Transaction states
  const [txStatus, setTxStatus] = useState('idle'); // 'idle' | 'preparing' | 'pending' | 'success' | 'error'
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);
  const [lastVoteEvent, setLastVoteEvent] = useState(null);

  // Time remaining state
  const [timeRemaining, setTimeRemaining] = useState({
    totalSeconds: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  const isContractConfigured = Boolean(
    contractAddress && ethers.isAddress(contractAddress)
  );

  const isOwner = Boolean(
    account && owner && account.toLowerCase() === owner.toLowerCase()
  );

  const isDeadlinePassed = votingDeadline > 0 && Math.floor(Date.now() / 1000) >= votingDeadline;
  const isVotingActive = votingOpen && !isDeadlinePassed;

  // Read all contract data
  const fetchContractData = useCallback(async () => {
    if (!isContractConfigured || !provider) {
      return;
    }

    try {
      setIsLoading(true);
      setContractError(null);

      const contract = new ethers.Contract(contractAddress, VotingSystemABI, provider);

      // Fetch basic variables in parallel
      const [ownerRes, openRes, deadlineRes, countRes] = await Promise.all([
        contract.owner(),
        contract.votingOpen(),
        contract.votingDeadline(),
        contract.candidateCount(),
      ]);

      const parsedOwner = ownerRes;
      const parsedOpen = Boolean(openRes);
      const parsedDeadline = Number(deadlineRes);
      const parsedCount = Number(countRes);

      setOwner(parsedOwner);
      setVotingOpen(parsedOpen);
      setVotingDeadline(parsedDeadline);
      setCandidateCount(parsedCount);

      // Fetch all candidate records
      const candidatePromises = [];
      for (let i = 1; i <= parsedCount; i++) {
        candidatePromises.push(
          (async () => {
            const candidateData = await contract.candidates(i);
            const votes = await contract.getCandidateVotes(i);
            return {
              id: Number(candidateData.id || i),
              name: candidateData.name,
              voteCount: Number(votes !== undefined ? votes : candidateData.voteCount),
            };
          })()
        );
      }

      const candidateResults = await Promise.all(candidatePromises);
      setCandidates(candidateResults);

      // Check if current account has voted
      if (account) {
        const userHasVoted = await contract.hasVoted(account);
        setHasVoted(Boolean(userHasVoted));
      } else {
        setHasVoted(false);
      }
    } catch (err) {
      console.error('Failed to read contract data:', err);
      setContractError(
        'Unable to load contract data. Please verify the contract is deployed at this address and the network matches.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isContractConfigured, contractAddress, provider, account]);

  // Ensure hasVoted resets immediately on account switch so stale status is not carried over
  useEffect(() => {
    setHasVoted(false);
  }, [account]);

  // Initial load and reload on address/account/network change
  useEffect(() => {
    fetchContractData();
  }, [fetchContractData]);

  // Setup Real-time Event Listeners
  useEffect(() => {
    if (!isContractConfigured || !provider) return;

    let contractInstance;
    try {
      contractInstance = new ethers.Contract(contractAddress, VotingSystemABI, provider);

      const onVoteCast = (voter, candidateId, event) => {
        console.log('Real-time VoteCast event detected:', voter, candidateId);
        setLastVoteEvent({
          voter,
          candidateId: Number(candidateId),
          timestamp: Date.now(),
        });
        // Automatically refresh data
        fetchContractData();
      };

      const onVotingClosed = (closedAt) => {
        console.log('VotingClosed event detected at:', closedAt);
        setVotingOpen(false);
        fetchContractData();
      };

      contractInstance.on('VoteCast', onVoteCast);
      contractInstance.on('VotingClosed', onVotingClosed);

      return () => {
        if (contractInstance) {
          contractInstance.removeAllListeners('VoteCast');
          contractInstance.removeAllListeners('VotingClosed');
        }
      };
    } catch (err) {
      console.error('Failed to bind contract event listeners:', err);
    }
  }, [isContractConfigured, contractAddress, provider, fetchContractData]);

  // Deadline countdown timer
  useEffect(() => {
    if (!votingDeadline || votingDeadline === 0) {
      setTimeRemaining({
        totalSeconds: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false,
      });
      return;
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = votingDeadline - now;

      if (diff <= 0) {
        setTimeRemaining({
          totalSeconds: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
      } else {
        const days = Math.floor(diff / (24 * 3600));
        const hours = Math.floor((diff % (24 * 3600)) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        setTimeRemaining({
          totalSeconds: diff,
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [votingDeadline]);

  // Vote for a candidate
  const castVote = async (candidateId) => {
    if (!signer) {
      setTxError('Please connect your MetaMask wallet first.');
      return;
    }
    if (!isCorrectNetwork) {
      setTxError('Please switch to the correct network to vote.');
      return;
    }
    if (!isContractConfigured) {
      setTxError('Contract address is not configured.');
      return;
    }
    if (hasVoted) {
      setTxError('You have already cast your vote in this election.');
      return;
    }
    if (!votingOpen) {
      setTxError('Voting has been closed by the contract administrator.');
      return;
    }
    if (isDeadlinePassed) {
      setTxError('The voting deadline has expired.');
      return;
    }

    setTxStatus('preparing');
    setTxError(null);
    setTxHash(null);

    try {
      const contractWithSigner = new ethers.Contract(contractAddress, VotingSystemABI, signer);
      
      const tx = await contractWithSigner.vote(candidateId);
      setTxHash(tx.hash);
      setTxStatus('pending');

      const receipt = await tx.wait(1);
      if (receipt.status === 1) {
        setTxStatus('success');
        setHasVoted(true);
        // Refresh contract state
        await fetchContractData();
      } else {
        throw new Error('Transaction execution failed on-chain.');
      }
    } catch (err) {
      console.error('Vote transaction error:', err);
      setTxStatus('error');
      setTxError(parseContractError(err));
    }
  };

  // Close voting (Owner only)
  const closeVoting = async () => {
    if (!signer || !isOwner) {
      setTxError('Only the contract owner can close voting.');
      return;
    }

    setTxStatus('preparing');
    setTxError(null);
    setTxHash(null);

    try {
      const contractWithSigner = new ethers.Contract(contractAddress, VotingSystemABI, signer);
      const tx = await contractWithSigner.closeVoting();
      setTxHash(tx.hash);
      setTxStatus('pending');

      const receipt = await tx.wait(1);
      if (receipt.status === 1) {
        setTxStatus('success');
        setVotingOpen(false);
        await fetchContractData();
      } else {
        throw new Error('Close voting transaction failed.');
      }
    } catch (err) {
      console.error('Close voting transaction error:', err);
      setTxStatus('error');
      setTxError(parseContractError(err));
    }
  };

  const resetTxState = () => {
    setTxStatus('idle');
    setTxHash(null);
    setTxError(null);
  };

  // Calculate total votes across all candidates
  const totalVotes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);

  return {
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
    fetchContractData,
    txStatus,
    txHash,
    txError,
    resetTxState,
    lastVoteEvent,
  };
}
