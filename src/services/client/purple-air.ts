
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
  }

  static async startClientSync(clients: PurpleClients) {
    const accounts: PurpleAirAccount[] = await PurpleAirModel.find({
      api_type: 'purple-air'
    })
    for (let account of accounts) {
      try {
        await this.createClient(clients, account._id);
      } catch (e: any) {
        console.log(
          `Error creating client for key ${account.api_key} - ${e.stack}`
        );
      }
    }

  }

  static async startDataSync(clients: PurpleClients) {
    setInterval(async () => {
      clients.forEach(async (client, ObjectId) => {
        const data: PurpleSensorData | undefined = await PurpleAirApi.fetchSensorData(client.sensor, client.read_key, ObjectId);
        if (data && data.time_stamp > client.last_data) {
          clients.set(ObjectId, {
            ...client,
            last_data: data.time_stamp
          });
          this.saveData(data);
        }
      });
    }, 300000);
  }

  static async saveData(data: PurpleSensorData) {
    const sensorData = new PurpleAirDataModel(
      {
        ...data,
        timestamp: data.time_stamp,
        metadata: {
          type: 'purple-air',
          deviceMAC: data.sensor.primary_key_a,
          location: {
            lat: data.sensor.latitude,
            lon: data.sensor.longitude,
            altitude: data.sensor.altitude

          }
        }
      });
    await sensorData.save();
    console.log(`Saved data for sensor ${data.sensor.sensor_index}`);

  }

}

export default PurpleAirClient;

export type PurpleClients = Map<string, { read_key: string, sensor: string, obj_id: string, last_data: number }>;