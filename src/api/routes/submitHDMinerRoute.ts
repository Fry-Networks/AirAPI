import express from 'express';
import { getCollectionByMinerKey } from "../../db/models/data.js";
import { Hardware, HardwareAccount } from '../../db/models/hardware_schema.js';

const router = express.Router();

router.post('/api/submitHDMiner', async function (req, res) {
  try {
    const { data, deviceMac } = req.body;
    console.log('Hardware Miner Data : ', data, deviceMac);

    const hd_device = await HardwareAccount.findOne({ miner_key: data });
    if (!hd_device) {
      res.status(409).send({
        message: `Miner Key isn't existed in the database.`,
        status: 'ERROR',
      });
    }

    const list: string[] = deviceMac;

    if (hd_device && list.find(item => item.toLowerCase() === hd_device.device_id.toLowerCase())) {
      console.log("log1")
      const miner_key = hd_device.miner_key;

      const DataCollection = await getCollectionByMinerKey(miner_key);

      const dataObject = JSON.stringify(data);

      const newData = new DataCollection({
        miner_key,
        status: Object.keys(dataObject).length === 0 ? 'offline' : 'online',
        deviceDataString: dataObject,
        timestamp: new Date(),
      });

      await newData.save();

      res.status(200).send({
        message: `Successfully received updated data from your ${hd_device.device_id}`,
        status: 'SUCCESS',
      });
    } else {
      console.log("log2")
      res.status(409).send({
        message: `Device ID isn't existed in the database.`,
        status: 'ERROR',
      });
    }
      
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({
      message: 'Internal server error.',
      status: 'ERROR',
    });
  }
});

export default router;