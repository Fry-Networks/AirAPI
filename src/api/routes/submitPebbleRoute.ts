import express from "express";
import { AmbientModel, PebbleModel } from "../../db/models/air_accounts.js";
import axios from "axios";
import { getUserByAddress } from "../../db/models/users-schema.js";
import { newApiKeyEvent } from "../../db/connect.js";
import PebbleApi from "../../services/api/pebble.js";

const router = express.Router();

router.post("/api/submitpebble", async function (req, res) {
    try {
        const data: {
          imei: string;
          erc_addr: string;
          address: string
        } = req.body;
        console.log(data);
        // Check if the key is already in the database
        const existingImei = await PebbleModel.exists({ imei: data.imei });
    
        if (existingImei) {
          return void res.status(409).send({
            message: "Imei already exists in database.",
            status: "ERROR",
          });
        }
        // Check regex
        const regexCheck = /^[0-9]{15}$/.test(data.imei);
        if (!regexCheck) {
          return void res.status(400).send({
            message: "Imei is invalid. (Didn't pass regex check)",
            status: "ERROR",
          });
        }
        // Check if the key is valid by making a request to the API
        //https://rt.ambientweather.net/v1/devices?applicationKey=&apiKey=
        try {
          const isOwner = await PebbleApi.verifyOwnership(data.imei, data.erc_addr);
          console.log(isOwner);
          if (!isOwner) {
            return void res.status(400).send({
              message: "Failed to ensure ownership of the pebble tracker (imeil and owner (ERC20 address) do not match)",
              status: "ERROR",
            });
          }
        } catch (e) {
          console.log(e);
          return void res.status(400).send({
            message: "Failed to ensure ownership of the pebble tracker (imeil and owner (ERC20 address) do not match)",
            status: "ERROR",
          });
        }
        // Add the key to the database
        const user = await getUserByAddress(data.address);
    
        const key = new PebbleModel({
          imei: data.imei,
          user_id: user._id,
          address: data.address,
          timestamp: new Date(),
          owner: data.erc_addr.toLowerCase(),
          api_type: "pebble",
        });
        await key.save();
        newApiKeyEvent.emit("newApiKey", key._id);
    
        res.status(200).send({
          message:
            "Successfully linked your Pebble device to your wallet address!\nWe will soon begin to retreive data from it.",
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
