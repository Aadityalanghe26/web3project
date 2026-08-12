import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import CertiChainArtifact from '../contracts/CertiChain.json';

export interface CertificateStruct {
  certificateId: string;
  studentName: string;
  studentAddress: string;
  courseName: string;
  issuerName: string;
  issueDate: bigint;
  ipfsCid: string;
  isValid: boolean;
  exists: boolean;
}

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  hasIssuerRole: boolean;
  contract: ethers.Contract | null;
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null;
  signer: ethers.Signer | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (targetChainId: number) => Promise<void>;
  contractAddress: string;
  networkName: string;
  refreshIssuerRole: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  CertiChainArtifact.address ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const RPC_URL = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545";

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [hasIssuerRole, setHasIssuerRole] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | ethers.JsonRpcProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Initialize read-only contract provider
  const getReadOnlyProviderAndContract = useCallback(() => {
    try {
      const readProvider = new ethers.JsonRpcProvider(RPC_URL);
      const readContract = new ethers.Contract(CONTRACT_ADDRESS, CertiChainArtifact.abi, readProvider);
      return { readProvider, readContract };
    } catch (err) {
      console.warn("Failed to initialize read-only JsonRpcProvider:", err);
      return { readProvider: null, readContract: null };
    }
  }, []);

  const checkIssuerRole = useCallback(async (userAddress: string, contractInst: ethers.Contract) => {
    try {
      const ISSUER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ISSUER_ROLE"));
      const isIssuer = await contractInst.hasRole(ISSUER_ROLE, userAddress);
      setHasIssuerRole(isIssuer);
    } catch (err) {
      console.warn("Error checking ISSUER_ROLE:", err);
      setHasIssuerRole(false);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("MetaMask or Web3 Wallet is not installed. Please install MetaMask to interact with Web3 features.");
      return;
    }

    try {
      setIsConnecting(true);
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        const userAccount = accounts[0];
        const network = await browserProvider.getNetwork();
        const userSigner = await browserProvider.getSigner();
        const userContract = new ethers.Contract(CONTRACT_ADDRESS, CertiChainArtifact.abi, userSigner);

        setAccount(userAccount);
        setChainId(Number(network.chainId));
        setProvider(browserProvider);
        setSigner(userSigner);
        setContract(userContract);

        await checkIssuerRole(userAccount, userContract);
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [checkIssuerRole]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setSigner(null);
    setHasIssuerRole(false);

    // Fallback to read-only provider
    const { readProvider, readContract } = getReadOnlyProviderAndContract();
    setProvider(readProvider);
    setContract(readContract);
  }, [getReadOnlyProviderAndContract]);

  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) return;
    const hexChainId = `0x${targetChainId.toString(16)}`;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
    } catch (switchError: any) {
      console.error("Failed to switch network:", switchError);
    }
  }, []);

  const refreshIssuerRole = useCallback(async () => {
    if (account && contract) {
      await checkIssuerRole(account, contract);
    }
  }, [account, contract, checkIssuerRole]);

  // Initial read-only setup
  useEffect(() => {
    const { readProvider, readContract } = getReadOnlyProviderAndContract();
    setProvider(readProvider);
    setContract(readContract);

    // Auto reconnect if already authorized
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connectWallet();
          }
        })
        .catch(console.error);

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
    return undefined;
  }, [connectWallet, disconnectWallet, getReadOnlyProviderAndContract]);

  const getNetworkName = (id: number | null) => {
    if (!id) return 'Disconnected';
    if (id === 31337) return 'Hardhat Localhost';
    if (id === 11155111) return 'Sepolia Testnet';
    if (id === 1) return 'Ethereum Mainnet';
    return `Chain ID: ${id}`;
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        isConnecting,
        hasIssuerRole,
        contract,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        contractAddress: CONTRACT_ADDRESS,
        networkName: getNetworkName(chainId),
        refreshIssuerRole,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
