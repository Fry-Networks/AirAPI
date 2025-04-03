import mongoose from "mongoose";

// Sensor Value Schema
const sensorValueSchema = new mongoose.Schema({
    u: { type: Number, required: true }, // Timestamp or unique identifier
    s: { type: Number, required: true }, // Sensor reading
}, { _id: false });

// Current Lacrosse Data Schema
const LacrosseDataSchema = new mongoose.Schema({
    miner_key: { 
        type: String, 
        required: true 
    },
    api_type: { 
        type: String, 
        default: 'Lacrosse' 
    },
    walletAddress: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    device_id: String,
    device_name: String,
    Temperature: {
        values: [sensorValueSchema],
        unit: { type: String, default: "Celsius" },
    },
    Humidity: {
        values: [sensorValueSchema],
        unit_enum: { type: Number },
        unit: { type: String, default: "relative_humidity" },
    },
    HeatIndex: {
        values: [sensorValueSchema],
        unit_enum: { type: Number },
        unit: { type: String, default: "relative_humidity" },
    },
    BarometricPressure: {
        values: [sensorValueSchema],
        unit_enum: { type: Number },
        unit: { type: String, default: "relative_humidity" },
    },
}, { timestamps: true });

export const LacrosseData = mongoose.model("Lacrosse", LacrosseDataSchema);