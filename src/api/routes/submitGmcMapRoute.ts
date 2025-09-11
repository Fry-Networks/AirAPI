import axios from "axios";
import express from "express";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

router.post("/api/submitGmcMap", async function (req, res) {
  const { param_id, miner_key } = req.body;

  if (!param_id || !miner_key) {
    console.error("Param_ID or MinerKey is missing");
    return res.status(400).json({
      status: "ERROR",
      message: "Param_ID and MinerKey are required",
    });
  }

  console.log(`Received Param_ID: ${param_id}, MinerKey: ${miner_key}`);

  try {
    // Simple validation: page returns 200
    await axios.get(`https://gmcmap.com/historyData.asp?Param_ID=${encodeURIComponent(param_id)}`);
    await DeviceCredentials.findOneAndUpdate(
      { miner_key, type: 'gmcmap' },
      { $set: { miner_key, type: 'gmcmap', credentials: { param_id } } },
      { upsert: true, new: true }
    );

    res.status(200).json({ status: "SUCCESS", message: "GmcMap param validated and saved" });
  } catch (error: any) {
    console.error("Error occurred while processing:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve and store data",
      error: error.message,
    });
  }
});

// No scheduler in minimal API

export default router;
