import mongoose from "mongoose";

const ecowittAccountSchema = new mongoose.Schema({
  miner_key: { type: String, required: true },
  user_id: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  api_type: String,
  walletAddress: String,
  devices: {
    type: [
      {
        id: { type: String, required: false },
        deviceMAC: String,
        date_zone_id: String,
        infos: {
          coords: {
            lat: Number,
            lon: Number,
          },
          name: String,
        },
      },
    ],
    default: [],
  },
});

const deviceSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: String,
  mac: String,
  type: Number,
  date_zone_id: String,
  createtime: Number,
  longitude: Number,
  latitude: Number,
  stationtype: String,
});

const EcowittaccountSchema = new mongoose.Schema({
  api_key: { type: String, required: true },
  app_key: { type: String, required: true },
  devices: [deviceSchema]
});

// export interface EcowittData extends mongoose.Document {
//   api_key: string,
//   data: [
//     {
//       id: string,
//       deviceMAC: string,
//       date_zone_id: string,
//       infos: {
//         coords: {
//           lat: number,
//           lon: number,
//         },
//         name: string,
//       },
//     }
//   ],
//   metadata: {
//     data_type: string,
//   }
// }

const EcowittAccount = mongoose.model('ecowitt-Accounts', ecowittAccountSchema);
export const Ecowittmodel = EcowittAccount.discriminator('Ecowittaccount', EcowittaccountSchema);
