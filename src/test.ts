import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from "socks-proxy-agent";
import UserAgent from "user-agents";
import 'dotenv/config';
import PebbleApi from './services/api/pebble.js';

PebbleApi.getPebbleDataByImei("350916067101876").then((data) => console.log(data!.pebble_device_record[0]));