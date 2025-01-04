// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import path from 'path';
import url from 'url';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';

// @ts-ignore
import { type InstallResult, sync } from 'node-version-install';
import validateInstall from '../lib/validateInstall';

const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);
const TMP_DIR = path.join(path.join(__dirname, '..', '..', '.tmp'));
const INSTALLED_DIR = path.join(TMP_DIR, 'installed');
const OPTIONS = {
  storagePath: TMP_DIR,
};
const VERSIONS = ['v4', 'v18', 'lts'];
const TARGETS = [{}];

function addTests(version, target) {
  const platform = target.platform || 'local';
  const arch = target.arch || 'local';

  describe(`${version} (${platform},${arch})`, () => {
    it('dist', (done) => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}`);
      const results = sync(version, { installPath, ...target, ...OPTIONS });
      assert.ok(results.length === 1);
      validateInstall(results[0].version, results[0].installPath, target, done);
    });

    it('dist x 2', (done) => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}`);
      const results = sync(version, { installPath, ...target, ...OPTIONS });
      assert.ok(results.length === 1);
      validateInstall(results[0].version, results[0].installPath, target, done);
    });
  });
}

describe('install (sync)', () => {
  before((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));
  after((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));

  for (let i = 0; i < VERSIONS.length; i++) {
    for (let j = 0; j < TARGETS.length; j++) {
      addTests(VERSIONS[i], TARGETS[j]);
    }

    describe('multiple', () => {
      it('should install 18,20', (done) => {
        const results = sync('18,20', { storagePath: path.join(INSTALLED_DIR, 'multiple'), concurrency: Infinity });
        const queue = new Queue(1);
        results.forEach((result) => {
          queue.defer(validateInstall.bind(null, result.version, result.installPath));
        });
        queue.await(done);
      });
    });
  }
});
