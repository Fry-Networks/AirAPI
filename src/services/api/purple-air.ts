import axios from "axios";

class PurpleAirApi {
   static url = 'https://api.purpleair.com/v1';
   static async getSensorsDetails (API_KEY: string) {
        const response = await axios.get<SensorsResponse>(`${this.url}/sensors?fields=name`, {
            headers: {
                'X-API-Key': API_KEY
            }
        });
        if(response.status === 200) {
            return response.data.data
        }
   }
}

export default PurpleAirApi




interface SensorsResponse {
    data: [number, string][]
}

