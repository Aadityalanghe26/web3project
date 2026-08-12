import React, { useRef } from 'react';
import { X, Award, ExternalLink, Share2, CheckCircle2, XCircle, Printer, Download, ShieldCheck } from 'lucide-react';
import { CertificateStruct } from '../context/Web3Context';
import { getIPFSGatewayUrl } from '../services/ipfsService';

interface CertificateModalProps {
  certificate: CertificateStruct | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!certificate) return null;

  const formatDate = (timestamp: bigint) => {
    try {
      const date = new Date(Number(timestamp) * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const shareUrl = `${window.location.origin}/?certId=${certificate.certificateId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const ipfsUrl = getIPFSGatewayUrl(certificate.ipfsCid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700/60 my-8">
        
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
              <Award className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Official Credential View</h3>
              <p className="text-xs font-mono text-slate-400">{certificate.certificateId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Link Copied!' : 'Share'}
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Credential Canvas */}
        <div className="mt-8 p-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-2xl">
          <div
            ref={printRef}
            className="bg-slate-900 rounded-[13px] p-8 sm:p-12 relative overflow-hidden text-center border border-slate-800"
          >
            {/* Background Seal Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <ShieldCheck className="w-96 h-96 text-indigo-400" />
            </div>

            {/* Credential Header */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-16 h-16 rounded-full bg-indigo-950 border-2 border-indigo-500/50 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-indigo-400 mb-1">
                Certificate of Completion
              </h2>
              <p className="text-xs text-slate-400">CertiChain Verified Immutable Record</p>
            </div>

            {/* Recipient */}
            <div className="my-8">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">This is to certify that</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-200 tracking-tight">
                {certificate.studentName}
              </h1>
              <p className="text-xs font-mono text-indigo-300/80 mt-2">
                Wallet Address: {certificate.studentAddress}
              </p>
            </div>

            {/* Course */}
            <div className="my-8 max-w-2xl mx-auto border-y border-slate-800/80 py-6">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Has successfully completed</p>
              <h3 className="text-2xl font-bold text-indigo-300">
                {certificate.courseName}
              </h3>
            </div>

            {/* Issuer & Date Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 text-left max-w-xl mx-auto bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-[11px] font-mono uppercase text-slate-400">Issuing Institution</p>
                <p className="text-sm font-semibold text-slate-200 mt-0.5">{certificate.issuerName}</p>
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase text-slate-400">Date Issued</p>
                <p className="text-sm font-semibold text-slate-200 mt-0.5">{formatDate(certificate.issueDate)}</p>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {certificate.isValid ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valid On-Chain Certificate</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                    <XCircle className="w-4 h-4" />
                    <span>Revoked Credential</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={ipfsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium text-indigo-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View IPFS Document</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
