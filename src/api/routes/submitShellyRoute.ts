import axios from "axios";
import express from "express";
import { ShellyModel } from "../../db/models/shelly_schema.js";
import { getCollectionByMinerKey } from "../../db/models/data.js";

const router = express.Router();

const fetchDataAndUpdate = async () => {
    try {
        const shellyAccounts = await ShellyModel.find();

        for (const account of shellyAccounts) {
            const { minerKey, serverUrl, deviceId, authKey, address } = account;

            const formData = {
                ids: [deviceId],
                select: ["status"],
                pick: {}
            };

            const response = await axios.post(`${serverUrl}/v2/devices/api/get?auth_key=${authKey}`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.data.isok && response.data.errors && response.data.errors.no_permissions) {
                console.error(`Error fetching data for device ${deviceId}: ${response.data.errors.no_permissions}`);
                continue; // Skip to the next device if there's an error
            }

            const responseData = response.data;
            const device_status = responseData && responseData.length > 0 ? responseData[0].status : null;

            // Update the latest data in ShellyAccount (overwrite if exists)
            await ShellyModel.findOneAndUpdate(
                { deviceId: responseData[0].id },
                { devices: [{device_status: device_status}] },
                { upsert: true }
            );

            const DataCollection = await getCollectionByMinerKey(minerKey);

            const data = new DataCollection({
                miner_key: minerKey,
                status: responseData[0].online === 1 ? 'online' : 'offline',
                deviceDataString: device_status,
                timestamp: new Date(),
            });

            await data.save();
        }

        console.log("Shelly Data fetch and update completed.");
    } catch (error) {
        console.error("Error fetching or updating data:", error);
    }
};

fetchDataAndUpdate();
setInterval(fetchDataAndUpdate, 10 * 60 * 1000); // Run every 10 minutes


function extractErrorMessage(errors: any) {
    if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
        const firstErrorKey = Object.keys(errors)[0];
        return errors[firstErrorKey];
    }
    return "An error occurred";
}

router.post("/api/submitShelly", async (req, res) => {
    const { minerKey, serverURL, deviceID, authKey, address } = req.body;
    const existingKey = await ShellyModel.exists({
        deviceId: deviceID,
    });

    if (existingKey) {
        const result = await ShellyModel.findOne({
            deviceId: deviceID,
        });

        if (result?.minerKey !== minerKey) {
            return res.status(409).send({
                message: "Already registered in the database.",
                status: "ERROR",
            });
        }
    }

    try {
        const formData = {
            ids: [deviceID],
            select: ["status"],
            pick: {}
        };

        const response = await axios.post(`${serverURL}/v2/devices/api/get?auth_key=${authKey}`, formData, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log(response.data);
        if (!response.data.isok && response.data.errors && response.data.errors.no_permissions) {
            res.status(403).send({
                message: response.data.errors.no_permissions,
                status: "ERROR",
            });
            return;
        }

        const responseData = response.data;
        const device_status = responseData && responseData.length > 0 ? responseData[0].status : null;

        if (existingKey) {
            await ShellyModel.findOneAndUpdate(
                { minerKey },
                { 
                    deviceId: deviceID,
                    authKey,
                    serverUrl: serverURL,
                    devices: [{ device_status }]
                },
                { upsert: false }
            );

            return res.status(200).send({
              message: "Updated Shelly API Successful.",
              status: "SUCCESS",
            });
        }

        // Save latest data in ShellyAccount (without overwriting)
        const shellyAccountData = {
            minerKey,
            deviceId: deviceID,
            authKey,
            api_type: "Shelly",
            serverUrl: serverURL,
            address,
            devices: [{ device_status }]
        };
    
        await ShellyModel.create(shellyAccountData);

        res.status(200).send({
            message: "Shelly API successful.",
            data: responseData,
            status: "SUCCESS",
        });
    } catch (error: any) {
        console.error("Error:", error);
        res.status(500).send({
            message: extractErrorMessage(error?.response?.data?.errors),
            status: "ERROR",
        });
    }
});

export default router;
