import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    time: String,
    voc: String,
    pm1: String,
    pm25: String,
    pm10: String,
    p: String,
});

const apiDataSchema = new mongoose.Schema({
    miner_key: String,
    token: String,
    walletAddress: String,
    deviceId: String,
    status: String,
    data: {
        total: { type: Number, required: true },
        items: [itemSchema]
    },
    metadata: {
        data_type: String,
    }
}, { timestamps: true });

interface itemSchema extends mongoose.Document {
    time: string,
    voc: string,
    pm1: string,
    pm25: string,
    pm10: string,
    p: string,
}

export interface AtmotubeData extends mongoose.Document {
    deviceId: string,
    timestamp: Date,
    data: {
        total: number,
        items: [itemSchema]
    },
    metadata: {
        data_type: string,
    }
}

export const Atmotube = mongoose.model('Atmotube', apiDataSchema);
