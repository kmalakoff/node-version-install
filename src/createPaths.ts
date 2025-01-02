import path from 'path';

import type { CacheLocations } from './types';

export default function createPaths(installPath: string): CacheLocations {
  return {
    cachePath: path.join(installPath, 'cache'),
    buildPath: path.join(installPath, 'build'),
  };
}
