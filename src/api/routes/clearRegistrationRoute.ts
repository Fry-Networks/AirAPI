import express from 'express';
import { HardwareAccount } from '../../db/models/hardware_schema.js';
import { NodeAccount } from '../../db/models/node_schema.js';
import { RtspLink } from '../../db/models/rtsp_schema.js';
import { AmbientModel, EcowittModel, PurpleAirModel, PebbleModel, WXMModel } from '../../db/models/air_accounts.js';
import { Awair } from '../../db/models/awair_schema.js';
import { Atmotube } from '../../db/models/atmotube_schema.js';
import { GoveeAccount } from '../../db/models/govee_schema.js';
import { IopoolAccountModel } from '../../db/models/iopool_schema.js';
import { Kaiterra } from '../../db/models/kaiterra_schema.js';
import { LacrosseData } from '../../db/models/lacrosse-schema.js';
import { Nrf } from '../../db/models/nrf_schema.js';
import { SenseCAPAccount } from '../../db/models/sensecap_schema.js';
import { ShellyModel } from '../../db/models/shelly_schema.js';
import { TapoModel } from '../../db/models/tapo_schema.js';
import { GmcMapData } from '../../db/models/gmcmap_schema.js';
import { TempestData } from '../../db/models/tempest_schema.js';

const router = express.Router();

// Require support secret for all clear-registration operations
function supportAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const expected = process.env.SUPPORT_SECRET;
  if (!expected) {
    return res.status(500).send({ message: 'SUPPORT_SECRET is not configured on the server', status: 'ERROR' });
  }

  const authHeader = req.headers['authorization'];
  const headerSecret = req.headers['x-support-secret'];

  let provided: string | undefined;
  if (typeof headerSecret === 'string') provided = headerSecret;
  else if (Array.isArray(headerSecret)) provided = headerSecret[0];
  else if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) provided = authHeader.slice(7);

  if (!provided) {
    return res.status(401).send({ message: 'Missing support credentials', status: 'ERROR' });
  }
  if (provided !== expected) {
    return res.status(403).send({ message: 'Invalid support credentials', status: 'ERROR' });
  }
  return next();
}

router.use('/api/clearRegistration', supportAuth);

const minerType: Record<string, string[]> = {
  weather: ['HWM', 'LWM'],
  air: ['IHAQM', 'ILAQM', 'OMAQM', 'IMAQM', 'OHAQM'],
  water: ['OLWQM', 'OHWQM'],
  radiation: ['IRM'],
  hardware: ['ISM', 'OSM', 'BM', 'IDM', 'ODM'],
  camera: [
    'AOWSCM',
    'AOWCM',
    'AIWCM',
    'AOSCM',
    'AISCM',
    'AOTCM',
    'AITCM',
    'AIWSCM'
  ],
  energy: ['EM'],
  node: ['SDN', 'SVN', 'RDN', 'CN', 'AEM']
};

type MinerCategory = keyof typeof minerType;

function getMinerCategory(miner_key: string): MinerCategory | null {
  const prefix = (miner_key || '').split('-')[0];
  for (const key of Object.keys(minerType) as string[]) {
    if ((minerType[key] || []).includes(prefix)) return key as MinerCategory;
  }
  return null;
}

// Clear a registration by miner_key across categories
// Optional body param `kind`: one of miner categories
// Optional body param `confirm`: boolean — if false/omitted, returns a dry-run list
async function clearHandler(req: express.Request, res: express.Response) {
  try {
    const { miner_key, kind, confirm } = (req.body ?? {}) as { miner_key?: string; kind?: MinerCategory; confirm?: boolean };

    if (!miner_key) {
      return res.status(400).send({ message: 'miner_key is required', status: 'ERROR' });
    }

    let deletedHardware = false;
    let deletedNode = false;
    let deletedCamera = false;
    let deletedWeather = false;
    let deletedAir = false;
    let deletedWater = false;
    let deletedRadiation = false;
    let deletedEnergy = false;

    // Infer kind from miner_key if not provided
    const inferred = getMinerCategory(miner_key);
    const noKind = !kind;
    const allow = (cat: MinerCategory) => (kind === cat) || (noKind && inferred === cat) || (noKind && !inferred);

    // Gather matches (dry run info). Use minimal projections to avoid leaking secrets
    const models: Record<string, any[]> = {};

    const add = (key: string, items: any[]) => {
      if (items && items.length) models[key] = items;
    };

    if (allow('hardware')) {
      const items = await HardwareAccount.find({ miner_key }).select('_id miner_key device_id hd_type').lean();
      add('HardwareAccount', items);
      if (confirm) {
        const r = await HardwareAccount.deleteMany({ miner_key });
        deletedHardware = (r.deletedCount ?? 0) > 0;
      }
    }

    if (allow('node')) {
      const items = await NodeAccount.find({ miner_key }).select('_id miner_key device_id node_type').lean();
      add('NodeAccount', items);
      if (confirm) {
        const r = await NodeAccount.deleteMany({ miner_key });
        deletedNode = (r.deletedCount ?? 0) > 0;
      }
    }

    if (allow('camera')) {
      const items = await RtspLink.find({ minerKey: miner_key }).select('_id minerKey').lean();
      add('RtspLink', items);
      if (confirm) {
        const r = await RtspLink.deleteMany({ minerKey: miner_key });
        deletedCamera = (r.deletedCount ?? 0) > 0;
      }
    }

    if (allow('weather')) {
      const wxm = await WXMModel.find({ miner_key }).select('_id miner_key api_type').lean();
      const tempest = await TempestData.find({ minerKey: miner_key }).select('_id minerKey').lean();
      const lacrosse = await LacrosseData.find({ miner_key }).select('_id miner_key device_id device_name').lean();
      add('WXMModel', wxm);
      add('TempestData', tempest);
      add('LacrosseData', lacrosse);
      if (confirm) {
        const w1 = await WXMModel.deleteMany({ miner_key });
        const w2 = await TempestData.deleteMany({ minerKey: miner_key });
        const w3 = await LacrosseData.deleteMany({ miner_key });
        deletedWeather = ((w1.deletedCount ?? 0) + (w2.deletedCount ?? 0) + (w3.deletedCount ?? 0)) > 0;
      }
    }

    if (allow('air')) {
      const ambient = await AmbientModel.find({ miner_key }).select('_id miner_key').lean();
      const awair = await Awair.find({ miner_key }).select('_id miner_key deviceId').lean();
      const kaiterra = await Kaiterra.find({ miner_key }).select('_id miner_key deviceId').lean();
      const purple = await PurpleAirModel.find({ miner_key }).select('_id miner_key sensor').lean();
      const govee = await GoveeAccount.find({ miner_key }).select('_id miner_key device_id sku').lean();
      const ecowitt = await EcowittModel.find({ miner_key }).select('_id miner_key').lean();
      const atmotube = await Atmotube.find({ miner_key }).select('_id miner_key deviceId').lean();
      const lacrosse = await LacrosseData.find({ miner_key }).select('_id miner_key device_id device_name').lean();
      const sensecap = await SenseCAPAccount.find({ miner_key }).select('_id miner_key deviceID username').lean();
      const nrf = await Nrf.find({ miner_key }).select('_id miner_key id name type').lean();
      add('AmbientModel', ambient);
      add('Awair', awair);
      add('Kaiterra', kaiterra);
      add('PurpleAirModel', purple);
      add('GoveeAccount', govee);
      add('EcowittModel', ecowitt);
      add('Atmotube', atmotube);
      add('LacrosseData', lacrosse);
      add('SenseCAPAccount', sensecap);
      add('Nrf', nrf);
      if (confirm) {
        const a1 = await AmbientModel.deleteMany({ miner_key });
        const a2 = await Awair.deleteMany({ miner_key });
        const a3 = await Kaiterra.deleteMany({ miner_key });
        const a4 = await PurpleAirModel.deleteMany({ miner_key });
        const a5 = await GoveeAccount.deleteMany({ miner_key });
        const a6 = await EcowittModel.deleteMany({ miner_key });
        const a7 = await Atmotube.deleteMany({ miner_key });
        const a8 = await LacrosseData.deleteMany({ miner_key });
        const a9 = await SenseCAPAccount.deleteMany({ miner_key });
        const a10 = await Nrf.deleteMany({ miner_key });
        deletedAir = ([a1,a2,a3,a4,a5,a6,a7,a8,a9,a10].reduce((s, r: any) => s + (r.deletedCount ?? 0), 0)) > 0;
      }
    }

    if (allow('water')) {
      const iopool = await IopoolAccountModel.find({ miner_key }).select('_id miner_key iopool_id title').lean();
      add('IopoolAccountModel', iopool);
      if (confirm) {
        const r = await IopoolAccountModel.deleteMany({ miner_key });
        deletedWater = (r.deletedCount ?? 0) > 0;
      }
    }

    if (allow('radiation')) {
      const gmc = await GmcMapData.find({ minerKey: miner_key }).select('_id minerKey paramID').lean();
      add('GmcMapData', gmc);
      if (confirm) {
        const r = await GmcMapData.deleteMany({ minerKey: miner_key });
        deletedRadiation = (r.deletedCount ?? 0) > 0;
      }
    }

    if (allow('energy')) {
      const shelly = await ShellyModel.find({ minerKey: miner_key }).select('_id minerKey deviceId address').lean();
      const tapo = await TapoModel.find({ minerKey: miner_key }).select('_id minerKey deviceIp address').lean();
      add('ShellyModel', shelly);
      add('TapoModel', tapo);
      if (confirm) {
        const e1 = await ShellyModel.deleteMany({ minerKey: miner_key });
        const e2 = await TapoModel.deleteMany({ minerKey: miner_key });
        deletedEnergy = ((e1.deletedCount ?? 0) + (e2.deletedCount ?? 0)) > 0;
      }
    }

    const deleted = deletedHardware || deletedNode || deletedCamera || deletedWeather || deletedAir || deletedWater || deletedRadiation || deletedEnergy;

    // If not confirmed, return dry-run list and prompt for confirmation
    if (!confirm) {
      const total = Object.values(models).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      return res.status(200).send({
        dryRun: true,
        inferredKind: inferred,
        totalMatches: total,
        models,
        message: 'Review items above. Re-run request with { confirm: true } to delete.'
      });
    }

    // Confirmed: return deletion summary and items that were removed
    return res.status(200).send({
      dryRun: false,
      inferredKind: inferred,
      deleted,
      deletedHardware,
      deletedNode,
      deletedCamera,
      deletedWeather,
      deletedAir,
      deletedWater,
      deletedRadiation,
      deletedEnergy,
      models,
      status: 'SUCCESS',
    });
  } catch (e: any) {
    return res.status(500).send({ message: 'Internal server error.', status: 'ERROR' });
  }
}

router.delete('/api/clearRegistration', clearHandler);
router.post('/api/clearRegistration', clearHandler);

export default router;
