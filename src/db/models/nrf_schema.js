import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
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
    metadata: {
        desired: Object,
        reported: Object,
        version: Number
    }
}, { timestamps: true });const historicalDeviceSchema = new mongoose.Schema({
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
    metadata: {
        desired: Object,
        reported: Object,
        version: Number
    },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const HistoricalNrf = mongoose.model('HistoricalNrf', historicalDeviceSchema);

export const Nrf = mongoose.model('Nrf', deviceSchema);

