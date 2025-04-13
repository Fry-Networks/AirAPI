import axios from 'axios';
import express from 'express';
import { getCollectionByMinerKey } from "../../db/models/data.js";
import { IopoolAccountModel } from "../../db/models/iopool_schema.js";
import { getUserByAddress } from '../../db/models/users-schema.js';

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

    // Check if the API key already exists in the database
    const existingKey = await IopoolAccountModel.exists({ api_key: apiKey });

    if (existingKey) {
      return res.status(409).send({
        message: "This api key already exists in the database.",
        status: "ERROR",
      });
    }
    const { success, response } = await validateKey(apiKey);
    if (success) {
      const user = await getUserByAddress(address);
      const key = new IopoolAccountModel({
        miner_key,
        user_id: user._id,
        timestamp: new Date(),
        api_type: "Iopool",
        api_key: apiKey,
        title: response.title,
        latestMeasure: response.latestMeasure,
        iopool_id: response.id,
      });
      await key.save();
      
      return res.status(200).send({
        message: "Successfully linked your App Key to your wallet address!\nWe will soon begin to retreive data from your Iopool devices.",
        status: "SUCCESS",
      });
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

async function fetchDataDynamically() {
  try {
    const documents = await IopoolAccountModel.find();

    for (const document of documents) {
      const apiKey = document.api_key;
      const { success, response } = await validateKey(apiKey);
      if (success) {
        const miner_key = document.miner_key;
        const DataCollection = await getCollectionByMinerKey(miner_key);

        const latestMeasureString = JSON.stringify(document.latestMeasure);
        const responseMeasureString = JSON.stringify(response.latestMeasure);
        if (latestMeasureString !== responseMeasureString) {
          // Save previous measurements to historical data collection

          const dataObject = {
            temperature: response.latestMeasure.temperature,
            ph: response.latestMeasure.ph,
            orp: response.latestMeasure.orp,
            mode: response.latestMeasure.mode,
            isValid: response.latestMeasure.isValid,
            ecoId: response.latestMeasure.ecoId,
            measuredAt: response.latestMeasure.measuredAt,
            metadata: {
              data_type: "Iopool",
              iopool_id: response.id,
            },
            timestamp: new Date(),
          };
          
          const data = new DataCollection({
            miner_key,
            status: 'online',
            deviceDataString: dataObject,
            timestamp: new Date(),
          });

          await data.save();

          // Update latestMeasure in current data collection
          document.latestMeasure = response.latestMeasure;
          await document.save();
          console.log(`Updated document with API key: ${apiKey}`);
        } else {
          const data = new DataCollection({
            miner_key,
            status: 'offline',
            deviceDataString: [],
            timestamp: new Date(),
          });

          await data.save();
          console.log(`No update needed for document with API key: ${apiKey}`);
        }
      } else {
        console.error(`Error validating API key: ${apiKey}`, response);
      }
    }
  } catch (error) {
    console.error("Error fetching or updating data:", error);
  }
}

// Set interval for periodic data fetching (every 10 minutes)
setInterval(fetchDataDynamically, 600000);

export default router;