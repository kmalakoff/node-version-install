import type { InstallCallback, InstallOptions, InstallResult } from './types.js';
import worker from './workers/install.js';
import workerSync from './workers/installSync.js';

export type * from './types.js';
export default function install(versionExpression: string, options?: InstallOptions, callback?: InstallCallback): undefined | Promise<InstallResult[]> {
  if (typeof options === 'function') {
    callback = options as InstallCallback;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return worker(versionExpression, options, callback) as undefined;
  return new Promise((resolve, reject) => worker(versionExpression, options, (err, result) => (err ? reject(err) : resolve(result))));
}

export function sync(versionExpression: string, options?: InstallOptions): InstallResult[] {
  options = options || {};
  return workerSync(versionExpression, options);
}
