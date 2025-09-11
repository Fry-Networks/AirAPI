import express from "express";
import { request, gql } from 'graphql-request';
import { DeviceCredentials } from "../../db/models/device_credentials.js";

const router = express.Router();
// Enable by setting env var DEBUG_PEBBLE=1
const debugPebble = (...args: any[]) => {
  if (process.env.DEBUG_PEBBLE === '1') {
    console.log('[Pebble]', ...args);
  }
};

router.post("/api/submitpebble", async function (req, res) {
    try {
        const data: {
          miner_key: string;
          imei: string;
          erc_addr: string;
          address: string
        } = req.body;
        console.log(data);
        // Check regex
        const regexCheck = /^[0-9]{15}$/.test(data.imei);
        debugPebble('IMEI regexCheck:', regexCheck, 'imei:', data.imei);
        if (!regexCheck) {
          return void res.status(400).send({
            message: "Imei is invalid. (Didn't pass regex check)",
            status: "ERROR",
          });
        }
        // Verify ownership via GraphQL endpoint
        try {
          const url = 'https://pebble.iotex.me/v1/graphql';
          const q1 = gql`
            query {
              pebble_device_record(limit: 1, where: { imei: { _eq: "${data.imei}" } }) {
                id
              }
            }
          `;
          const r1: { pebble_device_record: { id: string }[] } = await request(url, q1);
          debugPebble('GraphQL r1 pebble_device_record count:', r1?.pebble_device_record?.length ?? 0, 'for IMEI:', data.imei);
          if (!r1.pebble_device_record || r1.pebble_device_record.length === 0) {
            debugPebble('IMEI not found in GraphQL for IMEI:', data.imei, 'raw r1:', r1);
            return res.status(400).send({
              message: "IMEI not found.",
              status: "ERROR",
            });
          }
          const deviceId = r1.pebble_device_record[0].id.split('-')[0];
          debugPebble('Resolved deviceId prefix:', deviceId, 'for IMEI:', data.imei);
          const q2 = gql`
            query {
              pebble_device(limit: 1, where: { id: { _like: "${deviceId}%" } }) { owner }
            }
          `;
          const r2: { pebble_device: { owner: string }[] } = await request(url, q2);
          const owner = r2.pebble_device?.[0]?.owner;
          debugPebble('GraphQL owner:', owner, 'provided erc_addr:', data.erc_addr);
          if (!owner || owner.toLowerCase() !== data.erc_addr.toLowerCase()) {
            debugPebble('Owner mismatch', { graphOwner: owner, provided: data.erc_addr });
            return res.status(400).send({
              message: "Ownership does not match ERC20 address.",
              status: "ERROR",
            });
          }

          await DeviceCredentials.findOneAndUpdate(
            { miner_key: data.miner_key, type: 'pebble' },
            { $set: { miner_key: data.miner_key, type: 'pebble', address: data.address, credentials: { imei: data.imei, owner: data.erc_addr.toLowerCase() } } },
            { upsert: true, new: true }
          );

          res.status(200).send({
            message: "Pebble credentials validated and saved.",
            status: "SUCCESS",
          });
        } catch (e) {
          console.log(e);
          debugPebble('GraphQL ownership verification error:', (e as any)?.message ?? e);
          return void res.status(400).send({
            message: "Failed to ensure ownership of the pebble tracker.",
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

export default router;
