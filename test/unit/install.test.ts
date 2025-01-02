// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import Pinkie from 'pinkie-promise';
import Queue from 'queue-cb';

import assert from 'assert';
import path from 'path';
import url from 'url';
import rimraf2 from 'rimraf2';

// @ts-ignore
import install from 'node-version-install';
import validateInstall from '../lib/validateInstall';

const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);
const TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
const INSTALLED_DIR = path.join(TMP_DIR, 'installed');
const OPTIONS = {
  storagePath: TMP_DIR,
};
const VERSIONS = ['v20'];
const TARGETS = [{}, { arch: 'arm64' }, { arch: 'x64' }];

function addTests(version, target) {
  const platform = target.platform || 'local';
  const arch = target.arch || 'local';

  describe(`${version} (${platform},${arch})`, () => {
    (() => {
      // patch and restore promise
      // @ts-ignore
      let rootPromise: Promise;
      before(() => {
        rootPromise = global.Promise;
        // @ts-ignore
        global.Promise = Pinkie;
      });
      after(() => {
        global.Promise = rootPromise;
      });
    })();

    it('dist', (done) => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}`);
      install(version, { installPath, ...target, ...OPTIONS }, (err, results) => {
        assert.ok(!err, err ? err.message : '');
        assert.ok(results.length === 1);
        validateInstall(results[0].version, results[0].installPath, target, done);
      });
    });

    it('promise', async () => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}-promise`);

      const results = await install(version, { installPath, ...target, ...OPTIONS });
      assert.ok(results.length === 1);
      await validateInstall(results[0].version, results[0].installPath, target);
    });
  });
}

describe('install (async)', () => {
  before((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));
  after((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));

  for (let i = 0; i < VERSIONS.length; i++) {
    for (let j = 0; j < TARGETS.length; j++) {
      addTests(VERSIONS[i], TARGETS[j]);
    }
  }
  describe('multiple', () => {
    it('should install 18,20', (done) => {
      const installPath = path.join(INSTALLED_DIR, 'multiple');
      install('18,20', { installPath, concurrency: Infinity }, (err, results) => {
        if (err) return done(err);
        const queue = new Queue(1);
        results.forEach((result) => {
          queue.defer(validateInstall.bind(null, result.version, result.installPath));
        });
        queue.await(done);
      });
    });
  });
});
