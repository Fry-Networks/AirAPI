import axios from "axios";
import express from "express";
import { HistoricalKaiterra, Kaiterra } from "../../db/models/kaiterra_schema.js";

const router = express.Router();

const fetchDataAndUpdate = async () => {
    try {
        const kaiterraDevices = await Kaiterra.find();

        for (const device of kaiterraDevices) {
            const { deviceId, token, walletAddress } = device;

            const url = `https://api.kaiterra.cn/v1/devices/${deviceId}/top?key=${token}`;
            const response = await axios.get(url);

            const newData = response.data;
            const mappedData = newData?.data?.map((item: any) => ({
                param: item.param,
                units: item.units,
                span: item.span,
                points: item?.points?.map((point: any) => ({
                    ts: new Date(point.ts),
                    value: point.value,
                })),
            }));

            const existingData = await Kaiterra.findOne({ deviceId: newData.id });

            if (existingData && JSON.stringify(existingData.data) !== JSON.stringify(mappedData)) {
                await Kaiterra.findOneAndUpdate(
                    { deviceId: newData.id },
                    {
                        token,
                        walletAddress,
                        data: mappedData
                    },
                    { upsert: true }
                );

                // Save historical data in HistoricalKaiterra collection
                const historicalData = new HistoricalKaiterra({
                    deviceId: newData.id,
                    data: mappedData,
                    timestamp: new Date()
                });

                await historicalData.save();
            }
        }

        console.log("Kaiterra Data fetch and update completed.");
    } catch (error) {
        console.error("Error fetching or updating data:", error);
    }
};

// Fetch data and update every 10 minutes
fetchDataAndUpdate();
setInterval(fetchDataAndUpdate, 10 * 60 * 1000);


router.post("/api/submitKaiterra", async (req: any, res: any) => {
  console.log(req.body, "____body");
  try {
    const { token, deviceId, address } = req.body;

    // Check if the device already exists in the database
    const existingDevice = await Kaiterra.findOne({ deviceId: deviceId });
    if (existingDevice) {
      return res.status(400).send({
        message: "ID already exists.",
        status: "ERROR",
      });
    }
    const url = `https://api.kaiterra.cn/v1/devices/${deviceId}/top?key=${token}`;

    try {
      const response = await axios.get(url);
      const deviceData = response.data;

      // Check and map the structure of data if needed
      const mappedData = deviceData?.data?.map((item: any) => ({
        param: item.param,
        units: item.units,
        span: item.span,
        points: item?.points?.map((point: any) => ({
          ts: new Date(point.ts),
          value: point.value,
        })),
      }));

      // Create a new document with the mapped data
      const newData = new Kaiterra({
        deviceId: deviceId,
        token: token,
        walletAddress: address,
        data: mappedData,
      });

      await newData.save();

      res.status(200).send({
        message: "Device information retrieved successfully.",
        status: "SUCCESS",
        data: response.data,
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
});

export default router;
