import express from "express";
import axios from "axios";
import { connect, newApiKeyEvent } from "../../db/connect.js";
import { getUserByAddress } from "../../db/models/users-schema.js";
import { PurpleAirModel } from "../../db/models/air_accounts.js";
import PurpleAirApi from "../../services/api/purple-air.js";

const router = express.Router();

router.post("/api/submitpurple", async function (req, res) {
    try {
      const data: {
        miner_key: string;
        read_key: string;
        sensor_id: string;
        address: string;
      } = req.body;
      // Check if the key is already in the database
      const isPresent = await PurpleAirModel.exists({ sensor: data.sensor_id });
  
      if (isPresent) {
        return void res.status(409).send({
          message: "Sensor already exists in database.",
          status: "ERROR",
        });
      }
     
      // Check if the key is valid by making a request to the API
      //https://rt.ambientweather.net/v1/devices?applicationKey=&apiKey=
      const isValid = await PurpleAirApi.isValid(data.read_key, data.sensor_id)
      if(!isValid) { 
        return void res.status(400).send({
          message: "Read key or invalid sensor ID. (Didn't pass API check)",
          status: "ERROR",
        });
      }
      // Add the key to the database
      const user = await getUserByAddress(data.address);
      console.log(data)
      const air_Account = new PurpleAirModel({
        miner_key: data.miner_key,
        read_key: data.read_key,
        user_id: user._id,
        sensor: data.sensor_id,
        timestamp: new Date(),
        address: data.address,
        api_type: "Purple-air",
      });
      await air_Account.save();
      newApiKeyEvent.emit("newApiKey", air_Account._id);
  
      res.status(200).send({
        message:
          "Successfully linked your Purple air device to your wallet address!\nWe will soon begin to retreive data from your air stations/devices.",
        status: "SUCCESS",
      });
    } catch (e) {
      console.log(e);
      res.status(500).send({
        message: "Internal server error.",
        status: "ERROR",
      });
    }
  });

export default router;
