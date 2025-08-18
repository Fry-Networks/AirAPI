import axios from 'axios';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { newApiKeyEvent } from '../../db/connect.js';
import { getCollectionByMinerKey } from "../../db/models/data.js";
import { GoveeAccount, GoveeData } from '../../db/models/govee_schema.js';
import { getUserByAddress } from '../../db/models/users-schema.js';

const router = express.Router();

router.post('/api/submitGoveeKey', async function (req, res) {
  try {
    const data = req.body;
    console.log(data, 'Govee data');
    
    const existingKey = await GoveeAccount.exists({ api_key: data.apiKey });
    if (existingKey) {
      const result = await GoveeAccount.findOne({
        api_key: data.apiKey,
      });

      if (result?.miner_key !== data.miner_key) {
        return res.status(409).send({
            message: "API Key already exists in the database.",
            status: "ERROR",
        });
      }
    }

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

    if (existingKey) {
      await GoveeAccount.findOneAndUpdate(
          { miner_key: data.miner_key },
          { 
            api_key: data.apiKey,
            device_id: data.deviceId,
            sku: apiResponse.payload.sku,
            capabilities: apiResponse.payload.capabilities,
            timestamp: new Date(),
          },
          { upsert: false }
      );

      return res.status(200).send({
        message: "Updated Govee Account Successful.",
        status: "SUCCESS",
      });
    }
    
    const user = await getUserByAddress(data.address);

    const goveeAccount = new GoveeAccount({
      miner_key: data.miner_key,
      api_key: data.apiKey,
      user_id: user._id,
      timestamp: new Date(),
      api_type: 'Govee',
      device_id: data.deviceId,
      sku: apiResponse.payload.sku,
      walletAddress: data.address,
      capabilities: apiResponse.payload.capabilities,
    });

    await goveeAccount.save();
    newApiKeyEvent.emit('newApiKey', goveeAccount._id);

    res.status(200).send({
      message: 'Successfully linked your API Key to your wallet address!',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({
      message: 'Internal server error.',
      status: 'ERROR',
    });
  }
});

async function fetchDataDynamically() {
  try {
    const accounts = await GoveeAccount.find();

    for (const account of accounts) {
      const { miner_key, api_key, device_id, sku } = account;

      if (!miner_key)
        continue;

      // Fetch latest state from Govee API
      const response = await axios.post(
        'https://openapi.api.govee.com/router/api/v1/device/state',
        {
          requestId: 'uuid', // Generate a unique UUID for each request
          payload: {
            sku: sku,
            device: device_id,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Govee-API-Key': api_key,
          },
        }
      );

      const apiResponse = response.data;

      if (apiResponse.code === 200) {
        const DataCollection = await getCollectionByMinerKey(miner_key);

        const dataObject = {
          api_key: api_key,
          device_state: apiResponse.payload,
          timestamp: new Date(),
          metadata: {
            data_type: "Govee",
          }
        } as GoveeData;

        const data = new DataCollection({
          miner_key,
          status: apiResponse === null ? 'offline' : 'online',
          deviceDataString: dataObject,
          timestamp: new Date(),
        });

        await data.save();

        console.log(`Updated device state for API Key: ${api_key}`);
      } else {
        console.error(`Error fetching device state for API Key: ${api_key}`);
      }
    }
  } catch (error) {
    console.error('Error fetching or updating Govee data:', error);
  }
}

// Set interval for periodic data fetching (every 10 minutes)
setInterval(fetchDataDynamically, 10 * 60 * 1000);

export default router;