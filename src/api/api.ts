import bodyparser from "body-parser";
import cors from 'cors';
import express from "express";
import { rateLimit } from "express-rate-limit";
import { connect } from "../db/connect.js";
import submitKeyRoute from "./routes/submitAmbientRoute.js";
import submitAtmotubeRoute from "./routes/submitAtmotubeRoute.js";
import submitAwairRoute from "./routes/submitAwairRoute.js";
import submitEcoKeyRoute from "./routes/submitEcoKeyRoute.js";
import submitGoveeKey from "./routes/submitGoveeRoute.js";
import submitKaiterraRoute from "./routes/submitKaiterraRoute.js";
import submitNRFRoute from "./routes/submitNRFRoute.js";
import submitPebbleRoute from "./routes/submitPebbleRoute.js";
import submitPurpleRoute from "./routes/submitPurpleRoute.js";
import submitSenseCAPRoute from './routes/submitSensecapRoute.js';
import submitXMTokenRoute from "./routes/submitXMTokenRoute.js";
import submitIopoolRoute from './routes/submitIopoolRoute.js';
import submitGmcMapRoute from './routes/submitGmcMapRoute.js';
import submitRegisterHDRoute from './routes/submitRegisterHDRoute.js';
import submitHDMinerRoute from './routes/submitHDMinerRoute.js';
import submitCameraRoute from './routes/submitCameraRoute.js';
import submitTapoRoute from './routes/submitTapoRoute.js';
import submitShellyRoute from './routes/submitShellyRoute.js';
import getDeviceCredential from './routes/getDeviceCredentialRoute.js';

const app = express();

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "https://registration-portal-beryl.vercel.app"], // Change this to your frontend URL
//     methods: "GET, POST, OPTIONS",
//     allowedHeaders: "Content-Type",
//   })
// );

app.use(cors());

app.use(bodyparser.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  keyGenerator: function (req) {
    return req.body.address;
  },
  handler: function (req, res) {
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

app.use(submitKeyRoute);
app.use(submitEcoKeyRoute);
app.use(submitPurpleRoute);
app.use(submitPebbleRoute);
app.use(submitNRFRoute);
app.use(submitAtmotubeRoute);
app.use(submitKaiterraRoute);
app.use(submitAwairRoute);
app.use(submitGoveeKey);
app.use(submitSenseCAPRoute);
app.use(submitXMTokenRoute);
app.use(submitIopoolRoute);
app.use(submitGmcMapRoute);
app.use(submitRegisterHDRoute);
app.use(submitHDMinerRoute);
app.use(submitCameraRoute);
app.use(submitTapoRoute);
app.use(submitShellyRoute);
app.use(getDeviceCredential);

export async function startApi() {
  await connect();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
