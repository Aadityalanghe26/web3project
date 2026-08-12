import React, { useState, useEffect, useCallback } from 'react';
import { Award, Upload, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, FileText, Lock, XCircle, Search, Ban } from 'lucide-react';
import { useWeb3, CertificateStruct } from '../context/Web3Context';
import { uploadToIPFS } from '../services/ipfsService';

export const IssuerDashboard: React.FC = () => {
  const { account, contract, hasIssuerRole, connectWallet } = useWeb3();

  // Form State
  const [studentName, setStudentName] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [courseName, setCourseName] = useState('');
  const [issuerName, setIssuerName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Flow State
  const [statusStep, setStatusStep] = useState<'idle' | 'uploading_ipfs' | 'signing_tx' | 'indexing'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [issuedCertId, setIssuedCertId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Management List State
  const [issuedCertificates, setIssuedCertificates] = useState<CertificateStruct[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchIssuedCertificates = useCallback(async () => {
    if (!contract) return;
    setLoadingList(true);
    try {
      // In hardhat local/test environment, fetch sample certificates by incrementing IDs
      const list: CertificateStruct[] = [];
      for (let i = 1; i <= 20; i++) {
        const paddedCounter = i.toString().padStart(6, '0');
        const certId = `CERT-2026-${paddedCounter}`;
        try {
          const cert = await contract.getCertificate(certId);
          if (cert && cert.exists) {
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
      setIssuedCertificates(list);
    } catch (err) {
      console.warn("Failed to load issued certificates list:", err);
    } finally {
      setLoadingList(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchIssuedCertificates();
  }, [fetchIssuedCertificates]);

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !hasIssuerRole) return;

    if (!selectedFile) {
      setError("Please select a PDF certificate document to upload to IPFS.");
      return;
    }

    setError(null);
    setTxHash(null);
    setIssuedCertId(null);

    try {
      // 1. Upload to IPFS
      setStatusStep('uploading_ipfs');
      const ipfsResult = await uploadToIPFS(selectedFile);
      const ipfsCid = ipfsResult.cid;

      // 2. Sign and send transaction
      setStatusStep('signing_tx');
      const tx = await contract.issueCertificate(
        studentName.trim(),
        studentAddress.trim(),
        courseName.trim(),
        issuerName.trim(),
        ipfsCid
      );

      setTxHash(tx.hash);

      // 3. Wait for confirmation
      const receipt = await tx.wait();
      
      // Extract Certificate ID from logs if available
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          const parsedLog = contract.interface.parseLog(receipt.logs[0]);
          if (parsedLog && parsedLog.args && parsedLog.args.certificateId) {
            setIssuedCertId(parsedLog.args.certificateId);
          }
        } catch {
          setIssuedCertId("Issued Successfully");
        }
      }

      setStatusStep('idle');
      // Reset form
      setStudentName('');
      setStudentAddress('');
      setCourseName('');
      setIssuerName('');
      setSelectedFile(null);

      // Refresh management list
      fetchIssuedCertificates();
    } catch (err: any) {
      console.error("Issuance error:", err);
      setError(err.reason || err.message || "Failed to issue certificate.");
      setStatusStep('idle');
    }
  };

  const handleRevoke = async (certId: string) => {
    if (!contract || !hasIssuerRole) return;
    if (!confirm(`Are you sure you want to revoke certificate ${certId}? This action is permanent on the blockchain.`)) {
      return;
    }

    setRevokingId(certId);
    try {
      const tx = await contract.revokeCertificate(certId);
      await tx.wait();
      await fetchIssuedCertificates();
    } catch (err: any) {
      console.error("Revocation error:", err);
      alert(err.reason || err.message || "Failed to revoke certificate.");
    } finally {
      setRevokingId(null);
    }
  };

  const filteredCerts = issuedCertificates.filter((cert) => {
    const q = filterQuery.toLowerCase();
    return (
      cert.certificateId.toLowerCase().includes(q) ||
      cert.studentName.toLowerCase().includes(q) ||
      cert.courseName.toLowerCase().includes(q) ||
      cert.studentAddress.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Institutional Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Issuer Administration Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Issue tamper-proof digital credentials and manage existing certificates on Ethereum.
          </p>
        </div>

        {/* Authorization Badge */}
        <div>
          {account ? (
            hasIssuerRole ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Authorized Issuer Account</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Wallet Connected (Missing ISSUER_ROLE)</span>
              </div>
            )
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
            >
              <Lock className="w-4 h-4" />
              Connect Wallet to Issue
            </button>
          )}
        </div>
      </div>

      {/* Main Issue Form Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          Issue New Certificate
        </h2>

        {!hasIssuerRole && account && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Issuer Authorization Needed</p>
              <p className="text-amber-300/80 mt-1">
                Your connected account (<span className="font-mono">{account}</span>) does not currently possess <span className="font-mono">ISSUER_ROLE</span> on the smart contract. Submitting transactions will revert unless authorized by the contract admin.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleIssueSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Alice Smith"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Student Address */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Student Ethereum Address *
              </label>
              <input
                type="text"
                required
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Course Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Course / Program Title *
              </label>
              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Certified Web3 & Smart Contract Developer"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Issuer Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Issuing Institution Name *
              </label>
              <input
                type="text"
                required
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                placeholder="e.g. CertiChain Global Institute"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

          </div>

          {/* File Upload to IPFS */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Certificate Document File (PDF) *
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-6 text-center bg-slate-900/50 transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-indigo-400" />
                <span className="text-sm font-medium text-slate-200">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag & drop certificate PDF'}
                </span>
                <span className="text-xs text-slate-500">
                  Document will be content-addressed & pinned on IPFS via web3.storage
                </span>
              </label>
            </div>
          </div>

          {/* Status Updates */}
          {statusStep !== 'idle' && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3 text-indigo-300 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>
                {statusStep === 'uploading_ipfs' && 'Uploading PDF document to IPFS storage...'}
                {statusStep === 'signing_tx' && 'Awaiting MetaMask signature & smart contract transaction confirmation...'}
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {issuedCertId && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-base text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span>Certificate Successfully Issued!</span>
              </div>
              <p className="text-xs font-mono">Certificate ID: {issuedCertId}</p>
              {txHash && <p className="text-[11px] font-mono text-emerald-400/80">Tx Hash: {txHash}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={statusStep !== 'idle' || !account}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            Issue Certificate On-Chain
          </button>
        </form>
      </div>

      {/* Issued Certificates Table Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Issued Certificates Registry
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage and monitor certificates issued by this contract</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search registry..."
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={fetchIssuedCertificates}
              disabled={loadingList}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Refresh Registry"
            >
              <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Registry Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase">
              <tr>
                <th className="p-4">Certificate ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                    {loadingList ? 'Loading certificates...' : 'No certificate records found.'}
                  </td>
                </tr>
              ) : (
                filteredCerts.map((cert) => (
                  <tr key={cert.certificateId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-400">{cert.certificateId}</td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{cert.studentName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{cert.studentAddress}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-300">{cert.courseName}</td>
                    <td className="p-4">
                      {cert.isValid ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Valid
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {cert.isValid && hasIssuerRole && (
                        <button
                          onClick={() => handleRevoke(cert.certificateId)}
                          disabled={revokingId === cert.certificateId}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold transition-colors disabled:opacity-50 flex items-center gap-1 ml-auto"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{revokingId === cert.certificateId ? 'Revoking...' : 'Revoke'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
