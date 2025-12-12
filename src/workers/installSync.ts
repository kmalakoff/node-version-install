import fs from 'fs';
import path from 'path';
import url from 'url';
import { homedir } from '../compat.ts';

const DEFAULT_STORAGE_PATH = path.join(homedir(), '.nvu');

import Module from 'module';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

const SLEEP_MS = 200;
const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);

import type { InstallOptions, InstallResult } from '../types.ts';

// Worker MUST always load from dist/cjs/ for old Node compatibility
const workerPath = path.join(__dirname, '..', '..', 'cjs', 'workers', 'install.js');

let functionExec = null; // break dependencies
let resolveVersionsFn = null; // break dependencies
let createResultFn = null; // break dependencies
export default function installSyncWorker(versionExpression: string, options: InstallOptions): InstallResult[] {
  try {
    if (!resolveVersionsFn) resolveVersionsFn = _require('node-resolve-versions');
    const versions = resolveVersionsFn.sync(versionExpression, options);
    if (!versions.length) throw new Error(`No versions found from expression: ${versionExpression}`);

    // shortcut to not spawn a worker if it's a simple case
    if (versions.length === 1) {
      const version = versions[0];
      const storagePath = options.storagePath || DEFAULT_STORAGE_PATH;
      options = { storagePath, ...options };

      if (!createResultFn) createResultFn = _require('node-install-release').createResult;
      const result = createResultFn({ name: version, ...options }, version);

      fs.statSync(result.execPath);
      return [result];
    }
  } catch (_) {}

  if (!functionExec) functionExec = _require('function-exec-sync');
  return functionExec({ cwd: process.cwd(), sleep: SLEEP_MS, callbacks: true }, workerPath, versionExpression, options);
}
