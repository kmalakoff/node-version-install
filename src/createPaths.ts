import path from 'path';

import type { InstallPaths } from './types.js';

export default function createPaths(installPath: string): InstallPaths {
  return {
    cachePath: path.join(installPath, 'cache'),
    buildPath: path.join(installPath, 'build'),
    installPath: path.join(installPath, 'installed'),
  };
}
