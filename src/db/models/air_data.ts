import mongoose, { mongo } from 'mongoose';

const BaseAirSchema = new mongoose.Schema(
    {
        timestamp: Date,
        metadata: {
            data_type: String,
            deviceMAC: String,
            location: {
                lat: Number,
                lon: Number,
            }
        },
    },
    {
        timeseries: {
            timeField: 'timestamp',
            metaField: 'metadata',
            granularity: 'hours',
        }
    }
);

export interface BaseAirData extends mongoose.Document {
    timestamp: Date;
    metadata: {
        type: string;
        deviceMAC: string;
        location: {
            lat: number;
            lon: number;
        };
    };
 
}

export const BaseAirModel = mongoose.model<BaseAirData>('air', BaseAirSchema);

const AmbientDataSchema = new mongoose.Schema({
    pm25: { type: Number, required: false },
    pm25_24h: { type: Number, required: false },
    pm25_in: { type: Number, required: false },
    pm25_in_24h: { type: Number, required: false },
    pm25_in_aqin: { type: Number, required: false },
    pm25_in_24h_aqin: { type: Number, required: false },
    pm10_in_aqin: { type: Number, required: false },
    pm10_in_24h_aqin: { type: Number, required: false },
    co2: { type: Number, required: false },
    co2_in_aqin: { type: Number, required: false },
    co2_in_24h_aqin: { type: Number, required: false },
    aqi_pm25_aqin: { type: Number, required: false },
    aqi_pm25_24h_aqin: { type: Number, required: false },
    aqi_pm10_aqin: { type: Number, required: false },
    aqi_pm10_24h_aqin: { type: Number, required: false },
    aqi_pm25_in: { type: Number, required: false },
    aqi_pm25_in_24h: { type: Number, required: false },
    tempf: { type: Number, required: false },
    humidity: { type: Number, required: false },
    tempinf: { type: Number, required: false },
    humidityin: { type: Number, required: false },
    pm_in_temp_aqin: { type: Number, required: false },
    pm_in_humidity_aqin: { type: Number, required: false },
    winddir: { type: Number, required: false },
    windspeedmph: { type: Number, required: false },
    windgustmph: { type: Number, required: false },
    windgustdir: { type: Number, required: false },
    windspdmph_avg2m: { type: Number, required: false },
    winddir_avg2m: { type: Number, required: false },
    windspdmph_avg10m: { type: Number, required: false },
    winddir_avg10m: { type: Number, required: false },
});

export const AmbientDataModel = BaseAirModel.discriminator('ambient', AmbientDataSchema);

export interface AmbientData extends BaseAirData {
    pm25?: number;
    pm25_24h?: number;
    pm25_in?: number;
    pm25_in_24h?: number;
    pm25_in_aqin?: number;
    pm25_in_24h_aqin?: number;
    pm10_in_aqin?: number;
    pm10_in_24h_aqin?: number;
    co2?: number;
    co2_in_aqin?: number;
    co2_in_24h_aqin?: number;
    aqi_pm25_aqin?: number;
    aqi_pm25_24h_aqin?: number;
    aqi_pm10_aqin?: number;
    aqi_pm10_24h_aqin?: number;
    aqi_pm25_in?: number;
    aqi_pm25_in_24h?: number;
    tempf?: number;
    humidity?: number;
    tempinf?: number;
    humidityin?: number;
    pm_in_temp_aqin?: number;
    pm_in_humidity_aqin?: number;
    winddir?: number;
    windspeedmph?: number;
    windgustmph?: number;
    windgustdir?: number;
    windspdmph_avg2m?: number;
    winddir_avg2m?: number;
    windspdmph_avg10m?: number;
    winddir_avg10m?: number;
}

/*pm25 - PM2.5 Air Quality, µg/m³
pm25_24h - PM2.5 Air Quality 24-hour average, µg/m³
pm25_in - Indoor PM2.5 Air Quality, µg/m³
pm25_in_24h - Indoor PM2.5 Air Quality 24-hour average, µg/m³
pm25_in_aqin - Indoor PM2.5 AQIN sensor reading, µg/m³
pm25_in_24h_aqin - Indoor PM2.5 24-hour running average, AQIN sensor, µg/m³
PM10 (Particulate Matter ≤ 10 µm): Measures larger particulate pollution, important for air quality.
pm10_in_aqin - PM10 Air Quality Sensor reading, µg/m³
pm10_in_24h_aqin - PM10 Air Quality Sensor 24-hour running average, µg/m³
CO2 (Carbon Dioxide): Indoor and outdoor levels can indicate air quality and ventilation status.
co2 - CO2 Meter reading, ppm
co2_in_aqin - Indoor CO2 from AQIN, ppm
co2_in_24h_aqin - Indoor CO2 24-hour running average from AQIN, ppm
AQI (Air Quality Index) Values: Derived from PM2.5 and PM10 measurements, providing a standardized air quality rating.
aqi_pm25_aqin - AQI derived from PM2.5, AQIN sensor
aqi_pm25_24h_aqin - AQI derived from PM2.5 Indoor, 24-hour running average, AQIN sensor
aqi_pm10_aqin - AQI derived from PM10 Indoor, AQIN sensor
aqi_pm10_24h_aqin - AQI derived from PM10 Indoor, 24-hour running average, AQIN sensor
aqi_pm25_in - AQI derived from indoor PM2.5
aqi_pm25_in_24h - AQI derived from indoor PM2.5, 24-hour running average
Indirect Air Quality Influencers
These data points are not direct measures of air quality but can influence air quality and its effects:

Temperature and Humidity: Affects the concentration and chemistry of air pollutants.
tempf - Outdoor Temperature, ºF
humidity - Outdoor Humidity, %
tempinf - Indoor Temperature, ºF
humidityin - Indoor Humidity, %
pm_in_temp_aqin - Indoor PM sensor temperature, ºF
pm_in_humidity_aqin - Indoor PM sensor humidity, %
Wind Speed and Direction: Influences pollutant dispersion and concentration.
winddir - Instantaneous wind direction
windspeedmph - Instantaneous wind speed, mph
windgustmph - Max wind speed in the last 10 minutes, mph
windgustdir - Wind direction at which the wind gust occurred
windspdmph_avg2m - 2-minute average wind speed, mph
winddir_avg2m - 2-minute average wind direction
windspdmph_avg10m - 10-minute average wind speed, mph
winddir_avg10m - 10-minute average wind direction
*/

/*indoor_co2

indoor_co2.co2: CO2 (ppm) - Measures the concentration of carbon dioxide indoors, which is relevant for assessing indoor air quality.
indoor_co2.24_hours_average: CO2 24 Hours Average (ppm) - Provides an average concentration of CO2 over a 24-hour period, which can help understand daily variations in indoor air quality.
pm25_ch1, pm25_ch2, pm25_ch3, pm25_ch4

pm25_chX.real_time_aqi: PM2.5 Real-Time AQI - The Air Quality Index based on real-time PM2.5 data, important for understanding immediate air quality levels.
pm25_chX.pm25: PM2.5 (µg/m3) - The concentration of PM2.5 particles, critical for air quality assessments.
pm25_chX.24_hours_aqi: PM2.5 24 Hours AQI - The 24-hour average AQI for PM2.5, indicating daily air quality levels.
pm10_aqi_combo

pm10_aqi_combo.real_time_aqi: PM10 Real-Time AQI - Indicates the real-time air quality based on PM10 levels.
pm10_aqi_combo.pm10: PM10 (µg/m3) - The concentration of PM10 particles, which are larger than PM2.5 but still relevant for air quality.
pm1_aqi_combo

pm1_aqi_combo.real_time_aqi: PM1.0 Real-Time AQI - The Air Quality Index for PM1.0 in real-time.
pm1_aqi_combo.pm1: PM1.0 (µg/m3) - Concentration of PM1.0 particles, the smallest particulate matter typically monitored for air quality.
pm4_aqi_combo

pm4_aqi_combo.real_time_aqi: PM4.0 Real-Time AQI - Air Quality Index based on PM4.0 data in real-time.
pm4_aqi_combo.pm4: PM4.0 (µg/m3) - The concentration of PM4.0 particles.
co2_aqi_combo

co2_aqi_combo.co2: CO2 (ppm) - Concentration of carbon dioxide, relevant for both indoor and outdoor air quality.
co2_aqi_combo.24_hours_average: CO2 24 Hours Average (ppm) - Average CO2 concentration over a 24-hour period.
pm25_aqi_combo

pm25_aqi_combo.real_time_aqi: PM2.5 Real-Time AQI - Real-time Air Quality Index for PM2.5.
pm25_aqi_combo.pm25: PM2.5 (µg/m3) - Real-time concentration of PM2.5 particles.
pm25_aqi_combo.24_hours_aqi: PM2.5 24 Hours AQI - The 24-hour Air Quality Index for PM2.5.
*/

const EcowittDataSchema = new mongoose.Schema({
    pm25_ch1: {
        real_time_aqi: { type: Number, required: false },
        pm25: { type: Number, required: false },
        '24_hours_aqi': { type: Number, required: false },
    },
    pm25_ch2: {
        real_time_aqi: { type: Number, required: false },
        pm25: { type: Number, required: false },
        '24_hours_aqi': { type: Number, required: false },
    },
    pm25_ch3: {
        real_time_aqi: { type: Number, required: false },
        pm25: { type: Number, required: false },
        '24_hours_aqi': { type: Number, required: false },
    },
    pm25_ch4: {
        real_time_aqi: { type: Number, required: false },
        pm25: { type: Number, required: false },
        '24_hours_aqi': { type: Number, required: false },
    },
    pm10_aqi_combo: {
        real_time_aqi: { type: Number, required: false },
        pm10: { type: Number, required: false },
    },
    pm1_aqi_combo: {
        real_time_aqi: { type: Number, required: false },
        pm1: { type: Number, required: false },
    },
    pm4_aqi_combo: {
        real_time_aqi: { type: Number, required: false },
        pm4: { type: Number, required: false },
    },
    co2_aqi_combo: {
        co2: { type: Number, required: false },
        '24_hours_average': { type: Number, required: false },
    },
    pm25_aqi_combo: {
        real_time_aqi: { type: Number, required: false },
        pm25: { type: Number, required: false },
        '24_hours_aqi': { type: Number, required: false },
    },
});

export const EcowittDataModel = BaseAirModel.discriminator('ecowitt', EcowittDataSchema);

export interface EcowittData extends BaseAirData {
    pm25_ch1?: {
        real_time_aqi?: number;
        pm25?: number;
        '24_hours_aqi'?: number;
    };
    pm25_ch2?: {
        real_time_aqi?: number;
        pm25?: number;
        '24_hours_aqi'?: number;
    };
    pm25_ch3?: {
        real_time_aqi?: number;
        pm25?: number;
        '24_hours_aqi'?: number;
    };
    pm25_ch4?: {
        real_time_aqi?: number;
        pm25?: number;
        '24_hours_aqi'?: number;
    };
    pm10_aqi_combo?: {
        real_time_aqi?: number;
        pm10?: number;
    };
    pm1_aqi_combo?: {
        real_time_aqi?: number;
        pm1?: number;
    };
    pm4_aqi_combo?: {
        real_time_aqi?: number;
        pm4?: number;
    };
    co2_aqi_combo?: {
        co2?: number;
        '24_hours_average'?: number;
    };
    pm25_aqi_combo?: {
        real_time_aqi?: number;
        pm25?: number;
        '24_hours_aqi'?: number;
    };
}

const PebbleDataSchema = new mongoose.Schema({
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    timestamp: { type: Date, required: false },
    light: { type: Number, required: false },
    snr: { type: Number, required: false },
    vbat: { type: Number, required: false },
    humidity: { type: Number, required: false },
    pressure: { type: Number, required: false },
    gyroscope: { type: String, required: false },
    temperature: { type: Number, required: false },
    gas_resistance: { type: Number, required: false },
    accelerometer: { type: String, required: false },
    temperature2: { type: Number, required: false },
});

export const PebbleDataModel = BaseAirModel.discriminator('pebble', PebbleDataSchema);

export interface PebbleData extends BaseAirData {
    latitude: number;
    longitude: number;
    timestamp: Date;
    light: number; // lux
    snr: number; // dB
    vbat: number; // volt battery
    id: string;
    humidity: number; // Percent
    pressure: number; // Pascal
    gyroscope: string;  // m/s^2
    temperature: number; // Celsius
    gas_resistance: number; // Ohms
    accelerometer: string;  // m/s^2
    temperature2: number;   // Celsius
}
    /*{
  "data": {
    "pebble_device_record": [
      {
        "latitude": "44.0900000",
        "longitude": "-92.5000000",
        "timestamp": 1709211112,
        "light": 24.43,
        "id": "351358813282198-1709211112",
        "snr": 51.25,
        "vbat": 68.9,
        "humidity": 51.67,
        "pressure": 983.51,
        "gyroscope": "[-55,-30,-3]",
        "temperature": 21474831.23,
        "gas_resistance": 2895731.84,
        "accelerometer": "[10,3092,7874]",
        "temperature2": -10.5
      }
    ]
  }
}
*/