import axios from "axios";
import express, { Request, Response } from "express";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

// Minimal: only credential validation

router.post(
  "/api/submitAtmotube",
  async (req: Request, res: Response) => {
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

      const url = `https://api.atmotube.com/api/v1/data?api_key=${token}&mac=${deviceId}&format=json&offset=0&limit=100`;

      try {
        const response = await axios.get(url);
        // Any 200 response is considered valid. Save credentials.
        await DeviceCredentials.findOneAndUpdate(
          { miner_key, type: 'atmotube' },
          { $set: { miner_key, type: 'atmotube', address, credentials: { token, deviceId } } },
          { upsert: true, new: true }
        );

        res.status(200).send({ message: "Atmotube credentials validated and saved.", status: "SUCCESS" });
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
