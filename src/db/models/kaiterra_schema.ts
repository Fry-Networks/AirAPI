import mongoose from 'mongoose';

// Define the schema for points
const pointSchema = new mongoose.Schema({
    ts: { type: Date, required: true },
    value: { type: Number, required: true }
});

// Define the schema for data
const dataSchema = new mongoose.Schema({
    param: { type: String, required: true },
    units: { type: String, required: true },
    span: { type: Number, required: true },
    points: [pointSchema]
});

// Define the main schema
const kaiterraSchema = new mongoose.Schema({
    deviceId: { type: String, required: true },
    token: String,
    walletAddress: String,
    data: [dataSchema],
    metadata: {
        data_type: String,
    }
}, { timestamps: true });

// Define the schema for historical records
const historicalKaiterraSchema = new mongoose.Schema({
    deviceId: { type: String, required: true },
    data: [dataSchema],
    metadata: {
        data_type: String,
    },
    timestamp: { type: Date, default: Date.now }
});

export const Kaiterra = mongoose.model('Kaiterra', kaiterraSchema);
export const HistoricalKaiterra = mongoose.model('HistoricalKaiterra', historicalKaiterraSchema);


