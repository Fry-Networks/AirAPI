// Ambient Miner File
import ambient, { Device } from "ambient-weather-api";
import { AirAccountModel, AmbientAccount, AmbientModel } from "../db/models/air_accounts.js";
import { AmbientDataModel } from "../db/models/air_data.js";
const ambientApplicationKey = process.env.AW_APPLICATION_KEY!;

export const createClientForAmbientKey = async (ambientClients: Map<string, ambient>, ObjectId: string) => {
    if (ambientClients.has(ObjectId)) return;

    let accountData: AmbientAccount = (await AmbientModel.findById(ObjectId))!;
    if (!accountData) { accountData = (await AirAccountModel.findById(ObjectId))!; }
    const account: AmbientAccount = accountData.toObject();
    const client = new ambient({
        apiKey: account.api_key,
        applicationKey: ambientApplicationKey,
    });

    function getName(device: Device) {
        return device.info.name;
    }

    client.connect();
    client.on("connect", () => {
        console.log(`Connected with key ${account.api_key}`);
        client.subscribe(account.api_key);
    });
    //@ts-ignore
    client.on("error", console.error);
    client.on("subscribed", (data) => {
        console.log("Subscribed to " + data.devices.length + " device(s): ");
        console.log(data.devices.map(getName).join(", "));

        const toDb = data.devices.filter(device => device.info.coords).map((device) => {
            return {
                deviceMAC: device.macAddress,
                infos: {
                    coords: {
                        lat: device.info.coords.coords.lat,
                        lon: device.info.coords.coords.lon,
                    },
                    name: device.info.name,
                },
            };
        });

        if (account.devices !== toDb) {
            accountData.devices = toDb;
            accountData.save();
        }
        console.log(`Created client for ambient key ${account.api_key}`);
    });
    client.on("data", (data) => {
        logAmbient(data);
    });

    ambientClients.set(ObjectId, client);
    return;
};

const logAmbient = async (data: any & { device: ambient.Device }) => {
    const toDb = new AmbientDataModel({
        timestamp: new Date(data.dateutc),
        pm25: data.pm25,
        pm25_24h: data.pm25_24h,
        pm25_in: data.pm25_in,
        pm25_in_24h: data.pm25_in_24h,
        pm25_in_aqin: data.pm25_in_aqin,
        pm25_in_24h_aqin: data.pm25_in_24h_aqin,
        pm10_in_aqin: data.pm10_in_aqin,
        pm10_in_24h_aqin: data.pm10_in_24h_aqin,
        co2: data.co2,
        co2_in_aqin: data.co2_in_aqin,
        co2_in_24h_aqin: data.co2_in_24h_aqin,
        aqi_pm25_aqin: data.aqi_pm25_aqin,
        aqi_pm25_24h_aqin: data.aqi_pm25_24h_aqin,
        aqi_pm10_aqin: data.aqi_pm10_aqin,
        aqi_pm10_24h_aqin: data.aqi_pm10_24h_aqin,
        aqi_pm25_in: data.aqi_pm25_in,
        aqi_pm25_in_24h: data.aqi_pm25_in_24h,
        tempf: data.tempf,
        humidity: data.humidity,
        tempinf: data.tempinf,
        humidityin: data.humidityin,
        pm_in_temp_aqin: data.pm_in_temp_aqin,
        pm_in_humidity_aqin: data.pm_in_humidity_aqin,
        winddir: data.winddir,
        windspeedmph: data.windspeedmph,
        windgustmph: data.windgustmph,
        windgustdir: data.windgustdir,
        windspdmph_avg2m: data.windspdmph_avg2m,
        winddir_avg2m: data.winddir_avg2m,
        windspdmph_avg10m: data.windspdmph_avg10m,
        winddir_avg10m: data.winddir_avg10m,
        metadata: {
            data_type: "ambient",
            deviceMAC: data.device.macAddress || "N/A",
            location: {
                lat: data.device.info?.coords?.coords?.lat,
                lon: data.device.info?.coords?.coords?.lon
            }
        }
    });

    await toDb.save();
};
