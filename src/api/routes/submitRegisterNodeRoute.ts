import express from "express";
import { getUserByAddress } from "../../db/models/users-schema.js";
import { NodeAccount } from "../../db/models/node_schema.js";

const router = express.Router();

const minerType = {
  Storage: ["SDN"],
  Reward: ["RDN"],
  Validator: ["SVN"],
  Contributor: ["CN"],
  Ai: ["AEM"],
};
type MinerCategory = keyof typeof minerType;
function getMinerCategory(miner_key: string): MinerCategory | null {
  const prefix = miner_key.split("-")[0];
  for (const key of Object.keys(minerType) as MinerCategory[]) {
    if (minerType[key].includes(prefix)) {
      return key;
    }
  }
  return null;
}

router.post("/api/submitRegisterNode", async function (req, res) {
  try {
    const { miner_key, device_id, address } = req.body;

    // Check if the key is already in the database

    const existingKey = await NodeAccount.exists({ miner_key });
    if (existingKey) {
      const result = await NodeAccount.findOne({ miner_key });
      if (result?.device_id.toLocaleLowerCase() === device_id.toLocaleLowerCase() ) {
        return void res.status(409).send({
          message: "Miner Key already exists in database.",
          status: "ERROR",
        });
      }
    }

    const type = getMinerCategory(miner_key);
    const existingId = await NodeAccount.exists({ device_id, node_type: type });
    if (existingId) {
      return void res.status(409).send({
        message: `Device ID already exists in database with ${type}.`,
        status: "ERROR",
      });
    }

    if (existingKey) {
      await NodeAccount.findOneAndUpdate(
        { miner_key },
        { 
          device_id,
          timestamp: new Date(),
        },
        { upsert: false }
      );

      return res.status(200).send({
        message: "Updated Node Account Successful.",
        status: "SUCCESS",
      });
    }

    const user = await getUserByAddress(address);
    
    const device = new NodeAccount({
      miner_key: miner_key,
      device_id,
      user_id: user._id,
      address: address,
      timestamp: new Date(),
      node_type: type,
    });
    await device.save();

    res.status(200).send({
      message: "Successfully linked your Device MAC to your miner key!",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Internal server error.",
      status: "ERROR",
    });
  }
});

export default router;
