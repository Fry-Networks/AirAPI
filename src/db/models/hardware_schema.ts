import mongoose, { mongo } from "mongoose";
 const HardwareSchema = new mongoose.Schema({
  miner_key: { type: String, required: true },
  user_id: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  hd_type: String,
  device_id: { type: String, required: true }
});

export interface Hardware extends mongoose.Document {
  miner_key: string;
  user_id: mongoose.Schema.Types.ObjectId | string;
  timestamp: Date;
  hd_type: HD_TYPE;
  devices_id: string;
}

type HD_TYPE = "Satellite" | "Decibel" | "Bandwidth";

export const HardwareAccount = mongoose.model('Hardware', HardwareSchema);