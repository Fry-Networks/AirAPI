import axios from "axios";
import express from "express";
import { newApiKeyEvent } from "../../db/connect.js";
import { Ecowittmodel } from "../../db/models/ecowitt_schema.js";
import { getUserByAddress } from "../../db/models/users-schema.js";

const router = express.Router();

router.post("/api/submitEcokey", async function (req, res) {
  try {
    const data: {key: string, app_key: string, address: string} = req.body;
    console.log(data,'ecowitt data')
    const existingKey = await Ecowittmodel.exists({
      api_key: data.key,
    });

    if (existingKey) {
      return res.status(409).send({
        message: "API Key already exists in the database.",
        status: "ERROR",
      });
    }

    const existingAppKey = await Ecowittmodel.exists({
      app_key: data.app_key,
    });

    if (existingAppKey) {
      return res.status(409).send({
        message: "App Key already exists in the database.",
        status: "ERROR",
      });
    }

    const response = await axios.get(
      `https://api.ecowitt.net/api/v3/device/list?application_key=${data.app_key}&api_key=${data.key}`
    );
    console.log(response,'url')

    const apiResponse = response.data;
    console.log(apiResponse,'apiResponse')

    if (apiResponse.code !== 0) {
      return res.status(400).send({
        message: "Key is invalid. (Did not pass API check)",
        status: "ERROR",
      });
    }
    const user = await getUserByAddress(data.address);

    const devices = apiResponse.data.list.map((device: { id: { toString: () => any; }; mac: any; latitude: any; longitude: any; name: any; }) => ({
      id: device.id.toString(),
      deviceMAC: device.mac,
      infos: {
        coords: {
          lat: device.latitude,
          lon: device.longitude,
        },
        name: device.name,
      },
    }));

    const ecowittAccount = new Ecowittmodel({
      api_key: data.key,
      user_id: user._id,
      timestamp: new Date(),
      api_type: "ecowitt",
      app_key: data.app_key,
      walletAddress: data.address,
      devices: devices,
    });

    await ecowittAccount.save();
    newApiKeyEvent.emit("newApiKey", ecowittAccount._id);

    res.status(200).send({
      message:
        "Successfully linked your API Key to your wallet address!\nWe will soon begin to retrieve data from your ecowitt stations/devices.",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Internal server error.",
      status: "ERROR",
    });
  }

  // Periodic data fetching function
async function fetchDataDynamically() {
    try {
      const accounts = await Ecowittmodel.find();
  
      for (const account of accounts) {
        //@ts-ignore
        const { api_key, app_key } = account;
  
        // Fetch latest devices from Ecowitt API
        const response = await axios.get(
          `https://api.ecowitt.net/api/v3/device/list?application_key=${app_key}&api_key=${api_key}`
        );
  
        const apiResponse = response.data;
  
        // Update devices if API response is successful
        if (apiResponse.code === 0) {
          const devices = apiResponse.data.list.map((device: any) => ({
            id: device.id.toString(),
            deviceMAC: device.mac,
            infos: {
              coords: {
                lat: device.latitude,
                lon: device.longitude,
              },
              name: device.name,
            },
          }));
  
          // Update devices in the database
          await Ecowittmodel.findOneAndUpdate(
            { api_key },
            {
              devices,
              timestamp: new Date(),
            }
          );
  
          console.log(`Updated devices for API Key: ${api_key}`);
        } else {
          console.error(`Error fetching devices for API Key: ${api_key}`);
        }
      }
    } catch (error) {
      console.error("Error fetching or updating Ecowitt data:", error);
    }
  }
  
  // Set interval for periodic data fetching (every 10 minutes)
  setInterval(fetchDataDynamically, 10 * 60 * 1000);
});

export default router;
