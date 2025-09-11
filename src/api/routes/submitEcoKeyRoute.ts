import axios from "axios";
import express from "express";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

router.post("/api/submitEcokey", async function (req, res) {
  try {
    const data = req.body;

    const response = await axios.get(
      `https://api.ecowitt.net/api/v3/device/list?application_key=${data.appKey}&api_key=${data.apiKey}`
    );

    const apiResponse = response.data;
    console.log(apiResponse,'apiResponse')

    if (apiResponse.code !== 0) {
      return res.status(400).send({
        message: "Key is invalid. (Did not pass API check)",
        status: "ERROR",
      });
    }
    await DeviceCredentials.findOneAndUpdate(
      { miner_key: data.miner_key, type: 'ecowitt' },
      { $set: { miner_key: data.miner_key, type: 'ecowitt', address: data.address, credentials: { api_key: data.apiKey, app_key: data.appKey } } },
      { upsert: true, new: true }
    );

    res.status(200).send({ message: "Ecowitt credentials validated and saved.", status: "SUCCESS" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Internal server error.",
      status: "ERROR",
    });
  }
});

export default router;
