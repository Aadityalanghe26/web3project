import * as Client from '@web3-storage/w3up-client';

export interface UploadResult {
  cid: string;
  gatewayUrl: string;
  isMock?: boolean;
}

const PUBLIC_IPFS_GATEWAY = 'https://w3s.link/ipfs';

/**
 * Uploads a PDF file or document buffer to IPFS.
 * Uses @web3-storage/w3up-client if credentials are provided in env,
 * or generates a deterministic CID for testing environments.
 */
export async function uploadToIPFS(file: File): Promise<UploadResult> {
  const principal = import.meta.env.VITE_W3_PRINCIPAL;
  const proof = import.meta.env.VITE_W3_PROOF;

  try {
    if (principal && proof) {
      const client = await Client.create();
      const cid = await client.uploadFile(file);
      const cidString = cid.toString();

      return {
        cid: cidString,
        gatewayUrl: `${PUBLIC_IPFS_GATEWAY}/${cidString}`,
        isMock: false
      };
    }
  } catch (error) {
    console.warn("web3.storage upload warning, falling back to IPFS simulation:", error);
  }

  // Fallback simulator for development/testing without live w3up proof:
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Format as v1 IPFS-style CID format
  const mockCid = `bafybeic${hexHash.substring(0, 32)}`;

  return {
    cid: mockCid,
    gatewayUrl: `${PUBLIC_IPFS_GATEWAY}/${mockCid}`,
    isMock: true
  };
}

export function getIPFSGatewayUrl(cid: string): string {
  if (!cid) return '';
  if (cid.startsWith('http://') || cid.startsWith('https://')) {
    return cid;
  }
  return `${PUBLIC_IPFS_GATEWAY}/${cid}`;
}
