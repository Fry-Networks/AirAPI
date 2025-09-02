import mongoose from 'mongoose';

export interface TempestObservation extends mongoose.Document {
  timestamp: number;
  air_density: number;
  air_temperature: number;
  barometric_pressure: number;
  brightness: number;
  delta_t: number;
  dew_point: number;
  feels_like: number;
  heat_index: number;
  lightning_strike_count: number;
  lightning_strike_count_last_1hr: number;
  lightning_strike_count_last_3hr: number;
  lightning_strike_last_distance: number;
  lightning_strike_last_epoch: number;
  precip: number;
  precip_accum_last_1hr: number;
  precip_accum_local_day: number;
  precip_accum_local_day_final: number;
  precip_accum_local_yesterday: number;
  precip_accum_local_yesterday_final: number;
  precip_analysis_type_yesterday: number;
  precip_minutes_local_day: number;
  precip_minutes_local_yesterday: number;
  precip_minutes_local_yesterday_final: number;
  pressure_trend: string;
  relative_humidity: number;
  sea_level_pressure: number;
  solar_radiation: number;
  station_pressure: number;
  uv: number;
  wet_bulb_globe_temperature: number;
  wet_bulb_temperature: number;
  wind_avg: number;
  wind_chill: number;
  wind_direction: number;
  wind_gust: number;
  wind_lull: number;
}

const tempestObservationSchema = new mongoose.Schema({
  timestamp: Number,
  air_density: Number,
  air_temperature: Number,
  barometric_pressure: Number,
  brightness: Number,
  delta_t: Number,
  dew_point: Number,
  feels_like: Number,
  heat_index: Number,
  lightning_strike_count: Number,
  lightning_strike_count_last_1hr: Number,
  lightning_strike_count_last_3hr: Number,
  lightning_strike_last_distance: Number,
  lightning_strike_last_epoch: Number,
  precip: Number,
  precip_accum_last_1hr: Number,
  precip_accum_local_day: Number,
  precip_accum_local_day_final: Number,
  precip_accum_local_yesterday: Number,
  precip_accum_local_yesterday_final: Number,
  precip_analysis_type_yesterday: Number,
  precip_minutes_local_day: Number,
  precip_minutes_local_yesterday: Number,
  precip_minutes_local_yesterday_final: Number,
  pressure_trend: String,
  relative_humidity: Number,
  sea_level_pressure: Number,
  solar_radiation: Number,
  station_pressure: Number,
  uv: Number,
  wet_bulb_globe_temperature: Number,
  wet_bulb_temperature: Number,
  wind_avg: Number,
  wind_chill: Number,
  wind_direction: Number,
  wind_gust: Number,
  wind_lull: Number,
}, { _id: false });

const TempestSchema = new mongoose.Schema({
  station_id: { type: Number, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  elevation: { type: Number },
  obs: [tempestObservationSchema],
  minerKey: { type: String },
}, { timestamps: true });

export const TempestData = mongoose.model('Tempest', TempestSchema);
