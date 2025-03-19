import axios from "axios";
import express from "express";
import { newApiKeyEvent } from "../../db/connect.js";
import { EcowittModel } from "../../db/models/air_accounts.js";
import { getCollectionByMinerKey } from "../../db/models/data.js";
import { Ecowittmodel } from "../../db/models/ecowitt_schema.js";
import { getUserByAddress } from "../../db/models/users-schema.js";

const router = express.Router();

router.post("/api/submitEcokey", async function (req, res) {
  try {
    const data = req.body;
    console.log(data,'ecowitt data')
    const existingKey = await EcowittModel.exists({
      api_key: data.apiKey,
    });

    if (existingKey) {
      return res.status(409).send({
        message: "API Key already exists in the database.",
        status: "ERROR",
      });
    }

    const existingAppKey = await EcowittModel.exists({
      app_key: data.appKey,
    });

    if (existingAppKey) {
      return res.status(409).send({
        message: "App Key already exists in the database.",
        status: "ERROR",
      });
    }

    const response = await axios.get(
      `https://api.ecowitt.net/api/v3/device/list?application_key=${data.appKey}&api_key=${data.apiKey}`
    );

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

    const ecowittAccount = new EcowittModel({
      miner_key: data.miner_key,
      api_key: data.apiKey,
      user_id: user._id,
      timestamp: new Date(),
      api_type: "Ecowitt",
      app_key: data.appKey,
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
});

export default router;
