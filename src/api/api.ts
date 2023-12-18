import express from "express";
import bodyparser from "body-parser";
import axios from "axios";
import { Ecowittmodel, WXMmodel, WeatherAccount } from "../db/models/weather_accounts.js";
import { connect, airAccountsEvent } from "../db/connect.js";
import { rateLimit } from "express-rate-limit";
import { getUserByAddress } from "../db/models/users-schema.js";
import { PurpleAirModel } from "../db/models/air_account.js";
import PurpleAirApi from "../services/api/purple-air.js";
const app = express();
app.use(bodyparser.json());

// Create a rate limiter that tracks by the 'address' field in the request body
const limiter = rateLimit({
  // Use Redis to store rate limit data
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each address to 100 requests per windowMs
  keyGenerator: function (req) {
    // use 'address' field in body as key
    return req.body.address;
  },
  handler: function (req, res) {
    // response when rate limit exceeded
    console.log("Rate limit exceeded for " + req.body.address);
    res.status(429).send({
      message: "Too many requests, please try again later.",
      status: "ERROR",
    });
  },
});

app.use(limiter);
app.set("trust proxy", 1);
app.get("/", function (req, res) {
  res.status(403).send({
    message: "Please use the API as described in the documentation.",
  });
});

app.post("/api/purple-air", async function (req, res) {
  try {
    const data: {
      api_key: string;
      address: string
    } = req.body;
    // Check if the key is already in the database
    const isPresent = await PurpleAirModel.exists({ api_key: data.api_key });

    if (isPresent) {
      return void res.status(409).send({
        message: "Key already exists in database.",
        status: "ERROR",
      });
    }
   
    // Check if the key is valid by making a request to the API
    //https://rt.ambientweather.net/v1/devices?applicationKey=&apiKey=
    const isValid = await PurpleAirApi.isValidApiKey(data.api_key)
    if(!isValid) { 
      return void res.status(400).send({
        message: "Key is invalid. (Didn't pass API check)",
        status: "ERROR",
      });
    }
    // Add the key to the database
    const user = await getUserByAddress(data.address);

    const air_Account = new PurpleAirModel({
      api_key: data.api_key,
      user_id: user._id,
      timestamp: new Date(),
      api_type: "ambient",
    });
    await air_Account.save();
    airAccountsEvent.emit("newApiKey", air_Account._id);

    res.status(200).send({
      message:
        "Successfully linked your API Key to your wallet address!\nWe will soon begin to retreive data from your weather stations/devices.",
      status: "SUCCESS",
    });
  } catch (e) {
    res.status(500).send({
      message: "Internal server error.",
      status: "ERROR",
    });
  }
});
app.post("/api/submitXMToken", async function (req, res) {
  try {
    const data: {
      username: string;
      password:string;
      address: string;
    } = req.body;
    try {
      const loginResponse:any =await axios.post('https://api.weatherxm.com/api/v1/auth/login',{username:data.username, password:data.password})
    // console.log(loginResponse);
    // Check if the token is already in the database
    const existingToken = await WXMmodel.exists({ token: loginResponse.data.token });

    if (existingToken) {
      return void res.status(409).send({
        message: "Token already exists in database.",
        status: "ERROR",
      });
    }
    // Check if the key is valid by making a request to the API
    //https://rt.ambientweather.net/v1/devices?applicationKey=&apiKey=
    try {
      const response = await axios.get(
        'https://api.weatherxm.com/api/v1/me',
        {
          headers: {
            Authorization: `Bearer ${loginResponse.data.token}`,
          },
        }
      );
    } catch (e) {
      return void res.status(401).send({
        message: "Token is invalid. (Didn't pass API check)",
        status: "ERROR",
      });
    }
    // Add the key to the database
    const user = await getUserByAddress(data.address);

    const key = new WXMmodel({
      api_type:'weather-xm',
      token: loginResponse.data.token,
      user_id: user._id,
      timestamp: new Date(),
    });
    await key.save();

    res.status(200).send({
      message:
        "Successfully linked your Token to your wallet address!\nWe will soon begin to retreive data from your weather stations/devices.",
      status: "SUCCESS",
    });
    } catch (error:any) {
      res.status(400).send({
        message: error.response.data.message,
        status: "ERROR",
      });
    }
  } catch (e) {
    res.status(500).send({
      message: "Internal server error.",
      status: "ERROR",
    });
  }
});

app.post("/api/submitEcokey", async function (req, res) {
  try {
    const data: {
      key: string;
      app_key: string;
      address: string;
    } = req.body;
    console.log(data);
    // Check if the key is already in the database
    const existingKey = await Ecowittmodel.exists({
      api_key: data.key,
    });

    if (existingKey) {
      return void res.status(409).send({
        message: "Api Key already exists in database.",
        status: "ERROR",
      });
    }

    const existingAppKey = await Ecowittmodel.exists({
      app_key: data?.app_key,
    });

    if (existingAppKey) {
      return void res.status(409).send({
        message: "App Key already exists in database.",
        status: "ERROR",
      });
    }

    // Check if the key is valid by making a request to the ecowitt api
    try {
      const d: any = await axios.get(
        `https://api.ecowitt.net/api/v3/device/list?application_key=${data.app_key}&api_key=${data.key}`
      );
      if (d.data.code !== 0) {
        return void res.status(400).send({
          message: "Key is invalid. (Didn't pass API check)",
          status: "ERROR",
        });
      }
    } catch (e) {
      return void res.status(400).send({
        message: "Key is invalid. (Didn't pass API check)",
        status: "ERROR",
      });
    }
    // Add the key to the database
    const user = await getUserByAddress(data.address);

    const key = new Ecowittmodel({
      api_key: data.key,
      user_id: user._id,
      timestamp: new Date(),
      api_type: "ecowitt",
      app_key: data.app_key,
    });
    await key.save();
    airAccountsEvent.emit("newApiKey", key._id);

    res.status(200).send({
      message:
        "Successfully linked your API Key to your wallet address!\nWe will soon begin to retreive data from your weather stations/devices.",
      status: "SUCCESS",
    });
  } catch (e) {
    res.status(500).send({
      message: "Internal server error.",
      status: "ERROR",
    });
  }
});

export async function startApi() {
  await connect();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
