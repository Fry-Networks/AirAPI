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
  const ambientApiKeys: AmbientAccount[] = await AmbientModel.find({ api_type: { $in: ["Ambient"] } });
  for (let account of ambientApiKeys) {
    try {
      await createClientForAmbientKey(ambientClients, account._id);
      
    }
    catch (e: any) {
      console.log(`Error creating client for ambient key ${account.api_key} - ${e.stack}`);
    }
  }

  // Handling for PurpleAir devices
  const purpleAirApiKeys: PurpleAirAccount[] = await PurpleAirModel.find({ api_type: "Purple-air" });
  for (let account of purpleAirApiKeys) {
    try {
      await PurpleAirClient.createClient(purpleairClients, account._id);
   
    }
    catch (e: any) {
      console.log(`Error creating client for read_key ${account.read_key} - ${e.stack}`);
    }
  }


  // Handling for EcoWitt devices
  const ecoapiKeys: EcowittAccount[] = await EcowittModel.find({ api_type: "Ecowitt" });
  for (const account of ecoapiKeys) {
    try {
      await createClientForEcoWittKey(ecowittClients, account._id);
      
    }
    catch (e: any) {
      console.log(`Error creating client for ecowitt key ${account.api_key} - ${e.stack}`);
    }
  }

  // Handling for Pebble devices
  const pebbleApiKeys: PebbleAccount[] = await PebbleModel.find({ api_type: "Pebble" });
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
    console.log('findedApikey : ', findedApikey, ObjectId);
    if (findedApikey?.api_type === "Ecowitt") {
      console.log('new API Key Event Ecowitt : ', findedApikey?.api_type);
      await createClientForEcoWittKey(ecowittClients, ObjectId);
    } else if (findedApikey?.api_type === "Ambient") {
      await createClientForAmbientKey(ambientClients, ObjectId);
    } else if (findedApikey?.api_type === "Purple-air") {
      await PurpleAirClient.createClient(purpleairClients, ObjectId);
    } else if (findedApikey?.api_type === "Pebble") {
      await PebbleClient.createClient(pebbleClients, ObjectId);

    }
  });

  newApiKeyEvent.on("deleteApiKey", async (ObjectId: string) => {
    const findedApikey = await AirAccountModel.findById(ObjectId);
    console.log(findedApikey)
    if (findedApikey?.api_type === "Ecowitt") {
      ecowittClients.delete(ObjectId);
    } else if (findedApikey?.api_type === "Purple-air") {
      purpleairClients.delete(ObjectId);
    } else if (findedApikey?.api_type === "Ambient") {
      ambientClients.delete(ObjectId);
    } else if (findedApikey?.api_type === "Pebble") {
      pebbleClients.delete(ObjectId);
    }
  });
};

startApp();
