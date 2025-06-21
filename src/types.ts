import type { InstallOptions as InstallOptionsBase, InstallResult as InstallResultBase } from 'node-install-release';

export interface InstallResult extends InstallResultBase {
  error?: Error;
}

export interface InstallOptions extends InstallOptionsBase {
  concurrency?: number;
  silent?: boolean;
}

export type InstallCallback = (err?: Error, results?: InstallResult[]) => void;
