export type CacheLocations = {
  cachePath: string;
  buildPath: string;
};

export type InstallResult = {
  version: string;
  installPath: string;
  execPath: string;
  error?: Error;
};

export interface InstallOptions {
  cachePath?: string;
  concurrency?: number;
}

export type InstallCallback = (err?: Error, results?: InstallResult[]) => void;
