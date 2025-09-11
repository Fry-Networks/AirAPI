import axios from "axios";
import express, { Request, Response } from "express";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

// Minimal: only credential validation

router.post("/api/submitNRF", async (req: Request, res: Response) => {
        
        try {
            const { miner_key, token, deviceId, address } = req.body;

            if (!miner_key || !token || !deviceId || !address) {
                return res
                    .status(400)
                    .send({
                        message: "Token, deviceId, and address are required.",
                        status: "ERROR",
                    });
            }

            try {
                const response = await axios.get(
                    `https://api.nrfcloud.com/v1/devices/${deviceId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                await DeviceCredentials.findOneAndUpdate(
                  { miner_key, type: 'nrf' },
                  { $set: { miner_key, type: 'nrf', address, credentials: { token, deviceId } } },
                  { upsert: true, new: true }
                );

                res.status(200).send({ message: "NRF credentials validated and saved.", status: "SUCCESS" });
            } catch (error: any) {
                return res.status(400).send({
                    message: "Invalid API key or device ID.",
                    status: "ERROR",
                    error: error.message,
                });
            }
        } catch (e) {
            res.status(500).send({
                message: "Internal server error.",
                status: "ERROR",
            });
        }
    }
);

export default router;
