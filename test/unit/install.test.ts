// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Promise from 'pinkie-promise';
import Queue from 'queue-cb';

import assert from 'assert';
import path from 'path';
import url from 'url';
import rimraf2 from 'rimraf2';

// @ts-ignore
import install, { type InstallResult } from 'node-version-install';
import validateInstall from '../lib/validateInstall';

const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);
const TMP_DIR = path.resolve(path.join(__dirname, '..', '..', '.tmp'));
const INSTALLED_DIR = path.join(TMP_DIR, 'installed');
const OPTIONS = {
  cachePath: path.join(TMP_DIR, 'cache'),
  buildPath: path.join(TMP_DIR, 'build'),
};

const VERSIONS = ['v20'];
const TARGETS = [{}, { arch: 'arm64' }, { arch: 'x64' }];

function addTests(version, target) {
  const platform = target.platform || 'local';
  const arch = target.arch || 'local';

  describe(`${version} (${platform},${arch})`, () => {
    (() => {
      // patch and restore promise
      let rootPromise: Promise;
      before(() => {
        rootPromise = global.Promise;
        global.Promise = Promise;
      });
      after(() => {
        global.Promise = rootPromise;
      });
    })();

    it('dist', (done) => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}`);
      install(version, { ...target, ...OPTIONS, installPath }, (err, results) => {
        assert.ok(!err, err ? err.message : '');
        assert.ok(results.length === 1);
        validateInstall(version, results[0].installPath, target, done);
      });
    });

    it('promise', async () => {
      const installPath = path.join(INSTALLED_DIR, `${version}-${platform}-${arch}-promise`);

      const results = await install(version, { ...target, ...OPTIONS, installPath });
      assert.ok(results.length === 1);
      await validateInstall(version, results[0].installPath, target);
    });
  });
}

describe('install (async)', () => {
  before((cb) => rimraf2(TMP_DIR, { disableGlob: true }, cb.bind(null, null)));

  for (let i = 0; i < VERSIONS.length; i++) {
    for (let j = 0; j < TARGETS.length; j++) {
      addTests(VERSIONS[i], TARGETS[j]);
    }
  }
  describe('multiple', () => {
    it('should install 18,20', (done) => {
      install('18,20', { installPath: path.join(INSTALLED_DIR, 'multiple'), concurrency: Infinity }, (err, results) => {
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
