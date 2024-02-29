import { PebbleAccount, PebbleModel } from "db/models/air_accounts";
import { PebbleData, PebbleDataModel } from "db/models/air_data";
import PebbleApi from "services/api/pebble";


class PebbleClient {

  static async createClient(clients: Map<string, { imei: string, last_data?: string }>, ObjectId: string) {
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
  }

  static async startDataSync(clients: Map<string, { imei: string, last_data?: Date }>) {
    clients.forEach(async (obj, ObjectId) => {
      const data = (await PebbleApi.getPebbleDataByImei(obj.imei))?.pebble_device_record[0];
      if (data && data.timestamp !== clients.get(ObjectId)!.last_data) {
        this.saveData(data, obj.imei);
      }
    });
  }

  static async saveData(data: PebbleData, imei: string) {
    const newData = new PebbleDataModel({
      metadata: {
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        data_type: "pebble",
        deviceMAC: imei
      },
      timestamp: data.timestamp,
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
    await newData.save();
    console.log(`Data saved for device ${imei} at ${data.timestamp}`);


  }

}

export default PebbleClient;