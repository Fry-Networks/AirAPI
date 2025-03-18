import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
    miner_key: { type: String, required: true },
    token: String,
    walletAddress: String,
    id: { type: String, required: true },
    tags: [String],
    tenantId: { type: String, required: true },
    meta: {
        updatedAt: Date,
        createdAt: Date
    },
    name: String,
    type: String,
    subType: String,
    firmware: {
        supports: [String],
        app: {
            name: String,
            version: String
        },
        modem: String
    },
    cloudMqttEnabled: Boolean,
    state: {
        desired: {
            pairing: {
                state: String,
                topics: {
                    d2c: String,
                    c2d: String
                }
            },
            nrfcloud_mqtt_topic_prefix: String
        },
        reported: {
            connection: {
                status: String,
                keepalive: Number
            },
            config: {
                activeMode: Boolean,
                locationTimeout: Number,
                activeWaitTime: Number,
                movementResolution: Number,
                movementTimeout: Number,
                accThreshAct: Number,
                accThreshInact: Number,
                accTimeoutInact: Number,
                nod: [String]
            },
            pairing: {
                state: String,
                topics: {
                    d2c: String,
                    c2d: String
                }
            },
            nrfcloud_mqtt_topic_prefix: String,
            device: {
                deviceInfo: {
                    appVersion: String,
                    modemFirmware: String,
                    imei: String,
                    board: String,
                    sdkVer: String,
                    appName: String,
                    zephyrVer: String,
                    hwVer: String
                },
                simInfo: {
                    uiccMode: Number,
                    iccid: String,
                    imsi: String
                },
                serviceInfo: {
                    fota_v2: [String],
                    ui: [String]
                },
                networkInfo: {
                    currentBand: Number,
                    networkMode: String,
                    rsrp: Number,
                    areaCode: Number,
                    mccmnc: String,
                    cellID: Number,
                    ipAddress: String
                }
            }
        }
    },
    metaStateData: {
        desired: Object,
        reported: Object,
        version: Number
    },
    metadata: {
        data_type: String,
    }
}, { timestamps: true });

const historicalDeviceSchema = new mongoose.Schema({
    walletAddress: String,
    id: { type: String, required: true },
    tags: [String],
    tenantId: { type: String, required: true },
    meta: {
        updatedAt: Date,
        createdAt: Date
    },
    name: String,
    type: String,
    subType: String,
    firmware: {
        supports: [String],
        app: {
            name: String,
            version: String
        },
        modem: String
    },
    cloudMqttEnabled: Boolean,
    state: {
        desired: {
            pairing: {
                state: String,
                topics: {
                    d2c: String,
                    c2d: String
                }
            },
            nrfcloud_mqtt_topic_prefix: String
        },
        reported: {
            connection: {
                status: String,
                keepalive: Number
            },
            config: {
                activeMode: Boolean,
                locationTimeout: Number,
                activeWaitTime: Number,
                movementResolution: Number,
                movementTimeout: Number,
                accThreshAct: Number,
                accThreshInact: Number,
                accTimeoutInact: Number,
                nod: [String]
            },
            pairing: {
                state: String,
                topics: {
                    d2c: String,
                    c2d: String
                }
            },
            nrfcloud_mqtt_topic_prefix: String,
            device: {
                deviceInfo: {
                    appVersion: String,
                    modemFirmware: String,
                    imei: String,
                    board: String,
                    sdkVer: String,
                    appName: String,
                    zephyrVer: String,
                    hwVer: String
                },
                simInfo: {
                    uiccMode: Number,
                    iccid: String,
                    imsi: String
                },
                serviceInfo: {
                    fota_v2: [String],
                    ui: [String]
                },
                networkInfo: {
                    currentBand: Number,
                    networkMode: String,
                    rsrp: Number,
                    areaCode: Number,
                    mccmnc: String,
                    cellID: Number,
                    ipAddress: String
                }
            }
        }
    },
    metaStateData: {
        desired: Object,
        reported: Object,
        version: Number
    },
    metadata: {
        data_type: String,
    },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export interface NrfData extends mongoose.Document {
    id: string,
    tags: [string],
    tenantId: string,
    meta: {
        updatedAt: Date,
        createdAt: Date
    },
    name: string,
    type: string,
    subType: string,
    firmware: {
        supports: [string],
        app: {
            name: string,
            version: string
        },
        modem: string
    },
    cloudMqttEnabled: boolean,
    state: {
        desired: {
            pairing: {
                state: string,
                topics: {
                    d2c: string,
                    c2d: string
                }
            },
            nrfcloud_mqtt_topic_prefix: string
        },
        reported: {
            connection: {
                status: string,
                keepalive: number,
            },
            config: {
                activeMode: boolean,
                locationTimeout: number,
                activeWaitTime: number,
                movementResolution: number,
                movementTimeout: number,
                accThreshAct: number,
                accThreshInact: number,
                accTimeoutInact: number,
                nod: [string]
            },
            pairing: {
                state: string,
                topics: {
                    d2c: string,
                    c2d: string
                }
            },
            nrfcloud_mqtt_topic_prefix: string,
            device: {
                deviceInfo: {
                    appVersion: string,
                    modemFirmware: string,
                    imei: string,
                    board: string,
                    sdkVer: string,
                    appName: string,
                    zephyrVer: string,
                    hwVer: string
                },
                simInfo: {
                    uiccMode: number,
                    iccid: string,
                    imsi: string
                },
                serviceInfo: {
                    fota_v2: [string],
                    ui: [string]
                },
                networkInfo: {
                    currentBand: number,
                    networkMode: string,
                    rsrp: number,
                    areaCode: number,
                    mccmnc: string,
                    cellID: number,
                    ipAddress: string
                }
            }
        }
    },
    metaStateData: {
        desired: object,
        reported: object,
        version: number
    },
    metadata: {
        data_type: string,
    },
    timestamp: Date,
};

export const Nrf = mongoose.model('Nrf', deviceSchema);

