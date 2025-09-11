import cors from 'cors';
import bodyparser from "body-parser";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { connect } from "../db/connect.js";
import deviceCredentialsRoute from './routes/deviceCredentialsRoute.js';
import submitAwairRoute from './routes/submitAwairRoute.js';
import submitAmbientRoute from './routes/submitAmbientRoute.js';
import submitAtmotubeRoute from './routes/submitAtmotubeRoute.js';
import submitCameraRoute from './routes/submitCameraRoute.js';
import submitEcoKeyRoute from './routes/submitEcoKeyRoute.js';
import submitGmcMapRoute from './routes/submitGmcMapRoute.js';
import submitGoveeRoute from './routes/submitGoveeRoute.js';
import submitKaiterraRoute from './routes/submitKaiterraRoute.js';
import submitLacrosseRoute from './routes/submitLacrosseRoute.js';
import submitNRFRoute from './routes/submitNRFRoute.js';
import submitPebbleRoute from './routes/submitPebbleRoute.js';
import submitPurpleRoute from './routes/submitPurpleRoute.js';
import submitSensecapRoute from './routes/submitSensecapRoute.js';
import submitShellyRoute from './routes/submitShellyRoute.js';
import submitTapoRoute from './routes/submitTapoRoute.js';
import submitTempestRoute from './routes/submitTempestRoute.js';
import submitXMTokenRoute from './routes/submitXMTokenRoute.js';
import clearRegistrationRoute from './routes/clearRegistrationRoute.js';

const app = express();

// CORS middleware FIRST (keep simple/compatible)
app.use(cors());

app.use(bodyparser.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

app.use(limiter);
app.set("trust proxy", 1);

app.get("/", function (req, res) {
  res.status(403).send({
    message: "Please use the API as described in the documentation.",
  });
});

// Only expose: credentials management and device credential validation routes
app.use(deviceCredentialsRoute);
app.use(submitAwairRoute);
app.use(submitAmbientRoute);
app.use(submitAtmotubeRoute);
app.use(submitCameraRoute);
app.use(submitEcoKeyRoute);
app.use(submitGmcMapRoute);
app.use(submitGoveeRoute);
app.use(submitKaiterraRoute);
app.use(submitLacrosseRoute);
app.use(submitNRFRoute);
app.use(submitPebbleRoute);
app.use(submitPurpleRoute);
app.use(submitSensecapRoute);
app.use(submitShellyRoute);
app.use(submitTapoRoute);
app.use(submitTempestRoute);
app.use(submitXMTokenRoute);
app.use(clearRegistrationRoute);

export async function startApi() {
  await connect();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
