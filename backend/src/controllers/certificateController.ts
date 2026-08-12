import { Request, Response } from 'express';
import { CertificateModel } from '../models/Certificate';
import { getInMemoryCertificates } from '../services/indexer';
import mongoose from 'mongoose';

export const getCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const certificates = await CertificateModel.find().sort({ createdAt: -1 });
      res.json({ success: true, count: certificates.length, data: certificates });
      return;
    }
    const memCerts = getInMemoryCertificates();
    res.json({ success: true, count: memCerts.length, data: memCerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCertificateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const certificate = await CertificateModel.findOne({ certificateId: id });
      if (!certificate) {
        res.status(404).json({ success: false, error: 'Certificate not found' });
        return;
      }
      res.json({ success: true, data: certificate });
      return;
    }

    const memCerts = getInMemoryCertificates();
    const cert = memCerts.find(c => c.certificateId === id);
    if (!cert) {
      res.status(404).json({ success: false, error: 'Certificate not found' });
      return;
    }
    res.json({ success: true, data: cert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCertificatesByStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    const searchAddr = address.toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const certificates = await CertificateModel.find({
        studentAddress: { $regex: new RegExp(`^${searchAddr}$`, 'i') }
      });
      res.json({ success: true, count: certificates.length, data: certificates });
      return;
    }

    const memCerts = getInMemoryCertificates();
    const filtered = memCerts.filter(c => c.studentAddress?.toLowerCase() === searchAddr);
    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
