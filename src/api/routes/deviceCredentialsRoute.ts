import express from 'express';
import { DeviceCredentials } from '../../db/models/device_credentials.js';

const router = express.Router();

// Back-compat: POST body-based get (miner_key + optional type)
router.post('/api/getDeviceCredential', async (req, res) => {
  try {
    const { miner_key, type } = req.body ?? {};
    if (!miner_key) {
      return res.status(400).send({ message: 'miner_key is required', status: 'ERROR' });
    }
    if (type) {
      const doc = await DeviceCredentials.findOne({ miner_key, type });
      return res.status(200).send({ data: doc ?? null });
    }
    const docs = await DeviceCredentials.find({ miner_key });
    return res.status(200).send({ data: docs });
  } catch (e: any) {
    return res.status(500).send({ message: 'Internal server error.', status: 'ERROR' });
  }
});

// Get credentials by miner_key
router.get('/api/credentials/:miner_key', async (req, res) => {
  try {
    const { miner_key } = req.params;
    const { type } = req.query as { type?: string };
    if (type) {
      const doc = await DeviceCredentials.findOne({ miner_key, type });
      return res.status(200).send({ data: doc ?? null });
    }
    const docs = await DeviceCredentials.find({ miner_key });
    return res.status(200).send({ data: docs });
  } catch (e: any) {
    return res.status(500).send({ message: 'Internal server error.', status: 'ERROR' });
  }
});

// Create or update (upsert) credentials by miner_key
router.put('/api/credentials/:miner_key', async (req, res) => {
  try {
    const { miner_key } = req.params;
    const { type, address, credentials } = req.body ?? {};

    if (!type) {
      return res.status(400).send({ message: 'type is required', status: 'ERROR' });
    }

    const updated = await DeviceCredentials.findOneAndUpdate(
      { miner_key },
      {
        $set: {
          miner_key,
          type,
          ...(address !== undefined ? { address } : {}),
          ...(credentials !== undefined ? { credentials } : {}),
        },
      },
      { new: true, upsert: true }
    );

    return res.status(200).send({ data: updated });
  } catch (e: any) {
    return res.status(500).send({ message: 'Internal server error.', status: 'ERROR' });
  }
});

// Delete credentials by miner_key
router.delete('/api/credentials/:miner_key', async (req, res) => {
  try {
    const { miner_key } = req.params;
    const result = await DeviceCredentials.findOneAndDelete({ miner_key });
    return res.status(200).send({ data: result ? { deleted: true } : { deleted: false } });
  } catch (e: any) {
    return res.status(500).send({ message: 'Internal server error.', status: 'ERROR' });
  }
});

export default router;
