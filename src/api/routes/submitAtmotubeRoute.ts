import axios from "axios";
import express, { Request, Response } from "express";
import { getCollectionByMinerKey } from "../../db/models/data.js";
import { AtmotubeItem, RequestBody } from "types/atmotubeTypes.js";
import { Atmotube, AtmotubeData } from "../../db/models/atmotube_schema.js";

const router = express.Router();

const fetchDataAndUpdate = async () => {
  try {
    const atmotubeDevices = await Atmotube.find();

    for (const device of atmotubeDevices) {
      const { miner_key, token, deviceId } = device;

      if (!miner_key)
        continue;

      const url = `https://api.atmotube.com/api/v1/data?api_key=${token}&mac=${deviceId}&format=json&offset=0&limit=100`;
      try {
        const response = await axios.get(url);

        const newData = response.data;
        if (newData.status !== 0) {
          console.error(`Invalid response for account: ${deviceId}`);
          continue;
        }

        const atmotubeData = {
          total: newData.data.total,
          items: newData.data.items.map((item: AtmotubeItem) => ({
            time: item.time,
            voc: item.voc,
            pm1: item.pm1,
            pm25: item.pm25,
            pm10: item.pm10,
            p: item.p,
          })),
        };
        
        const existingData = await Atmotube.findOne({ deviceId: deviceId });
        const DataCollection = await getCollectionByMinerKey(miner_key);

        if (
          existingData &&
          JSON.stringify(existingData.data) !== JSON.stringify(atmotubeData)
        ) {
          await Atmotube.findOneAndUpdate(
            { deviceId: deviceId },
            {
              status: newData.status,
              data: atmotubeData,
            }
          );
        }

        const dataObject = {
          deviceId: deviceId,
          data: {
            total: newData.data.total,
            items: newData.data.items.map((item: AtmotubeItem) => ({
              time: item.time,
              voc: item.voc,
              pm1: item.pm1,
              pm25: item.pm25,
              pm10: item.pm10,
              p: item.p,
            })),
          },
          timestamp: new Date(),
          metadata: {
            data_type: "Atmotube",
          },
        } as AtmotubeData;

        const data = new DataCollection({
          miner_key,
          status: Object.keys(newData.data).length === 0 ? 'offline' : 'online',
          deviceDataString: dataObject,
          timestamp: new Date(),
        });

        await data.save();
      } catch (error) {
        console.error("Error fetching when handle API request:", error);
      }
    }
    console.log("Atmotube Data fetch and update completed.");
  } catch (error) {
    console.error("Error fetching or updating data:", error);
  }
};

// Fetch data and update every 10 minutes
fetchDataAndUpdate();
setInterval(fetchDataAndUpdate, 10 * 60 * 1000);

router.post(
  "/api/submitAtmotube",
  async (req: Request<{}, {}, RequestBody>, res: Response) => {
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
      const existingDevice = await Atmotube.findOne({ deviceId: deviceId });
      if (existingDevice) {
        return res.status(400).send({
          message: "ID already exists.",
          status: "ERROR",
        });
      }

      const url = `https://api.atmotube.com/api/v1/data?api_key=${token}&mac=${deviceId}&format=json&offset=0&limit=100`;

      try {
        const response = await axios.get(url);
        const deviceData = response.data;

        const AtmotubeData = new Atmotube({
          miner_key: miner_key,
          status: deviceData.status,
          token: token,
          walletAddress: address,
          deviceId: deviceId,
          data: {
            total: deviceData.data.total,
            items: deviceData.data.items.map((item: AtmotubeItem) => ({
              time: item.time,
              voc: item.voc,
              pm1: item.pm1,
              pm25: item.pm25,
              pm10: item.pm10,
              p: item.p,
            })),
          },
          metadata: {
            data_type: "Atmotube",
          },
        });

        await AtmotubeData.save();

        res.status(200).send({
          message: "Device information retrieved and saved successfully.",
          status: "SUCCESS",
          data: deviceData,
        });
      } catch (error: any) {
        console.log(error.message);
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
