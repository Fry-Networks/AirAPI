import mongoose, { mongo } from "mongoose";
 const AirAccountSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  api_type: String,
  devices: [String],
});

export const AirAccountModel = mongoose.model('air_accounts', AirAccountSchema);

export interface AirAccount extends mongoose.Document {
  user_id: mongoose.Schema.Types.ObjectId | string;
  timestamp: Date;
  api_type: API_TYPE;
  info: String;
  devices: Array<any>;
  client_id?: String,
  secret?: String,
  api_key?: String,
}
const PurpleAirSchema = new mongoose.Schema({
  api_key: { type: String, required: true },
  sensors: [String],
});
export const PurpleAirModel = AirAccountModel.discriminator('purpleAir', PurpleAirSchema);

const AmbientSchema = new mongoose.Schema({
   api_key: { type: String, required: true },
});
export const AmbientModel = AirAccountModel.discriminator('ambient', AmbientSchema);

const EcowittSchema = new mongoose.Schema({
  api_key: { type: String, required: true },
});

export const EcowittModel = AirAccountModel.discriminator('ecowitt', EcowittSchema);

const PebbleSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  imei: { type: String, required: true },
});

export const PebbleModel = AirAccountModel.discriminator('pebble', PebbleSchema);


export interface PurpleAirAccount extends AirAccount {
  api_type: "purple-air";
  api_key: string;
  sensors: string[];
}
export interface AmbientAccount extends AirAccount {
  api_type: "ambient";
  api_key: string;
}
export interface PebbleAccount extends AirAccount {
  api_type: "pebble";
  owner: string;
  imei: string;
}
export interface EcowittAccount extends AirAccount {
  api_type: "ecowitt";
  api_key: string;
  app_key: string;
}


type API_TYPE = "purple-air" | "ambient" | "pebble" | "ecowitt";

export default AirAccountSchema