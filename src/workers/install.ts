import fs from 'fs';
import home from 'homedir-polyfill';
import { createResult } from 'node-install-release';
import path from 'path';
import Queue from 'queue-cb';

const DEFAULT_STORAGE_PATH = path.join(home(), '.nvu');

import Module from 'module';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

import type { InstallOptions, InstallResult } from '../types.js';

export default function installWorker(versionExpression: string, options: InstallOptions, callback) {
  const storagePath = options.storagePath || DEFAULT_STORAGE_PATH;
  options = { storagePath, ...options };

  _require('node-resolve-versions')(versionExpression, options, (err, versions) => {
    if (err) return callback(err);
    if (!versions.length) return callback(new Error(`No versions found from expression: ${versionExpression}`));

    const results: InstallResult[] = [];
    const queue = new Queue(options.concurrency || 1);
    versions.forEach((version) => {
      queue.defer((cb) => {
        const versionOptions = { name: version, ...options };
        const result = createResult(versionOptions, version);

        function done(error?) {
          results.push({ ...result, error });
          cb();
        }
        fs.stat(result.execPath, (_, stat) => (stat ? done() : _require('node-install-release')(version, versionOptions, done)));
      });
    });
    queue.await((err) => (err ? callback(err) : callback(null, results)));
  });
}
