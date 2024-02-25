
import PurpleAirApi from "../../services/api/purple-air.js";
import { PurpleAirAccount, PurpleAirModel } from "../../db/models/air_accounts.js";

class PurpleAirClient  { 

    static async createClient(clients: Map<string, string>, ObjectId: string) {
        if(clients.has(ObjectId)){
            return;
        }
        const account:PurpleAirAccount | null  = await PurpleAirModel.findById(ObjectId);
        if(!account) {
            return;
        }
        const {api_key} = account;
        console.log(api_key)
       const sensors = await PurpleAirApi.getSensorsDetails(api_key)
       let sensorIds = sensors!.map(sensor => sensor[0]);
       if(sensorIds.length > 0) { 
            setInterval(PurpleAirApi.fetchSensorsInterval(sensorIds,ObjectId, api_key ), 3000000)
       }
       
       clients.set(ObjectId, api_key);
    }

    static async startDataSync (clients: Map<string, string>) {
        const accounts: PurpleAirAccount[] = await PurpleAirModel.find({
            api_type: 'purple-air'
        })
        for (let account of accounts) {
            try {
              await this.createClient(clients,account._id);
            } catch (e: any) {
              console.log(
                `Error creating client for key ${account.api_key} - ${e.stack}`
              );
            }
          }

    }

    saveData (data: any) {
      console.log(data)

    }

}

export default PurpleAirClient;