import axios from "axios";
import express from "express";
import puppeteer from "puppeteer";
import { RowData, GmcMapData } from "../../db/models/gmcmap_schema.js";
import { getCollectionByMinerKey } from "../../db/models/data.js";
import { getUserByAddress } from "../../db/models/users-schema.js";

const router = express.Router();

const scrapeData = async (
  paramID: string,
  minerKey: string
): Promise<RowData[]> => {
  console.log(
    `Starting scrapeData with Param_ID: ${paramID}, MinerKey: ${minerKey}`
  );

  const url = `https://gmcmap.com/historyData.asp?Param_ID=${paramID}`;
  console.log(`Navigating to URL: ${url}`);

  const browser = await puppeteer.launch();
  console.log("Puppeteer launched");

  const page = await browser.newPage();
  console.log("New page opened");

  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    console.log("Page loaded successfully");

    const rows: RowData[] = await page.$$eval("table tbody tr", (rows: any) =>
      rows.map((row: any) => {
        const columns = row.querySelectorAll("td");
        return {
          date: columns[0]?.textContent?.trim() || "",
          cpm: columns[1]?.textContent?.trim() || "",
          acpm: columns[2]?.textContent?.trim() || "",
          usv_h: columns[3]?.textContent?.trim() || "",
          latitude: columns[4]?.textContent?.trim() || "",
          longitude: columns[5]?.textContent?.trim() || "",
        };
      })
    );

    console.log("Data extraction completed");

    await browser.close();
    console.log("Browser closed");

    return rows;
  } catch (error) {
    console.error("An error occurred during scraping:", error);
    await browser.close();
    console.log("Browser closed after error");

    return [];
  }
};

router.post("/api/submitGmcMap", async function (req, res) {
  const { param_id, miner_key } = req.body;

  if (!param_id || !miner_key) {
    console.error("Param_ID or MinerKey is missing");
    return res.status(400).json({
      status: "ERROR",
      message: "Param_ID and MinerKey are required",
    });
  }

  console.log(`Received Param_ID: ${param_id}, MinerKey: ${miner_key}`);

  try {
    const existingEntry = await GmcMapData.exists({ param_id });
    if (existingEntry) {
      const result = await GmcMapData.findOne({
        param_id
      });

      if (result?.minerKey !== miner_key) {
        return res.status(409).send({
            message: "paramID already exists in the database.",
            status: "ERROR",
        });
      }
    }

    // const data = await scrapeData(param_id, miner_key);

    // if (data.length === 0) {
    //   console.log("Geiger Counter Not Found or No Data Available");
    //   return res.status(400).json({
    //     status: "ERROR",
    //     message:
    //       "No data found for the provided Param_ID. Geiger Counter Not Found.",
    //   });
    // }

    if (existingEntry) {
      await GmcMapData.findOneAndUpdate(
          { minerKey: miner_key },
          { 
            paramID: param_id,
            createdAt: new Date(Date.now()),
          },
          { upsert: false }
      );

      return res.status(200).send({
        message: "Updated GmcMap Account Successful.",
        status: "SUCCESS",
      });
    }

    const scrapedData = new GmcMapData({
      paramID: param_id,
      minerKey: miner_key,
      createdAt: new Date(Date.now()),
    });

    await scrapedData.save();
    console.log(
      `Saved document for Param_ID: ${param_id}, MinerKey: ${miner_key}`
    );

    res.status(200).json({
      status: "SUCCESS",
      message: "Data retrieved and stored successfully",
      // data: data,
    });

    console.log("Response sent");
  } catch (error: any) {
    console.error("Error occurred while processing:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to retrieve and store data",
      error: error.message,
    });
  }
});

let previous_time = new Date(Date.now());

async function fetchDataDynamically() {
  try {
    const documents = await GmcMapData.find({});
    const currentDate = new Date(Date.now());

    for (const document of documents) {
      const miner_key = document.minerKey;
      const param_id = document.paramID;
      if (!miner_key) {
        console.log(`There's no miner key for device ${param_id}`);
        continue;
      }

      const data = await scrapeData(param_id, miner_key);
      const filtered_data = data.filter((data) => {
        const dataDate = new Date(data.date);

        if (dataDate >= previous_time && dataDate <= currentDate) {
          return true;
        }

        return false;
      });

      const DataCollection = await getCollectionByMinerKey(miner_key);

      if (filtered_data.length <= 0) {
        const savingData = new DataCollection({
          miner_key,
          status: "offline",
          deviceDataString: [],
          timestamp: new Date(),
        });

        await savingData.save();
        continue;
      }

      const dataObject = {
        data: filtered_data,
        metadata: {
          data_type: "GmcMap",
          gmcmap_id: param_id,
        },
        timestamp: new Date(),
      };
      const savingData = new DataCollection({
        miner_key,
        status: "online",
        deviceDataString: dataObject,
        timestamp: new Date(),
      });

      await savingData.save();
    }

    previous_time = currentDate;
  } catch (error) {
    console.error(
      `There's error occurred in fetchData from GmcMapData: ${error}`
    );
    return;
  }
}

setInterval(fetchDataDynamically, 1200000);

export default router;
