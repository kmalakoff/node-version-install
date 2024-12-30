export type InstallPaths = {
  cachePath: string;
  buildPath: string;
  installPath: string;
};

export type InstallResult = {
  version: string;
  installPath: string;
  execPath: string;
};

export interface InstallOptions {
  installPath?: string;
  concurrency?: number;
}

export type InstallCallback = (err?: Error, results?: InstallResult | InstallResult[]) => void;
