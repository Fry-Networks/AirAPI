import axios from "axios";
import express from "express";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

router.post("/api/getTemperature", async function (req, res) {
    try {
        const data = {
            miner_key: req.body.miner_key,
            email: req.body.email,
            password: req.body.password,
            walletAddress: req.body.address
        };

        const token = await lacrosseLogin(data.email, data.password);
        await lacrosseGetLocations(token); // basic validation

        await DeviceCredentials.findOneAndUpdate(
            { miner_key: data.miner_key, type: 'lacrosse' },
            { $set: { miner_key: data.miner_key, type: 'lacrosse', address: data.walletAddress, credentials: { email: data.email, password: data.password } } },
            { upsert: true, new: true }
        );

        return res.status(200).send({
            message: "Lacrosse credentials validated and saved.",
            status: "SUCCESS",
        });

    } catch (e: any) {
        let errorResponse;
        if (e.response?.data?.error) {
            const errorCode = e.response.data.error.code;
            const errorMessage = e.response.data.error.message;
            const errorDetails = e.response.data.error.errors || [];

            errorResponse = {
                message: errorMessage || "Internal server error.",
                status: "ERROR",
                errorCode: errorCode,
                errorDetails: errorDetails,
            };
        } else {
            errorResponse = {
                message: "Internal server error.",
                status: "ERROR",
            };
        }
        return res.status(500).send(errorResponse);
    }
});

async function lacrosseLogin(email: any, password: any) {
    const url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=REDACTED_ROTATE_ME";
    const payload = {
        email: email,
        returnSecureToken: true,
        password: password,
    };
    const response = await axios.post(url, payload);
    const token = response.data.idToken;

    if (!token) {
        throw new Error("Login Failed. Check credentials and try again.");
    }
    console.log("Login token received:", token);
    return token;
}

async function lacrosseGetLocations(token: any) {
    const url = "https://lax-gateway.appspot.com/_ah/api/lacrosseClient/v1.1/active-user/locations";
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(url, { headers });
    console.log(response,'______locationResponse')

    if (response.status < 200 || response.status >= 300) {
        throw new Error("Failed to get locations.");
    }
    console.log("Locations retrieved:", response.data.items); // Log the retrieved locations
    return response.data.items;
}

// Function to get devices
async function lacrosseGetDevices(token: any, locations: any) {
    const devices = [];
    for (const location of locations) {
        const url = `https://lax-gateway.appspot.com/_ah/api/lacrosseClient/v1.1/active-user/location/${location.id}/sensorAssociations?prettyPrint=false`;
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(url, { headers });

        if (response.status < 200 || response.status >= 300) {
            throw new Error("Failed to get devices.");
        }
        const rawDevices = response.data.items || [];
        for (const device of rawDevices) {
            const sensor = device.sensor || {};
            const sensorFields = sensor.type?.fields || {};
            
            const fieldNames = Object.keys(sensorFields)
                .filter(fieldName => fieldName.toLowerCase() !== 'notsupported');

            devices.push({
                device_name: device.name.toLowerCase().replace(/\s+/g, '_'),
                device_id: device.id,
                sensor_type_name: sensor.type?.name || 'Unknown',
                sensor_id: sensor.id || 'Unknown',
                sensor_field_names: fieldNames,
                location,
            });
        }
    }
    console.log("Devices retrieved:", devices); // Log the retrieved devices
    return devices;
}

// Function to get weather data
async function lacrosseGetWeatherData(token: any, device: any) {
    const fieldsStr = device.sensor_field_names.join(',') || null;
    const url = `https://ingv2.lacrossetechnology.com/api/v1.1/active-user/device-association/ref.user-device.${device.device_id}/feed?fields=${fieldsStr}&tz=America/Los_Angeles&aggregates=ai.ticks.1&types=spot`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(url, { headers });

    if (response.status < 200 || response.status >= 300) {
        throw new Error("Failed to get weather data.");
    }

    console.log("Weather data retrieved:", response.data[`ref.user-device.${device.device_id}`]['ai.ticks.1'].fields);
    return response.data[`ref.user-device.${device.device_id}`]['ai.ticks.1'].fields;
}

// No scheduler in minimal API


export default router;
