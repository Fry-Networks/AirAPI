import axios from "axios";
import express, { Request, Response } from "express";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

// Minimal: only credential validation

router.post(
  "/api/submitKaiterra",
  async (req: Request, res: Response) => {
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

      const url = `https://api.kaiterra.cn/v1/devices/${deviceId}/top?key=${token}`;

      try {
        const response = await axios.get(url);
        // valid
        await DeviceCredentials.findOneAndUpdate(
          { miner_key, type: 'kaiterra' },
          { $set: { miner_key, type: 'kaiterra', address, credentials: { token, deviceId } } },
          { upsert: true, new: true }
        );

        res.status(200).send({ message: "Kaiterra credentials validated and saved.", status: "SUCCESS" });
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
