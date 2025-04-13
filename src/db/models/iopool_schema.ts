import mongoose from "mongoose";

export const iopoolAccountScheme = new mongoose.Schema({
  miner_key: String,
  user_id: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  api_key: String,
  title: String,
  iopool_id: String,
  app_key: String,
  latestMeasure: {
    temperature: Number,
    ph: Number,
    orp: Number,
    mode: String,
    isValid: Boolean,
    ecoId: String,
    measuredAt: String,
  },
});

export interface iopoolAccount extends mongoose.Document {
  user_id: mongoose.Schema.Types.ObjectId | string;
  miner_key: string;
  timestamp: Date;
  api_key: string;
  api_type: string;
  title: string;
  iopool_id: string;
  app_key: string;
  latestMeasure: {
    temperature: number;
    ph: number;
    orp: number;
    mode: string;
    isValid: boolean;
    ecoId: string;
    measuredAt: string;
  };
}

// Define the model for current data
export const IopoolAccountModel = mongoose.model<iopoolAccount>(
  "iopool",
  iopoolAccountScheme
);
