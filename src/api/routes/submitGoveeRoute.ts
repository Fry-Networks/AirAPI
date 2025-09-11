import axios from 'axios';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DeviceCredentials } from '../../db/models/device_credentials.js';

const router = express.Router();

router.post('/api/submitGoveeKey', async function (req, res) {
  try {
    const data = req.body;
    console.log(data, 'Govee data');
    

    const response = await axios.post(
      'https://openapi.api.govee.com/router/api/v1/device/state',
      {
        requestId: uuidv4(),
        payload: {
          sku: 'H5100',
          device: data.deviceId,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Govee-API-Key': data.apiKey,
        },
      }
    );

    const apiResponse = response.data;
    if (apiResponse.code !== 200) {
      return res.status(400).send({
        message: 'Key is invalid. (Did not pass API check)',
        status: 'ERROR',
      });
    }

    await DeviceCredentials.findOneAndUpdate(
      { miner_key: data.miner_key, type: 'govee' },
      {
        $set: {
          miner_key: data.miner_key,
          type: 'govee',
          address: data.address,
          credentials: {
            apiKey: data.apiKey,
            deviceId: data.deviceId,
            sku: apiResponse.payload?.sku || 'H5100',
          },
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).send({ message: 'Govee credentials validated and saved.', status: 'SUCCESS' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({
      message: 'Internal server error.',
      status: 'ERROR',
    });
  }
});

// No scheduler in minimal API

export default router;
