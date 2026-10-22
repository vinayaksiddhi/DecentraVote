import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { DEFAULT_CONFIG, SUPPORTED_NETWORKS } from '../contract/contractConfig';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState(null);

  // Contract address can be loaded from localStorage (if user changed it) or default .env
  const [contractAddress, setContractAddressState] = useState(() => {
    const saved = localStorage.getItem('decentravote_contract_address');
    return (saved && saved.trim()) ? saved.trim() : DEFAULT_CONFIG.contractAddress;
  });

  const setContractAddress = (newAddress) => {
    const trimmed = (newAddress || '').trim();
    setContractAddressState(trimmed);
    if (trimmed) {
      localStorage.setItem('decentravote_contract_address', trimmed);
    } else {
      localStorage.removeItem('decentravote_contract_address');
    }
  };

  const expectedChainId = DEFAULT_CONFIG.expectedChainId;
  const isCorrectNetwork = !chainId || String(chainId) === String(expectedChainId);

  // Initialize read-only provider or detect existing MetaMask connection
  const initWeb3 = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        const network = await browserProvider.getNetwork();
        setChainId(network.chainId.toString());

        // Check if already authorized
        const accounts = await browserProvider.send('eth_accounts', []);
        if (accounts && accounts.length > 0) {
          const userSigner = await browserProvider.getSigner();
          setAccount(accounts[0]);
          setSigner(userSigner);
        }
      } catch (err) {
        console.error('Error initializing browser provider:', err);
      }
    } else if (DEFAULT_CONFIG.rpcUrl) {
      try {
        const fallbackProvider = new ethers.JsonRpcProvider(DEFAULT_CONFIG.rpcUrl);
        setProvider(fallbackProvider);
      } catch (err) {
        console.error('Fallback RPC error:', err);
      }
    }
  }, []);

  useEffect(() => {
    initWeb3();
  }, [initWeb3]);

  // Connect MetaMask Wallet
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setWalletError('MetaMask is not installed. Please install MetaMask to vote on blockchain.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    setWalletError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const userSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(userSigner);
      setAccount(accounts[0]);
      setChainId(network.chainId.toString());
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      if (err.code === 4001) {
        setWalletError('Connection request rejected by user.');
      } else {
        setWalletError(err.message || 'Failed to connect MetaMask.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect local state
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
  };

  // Switch network in MetaMask
  const switchNetwork = async (targetChainId = expectedChainId) => {
    if (!window.ethereum) return;
    const hexChainId = '0x' + BigInt(targetChainId).toString(16);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
    } catch (switchError) {
      const isUnrecognized =
        switchError.code === 4902 ||
        switchError.code === -32603 ||
        switchError?.data?.originalError?.code === 4902 ||
        (switchError.message && switchError.message.toLowerCase().includes('unrecognized'));

      if (isUnrecognized && SUPPORTED_NETWORKS[targetChainId]) {
        try {
          const config = SUPPORTED_NETWORKS[targetChainId];
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [config],
          });
        } catch (addError) {
          console.error('Failed to add network to MetaMask:', addError);
          setWalletError('Failed to add network to MetaMask.');
        }
      } else {
        console.error('Failed to switch network:', switchError);
        setWalletError('Failed to switch network in MetaMask.');
      }
    }
  };

  // Listen to MetaMask account and chain changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
      } else {
        setAccount(accounts[0]);
        if (provider) {
          try {
            const userSigner = await provider.getSigner();
            setSigner(userSigner);
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    const handleChainChanged = (newChainId) => {
      // Hex to decimal string
      try {
        const decimal = BigInt(newChainId).toString();
        setChainId(decimal);
      } catch {
        setChainId(newChainId);
      }
      // Re-initialize provider on chain change
      initWeb3();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [provider, initWeb3]);

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        provider,
        signer,
        isConnecting,
        walletError,
        setWalletError,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        isCorrectNetwork,
        expectedChainId,
        contractAddress,
        setContractAddress,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
