import axios from "axios";
import express, { Request, Response } from "express";
import { RequestBody } from "types/nrfTypes.js";
import { getCollectionByMinerKey } from "../../db/models/data.js";
import { NrfData, Nrf } from "../../db/models/nrf_schema.js";

const router = express.Router();

const fetchDataAndUpdate = async () => {
    try {
        const nrfDevices = await Nrf.find();

        for (const device of nrfDevices) {
            const { miner_key, id, walletAddress, token } = device;

            if (!miner_key)
                continue;

            const response = await axios.get(
                `https://api.nrfcloud.com/v1/devices/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const newData = response.data;

            const existingData = await Nrf.findOne({ id: newData.id });

            if (
                existingData &&
                JSON.stringify(existingData) !== JSON.stringify(newData)
            ) {
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
                            createdAt: newData.$meta.createdAt,
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
                            version: newData.state.version,
                        },
                        metadata: {
                            data_type: "nrf",
                        },
                    },
                    { upsert: true }
                );
            }

            const DataCollection = await getCollectionByMinerKey(miner_key);
            const dataObject = {
                id: newData.id,
                tags: newData.tags,
                tenantId: newData.tenantId,
                meta: {
                    updatedAt: newData.$meta.updatedAt,
                    createdAt: newData.$meta.createdAt,
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
                    version: newData.state.version,
                },
                timestamp: new Date(),
                metadata: {
                  data_type: "Nrf",
                },
            } as NrfData;

            const data = new DataCollection({
                miner_key,
                status: newData === null ? 'offline' : 'online',
                deviceDataString: dataObject,
                timestamp: new Date(),
            });

            await data.save();
        }
        console.log("Data fetch and update completed.");
    } catch (error) {
        console.error("Error fetching or updating data:", error);
    }
};

fetchDataAndUpdate();
setInterval(fetchDataAndUpdate, 10 * 60 * 1000); // Run every 10 minutes

router.post(
    "/api/submitNRF",
    async (req: Request<{}, {}, RequestBody>, res: Response) => {
        console.log(req.body, "____body");
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

            // Check if the device already exists in the database
            const existingDevice = await Nrf.findOne({ id: deviceId });
            if (existingDevice) {
                return res.status(400).send({
                    message: "ID already exists.",
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

                const deviceData = response.data;
                console.log("deviceData", deviceData);
                const device = new Nrf({
                    miner_key,
                    token: token,
                    walletAddress: address,
                    id: deviceData.id,
                    tags: deviceData.tags,
                    tenantId: deviceData.tenantId,
                    meta: {
                        updatedAt: deviceData.$meta.updatedAt,
                        createdAt: deviceData.$meta.createdAt,
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
                        version: deviceData.state.version,
                    },
                    metadata: {
                        data_type: "Nrf",
                    },
                });

                await device.save();

                res.status(200).send({
                    message: "Device information retrieved successfully.",
                    status: "SUCCESS",
                    data: deviceData,
                });
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
