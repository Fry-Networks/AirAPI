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

export const Atmotube = mongoose.model('Atmotube', apiDataSchema);
