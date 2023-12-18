import { PurpleAirAccount, PurpleAirModel } from "db/models/air_account";
import PurpleAirApi from "../../services/api/purple-air";

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
       const sensors = await PurpleAirApi.getSensorsDetails(api_key)
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

    }

}

export default PurpleAirClient;