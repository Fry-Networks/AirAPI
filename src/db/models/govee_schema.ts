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
  miner_key: { type: String, required: true },
  user_id: mongoose.Schema.Types.ObjectId,
  timestamp: { type: Date, default: Date.now },
  api_type: { type: String, default: 'govee' },
  walletAddress: String,
  device_id: String,
  sku: String,
  api_key: { type: String, required: true, unique: true },
  capabilities: [CapabilitySchema],
});

export interface GoveeData extends mongoose.Document {
  api_key: string,
  timestamp: Date,
  device_state: {
    device: string,
    sku: string,
    capabilities: [
      {
        type: string,
        instance: string,
        state: {
          value: boolean | number | object,
        }
      }
    ]
  },
  metadata: {
    data_type: string,
  }
}

// Create the models
export const GoveeAccount = mongoose.model('Govee', GoveeAccountSchema);

