import fs from 'fs';
import home from 'homedir-polyfill';
import { createResult } from 'node-install-release';
import path from 'path';
import url from 'url';

const DEFAULT_STORAGE_PATH = path.join(home(), '.nvu');

import Module from 'module';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

const SLEEP_MS = 200;
const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);
const dist = path.join(__dirname, '..', '..');
const workerPath = path.join(dist, 'cjs', 'workers', 'install.js');

export default function installSyncWorker(versionExpression: string, options) {
  try {
    const versions = _require('node-resolve-versions').sync(versionExpression, options);
    if (!versions.length) throw new Error(`No versions found from expression: ${versionExpression}`);

    // shortcut to not spawn a worker if it's a simple case
    if (versions.length === 1) {
      const version = versions[0];
      const storagePath = options.storagePath || DEFAULT_STORAGE_PATH;
      options = { storagePath, ...options };

      const result = createResult({ name: version, ...options }, version);

      fs.statSync(result.execPath);
      return [result];
    }
  } catch (_) {}

  return _require('function-exec-sync').default({ cwd: process.cwd(), sleep: SLEEP_MS, callbacks: true }, workerPath, versionExpression, options);
}
