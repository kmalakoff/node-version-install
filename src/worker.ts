import fs from 'fs';
import path from 'path';
import Queue from 'queue-cb';
import { NODE, isWindows } from './constants.js';

import home from 'homedir-polyfill';
import installPaths from './installPaths.js';
const DEFAULT_INSTALL_DIRECTORY = path.join(home(), '.nvu');
const DEFAULT_INSTALL_DIRECTORIES = installPaths(DEFAULT_INSTALL_DIRECTORY);

import Module from 'module';
import lazy from 'lazy-cache';
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const resolveVersions = lazy(_require)('node-resolve-versions');
const installRelease = lazy(_require)('node-install-release');

import type { InstallOptions, InstallResult } from './types.js';

export default function worker(versionExpression: string, options: InstallOptions, callback) {
  const { buildPath, cachePath, installPath: rootInstallPath } = options.installPath ? installPaths(options.installPath) : DEFAULT_INSTALL_DIRECTORIES;

  resolveVersions()(versionExpression, { ...options }, (err, versions) => {
    if (err) return callback(err);
    if (!versions.length) return callback(new Error(`No versions found from expression: ${versionExpression}`));

    const results: InstallResult[] = [];
    const queue = new Queue(options.concurrency || 1);
    versions.forEach((version) =>
      queue.defer((callback) => {
        const installPath = path.join(rootInstallPath, version);
        const binRoot = isWindows ? installPath : path.join(installPath, 'bin');
        const execPath = path.join(binRoot, NODE);

        function done(err?) {
          if (err) return callback(err);
          results.push({ version, installPath, execPath });
          callback();
        }

        fs.stat(execPath, (err) => {
          // TODO remove redundant options
          err ? installRelease()(version, installPath, { cachePath, buildPath }, done) : done();
        });
      })
    );
    queue.await((err) => {
      if (err) return callback(err);
      const result = versions.length === 1 ? results[0] : results;
      callback(null, result);
    });
  });
}
