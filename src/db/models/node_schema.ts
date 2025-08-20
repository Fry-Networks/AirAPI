import mongoose, { mongo } from "mongoose";
 const NodeSchema = new mongoose.Schema({
  miner_key: { type: String, required: true },
  user_id: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  node_type: String,
  device_id: { type: String, required: true }
});

export interface Node extends mongoose.Document {
  miner_key: string;
  user_id: mongoose.Schema.Types.ObjectId | string;
  timestamp: Date;
  node_type: NODE_TYPE;
  devices_id: string;
}

type NODE_TYPE = "Storage" | "Reward" | "Validator" | "Contributor" | "Ai";

export const NodeAccount = mongoose.model('Node', NodeSchema);