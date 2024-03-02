
import PurpleAirApi from "../../services/api/purple-air.js";
import { PurpleAirAccount, PurpleAirModel } from "../../db/models/air_accounts.js";
import { PurpleAirDataModel, PurpleSensorData } from "../../db/models/air_data.js";

class PurpleAirClient {

  static async createClient(clients: PurpleClients, ObjectId: string) {
    if (clients.has(ObjectId)) {
      return;
    }
    const account: PurpleAirAccount | null = await PurpleAirModel.findById(ObjectId);
    if (!account) {
      return;
    }
    const { read_key, sensor } = account;

    clients.set(ObjectId, {
      read_key,
      sensor,
      obj_id: ObjectId,
      last_data: 0
    });
    console.log(`Created client for read_key ${account.read_key}`);
    let firstTime = true;
    setInterval(async () => {
      if (firstTime) {
        firstTime = false;
        return;
      }

      this.syncData(ObjectId, sensor, read_key, clients);
    }, 300000);
  }

  static async syncData(obj_id: string, sensor_id: string, read_key: string, clients: PurpleClients) {

    const client = clients.get(obj_id)!;
    const data: PurpleSensorData | undefined = await PurpleAirApi.fetchSensorData(sensor_id, read_key);
    if (!data) {
      console.log(`No data for sensor ${sensor_id}`);
    } else if (data.sensor.last_seen > client.last_data) {
      clients.set(obj_id, {
        ...client,
        last_data: data.sensor.last_seen
      });
      this.saveData(data);
    }


  }

  static async saveData(data: PurpleSensorData) {
    const sensorData = new PurpleAirDataModel(
      {
        ...data,
        timestamp: data.time_stamp*1000,
        metadata: {
          data_type: 'purple-air',
          deviceMAC: data.sensor.primary_key_a,
          location: {
            lat: data.sensor.latitude,
            lon: data.sensor.longitude,
            altitude: data.sensor.altitude

          }
        }
      });
    sensorData.save().then(() => {
      console.log(`Saved data for sensor ${data.sensor.sensor_index}`);
    });

  }

}

export default PurpleAirClient;

export type PurpleClients = Map<string, { read_key: string, sensor: string, obj_id: string, last_data: number }>;