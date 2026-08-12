import { ethers } from 'ethers';
import { CertificateModel, ICertificate } from '../models/Certificate';
import mongoose from 'mongoose';

// In-memory fallback store for offline MongoDB execution
const inMemoryCertificates: Map<string, Partial<ICertificate>> = new Map();

const CERTICHAIN_ABI = [
  "event CertificateIssued(string indexed certificateId, address indexed studentAddress, address indexed issuer, uint256 issueDate)",
  "event CertificateRevoked(string indexed certificateId, address indexed revokedBy)",
  "function getCertificate(string certificateId) view returns (tuple(string certificateId, string studentName, address studentAddress, string courseName, string issuerName, uint256 issueDate, string ipfsCid, bool isValid, bool exists))"
];

export async function startIndexer(): Promise<void> {
  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const contractAddress = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, CERTICHAIN_ABI, provider);

    console.log(`[Indexer] Listening for CertiChain events at ${contractAddress} on ${rpcUrl}`);

    // Event 1: CertificateIssued
    contract.on('CertificateIssued', async (certId: string, studentAddr: string, issuerAddr: string, issueDate: bigint, event: any) => {
      console.log(`[Indexer Event] CertificateIssued: ${certId} for ${studentAddr}`);
      try {
        const certData = await contract.getCertificate(certId);
        const record = {
          certificateId: certId,
          studentName: certData.studentName,
          studentAddress: certData.studentAddress,
          courseName: certData.courseName,
          issuerName: certData.issuerName,
          issueDate: Number(certData.issueDate),
          ipfsCid: certData.ipfsCid,
          isValid: certData.isValid,
          transactionHash: event?.log?.transactionHash || '',
          blockNumber: event?.log?.blockNumber || 0
        };

        inMemoryCertificates.set(certId, record);

        if (mongoose.connection.readyState === 1) {
          await CertificateModel.findOneAndUpdate(
            { certificateId: certId },
            record,
            { upsert: true, new: true }
          );
        }
      } catch (err) {
        console.error(`[Indexer Error] Failed to process CertificateIssued for ${certId}:`, err);
      }
    });

    // Event 2: CertificateRevoked
    contract.on('CertificateRevoked', async (certId: string, revokedBy: string) => {
      console.log(`[Indexer Event] CertificateRevoked: ${certId} by ${revokedBy}`);
      try {
        const cert = inMemoryCertificates.get(certId);
        if (cert) {
          cert.isValid = false;
        }

        if (mongoose.connection.readyState === 1) {
          await CertificateModel.findOneAndUpdate(
            { certificateId: certId },
            { isValid: false }
          );
        }
      } catch (err) {
        console.error(`[Indexer Error] Failed to process CertificateRevoked for ${certId}:`, err);
      }
    });

  } catch (error) {
    console.warn(`[Indexer Warning] Could not connect to RPC provider:`, error);
  }
}

export function getInMemoryCertificates(): Partial<ICertificate>[] {
  return Array.from(inMemoryCertificates.values());
}
