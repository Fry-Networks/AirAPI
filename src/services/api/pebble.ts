import { request, gql } from 'graphql-request'
import { PebbleData } from "../../db/models/air_data.js";
class PebbleApi {
    static url = 'https://pebble.iotex.me/v1/graphql';
    static async getPebbleDataByImei(imei: string, limit = 1): Promise<PebbleRawData | undefined> {
        try {
            const query = gql`
        query {
            pebble_device_record(limit: ${limit},  order_by: {timestamp: desc}, where: {imei: {_eq: "${imei}"}, latitude: {_neq: "200.0000000"}}
            ) {
                latitude, longitude, timestamp
                light
                id
                snr
                vbat
                humidity
                pressure
                gyroscope
                temperature
                gas_resistance
                accelerometer
                temperature2


              }
            }
        `
            const response: PebbleRawData = await request(this.url, query)

            return response
        } catch (err: any) {
            console.log(err.message)
            return undefined
        }
    }
    static async getPebbleDataById(id: string): Promise<PebbleRawData | undefined> {
        try {
            const query = gql`
        query {
            pebble_device_record(limit: 1,  order_by: {timestamp: desc}, where: {id: {_like: "${id}%"}, latitude: {_neq: "200.0000000"}}
            ) {
                latitude, longitude, timestamp
              }
            }
        `
            const response: PebbleRawData = await request(this.url, query)
    
            return response
        } catch (err: any) {
            console.log(err.message)
            return undefined
        }
    }
    static async verifyOwnership(imei: string, owner: string): Promise<boolean> {
        try {
            const query = gql`
        query {
            pebble_device_record (limit: 1, where: {imei: {_eq: "${imei}"}}) {
                id
                }
            }
        `
            const response: { pebble_device_record: { id: string }[] } = await request(this.url, query)
   
            if (response.pebble_device_record.length === 0) {
                return false
            }
            const deviceId = response.pebble_device_record[0].id.split('-')[0]
            
            const query2 = gql`
        query {
            pebble_device (limit: 1, where: {id: {_like: "${deviceId}%"}}) {
                owner
                }
            }
        `
    
            const response2: { pebble_device: { owner: string }[] } = await request(this.url, query2)
        
            return response2.pebble_device[0].owner.toLowerCase() === owner.toLowerCase()

        } catch (err: any) {
            console.log(err.message)
            return false
        }
    }
    static async getPebbleDevices(owner: string): Promise<PebbleDevice[] | undefined> {
        try {
            const query = gql`
        query {
            pebble_device (limit: 10, where: {owner: {_ilike: "${owner}"} }) {
                id
                owner
                name
              }
            }
            `
            const response: { pebble_device: PebbleDevice[] } = await request(this.url, query)
            return response.pebble_device
        }
        catch (err: any) {
            console.log(err.message)
            return undefined
        }
    }
    /*
   query {
      pebble_device (limit: 10, where: {owner: {_eq: "0xF77f8De24194D768012CA1Edd15AeE0B33D919a1"} }) {
        id
        owner
            name
      }
    }
    */
}

export default PebbleApi

export interface PebbleRawData {
    pebble_device_record: PebbleData[]
}
interface PebbleDevice {
    id: string;
    owner: string;
    name: string;
}
/*
query  {
    pebble_device_record(limit: 1,  order_by: {timestamp: desc}, where: {imei: {_eq: "351358810263431"}, latitude: {_neq: "200.0000000"}}) {
        latitude, longitude, timestamp
      }
  }
  */

 