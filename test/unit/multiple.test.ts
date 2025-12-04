// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import { safeRm } from 'fs-remove-compat';
import path from 'path';
import Pinkie from 'pinkie-promise';
import url from 'url';

const _isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(path.join(__dirname, '..', '..', '.tmp'));
const OPTIONS = {
  storagePath: path.join(TMP_DIR),
  platform: process.platform,
  arch: 'x64' as NodeJS.Architecture,
};

import * as resolveVersions from 'node-resolve-versions';

const VERSIONS = resolveVersions.sync('>=0.8', { range: 'major,even' }) as string[];
VERSIONS.splice(0, VERSIONS.length, VERSIONS[0], VERSIONS[VERSIONS.length - 1]); // TEST SIMPLIFICATIOn

import install from 'node-version-install';
import validate from '../lib/validate.ts';

function addTests(versions) {
  describe(`${versions}`, () => {
    (() => {
      // patch and restore promise
      if (typeof global === 'undefined') return;
      const globalPromise = global.Promise;
      before(() => {
        global.Promise = Pinkie;
      });
      after(() => {
        global.Promise = globalPromise;
      });
    })();

    const _installPath = null;
    it('install', async () => {
      const res = await install(versions, OPTIONS);
      res.forEach((result) => {
        validate(result.installPath, OPTIONS);
      });
    });
  });
}

describe('multiple', () => {
  before((cb) => safeRm(TMP_DIR, cb));
  after((cb) => safeRm(TMP_DIR, cb));

  addTests(VERSIONS.join(','));
});
