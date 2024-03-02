// Main File
import "dotenv/config";
import { startApi } from "./api/api.js";
import { newApiKeyEvent } from "./db/connect.js";
import ambient from "ambient-weather-api";
import { createClientForAmbientKey } from "./devices/ambient.js";
import { createClientForEcoWittKey } from "./devices/ecowitt.js";
import { AirAccountModel, AmbientAccount, AmbientModel, EcowittAccount, EcowittModel, PebbleAccount, PebbleModel, PurpleAirAccount, PurpleAirModel } from "./db/models/air_accounts.js";
import PurpleAirClient, { PurpleClients } from "./services/client/purple-air.js";
import PebbleClient, { PebbleClients } from "./services/client/pebble.js";
const ecowittClients: Map<string, string> = new Map();
const purpleairClients: PurpleClients = new Map();
const ambientClients: Map<string, ambient> = new Map();
const pebbleClients: PebbleClients = new Map();
const startApp = async () => {
  await startApi();

  // Handling for Ambient devices
  const ambientApiKeys: AmbientAccount[] = await AmbientModel.find({ api_type: { $in: ["ambient"] } });
  for (let account of ambientApiKeys) {
    try {
      await createClientForAmbientKey(ambientClients, account._id);
      
    }
    catch (e: any) {
      console.log(`Error creating client for ambient key ${account.api_key} - ${e.stack}`);
    }
  }

  // Handling for PurpleAir devices
  const purpleAirApiKeys: PurpleAirAccount[] = await PurpleAirModel.find({ api_type: "purple-air" });
  for (let account of purpleAirApiKeys) {
    try {
      await PurpleAirClient.createClient(purpleairClients, account._id);
   
    }
    catch (e: any) {
      console.log(`Error creating client for read_key ${account.read_key} - ${e.stack}`);
    }
  }


  // Handling for EcoWitt devices
  const ecoapiKeys: EcowittAccount[] = await EcowittModel.find({ api_type: "ecowitt" });
  for (const account of ecoapiKeys) {
    try {
      await createClientForEcoWittKey(ecowittClients, account._id);
      
    }
    catch (e: any) {
      console.log(`Error creating client for ecowitt key ${account.api_key} - ${e.stack}`);
    }
  }

  // Handling for Pebble devices
  const pebbleApiKeys: PebbleAccount[] = await PebbleModel.find({ api_type: "pebble" });
  for (const account of pebbleApiKeys) {
    try {
      await PebbleClient.createClient(pebbleClients, account._id);
     
    }
    catch (e: any) {
      console.log(`Error creating client for imei ${account.imei} - ${e.stack}`);
    }
  }



  newApiKeyEvent.on("newApiKey", async (ObjectId: string) => {
    const findedApikey = await AirAccountModel.findById(ObjectId);
    if (findedApikey?.api_type === "ecowitt") {
      await createClientForEcoWittKey(ecowittClients, ObjectId);
    } else if (findedApikey?.api_type === "ambient") {
      await createClientForAmbientKey(ambientClients, ObjectId);
    } else if (findedApikey?.api_type === "purple-air") {
      await PurpleAirClient.createClient(purpleairClients, ObjectId);
    } else if (findedApikey?.api_type === "pebble") {
      await PebbleClient.createClient(pebbleClients, ObjectId);

    }
  });

  newApiKeyEvent.on("deleteApiKey", async (ObjectId: string) => {
    const findedApikey = await AirAccountModel.findById(ObjectId);
    console.log(findedApikey)
    if (findedApikey?.api_type === "ecowitt") {
      ecowittClients.delete(ObjectId);
    } else if (findedApikey?.api_type === "purple-air") {
      purpleairClients.delete(ObjectId);
    } else if (findedApikey?.api_type === "ambient") {
      ambientClients.delete(ObjectId);
    } else if (findedApikey?.api_type === "pebble") {
      pebbleClients.delete(ObjectId);
    }
  });
};

startApp();
