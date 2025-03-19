export interface AtmotubeItem {
    time: string;
    voc: string;
    pm1: string;
    pm25: string;
    pm10: string;
    p: string;
  }
  
  export interface RequestBody {
    miner_key: string;
    token: string;
    deviceId: string;
    address: string;
  }
  