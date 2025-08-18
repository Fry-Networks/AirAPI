import mongoose from "mongoose";

const tapoAccountSchema = new mongoose.Schema({
  minerKey: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  api_type: String,
  deviceIp: { type: String, required: true },
  address: { type: String, required: true }
});

export const TapoModel = mongoose.model("TapoAccount", tapoAccountSchema);