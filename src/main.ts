// Main File
import "dotenv/config";
import { startApi } from "./api/api.js";
import { newApiKeyEvent } from "./db/connect.js";
import ambient, { Device } from "ambient-weather-api";
import { createClientForAmbientKey } from "./devices/ambient.js";
import { createClientForEcoWittKey } from "./devices/ecowitt.js";
import { AirAccountModel, AmbientAccount, AmbientModel, EcowittAccount, EcowittModel, PurpleAirModel } from "db/models/air_accounts.js";
import { BaseAirModel } from './db/models/air_data';
import PurpleAirClient from "services/client/purple-air.js";
const ecowittClients: Map<string, string> = new Map();
const purpleairClients: Map<string, string> = new Map();
const ambientClients: Map<string, ambient> = new Map();
const startApp = async () => {
    await startApi();
  
    // Handling for Ambient devices
    const ambientApiKeys: AmbientAccount[] = await AmbientModel.find({ api_type: { $in: ["ambient"] } });
    for (let account of ambientApiKeys) {
        try {
            await createClientForAmbientKey(ambientClients, account._id);
        }
        catch (e: any) {
            console.log(`Error creating client for key ${account.api_key} - ${e.stack}`);
        }
    }

    // Handling for PurpleAir devices
    const purpleAirApiKeys: AmbientAccount[] = await PurpleAirModel.find({ api_type: "purpleair" });
    for (let account of purpleAirApiKeys) {
        try {
            await PurpleAirClient.createClient(purpleairClients, account._id);
        }
        catch (e: any) {
            console.log(`Error creating client for key ${account.api_key} - ${e.stack}`);
        }
    }
    

    // Handling for EcoWitt devices
    const ecoapiKeys: EcowittAccount[] = await EcowittModel.find({ api_type: "ecowitt" });
    for (const account of ecoapiKeys) {
        try {
            await createClientForEcoWittKey(ecowittClients, account._id);
        }
        catch (e: any) {
            console.log(`Error creating client for key ${account.api_key} - ${e.stack}`);
        }
    }

    newApiKeyEvent.on("newApiKey", async (ObjectId: string) => {
        const findedApikey = await AirAccountModel.findById(ObjectId);
        if (findedApikey?.api_type === "ecowitt") {
          await createClientForEcoWittKey(ecowittClients, ObjectId);
        } else {
          await createClientForAmbientKey(ambientClients, ObjectId);
        }
    });

    newApiKeyEvent.on("deleteApiKey", async (ObjectId: string) => {
        const findedApikey = await AirAccountModel.findById(ObjectId);
        if (findedApikey?.api_type === "ecowitt") {
          ecowittClients.delete(ObjectId);
        } else if (findedApikey?.api_type === "purple-air") {
          purpleairClients.delete(ObjectId);
        } else {
          ambientClients.delete(ObjectId);
        }
    });
};

startApp();
