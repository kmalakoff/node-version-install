import path from 'path';
import url from 'url';
import moduleRoot from 'module-root-sync';
import worker from './workers/install';

import type { InstallCallback, InstallOptions, InstallResult } from './types';

export type * from './types';
export default function install(versionExpression: string, rootInstallPath: string, options?: InstallOptions, callback?: InstallCallback): undefined | Promise<InstallResult[]> {
  if (typeof options === 'function') {
    callback = options as InstallCallback;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return worker(versionExpression, rootInstallPath, options, callback) as undefined;
  return new Promise((resolve, reject) => worker(versionExpression, rootInstallPath, options, (err, result) => (err ? reject(err) : resolve(result))));
}

import Module from 'module';
import lazy from 'lazy-cache';
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const execFunction = lazy(_require)('function-exec-sync');

const SLEEP_MS = 200;
const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);
const root = moduleRoot(__dirname);
const workerPath = path.join(root, 'dist', 'cjs', 'workers', 'install.cjs');

export function sync(versionExpression: string, rootInstallPath: string, options?: InstallOptions): InstallResult[] {
  options = options || {};
  return execFunction().default({ cwd: process.cwd(), sleep: SLEEP_MS, callbacks: true }, workerPath, versionExpression, rootInstallPath, options);
}
