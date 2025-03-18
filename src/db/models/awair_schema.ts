import mongoose from "mongoose";

const awairDataSchema = new mongoose.Schema({
  miner_key: { type: String, required: true },
  token: String,
  walletAddress: String,
  deviceId: { type: String, required: true },
  timestamp: {
    type: Date,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  sensors: [
    {
      comp: {
        type: String,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
  ],
  indices: [
    {
      comp: {
        type: String,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
  ],
  metadata: {
    data_type: String,
}
});

// Define the schema for historical records
export interface AwairData extends mongoose.Document {
  deviceId: string,
  timestamp: Date,
  score: number,
  sensors: [
    {
      comp: string,
      value: number,
    },
  ],
  indices: [
    {
      comp: string,
      value: number,
    },
  ],
  metadata: {
    data_type: string,
  }
}

export const Awair = mongoose.model("Awair", awairDataSchema);
// export const HistoricalAwair = mongoose.model("HistoricalAwair", awairHistoryDataSchema);

