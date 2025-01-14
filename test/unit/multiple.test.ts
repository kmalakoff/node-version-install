// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;
import Pinkie from 'pinkie-promise';

import path from 'path';
import url from 'url';
import rimraf2 from 'rimraf2';

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const _NODE = isWindows ? 'node.exe' : 'node';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const TMP_DIR = path.join(path.join(__dirname, '..', '..', '.tmp'));
const OPTIONS = {
  storagePath: path.join(TMP_DIR),
  platform: process.platform,
  arch: 'x64' as NodeJS.Architecture,
};

import resolveVersions from 'node-resolve-versions';
const VERSIONS = resolveVersions.sync('>=0.8', { range: 'major,even' });
// VERSIONS.splice(0, VERSIONS.length, 'v0.8.28')

import validate from '../lib/validate';

// @ts-ignore
import install from 'node-version-install';

function addTests(versions) {
  describe(`${versions}`, () => {
    (() => {
      // patch and restore promise
      // @ts-ignore
      let rootPromise: Promise;
      before(() => {
        rootPromise = global.Promise;
        global.Promise = Pinkie;
      });
      after(() => {
        global.Promise = rootPromise;
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
  before((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));
  after((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));

  addTests(VERSIONS.join(','));
});
