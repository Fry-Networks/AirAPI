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
    miner_key: { type: String, required: true },
    deviceId: { type: String, required: true },
    token: String,
    walletAddress: String,
    data: [dataSchema],
    metadata: {
        data_type: String,
    }
}, { timestamps: true });

export interface KaiterraData extends mongoose.Document {
    deviceId: string,
    timestamp: Date,
    data: [
        {
            param: string,
            units: string,
            span: number,
            points: [
                {
                    ts: Date,
                    value: number,
                }
            ]
        }
    ],
    metadata: {
        data_type: string,
    }
}

export const Kaiterra = mongoose.model('Kaiterra', kaiterraSchema);

