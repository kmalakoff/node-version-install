// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import path from 'path';
import url from 'url';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';

// @ts-ignore
import { type InstallResult, sync } from 'node-version-install';
import validateInstall from '../lib/validateInstall';

const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);
const TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
const INSTALLED_DIR = path.join(TMP_DIR, 'installed');
const OPTIONS = {
  cachePath: path.join(TMP_DIR, 'cache'),
  buildPath: path.join(TMP_DIR, 'build'),
};
// const VERSIONS = resolveVersions.sync('>=0.8', { range: 'major,even' });
const VERSIONS = ['v4'];
// const VERSIONS = ['v6'];
// const VERSIONS = ['v16'];

let TARGETS = [{ platform: 'darwin', arch: 'x64' }, { platform: 'linux', arch: 'x64' }, { platform: 'win32', arch: 'x64' }, {}];
// TARGETS = [{}];
// TARGETS = [{ platform: 'win32', arch: 'x64' }];
TARGETS = [{ platform: 'darwin', arch: 'x64' }];

function addTests(version, target) {
  const platform = target.platform || 'local';
  const arch = target.arch || 'local';

  describe(`${version} (${platform},${arch})`, () => {
    it('dist', (done) => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}`);
      const results = sync(version, { ...target, ...OPTIONS, installPath });
      validateInstall(version, (results as InstallResult).installPath, target, done);
    });
  });
}

describe('install (sync)', () => {
  before((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));

  for (let i = 0; i < VERSIONS.length; i++) {
    for (let j = 0; j < TARGETS.length; j++) {
      addTests(VERSIONS[i], TARGETS[j]);
    }

    describe('multiple', () => {
      it('should install 18,20', (done) => {
        const results = sync('18,20', { installPath: path.join(INSTALLED_DIR, 'multiple'), concurrency: Infinity });
        const queue = new Queue(1);
        (results as InstallResult[]).forEach((result) => {
          queue.defer(validateInstall.bind(null, result.version, result.installPath));
        });
        queue.await(done);
      });
    });
  }
});
