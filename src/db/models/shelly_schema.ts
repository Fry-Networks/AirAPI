import mongoose from "mongoose";

// Define schema for storing historical data with timestamps
const ShellySchema = new mongoose.Schema({
  device_status: {
    relays: Array,
    temperature: Number,
    fs_free: Number,
    has_update: Boolean,
    tmp: {
        tC: Number,
        tF: Number,
        is_valid: Boolean
    },
    mqtt: {
        connected: Boolean
    },
    uptime: Number,
    cfg_changed_cnt: Number,
    cloud: {
        enabled: Boolean,
        connected: Boolean
    },
    update: {
        status: String,
        has_update: Boolean,
        new_version: String,
        old_version: String,
        beta_version: String
    },
    serial: Number,
    unixtime: Number,
    _updated: Date,
    ram_total: Number,
    time: String,
    overtemperature: Boolean,
    mac: String,
    actions_stats: {
        skipped: Number
    },
    fs_size: Number,
    ram_free: Number,
    meters: [
        {
            power: Number,
            overpower: Number,
            is_valid: Boolean,
            timestamp: Number,
            counters: [Number],
            total: Number
        }
    ],
    wifi_sta: {
        connected: Boolean,
        ssid: String,
        ip: String,
        rssi: Number
    }
  },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    data_type: String,
    deviceId: String
  }
});

const shellyAccountSchema = new mongoose.Schema({
  minerKey: { type: String, required: true },
  deviceId: { type: String, required: true },
  address: { type: String, required: true },
  api_type: String,
  serverUrl: { type: String, required: true },
  authKey: { type: String, required: true },
  devices: [ShellySchema]
});

export interface ShellyData extends mongoose.Document {
  device_status: {
    id: string,
    _updated: string,
    serial: number,
    sys: {
      available_updates: {
        stable: {
          version: string
        }
      },
      mac: string,
      restart_required: boolean,
      time: string,
      unixtime: number,
      uptime: number,
      ram_size: number,
      ram_free: number,
      fs_size: number,
      fs_free: number,
      cfg_rev: number,
      kvs_rev: number,
      schedule_rev: number,
      webhook_rev: number,
      reset_reason: number
    },
    cloud: {
      connected: boolean
    },
    wifi: {
      sta_ip: string,
      status: string,
      ssid: string,
      rssi: number
    },
    mqtt: {
      connected: boolean
    },
    ble: Array<any>,
    ws: {
      connected: boolean
    },
    "switch:0": {
      id: number,
      aenergy: {
        by_minute: Array<any>,
        minute_ts: number,
        total: number
      },
      source: string,
      output: boolean,
      apower: number,
      voltage: number,
      current: number,
      temperature: {
        tC: number,
        tF: number
      }
    },
    code: string
  },
  timestamp: Date,
  metadata: {
    data_type: String,
    deviceId: String
  }
};

// Define the model for storing historical data
export const Shelly = mongoose.model("Shelly", ShellySchema);
export const ShellyModel = mongoose.model("ShellyAccount", shellyAccountSchema);


