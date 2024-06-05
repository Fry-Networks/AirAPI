import axios from "axios";
import express from "express";
import { HistoricalNrf, Nrf } from "../../db/models/nrf_schema.js";

const router = express.Router();

const fetchDataAndUpdate = async () => {
    try {
        const nrfDevices = await Nrf.find();

        for (const device of nrfDevices) {
            const { id, walletAddress,token } = device;

            const response = await axios.get(`https://api.nrfcloud.com/v1/devices/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const newData = response.data;

            const existingData = await Nrf.findOne({ id: newData.id });

            if (existingData && JSON.stringify(existingData) !== JSON.stringify(newData)) {
                // Data has changed, update the latest data collection
                await Nrf.findOneAndUpdate(
                    { id: newData.id },
                    {
                        walletAddress,
                        id: newData.id,
                        tags: newData.tags,
                        tenantId: newData.tenantId,
                        meta: {
                            updatedAt: newData.$meta.updatedAt,
                            createdAt: newData.$meta.createdAt
                        },
                        name: newData.name,
                        type: newData.type,
                        subType: newData.subType,
                        firmware: newData.firmware,
                        cloudMqttEnabled: newData.cloudMqttEnabled,
                        state: newData.state,
                        metaStateData: {
                            desired: newData.state.metadata?.desired,
                            reported: newData.state.metadata?.reported,
                            version: newData.state.version
                        },
                        metadata: {
                            data_type: 'nrf',
                        }
                    },
                    { upsert: true }
                );

                // Save historical data in HistoricalNrf collection
                const historicalData = new HistoricalNrf({
                    ...newData,
                    timestamp: new Date(), // Add timestamp for historical data
                    metadata: {
                        data_type: "nrf",
                    }
                });

                await historicalData.save();
            }
        }

        console.log("Data fetch and update completed.");
    } catch (error) {
        console.error("Error fetching or updating data:", error);
    }
};

fetchDataAndUpdate();
setInterval(fetchDataAndUpdate, 10 * 60 * 1000); // Run every 10 minutes

router.post("/api/submitNRF", async (req, res) => {
    console.log(req.body, '____body')
    try {
        const { token, deviceId, address } = req.body;

        // Check if the device already exists in the database
        const existingDevice = await Nrf.findOne({ id: deviceId });
        if (existingDevice) {
            return res.status(400).send({
                message: "ID already exists.",
                status: "ERROR"
            });
        }

        try {
            const response = await axios.get(`https://api.nrfcloud.com/v1/devices/${deviceId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const deviceData = response.data;
            console.log('deviceData', deviceData)
            const device = new Nrf({
                token: token,
                walletAddress: address,
                id: deviceData.id,
                tags: deviceData.tags,
                tenantId: deviceData.tenantId,
                meta: {
                    updatedAt: deviceData.$meta.updatedAt,
                    createdAt: deviceData.$meta.createdAt
                },
                name: deviceData.name,
                type: deviceData.type,
                subType: deviceData.subType,
                firmware: deviceData.firmware,
                cloudMqttEnabled: deviceData.cloudMqttEnabled,
                state: deviceData.state,
                metaStateData: {
                    desired: deviceData.state.metadata?.desired,
                    reported: deviceData.state.metadata?.reported,
                    version: deviceData.state.version
                },
                metadata: {
                    data_type: 'nrf',
                }
            });

            await device.save();

            // Also save the same data in the HistoricalNrf collection
            const historicalDevice = new HistoricalNrf({
                ...deviceData,
                timestamp: new Date(), // Add timestamp for historical data
                metadata: {
                    data_type: "nrf",
                    deviceId: deviceData.id
                }
            });

            await historicalDevice.save();

            res.status(200).send({
                message: "Device information retrieved successfully.",
                status: "SUCCESS",
                data: deviceData
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
