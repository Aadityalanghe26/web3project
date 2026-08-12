/// <reference types="vite/client" />

interface Window {
  ethereum?: any;
}

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS?: string;
  readonly VITE_RPC_URL?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_W3_PRINCIPAL?: string;
  readonly VITE_W3_PROOF?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@web3-storage/w3up-client' {
  export function create(options?: any): Promise<any>;
  export function parse(proof: string): Promise<any>;
}
