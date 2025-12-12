import Module from 'module';
import path from 'path';
import Queue from 'queue-cb';
import { homedir } from '../compat.ts';
import type { InstallCallback, InstallOptions, InstallResult } from '../types.ts';

const DEFAULT_STORAGE_PATH = path.join(homedir(), '.nvu');
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

let resolveVersionsFn = null; // break dependencies
let installReleaseFn = null; // break dependencies
export default function installWorker(versionExpression: string, options: InstallOptions, callback: InstallCallback): void {
  const storagePath = options.storagePath || DEFAULT_STORAGE_PATH;
  options = { storagePath, ...options };

  if (!resolveVersionsFn) resolveVersionsFn = _require('node-resolve-versions');
  resolveVersionsFn(versionExpression, options, (err, versions): undefined => {
    if (err) {
      callback(err);
      return;
    }
    if (!versions.length) {
      callback(new Error(`No versions found from expression: ${versionExpression}`));
      return;
    }

    const results: InstallResult[] = [];
    const queue = new Queue(options.concurrency || 1);
    versions.forEach((version) => {
      queue.defer((cb) => {
        const versionOptions = { name: version, ...options };
        if (!installReleaseFn) installReleaseFn = _require('node-install-release');
        const result = installReleaseFn.createResult(versionOptions as InstallOptions, version as string);

        // Always call node-install-release - it will check what's missing (node, npm, or both)
        installReleaseFn(version, versionOptions, (error?) => {
          results.push({ ...result, error });
          cb();
        });
      });
    });
    queue.await((err) => (err ? callback(err) : callback(null, results)));
  });
}
