

class PebbleClient {

  static async createClient(clients: Map<string, string>, ObjectId: string) {
    if (clients.has(ObjectId)) {
      return;
    }
    

    //clients.set(ObjectId, api_key);
  }

  static async startDataSync(clients: Map<string, string>) {


  }

  saveData(data: any) {
    console.log(data)

  }

}

export default PebbleClient;