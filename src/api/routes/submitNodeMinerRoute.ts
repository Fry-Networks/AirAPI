import express from 'express';
import { getCollectionByMinerKey } from "../../db/models/data.js";
import { NodeAccount } from '../../db/models/node_schema.js';

const router = express.Router();

router.post('/api/submitNodeMiner', async function (req, res) {
  try {
    const { data, deviceMac } = req.body;
    console.log('Fry Node Miner Data : ', data, deviceMac);

    const node_device = await NodeAccount.findOne({ miner_key: data });
    if (!node_device) {
      res.status(409).send({
        message: `Miner Key isn't existed in the database.`,
        status: 'ERROR',
      });
    }

    const list: string[] = deviceMac;

    if (node_device && list.find(item => item.toLowerCase() === node_device.device_id.toLowerCase())) {
      const miner_key = node_device.miner_key;

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
        message: `Successfully received updated data from your ${node_device.device_id}`,
        status: 'SUCCESS',
      });
    } else {
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