import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ShieldCheck, CheckCircle2, XCircle, AlertCircle, ExternalLink, Eye, RefreshCw, FileText, Lock } from 'lucide-react';
import { useWeb3, CertificateStruct } from '../context/Web3Context';
import { CertificateModal } from '../components/CertificateModal';
import { getIPFSGatewayUrl } from '../services/ipfsService';

export const VerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { contract } = useWeb3();
  const [certIdInput, setCertIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [certificate, setCertificate] = useState<CertificateStruct | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertificateStruct | null>(null);

  const sampleCerts = [
    'CERT-2026-000001',
    'CERT-2026-000002'
  ];

  const handleVerify = async (idToVerify: string) => {
    const cleanId = idToVerify.trim();
    if (!cleanId) return;

    setLoading(true);
    setSearched(true);
    setErrorMsg(null);
    setCertificate(null);

    try {
      if (!contract) {
        throw new Error("Smart contract connection unavailable. Make sure your network connection is active.");
      }

      // Query contract for certificate struct
      const result = await contract.getCertificate(cleanId);
      
      if (result && result.exists) {
        setCertificate({
          certificateId: result.certificateId,
          studentName: result.studentName,
          studentAddress: result.studentAddress,
          courseName: result.courseName,
          issuerName: result.issuerName,
          issueDate: result.issueDate,
          ipfsCid: result.ipfsCid,
          isValid: result.isValid,
          exists: result.exists
        });
      } else {
        setErrorMsg("Certificate record not found on-chain.");
      }
    } catch (err: any) {
      console.warn("Verification error:", err);
      if (err.message && err.message.includes("certificate not found")) {
        setErrorMsg("No certificate exists with the provided ID.");
      } else {
        setErrorMsg(err.reason || err.message || "Failed to verify certificate.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const certIdParam = searchParams.get('certId');
    if (certIdParam) {
      setCertIdInput(certIdParam);
      handleVerify(certIdParam);
    }
  }, [searchParams, contract]);

  const formatDate = (timestamp: bigint) => {
    try {
      return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          On-Chain Authenticity Verification
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight">
          Verify Any Academic or Professional Credential
        </h1>

        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Instantly check the validity, issuer identity, student ownership, and IPFS-pinned PDF document of any CertiChain issued certificate.
        </p>
      </div>

      {/* Search Form Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl mb-12 glow-effect">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(certIdInput);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={certIdInput}
              onChange={(e) => setCertIdInput(e.target.value)}
              placeholder="Enter Certificate ID (e.g. CERT-2026-000001)..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white font-mono text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !certIdInput.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 disabled:opacity-50 min-w-[140px]"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Verify</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Test Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-mono text-[11px] text-slate-500">Sample IDs:</span>
          {sampleCerts.map((sampleId) => (
            <button
              key={sampleId}
              type="button"
              onClick={() => {
                setCertIdInput(sampleId);
                handleVerify(sampleId);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-indigo-400 hover:border-indigo-500/50 transition-colors"
            >
              {sampleId}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-6">
          {errorMsg ? (
            <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 bg-rose-950/20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Verification Failed</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">{errorMsg}</p>
            </div>
          ) : certificate ? (
            <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden space-y-6">
              
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  {certificate.isValid ? (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg glow-emerald">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">
                        {certificate.isValid ? 'Authentic Certificate' : 'Revoked Certificate'}
                      </h3>
                      {certificate.isValid && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                          Verified On-Chain
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-indigo-400 mt-0.5">{certificate.certificateId}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCert(certificate)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  View Full Credential
                </button>
              </div>

              {/* Certificate Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono uppercase text-slate-400">Student Name</span>
                  <p className="text-lg font-bold text-slate-100">{certificate.studentName}</p>
                  <p className="text-xs font-mono text-slate-400 truncate pt-1">
                    Address: {certificate.studentAddress}
                  </p>
                </div>

                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono uppercase text-slate-400">Course / Program</span>
                  <p className="text-lg font-bold text-indigo-300">{certificate.courseName}</p>
                </div>

                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono uppercase text-slate-400">Issuing Institution</span>
                  <p className="text-base font-semibold text-slate-200">{certificate.issuerName}</p>
                </div>

                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono uppercase text-slate-400">Issue Date</span>
                  <p className="text-base font-semibold text-slate-200">{formatDate(certificate.issueDate)}</p>
                </div>
              </div>

              {/* IPFS Storage Section */}
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">IPFS Document Storage</h4>
                    <p className="text-xs font-mono text-cyan-400/90 truncate max-w-xs sm:max-w-md">
                      CID: {certificate.ipfsCid}
                    </p>
                  </div>
                </div>

                <a
                  href={getIPFSGatewayUrl(certificate.ipfsCid)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  <span>Open IPFS Gateway</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ) : null}
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
