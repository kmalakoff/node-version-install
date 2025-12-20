import type { InstallCallback, InstallOptions, InstallResult } from './types.ts';
import worker from './workers/install.ts';
import workerSync from './workers/installSync.ts';

export type * from './types.ts';

export default function install(versionExpression: string): Promise<InstallResult[]>;
export default function install(versionExpression: string, options: InstallOptions): Promise<InstallResult[]>;
export default function install(versionExpression: string, callback: InstallCallback): void;
export default function install(versionExpression: string, options: InstallOptions, callback: InstallCallback): void;
export default function install(versionExpression: string, options?: InstallOptions | InstallCallback, callback?: InstallCallback): void | Promise<InstallResult[]> {
  callback = typeof options === 'function' ? options : callback;
  options = typeof options === 'function' ? {} : ((options || {}) as InstallOptions);

  if (typeof callback === 'function') return worker(versionExpression, options, callback);
  return new Promise((resolve, reject) => worker(versionExpression, options, (err, result) => (err ? reject(err) : resolve(result))));
}

export function sync(versionExpression: string, options?: InstallOptions): InstallResult[] {
  return workerSync(versionExpression, options || {});
}
