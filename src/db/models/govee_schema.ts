import mongoose from 'mongoose';

// Capability Schema
const CapabilitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  instance: { type: String, required: true },
  state: {
    value: mongoose.Schema.Types.Mixed, // Can be boolean, number, or object
  },
}, { _id: false });

const GoveeAccountSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  timestamp: { type: Date, default: Date.now },
  api_type: { type: String, default: 'govee' },
  walletAddress: String,
  device_id: String,
  sku: String,
  api_key: { type: String, required: true, unique: true },
  capabilities: [CapabilitySchema],
});

// Schema for the dynamic data fetching
const DeviceStateSchema = new mongoose.Schema({
  device: { type: String, required: true },
  sku: { type: String, required: true },
  capabilities: [CapabilitySchema],
}, { _id: false });

const HistoricalGoveeAccountSchema = new mongoose.Schema({
  api_key: { type: String, required: true },
  device_state: DeviceStateSchema,
  timestamp: { type: Date, default: Date.now },
});

// Create the models
export const GoveeAccount = mongoose.model('Govee', GoveeAccountSchema);
export const HistoricalGoveeAccount = mongoose.model('HistoricalGovee', HistoricalGoveeAccountSchema);
