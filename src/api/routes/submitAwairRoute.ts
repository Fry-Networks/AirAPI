import axios from "axios";
import express from "express";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

// Note: In the minimal API, we only validate credentials here. No schedulers.

router.post("/api/submitAwair", async (req: any, res: any) => {
    console.log(req.body, '____body');
    try {
        const { miner_key, token, deviceId, address } = req.body;
        if (!miner_key || !token || !deviceId) {
            return res.status(400).send({ message: 'miner_key, token and deviceId are required', status: 'ERROR' });
        }

        const url = `https://developer-apis.awair.is/v1/users/self/devices/awair-element/${deviceId}/air-data/latest`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // If the upstream call succeeds, consider credentials valid.
            await DeviceCredentials.findOneAndUpdate(
                { miner_key, type: 'awair' },
                {
                    $set: {
                        miner_key,
                        type: 'awair',
                        address,
                        credentials: { token, deviceId },
                    },
                },
                { new: true, upsert: true }
            );

            return res.status(200).send({
                message: "Awair credentials validated and saved.",
                status: "SUCCESS",
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
