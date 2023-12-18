import mongoose, { mongo } from "mongoose";
export const AirAccountSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  api_type: String,
  info: {
    type: String,
    default: "",
  },
});

export const AirAccount = mongoose.model('air_accounts', AirAccountSchema);

export interface IAirAccount extends mongoose.Document {
  user_id: mongoose.Schema.Types.ObjectId | string;
  timestamp: Date;
  api_type: API_TYPE;
  info: String;
  client_id: String,
  secret: String,
  api_key: String,
}
const PurpleAirSchema = new mongoose.Schema({
  api_key: { type: String, required: true },
});
export const PurpleAirModel = AirAccount.discriminator('purpleAir', PurpleAirSchema);

const AirThingsSchema = new mongoose.Schema({
    client_id: { type: String, required: true },
    secret: { type: String, required: true },
});
export const AirthingsModel = AirAccount.discriminator('airThings', AirThingsSchema);

const W3bStreamSchema = new mongoose.Schema({
  api_key: { type: String, required: true },
});

export const W3bStreamModel = AirAccount.discriminator('w3bStream', W3bStreamSchema);


export interface PurpleAirAccount extends IAirAccount {
  api_type: "purple-air";
  api_key: string;
}
export interface AirthingsAccount extends IAirAccount {
  api_type: "air-things";
  client_id: string;
  secret: string;
}
export interface W3bStreamAccount extends IAirAccount {
  api_type: "w3bstream";
  api_key: string;
}


type API_TYPE = "purple-air" | "air-things" | "w3bstream"