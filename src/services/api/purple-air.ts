import axios, { AxiosError } from "axios";
import { PurpleSensorData } from "db/models/air_data";

class PurpleAirApi {
    static url = 'https://api.purpleair.com/v1';
    static async isValid(API_KEY: string, sensor: string) {
        let apiValid = false;
        let sensorValid = false;
        try {
            const response = await axios.get<any>(`${this.url}/keys`, {
                headers: {
                    'X-API-Key': API_KEY
                }
            });
            apiValid = response.status === 201 && response.data.api_key_type === 'READ'
            if(!apiValid) {
                return false;
            }
        }
        catch (err) {
            return false
        }
        try {
            const data = this.fetchSensorData(sensor, API_KEY);
            sensorValid = data !== undefined;
        } catch (err) {
            return false
        }
        return apiValid && sensorValid;
    }

    static async fetchSensorData(id: string, API_KEY: string) {
        try {
            const response = await axios.get<PurpleSensorData>(`${this.url}/sensors/${id}`, {
                headers: {
                    'X-API-Key': API_KEY
                }
            })
            if (response.status === 200) {
                return response.data
            }
        } catch (err) {
            console.error(`Not able to fetch data for device ${id}`);
            return undefined;
        }
    }
}

export default PurpleAirApi



