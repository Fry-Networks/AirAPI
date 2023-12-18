import axios, { AxiosError } from "axios";
import { PurpleAirModel } from "../../db/models/air_account.js";

class PurpleAirApi {
   static url = 'https://api.purpleair.com/v1';
   static async getSensorsDetails (API_KEY: string) {
    try {

        const response = await axios.get<SensorsResponse>(`${this.url}/sensors?fields=name`, {
            headers: {
                'X-API-Key': API_KEY
            }
        });
        if(response.status === 200) {
            return response.data.data
        }
    }
    catch(err: any) {
        console.log(err.message)
    }
   }

   static async isValidApiKey (API_KEY: string) {
        console.log(API_KEY)
        try {
            const response = await axios.get<SensorsResponse>(`${this.url}/sensors?fields=name`, {
                headers: {
                    'X-API-Key': API_KEY
                }
            });
            if(response.status === 200) {
                return true
            }
        }
        catch(err) {
            return false
        }
    }

    static  fetchSensorsInterval (sensorsList: number[], ObjectId: string, API_KEY: string ) {
       return  async () => {

            if (!Array.isArray(sensorsList) || sensorsList?.length === 0) return;
            const sensorDataList = await Promise.all(sensorsList?.map((sensorId: any) => this.fetchSensorData(sensorId, API_KEY, ObjectId)));
            sensorDataList.filter(data => data !== undefined)
            await PurpleAirModel.findByIdAndUpdate(Object, {
                devices: sensorDataList
            })
            console.log("Devices info added to the ", ObjectId)
        }
    }

    static async fetchSensorData (id: string, API_KEY: string, ObjectId: string) {
        try {
            const response  = await axios.get<SensorData>(`${this.url}/sensors/${id}`, {
                headers: {
                    'X-API-Key': API_KEY
                }
            })
            if(response.status === 200) {
                return JSON.stringify(response.data.sensor)
             }
          } catch (err) {
            console.error(`Not able to fetch data for device ${id}: ${ObjectId}`);
            return undefined;
          }
    }
}

export default PurpleAirApi




interface SensorsResponse {
    data: [number, string][]
}

interface SensorData {
    sensor: any
}

