import mongoose from 'mongoose';

const NodeSchema = new mongoose.Schema({
  dev_eui: { type: String },
  dev_name: { type: String },
  lon: { type: String },
  lat: { type: String },
  online_status: { type: String },
  battery_status: { type: String }
}, { _id: false });

const GroupSchema = new mongoose.Schema({
  group_name: { type: String },
  group_unique_name: { type: String },
  nodes: [NodeSchema]
}, { _id: false });

const SenseCAPAccountSchema = new mongoose.Schema({
  miner_key: { type: String, required: true },
  user_id: mongoose.Schema.Types.ObjectId,
  timestamp: { type: Date, default: Date.now },
  api_type: { type: String, default: 'sensecap' },
  walletAddress: String,
  username: { type: String, required: true },
  password: { type: String, required: true },
  deviceID: { type: String, required: true},
  groups: [GroupSchema],
});

// const SenseCAPDataHistorySchema = new mongoose.Schema({
//   sensecapAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'SenseCAPAccount' },
//   timestamp: { type: Date, default: Date.now },
//   groups: [GroupSchema],
// });

export interface SenseCAPData extends mongoose.Document {
  deviceID: string,
  data: [
    {
      group_name: string,
      group_unique_name: string,
      nodes: [
        {
          dev_eui: string,
          dev_name: string,
          lon: string,
          lat: string,
          online_status: string,
          battery_status: string
        }
      ]
    }
  ],
  metadata: {
    data_type: string,
  }
}

export const SenseCAPAccount = mongoose.model('SenseCAPAccount', SenseCAPAccountSchema);
