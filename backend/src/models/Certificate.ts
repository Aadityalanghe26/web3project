import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  certificateId: string;
  studentName: string;
  studentAddress: string;
  courseName: string;
  issuerName: string;
  issueDate: number;
  ipfsCid: string;
  isValid: boolean;
  transactionHash?: string;
  blockNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema: Schema = new Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    studentName: { type: String, required: true },
    studentAddress: { type: String, required: true, index: true },
    courseName: { type: String, required: true },
    issuerName: { type: String, required: true },
    issueDate: { type: Number, required: true },
    ipfsCid: { type: String, required: true },
    isValid: { type: Boolean, default: true },
    transactionHash: { type: String },
    blockNumber: { type: Number },
  },
  {
    timestamps: true,
  }
);

export const CertificateModel = mongoose.model<ICertificate>('Certificate', CertificateSchema);
