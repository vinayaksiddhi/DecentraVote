import VotingSystemABI from './VotingSystemABI.json';

// Default configuration from environment variables
export const DEFAULT_CONFIG = {
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  expectedChainId: import.meta.env.VITE_EXPECTED_CHAIN_ID || '31337',
  networkName: import.meta.env.VITE_NETWORK_NAME || 'Hardhat Local',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545',
};

// Known network configurations for switching
export const SUPPORTED_NETWORKS = {
  '31337': {
    chainId: '0x7a69',
    chainName: 'Hardhat Local',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: [],
  },
  '11155111': {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org', 'https://ethereum-sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  '1337': {
    chainId: '0x539',
    chainName: 'Ganache Localhost',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['http://127.0.0.1:7545'],
    blockExplorerUrls: [],
  },
  '1': {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://cloudflare-eth.com'],
    blockExplorerUrls: ['https://etherscan.io'],
  }
};

export { VotingSystemABI };
