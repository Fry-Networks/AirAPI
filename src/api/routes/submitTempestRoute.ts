import axios from "axios";
import express from "express";
import { TempestData } from "../../db/models/tempest_schema.js";
import { getCollectionByMinerKey } from "../../db/models/data.js";

const router = express.Router();

router.post("/api/submitTempest", async (req, res) => {
  const { minerKey, stationID, token, address } = req.body;

  // Conflict: station already linked to different miner
  const conflicting = await TempestData.findOne({ station_id: stationID, minerKey: { $ne: minerKey } });
  if (conflicting) {
    return res.status(409).send({
      message: "Already registered in the database.",
      status: "ERROR",
    });
  }

  try {
    const apiUrl = `https://swd.weatherflow.com/swd/rest/observations/station/${stationID}?token=${token}`;
    const response = await axios.get(apiUrl);

    if (!response.data || response.data.status.status_code !== 0) {
      return res.status(400).send({
        message: response.data?.status?.status_message || "API error",
        status: "ERROR",
      });
    }

    const tempestData = response.data;
    const obs = tempestData.obs || [];
    const latestObs = obs.length > 0 ? obs[0] : null;

    await TempestData.findOneAndUpdate(
      { minerKey },
      {
        minerKey,
        station_id: stationID,
        token,
        address,
        latitude: tempestData.latitude,
        longitude: tempestData.longitude,
        elevation: tempestData.elevation,
        station_name: tempestData.station_name,
        public_name: tempestData.public_name,
        is_public: tempestData.is_public,
        timezone: tempestData.timezone,
        obs,
        station_units: tempestData.station_units,
        devices: latestObs ? [latestObs] : [],
        timestamp: new Date(),
      },
      { upsert: true }
    );

    // Save latest observation to a Tempest collection (by miner)
    if (latestObs) {
      const DataCollection = await getCollectionByMinerKey(minerKey);
      const data = new DataCollection({
        miner_key: minerKey,
        status: "online",
        deviceDataString: latestObs,
        timestamp: new Date(),
      });
      await data.save();
    }

    return res.status(200).send({
      message: "Tempest API successful.",
      data: tempestData,
      status: "SUCCESS",
    });
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
