/**
 * Truncate an Ethereum address for display (e.g. 0x1234...abcd)
 */
export function shortenAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Format timestamp into readable date and time string
 */
export function formatTimestamp(timestampInSeconds) {
  if (!timestampInSeconds) return 'N/A';
  const num = Number(timestampInSeconds);
  if (num === 0) return 'Not set';
  const date = new Date(num * 1000);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Extract human-readable error message from Ethers / MetaMask error objects
 */
export function parseContractError(error) {
  if (!error) return 'An unknown error occurred';

  // User rejected request
  if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
    return 'Transaction rejected by user in MetaMask.';
  }

  // Contract revert reason in error.reason or error.shortMessage
  if (error.reason) {
    return error.reason;
  }
  if (error.shortMessage) {
    return error.shortMessage;
  }
  if (error.data?.message) {
    return error.data.message;
  }
  if (error.message) {
    // Check for common revert patterns
    if (error.message.includes('You have already voted')) {
      return 'You have already voted in this election.';
    }
    if (error.message.includes('Voting is currently closed')) {
      return 'Voting has already been closed.';
    }
    if (error.message.includes('Voting deadline has passed')) {
      return 'The voting deadline has expired.';
    }
    if (error.message.includes('Only owner can perform this action')) {
      return 'Only the contract owner can perform this action.';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient gas funds in wallet to execute transaction.';
    }
    return error.message.slice(0, 160);
  }

  return 'Transaction failed. Please check the contract requirements.';
}
