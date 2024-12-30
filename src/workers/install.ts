import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';
import { NODE, isWindows } from '../constants.js';

import home from 'homedir-polyfill';
import createPaths from '../createPaths.js';
const DEFAULT_ROOT_PATH = path.join(home(), '.nvu');
const DEFAULT_INSTALL_PATHS = createPaths(DEFAULT_ROOT_PATH);

import Module from 'module';
import lazy from 'lazy-cache';
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const resolveVersions = lazy(_require)('node-resolve-versions');
const installRelease = lazy(_require)('node-install-release');

import type { InstallOptions, InstallResult } from '../types.js';

export default function installWorker(versionExpression: string, options: InstallOptions, callback) {
  const { buildPath, cachePath, installPath: rootInstallPath } = options.installPath ? createPaths(options.installPath) : DEFAULT_INSTALL_PATHS;

  resolveVersions()(versionExpression, { ...options }, (err, versions) => {
    if (err) return callback(err);
    if (!versions.length) return callback(new Error(`No versions found from expression: ${versionExpression}`));

    const results: InstallResult[] = [];
    const queue = new Queue(options.concurrency || 1);
    versions.forEach((version) => {
      queue.defer((cb) => {
        const installPath = path.join(rootInstallPath, version);
        const binRoot = isWindows ? installPath : path.join(installPath, 'bin');
        const execPath = path.join(binRoot, NODE);

        function done(err?) {
          if (err) return cb(err);
          results.push({ version, installPath, execPath });
          cb();
        }

        fs.stat(execPath, (_, stat) => {
          // TODO remove redundant options
          stat ? done() : installRelease()(version, installPath, { cachePath, buildPath }, done);
        });
      });
    });
    queue.await((err) => (err ? callback(err) : callback(null, results)));
  });
}
