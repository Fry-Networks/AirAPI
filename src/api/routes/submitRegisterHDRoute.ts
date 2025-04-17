import express from 'express';
import { getUserByAddress } from "../../db/models/users-schema.js";
import { HardwareAccount } from '../../db/models/hardware_schema.js';

const router = express.Router();

const minerType = {
  Satellite: ["ISM", "OSM"],
  Decibel: ["IDM", "ODM"],
  Bandwidth: ["BM"],
}
type MinerCategory = keyof typeof minerType;
function getMinerCategory(miner_key: string): MinerCategory | null {
  const prefix = miner_key.split('-')[0];
  for (const key of Object.keys(minerType) as MinerCategory[]) {
    if (minerType[key].includes(prefix)) {
      return key;
    }
  }
  return null;
}

router.post('/api/submitRegsiterHD', async function (req, res) {
  try {
    const { miner_key, device_id, address } = req.body;
    
    // Check if the key is already in the database
    const existingKey = (await HardwareAccount.exists({ miner_key })) || (await HardwareAccount.exists({ device_id }));

    if (existingKey) {
      return void res.status(409).send({
        message: "Device ID already exists in database.",
        status: "ERROR",
      });
    }

    const user = await getUserByAddress(address);

    const type = getMinerCategory(miner_key);
    
    const device = new HardwareAccount({
      miner_key: miner_key,
      device_id,
      user_id: user._id,
      address: address,
      timestamp: new Date(),
      hd_type: type,
    });
    await device.save();

    res.status(200).send({
      message: 'Successfully linked your Device MAC to your miner key!',
      status: 'SUCCESS',
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({
      message: 'Internal server error.',
      status: 'ERROR',
    });
  }
});

export default router;