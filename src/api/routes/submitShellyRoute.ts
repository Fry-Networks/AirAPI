import axios from "axios";
import express from "express";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

// No scheduler in minimal API


function extractErrorMessage(errors: any) {
    if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
        const firstErrorKey = Object.keys(errors)[0];
        return errors[firstErrorKey];
    }
    return "An error occurred";
}

router.post("/api/submitShelly", async (req, res) => {
    const { minerKey, serverURL, deviceID, authKey, address } = req.body;

    try {
        const formData = { ids: [deviceID], select: ["status"], pick: {} };
        const response = await axios.post(`${serverURL}/v2/devices/api/get?auth_key=${authKey}`, formData, { headers: { 'Content-Type': 'application/json' } });

        if (!response.data?.isok) {
            const msg = extractErrorMessage(response.data?.errors);
            return res.status(400).send({ message: msg, status: "ERROR" });
        }

        await DeviceCredentials.findOneAndUpdate(
          { miner_key: minerKey, type: 'shelly' },
          { $set: { miner_key: minerKey, type: 'shelly', address, credentials: { serverURL, authKey, deviceID } } },
          { upsert: true, new: true }
        );

        return res.status(200).send({ message: "Shelly credentials validated and saved.", status: "SUCCESS" });
    } catch (error: any) {
        console.error("Error:", error);
        res.status(500).send({ message: extractErrorMessage(error?.response?.data?.errors), status: "ERROR" });
    }
});

export default router;
