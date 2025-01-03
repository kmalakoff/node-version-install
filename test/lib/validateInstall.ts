import assert from 'assert';
import fs from 'fs';
import path from 'path';
import cr from 'cr';
import spawn from 'cross-spawn-cb';
import existsSync from 'fs-exists-sync';
import isVersion from 'is-version';
import { spawnOptions } from 'node-version-utils';

const NODE = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE) ? 'node.exe' : 'node';

function worker(version, installPath, options, callback) {
  const platform = options.platform || process.platform;
  if (platform === 'win32') {
    assert.ok(existsSync(path.join(installPath, 'node.exe')), `node.exe ${fs.readdirSync(installPath)}`);
    assert.ok(existsSync(path.join(installPath, 'npm')), `npm ${fs.readdirSync(installPath)}`);
    assert.ok(existsSync(path.join(installPath, 'npm.cmd')), `npm.cmd ${fs.readdirSync(installPath)}`);
    // existsSync(path.join(installPath, 'npx'));
    // existsSync(path.join(installPath, 'npx.cmd'));
    assert.ok(existsSync(path.join(installPath, 'node_modules', 'npm')), `node_modules/npm ${fs.readdirSync(path.join(installPath, 'node_modules'))}`);
  } else {
    assert.ok(existsSync(path.join(installPath, 'bin', 'node')), `bin/node ${fs.readdirSync(path.join(installPath, 'bin'))}`);
    assert.ok(existsSync(path.join(installPath, 'bin', 'npm')), `bin/npm ${fs.readdirSync(path.join(installPath, 'bin'))}`);
    // existsSync(path.join(installPath, 'bin', 'npx'));
    // existsSync(path.join(installPath, 'bin', 'node-waf'));
    assert.ok(existsSync(path.join(installPath, 'lib', 'node_modules', 'npm')), `lib/node_modules/npm ${fs.readdirSync(path.join(installPath, 'lib', 'node_modules'))}`);
  }

  // if not the native platform, do not try running
  if (platform !== process.platform) return callback();

  if (['lts', 'stable'].indexOf(version) >= 0) return callback();

  spawn(NODE, ['--version'], spawnOptions(installPath, { encoding: 'utf8', env: {} }), (err, res) => {
    assert.ok(!err, 'spawn error NODE');
    const lines = cr(res.stdout).split('\n');
    const spawnVersion = lines.slice(-2, -1)[0];
    assert.ok(spawnVersion.indexOf(version) === 0, 'version mismatch npm');

    spawn('npm', ['--version'], spawnOptions(installPath, { encoding: 'utf8', env: {} }), (err, res) => {
      assert.ok(!err, 'spawn error npm');
      const lines = cr(res.stdout).split('\n');
      const spawnVersionNPM = lines.slice(-2, -1)[0];
      assert.ok(isVersion(spawnVersionNPM), 'version mismatch npm');
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
  return new Promise((resolve, reject) => worker(version, installPath, options, (err, result) => (err ? reject(err) : resolve(result))));
}
