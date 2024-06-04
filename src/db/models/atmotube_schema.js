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
    token: String,
    walletAddress: String,
    deviceId: String,
    status: String,
    data: {
        total: { type: Number, required: true },
        items: [itemSchema]
    }
}, { timestamps: true });

export const Atmotube = mongoose.model('Atmotube', apiDataSchema);
