import "dotenv/config";
import ambient, { Device } from "ambient-weather-api";
import { startApi } from "./api/api.js";
import { WeatherModel } from "./db/models/weather-schema.js";
import { airAccountsEvent } from "./db/connect.js";
import axios from "axios";
import {
  EcoWittDevice,
  EcoWittDeviceData,
  EcoWittDevicesResponse,
} from "types/ecowittTypes.js";
import { Ambientaccount, Ambientmodel, Ecowittaccount, Ecowittmodel, WXMaccount, WXMmodel, WeatherAccount } from "./db/models/weather_accounts.js";
import { AirAccount, IAirAccount, PurpleAirAccount, PurpleAirModel } from "./db/models/air_account.js";
import PurpleAirClient from "./services/client/purple-air.js";



const clients: Map<string, string> = new Map();
const weatherXMClients: Map<string, string> = new Map();
const ambientClients: Map<string, ambient> = new Map();

const purpleAirClients: Map<string, string> = new Map();

const startApp = async () => {
  // const applicationKey = process.env.ECOWITT_APPLICATION_KEY!;

  startApi();

 
  await PurpleAirClient.startDataSync(purpleAirClients);
  

  airAccountsEvent.on("newApiKey", async (ObjectId: string) => {
    const account: IAirAccount | null =  await AirAccount.findById(ObjectId);
    if (account?.api_type === "purple-air") {
      await PurpleAirClient.createClient(purpleAirClients,account._id)
    } 
  });

  airAccountsEvent.on("deleteApiKey", async (ObjectId: string) => {
    const account: IAirAccount | null =  await AirAccount.findById(ObjectId);
    if (account?.api_type === "purple-air") {
      clients.delete(ObjectId);
    } 
  });
};


startApp();
