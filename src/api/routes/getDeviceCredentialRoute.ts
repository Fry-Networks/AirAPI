import express from "express";
import { AmbientModel } from "../../db/models/air_accounts.js";
import { Awair } from "../../db/models/awair_schema.js";
import { Atmotube } from "../../db/models/atmotube_schema.js";
import { EcowittModel } from "../../db/models/air_accounts.js";
import { GoveeAccount } from '../../db/models/govee_schema.js';
import { GmcMapData } from "../../db/models/gmcmap_schema.js";
import { IopoolAccountModel } from "../../db/models/iopool_schema.js";
import { Kaiterra } from "../../db/models/kaiterra_schema.js";
import { LacrosseData } from "../../db/models/lacrosse-schema.js";
import { Nrf } from "../../db/models/nrf_schema.js";
import { PebbleModel } from "../../db/models/air_accounts.js";
import { PurpleAirModel } from "../../db/models/air_accounts.js";
import { SenseCAPAccount } from "../../db/models/sensecap_schema.js";
import { ShellyModel } from "../../db/models/shelly_schema.js";
import { TapoModel } from "../../db/models/tapo_schema.js";
import { WXMModel } from "../../db/models/air_accounts.js";
import { RtspLink } from '../../db/models/rtsp_schema.js';
import { HardwareAccount } from "../../db/models/hardware_schema.js";
import { NodeAccount } from "../../db/models/node_schema.js";

const router = express.Router();

router.post("/api/getDeviceCredential", async function (req, res) {
    try {
        const data: {
          miner_key: string;
          type: string;
          address: string;
        } = req.body;
        console.log(data);

        const miner_key = data.miner_key;
        const type = data.type;
        // Check if the key is already in the database
        if (type === 'ambient') {
          const existingKey = await AmbientModel.exists({ miner_key });
          if (existingKey) {
            const doc = await AmbientModel.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'atmotube') {
          const existingKey = await Atmotube.exists({ miner_key });
          if (existingKey) {
            const doc = await Atmotube.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'awair') {
          const existingKey = await Awair.exists({ miner_key });
          if (existingKey) {
            const doc = await Awair.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'ecowitt') {
          const existingKey = await EcowittModel.exists({ miner_key });
          if (existingKey) {
            const doc = await EcowittModel.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'govee') {
          const existingKey = await GoveeAccount.exists({ miner_key });
          if (existingKey) {
            const doc = await GoveeAccount.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'gmcmap') {
          const existingKey = await GmcMapData.exists({ minerKey: miner_key });
          if (existingKey) {
            const doc = await GmcMapData.findOne({ minerKey: miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'iopool') {
          const existingKey = await IopoolAccountModel.exists({ miner_key });
          if (existingKey) {
            const doc = await IopoolAccountModel.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'kaiterra') {
          const existingKey = await Kaiterra.exists({ miner_key });
          if (existingKey) {
            const doc = await Kaiterra.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'lacrosse') {
          const existingKey = await LacrosseData.exists({ miner_key });
          if (existingKey) {
            const doc = await LacrosseData.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'nrf') {
          const existingKey = await Nrf.exists({ miner_key });
          if (existingKey) {
            const doc = await Nrf.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'pebble') {
          const existingKey = await PebbleModel.exists({ miner_key });
          if (existingKey) {
            const doc = await PebbleModel.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'purple') {
          const existingKey = await PurpleAirModel.exists({ miner_key });
          if (existingKey) {
            const doc = await PurpleAirModel.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'sensecap') {
          const existingKey = await SenseCAPAccount.exists({ miner_key });
          if (existingKey) {
            const doc = await SenseCAPAccount.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'shelly') {
          const existingKey = await ShellyModel.exists({ minerKey: miner_key });
          if (existingKey) {
            const doc = await ShellyModel.findOne({ minerKey: miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'tapo') {
          const existingKey = await TapoModel.exists({ miner_key });
          if (existingKey) {
            const doc = await TapoModel.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'weatherxm') {
          const existingKey = await WXMModel.exists({ miner_key });
          if (existingKey) {
            const doc = await WXMModel.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'hardware') {
          const existingKey = await HardwareAccount.exists({ miner_key });
          if (existingKey) {
            const doc = await HardwareAccount.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else if (type === 'node') {
          const existingKey = await NodeAccount.exists({ miner_key });
          if (existingKey) {
            const doc = await NodeAccount.findOne({ miner_key });
            return void res.status(200).send({
              data: doc
            });
          }
        } else {
          if (type === 'camera') {
            const existingKey = await RtspLink.exists({ minerKey: miner_key });
            if (existingKey) {
              const doc = await RtspLink.findOne({ minerKey: miner_key });
              return void res.status(200).send({
                data: doc
              });
            } 
          }
        }

        return void res.status(200).send({
          data: null
        });

      } catch (e) {
        res.status(500).send({
          message: "Internal server error.",
          status: "ERROR",
        });
      }
});

export default router;
