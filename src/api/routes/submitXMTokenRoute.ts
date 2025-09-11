import express from "express";
import axios from "axios";
import UserAgent from 'user-agents';
import { SocksProxyAgent } from 'socks-proxy-agent';
import 'dotenv/config';
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();
const proxy = process.env.PROXY;
        const agent = new SocksProxyAgent(
          'socks://' + proxy
          );
const proxyInstance = axios.create({
  httpsAgent: agent,
});
router.post("/api/submitXMToken", async function (req, res) {
  console.log("Received request to submit XM Token");
    try {
        const data: {
          miner_key: string;
          username: string;
          password:string;
          address: string;
        } = req.body;
        try {
          const headers = {
            'User-Agent': new UserAgent().toString(),
        };
        
          const loginResponse:any =await proxyInstance.post('https://api.weatherxm.com/api/v1/auth/login',{username:data.username, password:data.password}, {
            headers: headers,
          })

        // Check if the key is valid by making a request to the API
        //https://rt.ambientweather.net/v1/devices?applicationKey=&apiKey=
        try {
          const response = await proxyInstance.get(
            'https://api.weatherxm.com/api/v1/me',
            {
              headers: {
                Authorization: `Bearer ${loginResponse.data.token}`,
                'User-Agent': new UserAgent().toString(),
              },
            }
          );
        } catch (e) {
          console.log(e);
          return void res.status(401).send({
            message: "Token is invalid. (Didn't pass API check)",
            status: "ERROR",
          });
        }
        await DeviceCredentials.findOneAndUpdate(
          { miner_key: data.miner_key, type: 'weatherxm' },
          { $set: { miner_key: data.miner_key, type: 'weatherxm', address: data.address, credentials: { username: data.username, password: data.password, token: loginResponse.data.token, refresh_token: loginResponse.data.refreshToken } } },
          { upsert: true, new: true }
        );
        res.status(200).send({ message: "WeatherXM credentials validated and saved.", status: "SUCCESS" });
        } catch (error:any) {
          console.log(error);
          res.status(400).send({
            message: error.response.data.message,
            status: "ERROR",
          });
        }
      } catch (e) {
        console.log(e);
        res.status(500).send({
          message: "Internal server error.",
          status: "ERROR",
        });
      }
});

export default router;
