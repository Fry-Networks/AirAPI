import axios from "axios";
import express from "express";
import { Awair, HistoricalAwair } from "../../db/models/awair_schema.js";

const router = express.Router();

const fetchDataAndUpdate = async () => {
    try {
        const AwairDevices = await Awair.find();

        for (const device of AwairDevices) {
            const { deviceId, token } = device;

            const url = `https://developer-apis.awair.is/v1/users/self/devices/awair-element/${deviceId}/air-data/latest`;
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const historicalData = response.data.data[0];

                // Retrieve the latest entry from HistoricalAwair collection
                const latestEntry = await HistoricalAwair.findOne({ deviceId: deviceId }).sort({ timestamp: -1 });

                // Check if the data has changed
                const hasDataChanged = !latestEntry || 
                    latestEntry.score !== historicalData.score || 
                    JSON.stringify(latestEntry.sensors) !== JSON.stringify(historicalData.sensors) || 
                    JSON.stringify(latestEntry.indices) !== JSON.stringify(historicalData.indices);

                if (hasDataChanged) {
                    // Save historical data in HistoricalAwair collection
                    const newData = new HistoricalAwair({
                        deviceId: deviceId,
                        timestamp: new Date(historicalData.timestamp),
                        score: historicalData.score,
                        sensors: historicalData.sensors,
                        indices: historicalData.indices,
                        metadata: {
                            data_type: 'Awair',
                        }
                    });
                    await newData.save();
                } else {
                    console.log(`No changes detected for Awair device ${deviceId}`);
                }
            } catch (error) {
                console.error("Error fetching or updating Awair data:", error);
            }
        }
        console.log("Awair Data fetch and update completed.");
    } catch (error) {
        console.error("Error fetching or updating data:", error);
    }
};

// Fetch data and update every 10 minutes
fetchDataAndUpdate();
setInterval(fetchDataAndUpdate, 10 * 60 * 1000);

router.post("/api/submitAwair", async (req: any, res: any) => {
    console.log(req.body, '____body');
    try {
        const { token, deviceId, address } = req.body;
        // Check if the device already exists in the database
        const existingDevice = await Awair.findOne({ deviceId: deviceId });
        if (existingDevice) {
            return res.status(400).send({
                message: "ID already exists.",
                status: "ERROR",
            });
        }

        const url = `https://developer-apis.awair.is/v1/users/self/devices/awair-element/${deviceId}/air-data/latest`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const airData = response.data.data[0];

            const newAirData = new Awair({
                walletAddress: address,
                deviceId: deviceId,
                token: token,
                timestamp: new Date(airData.timestamp),
                score: airData.score,
                sensors: airData.sensors,
                indices: airData.indices,
                metadata: {
                    data_type: 'Awair',
                }
            });
            await newAirData.save();
            console.log('deviceData', response.data);

            res.status(200).send({
                message: "Device information retrieved successfully.",
                status: "SUCCESS",
                data: response.data
            });
        } catch (error: any) {
            return res.status(400).send({
                message: "Invalid API key or device ID.",
                status: "ERROR",
                error: error.message
            });
        }
    } catch (e) {
        res.status(500).send({
            message: "Internal server error.",
            status: "ERROR"
        });
    }
});

export default router;
