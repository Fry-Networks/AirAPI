import axios from "axios";
import express from "express";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

router.post("/api/submitTempest", async (req, res) => {
  const { minerKey, stationID, token, address } = req.body;

  try {
    const apiUrl = `https://swd.weatherflow.com/swd/rest/observations/station/${stationID}?token=${token}`;
    const response = await axios.get(apiUrl);

    if (!response.data || response.data.status.status_code !== 0) {
      return res.status(400).send({
        message: response.data?.status?.status_message || "API error",
        status: "ERROR",
      });
    }

    await DeviceCredentials.findOneAndUpdate(
      { miner_key: minerKey, type: 'tempest' },
      { $set: { miner_key: minerKey, type: 'tempest', address, credentials: { stationID, token } } },
      { upsert: true, new: true }
    );

    return res.status(200).send({ message: "Tempest credentials validated and saved.", status: "SUCCESS" });
  } catch (error) {
    console.error("Error:", error);
    let errorMessage = "Internal server error.";
    if (typeof error === "object" && error !== null && "response" in error) {
      const axiosError = error as any;
      errorMessage = axiosError?.response?.data?.status?.status_message || axiosError?.response?.data?.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).send({
      message: errorMessage,
      status: "ERROR",
    });
  }
});

export default router;
