import fs from 'fs';
import path from 'path';
import url from 'url';
import moduleRoot from 'module-root-sync';

import home from 'homedir-polyfill';
import { createResult } from 'node-install-release';
const DEFAULT_STORAGE_PATH = path.join(home(), '.nvu');

import Module from 'module';
import lazy from 'lazy-cache';
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const resolveVersions = lazy(_require)('node-resolve-versions');

const execFunction = lazy(_require)('function-exec-sync');

const SLEEP_MS = 200;
const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);
const root = moduleRoot(__dirname);
const workerPath = path.join(root, 'dist', 'cjs', 'workers', 'install.cjs');

export default function installSyncWorker(versionExpression: string, options) {
  try {
    const versions = resolveVersions().sync(versionExpression, options);
    if (!versions.length) throw new Error(`No versions found from expression: ${versionExpression}`);

    // shortcut to not spawn a worker if it's a simple case
    if (versions.length === 1) {
      const version = versions[0];
      const storagePath = options.storagePath || DEFAULT_STORAGE_PATH;
      options = { storagePath, ...options };

      const versionOptions = { name: version, ...options };
      const result = createResult(versionOptions, version);

      fs.statSync(result.execPath);
      return [result];
    }
  } catch (_) {}

  return execFunction().default({ cwd: process.cwd(), sleep: SLEEP_MS, callbacks: true }, workerPath, versionExpression, options);
}
