// Main File
import "dotenv/config";
import { startApi } from "./api/api.js";
import { newApiKeyEvent } from "./db/connect.js";
import ambient from "ambient-weather-api";

import { createClientForAmbientKey } from "./devices/ambient.js";
import { createClientForEcoWittKey } from "./devices/ecowitt.js";
import { createClientForWeatherXM } from "./devices/wxm.js";
import PurpleAirClient, { PurpleClients } from "./services/client/purple-air.js";
import PebbleClient, { PebbleClients } from "./services/client/pebble.js";

import { 
  AirAccountModel, 
  AmbientAccount, 
  AmbientModel, 
  EcowittAccount, 
  EcowittModel, 
  PebbleAccount, 
  PebbleModel, 
  PurpleAirAccount, 
  PurpleAirModel,
  WXMAccount,
  WXMModel
} from "./db/models/air_accounts.js";

const ambientClients: Map<string, ambient> = new Map();
const ecowittClients: Map<string, string> = new Map();
const wxmClients: Map<string, string> = new Map();
const purpleairClients: PurpleClients = new Map();
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

  const xmTokens: WXMAccount[] = await WXMModel.find({ api_type: { $in: ["Weather-xm"] } });
     for (const account of xmTokens) {
        try {
            await createClientForWeatherXM(wxmClients, account._id);
        }
        catch (e: any) {
            console.log(`Error creating client for key ${account.token} - ${e.stack}`);
        }
    }

  newApiKeyEvent.on("newApiKey", async (ObjectId: string) => {
    const findedApikey = await AirAccountModel.findById(ObjectId);
    console.log('findedApikey : ', findedApikey, ObjectId);
    
    if (findedApikey?.api_type === "Ecowitt") {
      await createClientForEcoWittKey(ecowittClients, ObjectId);
    } else if (findedApikey?.api_type === "Ambient") {
      await createClientForAmbientKey(ambientClients, ObjectId);
    } else if (findedApikey?.api_type === "Purple-air") {
      await PurpleAirClient.createClient(purpleairClients, ObjectId);
    } else if (findedApikey?.api_type === "Pebble") {
      await PebbleClient.createClient(pebbleClients, ObjectId);
    } else if (findedApikey?.api_type === "Weather-xm") {
      await createClientForWeatherXM(wxmClients, ObjectId);
    }
  });

  newApiKeyEvent.on("deleteApiKey", async (ObjectId: string) => {
    const findedApikey = await AirAccountModel.findById(ObjectId);

    if (findedApikey?.api_type === "Ecowitt") {
      ecowittClients.delete(ObjectId);
    } else if (findedApikey?.api_type === "Purple-air") {
      purpleairClients.delete(ObjectId);
    } else if (findedApikey?.api_type === "Ambient") {
      ambientClients.delete(ObjectId);
    } else if (findedApikey?.api_type === "Pebble") {
      pebbleClients.delete(ObjectId);
    } else if (findedApikey?.api_type === "Weather-xm") {
      wxmClients.delete(ObjectId);
    }
  });
};

startApp();
