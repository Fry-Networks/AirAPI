import mongoose from 'mongoose';

const DeviceCredentialsSchema = new mongoose.Schema(
  {
    miner_key: { type: String, required: true, index: true },
    type: { type: String, required: true },
    address: { type: String },
    credentials: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

DeviceCredentialsSchema.index({ miner_key: 1, type: 1 }, { unique: true });

export const DeviceCredentials = mongoose.model(
  'device_credentials',
  DeviceCredentialsSchema
);

export type DeviceCredentialsDoc = mongoose.Document & {
  miner_key: string;
  type: string;
  address?: string;
  credentials: Record<string, any>;
};
