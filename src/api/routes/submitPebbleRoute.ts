import express from "express";
import { PebbleAccount, PebbleModel } from "../../db/models/air_accounts.js";
import axios from "axios";
import { getUserByAddress } from "../../db/models/users-schema.js";
import { newApiKeyEvent } from "../../db/connect.js";
import PebbleApi from "../../services/api/pebble.js";

const router = express.Router();

router.post("/api/submitpebble", async function (req, res) {
    try {
        const data: {
          miner_key: string;
          imei: string;
          erc_addr: string;
          address: string
        } = req.body;
        console.log(data);
        // Check if the key is already in the database
        const existingImei = await PebbleModel.exists({ imei: data.imei });
    
        if (existingImei) {
          const result: PebbleAccount | null = await PebbleModel.findOne({
            imei: data.imei,
          });
  
          if (result?.miner_key !== data.miner_key) {
              return res.status(409).send({
                message: "Imei already exists in database.",
                status: "ERROR",
              });
          }
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

        if (existingImei) {
          await PebbleModel.findOneAndUpdate(
              { miner_key: data.miner_key },
              { 
                imei: data.imei,
                owner: data.erc_addr.toLowerCase(),
                timestamp: new Date(),
              },
              { upsert: false }
          );
  
          return res.status(200).send({
            message: "Updated Pebble Account Successful.",
            status: "SUCCESS",
          });
        }

        // Add the key to the database
        const user = await getUserByAddress(data.address);
    
        const key = new PebbleModel({
          miner_key: data.miner_key,
          imei: data.imei,
          user_id: user._id,
          address: data.address,
          timestamp: new Date(),
          owner: data.erc_addr.toLowerCase(),
          api_type: "Pebble",
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
