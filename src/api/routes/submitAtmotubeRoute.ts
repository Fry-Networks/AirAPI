import axios from "axios";
import express from "express";
import { Atmotube } from "../../db/models/atmotube_schema.js";

const router = express.Router();

router.post("/api/submitAtmotube", async (req: any, res: any) => {
  console.log(req.body, "____body");
  try {
    const { token, deviceId, address } = req.body;

    // Check if the device already exists in the database
    const existingDevice = await Atmotube.findOne({ deviceId: deviceId });
    if (existingDevice) {
        return res.status(400).send({
            message: "ID already exists.",
            status: "ERROR"
        });
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    const url = `https://api.atmotube.com/api/v1/data?api_key=${token}&mac=${deviceId}&order=asc&format=json&offset=0&limit=100`;

    try {
      const response = await axios.get(url);
      const deviceData = response.data;
      console.log("deviceData", deviceData);
     
      const AtmotubeData = new Atmotube({
        status: deviceData.status,
        token: token,
        walletAddress: address,
        deviceId: deviceId,
        data: {
          total: deviceData.data.total,
          items: deviceData.data.items.map((item: any) => ({
            time: item.time,
            voc: item.voc,
            pm1: item.pm1,
            pm25: item.pm25,
            pm10: item.pm10,
            p: item.p,
          })),
        },
      });

      await AtmotubeData.save();

      res.status(200).send({
        message: "Device information retrieved and saved successfully.",
        status: "SUCCESS",
        data: deviceData,
      });
    } catch (error: any) {
      console.log(error.message)
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
