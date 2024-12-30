import assert from 'assert';
import path from 'path';
import cr from 'cr';
import existsSync from 'fs-exists-sync';
import isVersion from 'is-version';
import * as versionUtils_ from 'node-version-utils';

const NODE = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE) ? 'node.exe' : 'node';

const versionUtils = versionUtils_.default || versionUtils_;

function worker(version, installPath, options, callback) {
  const platform = options.platform || process.platform;

  if (platform === 'win32') {
    assert.ok(existsSync(path.join(installPath, 'node.exe')));
    assert.ok(existsSync(path.join(installPath, 'npm')));
    assert.ok(existsSync(path.join(installPath, 'npm.cmd')));
    // existsSync(path.join(installPath, 'npx'));
    // existsSync(path.join(installPath, 'npx.cmd'));
    assert.ok(existsSync(path.join(installPath, 'node_modules', 'npm')));
  } else {
    assert.ok(existsSync(path.join(installPath, 'bin', 'node')));
    assert.ok(existsSync(path.join(installPath, 'bin', 'npm')));
    // existsSync(path.join(installPath, 'bin', 'npx'));
    // existsSync(path.join(installPath, 'bin', 'node-waf'));
    assert.ok(existsSync(path.join(installPath, 'lib', 'node_modules', 'npm')));
  }

  // if not the native platform, do not try running
  if (platform !== process.platform) return callback();

  versionUtils.spawn(installPath, NODE, ['--version'], { encoding: 'utf8', env: {} }, (err, res) => {
    assert.ok(!err, err ? err.message : '');
    const lines = cr(res.stdout).split('\n');
    const spawnVersion = lines.slice(-2, -1)[0];
    assert.ok(isVersion(spawnVersion, 'v'));
    assert.ok(spawnVersion.indexOf(version) === 0);

    versionUtils.spawn(installPath, 'npm', ['--version'], { encoding: 'utf8' }, (err, res) => {
      assert.ok(!err, err ? err.message : '');
      const lines = cr(res.stdout).split('\n');
      const spawnVersionNPM = lines.slice(-2, -1)[0];
      assert.ok(isVersion(spawnVersionNPM));
      callback();
    });
  });
}

export default function validateInstall(version: string, installPath: string, options?, callback?): undefined | Promise<undefined> {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return worker(version, installPath, options, callback) as undefined;
  return new Promise((resolve, reject) =>
    worker(version, installPath, options, (err, result) => {
      err ? reject(err) : resolve(result);
    })
  );
}
