import axios from "axios";
import express from "express";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

router.post("/api/submitSenseCAPKey", async function (req, res) {
    try {
        const data = req.body;
        console.log(data, "SenseCAP data");
        const auth =
            "Basic " +
            new Buffer(`${data.username}` + ":" + `${data.password}`
            ).toString("base64");
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: "https://sensecap.seeed.cc/1.0/lists/group/devices",
            headers: {
                Authorization: auth,
            },
            data: {
                device_euis: `${data.deviceId}`,
                device_type: "1-gateway",
            },
        };

        const response = await axios.request(config);
        console.log(auth, "auth_____________");
        console.log(response?.data, "API response");

        const apiResponse = response.data;

        if (apiResponse.code !== "0") {
            return res.status(400).send({
                message: "Invalid credentials. (Did not pass API check)",
                status: "ERROR",
            });
        }
        await DeviceCredentials.findOneAndUpdate(
          { miner_key: data.miner_key, type: 'sensecap' },
          { $set: { miner_key: data.miner_key, type: 'sensecap', address: data.address, credentials: { username: data.username, password: data.password, deviceId: data.deviceId } } },
          { upsert: true, new: true }
        );

        res.status(200).send({ message: "SenseCAP credentials validated and saved.", status: "SUCCESS" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({
            message: "Internal server error.",
            status: "ERROR",
        });
    }
});

// No scheduler in minimal API

export default router;
