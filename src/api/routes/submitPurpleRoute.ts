import express from "express";
import axios from "axios";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

router.post("/api/submitpurple", async function (req, res) {
    try {
      const data: {
        miner_key: string;
        read_key: string;
        sensor_id: string;
        address: string;
      } = req.body;
      // Validate PurpleAir Read API key and sensor
      try {
        const keyResp = await axios.get(`https://api.purpleair.com/v1/keys`, { headers: { 'X-API-Key': data.read_key } });
        const isRead = keyResp.status === 201 && keyResp.data?.api_key_type === 'READ';
        if (!isRead) throw new Error('Invalid key type');
        await axios.get(`https://api.purpleair.com/v1/sensors/${data.sensor_id}`, { headers: { 'X-API-Key': data.read_key } });
      } catch (e) {
        return void res.status(400).send({
          message: "Read key or sensor ID is invalid.",
          status: "ERROR",
        });
      }

      await DeviceCredentials.findOneAndUpdate(
        { miner_key: data.miner_key, type: 'purple' },
        { $set: { miner_key: data.miner_key, type: 'purple', address: data.address, credentials: { read_key: data.read_key, sensor: data.sensor_id } } },
        { upsert: true, new: true }
      );

      res.status(200).send({ message: "PurpleAir credentials validated and saved.", status: "SUCCESS" });
    } catch (e) {
      console.log(e);
      res.status(500).send({
        message: "Internal server error.",
        status: "ERROR",
      });
    }
  });

export default router;
