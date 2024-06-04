import mongoose from "mongoose";

const awairDataSchema = new mongoose.Schema({
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
});

// Define the schema for historical records
const awairHistoryDataSchema = new mongoose.Schema({
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
});

export const Awair = mongoose.model("Awair", awairDataSchema);
export const HistoricalAwair = mongoose.model("HistoricalAwair", awairHistoryDataSchema);

