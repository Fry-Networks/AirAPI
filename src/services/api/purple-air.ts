import axios, { AxiosError } from "axios";

class PurpleAirApi {
    static url = 'https://api.purpleair.com/v1';
    static async isValidApiKey(API_KEY: string) {
        console.log(API_KEY)
        try {
            const response = await axios.get<any>(`${this.url}/keys`, {
                headers: {
                    'X-API-Key': API_KEY
                }
            });
            return response.status === 201 && response.data.api_key_type === 'READ'
        }
        catch (err) {
            return false
        }
    }

    static async fetchSensorData(id: string, API_KEY: string, ObjectId: string) {
        try {
            const response = await axios.get<SensorData>(`${this.url}/sensors/${id}`, {
                headers: {
                    'X-API-Key': API_KEY
                }
            })
            if (response.status === 200) {
                return response.data.sensor
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

