import mongoose, { mongo } from "mongoose";
 const AirAccountSchema = new mongoose.Schema({
  miner_key: String,
  user_id: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  api_type: String,
  devices: [Object],
});

export const AirAccountModel = mongoose.model('air_accounts', AirAccountSchema);

export interface AirAccount extends mongoose.Document {
  miner_key: string;
  user_id: mongoose.Schema.Types.ObjectId | string;
  timestamp: Date;
  api_type: API_TYPE;
  devices?: Array<any>;
}
const PurpleAirSchema = new mongoose.Schema({
  read_key: { type: String, required: true },
  sensor: { type: String, required: true },
});
export const PurpleAirModel = AirAccountModel.discriminator('purpleAir_acc', PurpleAirSchema);

const AmbientSchema = new mongoose.Schema({
   api_key: { type: String, required: true },
});
export const AmbientModel = AirAccountModel.discriminator('ambient_acc', AmbientSchema);

const EcowittSchema = new mongoose.Schema({
  api_key: { type: String, required: true },
  app_key: { type: String, required: true },
  walletAddress: { type: String, required: true },
});
export const EcowittModel = AirAccountModel.discriminator('ecowitt_acc', EcowittSchema);

const PebbleSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  imei: { type: String, required: true },
})
export const PebbleModel = AirAccountModel.discriminator('pebble_acc', PebbleSchema);

const WXMSchema = new mongoose.Schema({
  token: { type: String, required: true },
  refresh_token: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});
export const WXMModel = AirAccountModel.discriminator('wxm_acc', WXMSchema);

export interface PurpleAirAccount extends AirAccount {
  api_type: "Purple-air";
  read_key: string;
  sensor: string;
}
export interface AmbientAccount extends AirAccount {
  api_type: "Ambient";
  api_key: string;
}
export interface PebbleAccount extends AirAccount {
  api_type: "Pebble";
  owner: string;
  imei: string;
}
export interface EcowittAccount extends AirAccount {
  api_type: "Ecowitt";
  api_key: string;
  app_key: string;
  walletAddress: string;
}
export interface WXMAccount extends AirAccount {
  api_type: "Weather-xm";
  token: string;
  refresh_token: string;
}

type API_TYPE = "Purple-air" | "Ambient" | "Pebble" | "Ecowitt" | "Weather-xm";

export default AirAccountSchema