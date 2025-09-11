import axios from 'axios';
import express from 'express';
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();

async function validateKey(apiKey: any): Promise<any> {
  console.log('in validate key')
  try {
    const headers = {
      "x-api-key": apiKey,
    };
   const response = await axios
      .get("https://api.iopool.com/v1/pools", { headers })
      return { success: true, response:response?.data?.[0] };
  } catch (error) {
    return { success: false, response: error };
  }
}

router.post('/api/submitIopool', async function (req, res) {
  try {
    const miner_key = req.body.miner_key;
    const apiKey = req.body.api_key;
    const address = req.body.address;

    const { success, response } = await validateKey(apiKey);
    if (success) {
      await DeviceCredentials.findOneAndUpdate(
        { miner_key, type: 'iopool' },
        {
          $set: {
            miner_key,
            type: 'iopool',
            address,
            credentials: { api_key: apiKey, title: response.title, iopool_id: response.id },
          },
        },
        { upsert: true, new: true }
      );

      return res.status(200).send({ message: "Iopool credentials validated and saved.", status: "SUCCESS" });
    } else {
      // If the key is invalid, return an error
      return res.status(400).send({
        message: "Key is invalid. Please Enter Valid Api Key",
        status: "ERROR",
      });
    }
  } catch (error) {
    console.error("Error submitting IO Pool API key:", error);
    // Handle other errors
    return res.status(500).send({
      message: "Internal server error.",
      status: "ERROR",
    });
  }
});
// No scheduler in minimal API

export default router;
