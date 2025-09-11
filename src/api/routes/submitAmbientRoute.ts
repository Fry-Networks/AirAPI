import express from "express";
import axios from "axios";
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

router.post("/api/submitkey", async function (req, res) {
    try {
        const data: { miner_key: string; key: string; address?: string } = req.body;
        console.log(data);
        // Check regex
        const regexCheck = /^[a-z0-9]{64}$/.test(data.key);
        if (!regexCheck) {
          return void res.status(400).send({
            message: "Key is invalid. (Didn't pass regex check)",
            status: "ERROR",
          });
        }
        // Check if the key is valid by making a request to the API
        //https://rt.ambientweather.net/v1/devices?applicationKey=&apiKey=
        try {
          await axios.get(
            `https://rt.ambientweather.net/v1/devices?applicationKey=${process.env.AW_APPLICATION_KEY}&apiKey=${data.key}`
          );
        } catch (e) {
          return void res.status(400).send({
            message: "Key is invalid. (Didn't pass API check)",
            status: "ERROR",
          });
        }
        await DeviceCredentials.findOneAndUpdate(
          { miner_key: data.miner_key, type: 'ambient' },
          {
            $set: {
              miner_key: data.miner_key,
              type: 'ambient',
              address: data.address,
              credentials: { api_key: data.key },
            },
          },
          { upsert: true, new: true }
        );

        res.status(200).send({
          message: "Ambient key validated and saved.",
          status: "SUCCESS",
        });
      } catch (e) {
        res.status(500).send({
          message: "Internal server error.",
          status: "ERROR",
        });
      }
});

export default router;
