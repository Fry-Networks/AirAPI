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

}

export default PurpleAirApi




interface SensorsResponse {
    data: [number, string][]
}

