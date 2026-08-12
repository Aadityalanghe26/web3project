import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Award, Eye, ExternalLink, Share2, RefreshCw, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { useWeb3, CertificateStruct } from '../context/Web3Context';
import { CertificateModal } from '../components/CertificateModal';
import { getIPFSGatewayUrl } from '../services/ipfsService';

export const StudentDashboard: React.FC = () => {
  const { account, contract, connectWallet } = useWeb3();
  const [certificates, setCertificates] = useState<CertificateStruct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificateStruct | null>(null);

  const fetchStudentCertificates = useCallback(async () => {
    if (!contract || !account) return;
    setLoading(true);
    try {
      const userLower = account.toLowerCase();
      const list: CertificateStruct[] = [];

      // Query contract sequence for certificates belonging to this account
      for (let i = 1; i <= 30; i++) {
        const paddedCounter = i.toString().padStart(6, '0');
        const certId = `CERT-2026-${paddedCounter}`;
        try {
          const cert = await contract.getCertificate(certId);
          if (cert && cert.exists && cert.studentAddress.toLowerCase() === userLower) {
            list.push({
              certificateId: cert.certificateId,
              studentName: cert.studentName,
              studentAddress: cert.studentAddress,
              courseName: cert.courseName,
              issuerName: cert.issuerName,
              issueDate: cert.issueDate,
              ipfsCid: cert.ipfsCid,
              isValid: cert.isValid,
              exists: cert.exists
            });
          }
        } catch {
          // Reached end of sequence
          break;
        }
      }
      setCertificates(list);
    } catch (err) {
      console.warn("Error fetching student certificates:", err);
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  useEffect(() => {
    fetchStudentCertificates();
  }, [fetchStudentCertificates]);

  const formatDate = (timestamp: bigint) => {
    try {
      return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <UserCheck className="w-3.5 h-3.5" />
            Student Credential Portfolio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My Verifiable Credentials
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Access, view, and share all digital certificates issued directly to your wallet address.
          </p>
        </div>

        {account && (
          <button
            onClick={fetchStudentCertificates}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Portfolio</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      {!account ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white">Wallet Connection Required</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Please connect your MetaMask wallet to view digital certificates issued to your Ethereum address.
          </p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
          >
            Connect Wallet
          </button>
        </div>
      ) : loading ? (
        <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-mono">Querying blockchain for your certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">No Certificates Found</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            There are currently no certificates recorded for wallet address <span className="font-mono text-indigo-300">{account}</span>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.certificateId}
              className="glass-panel glass-panel-hover rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-6 relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    {cert.certificateId}
                  </span>
                  {cert.isValid ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Valid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                      <XCircle className="w-3 h-3" /> Revoked
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {cert.courseName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{cert.issuerName}</p>
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span>Issued: {formatDate(cert.issueDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Credential
                </button>

                <a
                  href={getIPFSGatewayUrl(cert.ipfsCid)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                  title="View Document on IPFS"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal View */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

    </div>
  );
};
