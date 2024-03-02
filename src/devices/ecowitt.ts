// EcoWitt Miner File
import axios from "axios";
import { EcowittAccount, EcowittModel } from "../db/models/air_accounts.js";
import { EcoWittDevice, EcoWittDeviceData, EcoWittDevicesResponse } from "../types/ecowittTypes.js";
import { EcowittDataModel } from "../db/models/air_data.js";

export const createClientForEcoWittKey = async (clients: Map<string, string>, ObjectId: string) => {
    if (clients.has(ObjectId)) return;

    const account: EcowittAccount = (await EcowittModel.findById(ObjectId))!;

    const accountApiKey = account.api_key;

    const accountAppKey = account.app_key;
    function getName(device: EcoWittDevice) {
        return device.name;
    }

    let devices: any = [];

    try {
        const data: { data: EcoWittDevicesResponse } = await axios.get(
            `https://api.ecowitt.net/api/v3/device/list?application_key=${accountAppKey}&api_key=${accountApiKey}`
        );
        console.log(
            `Subscribed to ${data?.data?.data?.list?.length} devices`,
            data?.data
        );
        console.log(data.data?.data?.list?.map(getName).join(", "));

        const toDb = data?.data?.data?.list?.map((device) => {
            return {
                deviceMAC: device.mac,
                infos: {
                    coords: {
                        lat: device.latitude,
                        lon: device.longitude,
                    },
                    name: device.name,
                },
            };
        });

        if (account.devices !== toDb) {
            account.devices = toDb;
            account.save();
            devices = toDb;
        }
        console.log(`Created client for ecowitt key ${account.api_key}`);
    } catch (error) {
        console.error(error);
    }

    console.log("Hello world devices", devices);

    const fetchDeviceData = async (val: any) => {
        try {
            const data: EcoWittDeviceData = await axios.get(
                `https://api.ecowitt.net/api/v3/device/real_time?application_key=${accountAppKey}&api_key=${accountApiKey}&mac=${val?.deviceMAC}&call_back=all`
            );
            logEcoWitt(data, val);
        } catch (error) {
            console.error(error);
        }
    };

    console.log(devices, "ecowitt devices");

    const fetchInterval = async () => {
        if (!Array.isArray(devices) || devices?.length === 0) return;
        await Promise.all(devices?.map((val: any) => fetchDeviceData(val)));
    };

    setInterval(fetchInterval, 120000);

    clients.set(ObjectId, accountApiKey);

    return;
};

const logEcoWitt = async (data: any, deviceInfo: any) => {
    let fullData: EcoWittDeviceData = data.data;
    let storeD = fullData.data
    //log the device if all weather fields are null
    if (fullData.code !== 0) {
        console.log("Error with device", deviceInfo.infos.name, fullData.msg);
        return;
    }
    const toDb = new EcowittDataModel({
        timestamp: new Date(parseInt(fullData.time) * 1000),
        pm25_ch1: {
            real_time_aqi: storeD?.pm25_ch1?.real_time_aqi,
            pm25: storeD?.pm25_ch1?.pm25,
            '24_hours_aqi': storeD?.pm25_ch1["24_hours_aqi"]
        },
        pm25_ch2: {
            real_time_aqi: storeD?.pm25_ch2?.real_time_aqi,
            pm25: storeD?.pm25_ch2?.pm25,
            '24_hours_aqi': storeD?.pm25_ch2["24_hours_aqi"]
        },
        pm25_ch3: {
            real_time_aqi: storeD?.pm25_ch3?.real_time_aqi,
            pm25: storeD?.pm25_ch3?.pm25,
            '24_hours_aqi': storeD?.pm25_ch3["24_hours_aqi"]
        },
        pm25_ch4: {
            real_time_aqi: storeD?.pm25_ch4?.real_time_aqi,
            pm25: storeD?.pm25_ch4?.pm25,
            '24_hours_aqi': storeD?.pm25_ch4["24_hours_aqi"]
        },
        pm10_aqi_combo: {
            real_time_aqi: storeD?.pm10_aqi_combo?.real_time_aqi,
            pm10: storeD?.pm10_aqi_combo?.pm10,
        },
        pm1_aqi_combo: {
            real_time_aqi: storeD?.pm1_aqi_combo?.real_time_aqi,
            pm1: storeD?.pm1_aqi_combo?.pm1,
        },
        pm4_aqi_combo: {
            real_time_aqi: storeD?.pm4_aqi_combo?.real_time_aqi,
            pm4: storeD?.pm4_aqi_combo?.pm4,
        },
        co2_aqi_combo: {
            co2: storeD?.co2_aqi_combo?.co2,
            '24_hours_average': storeD?.co2_aqi_combo["24_hours_average"]
        },
        pm25_aqi_combo: {
            real_time_aqi: storeD?.pm25_aqi_combo?.real_time_aqi,
            pm25: storeD?.pm25_aqi_combo?.pm25,
            '24_hours_aqi': storeD?.pm25_aqi_combo["24_hours_aqi"]
        },
        metadata: {
            data_type: 'ecowitt',
            deviceMAC: deviceInfo.macAddress || "N/A",
            location: {
                lat: deviceInfo.infos.coords.lat,
                lon: deviceInfo.infos.coords.lon
            }
        }
    });

    await toDb.save();
};

// Additional EcoWitt-specific functions as neede