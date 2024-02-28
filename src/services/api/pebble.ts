import axios, { AxiosError } from "axios";
import { PurpleAirModel } from "../../db/models/air_accounts.js";
import { request, gql } from 'graphql-request'
class PebbleApi {
    static url = 'https://pebble.iotex.me/v1/graphql';
    static async getPebbleData(imei: string): Promise<PebbleData | undefined> {
        try {
            const query = gql`
        query {
            pebble_device_record(limit: 1,  order_by: {timestamp: desc}, where: {imei: {_eq: "${imei}"}, latitude: {_neq: "200.0000000"}}
            ) {
                latitude, longitude, timestamp
              }
            }
        `
        console.log(query)
            const response: PebbleData = await request(this.url, query)
            console.log(response)
            return response
        } catch (err: any) {
            console.log(err.message)
            return undefined
        }
    }

}

export default PebbleApi

interface PebbleData {
    pebble_device_record: {latitude: string;
        longitude: string;
        timestamp: string;}[]
    
}
/*
query  {
    pebble_device_record(limit: 1,  order_by: {timestamp: desc}, where: {imei: {_eq: "351358810263431"}, latitude: {_neq: "200.0000000"}}) {
        latitude, longitude, timestamp
      }
  }
  */
