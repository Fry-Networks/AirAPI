import { PebbleAccount, PebbleModel } from "../../db/models/air_accounts.js";
import { PebbleData, PebbleDataModel } from "../../db/models/air_data.js";
import PebbleApi from "../api/pebble.js";


class PebbleClient {

  static async createClient(clients: PebbleClients, ObjectId: string) {
    if (clients.has(ObjectId)) {
      return;
    }
    const account: PebbleAccount | null = await PebbleModel.findById(ObjectId);
    if (!account) {
      return;
    }
    const { owner, imei } = account;
    const devices = await PebbleApi.getPebbleDevices(owner);
    if (!devices) {
      return;
    }
    const devices_ids = devices.map(device => device.id);
    const corresponding_device = await PebbleApi.getPebbleDataByImei(imei);
    if (!corresponding_device) {
      return;
    }
    const device_id = corresponding_device.pebble_device_record[0].id.split('-')[0];

    if (devices_ids.includes(device_id)) {
      clients.set(ObjectId, { imei });
    }
    console.log(`Created client for imei ${account.imei}`);
    let firstTime = true;
    setInterval(async () => {
      if (firstTime) {
        firstTime = false;
        return;
      }
      this.syncData(ObjectId, imei, clients);
    }, 600000);
  }

  static async syncData(obj_id: string, imei: string, clients: PebbleClients) {
    const data = (await PebbleApi.getPebbleDataByImei(imei))?.pebble_device_record[0];
    if (data && data.timestamp !== clients.get(obj_id)!.last_data) {
      clients.set(obj_id, {
        imei,
        last_data: data.timestamp
      });
      this.saveData(data, imei);
    }
  }

  static async saveData(data: PebbleData, imei: string) {
    const newData = new PebbleDataModel({
      metadata: {
        location: {
          lat: +data.latitude,
          lon: +data.longitude,
        },
        data_type: "pebble",
        deviceMAC: imei
      },
      timestamp: data.timestamp + '000',
      temperature: data.temperature,
      humidity: data.humidity,
      pressure: data.pressure,
      light: data.light,
      snr: data.snr,
      vbat: data.vbat,
      id: data.id,
      gyroscope: data.gyroscope,
      gas_resistance: data.gas_resistance,
      accelerometer: data.accelerometer,
      temperature2: data.temperature2
    });
    newData.save().then(() => {
    console.log(`Data saved for device ${imei} at ${data.timestamp}`);
    });
  }

}

export default PebbleClient;

export type PebbleClients = Map<string, { imei: string, last_data?: Date }>;