import express from "express";
import { TempestData } from "../../db/models/tempest_schema.js";
import { getUserByAddress } from "../../db/models/users-schema.js";

const router = express.Router();

router.post("/api/submitTempestKey", async function (req, res) {
  try {
    const data = req.body;

    // Check for existing station_id
    const existingStation = await TempestData.exists({
      station_id: data.station_id,
    });

    if (existingStation) {
      const result = await TempestData.findOne({
        station_id: data.station_id,
      });

      if (result?.minerKey !== data.minerKey) {
        return res.status(409).send({
          message: "Station ID already exists in the database.",
          status: "ERROR",
        });
      }
    }

    if (existingStation) {
      await TempestData.findOneAndUpdate(
        { minerKey: data.minerKey },
        {
          station_id: data.station_id,
          latitude: data.latitude,
          longitude: data.longitude,
          elevation: data.elevation,
          timestamp: new Date(),
        },
        { upsert: false }
      );

      return res.status(200).send({
        message: "Updated Tempest Account Successful.",
        status: "SUCCESS",
      });
    }

    const user = await getUserByAddress(data.address);

    const tempestAccount = new TempestData({
      minerKey: data.minerKey,
      user_id: user._id,
      timestamp: new Date(),
      station_id: data.station_id,
      latitude: data.latitude,
      longitude: data.longitude,
      elevation: data.elevation,
      walletAddress: data.address,
    });

    await tempestAccount.save();

    res.status(200).send({
      message:
        "Successfully linked your Tempest station to your wallet address! Data will be retrieved soon.",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Internal server error.",
      status: "ERROR",
    });
  }
});

export default router;
