import assert from 'assert';
import fs from 'fs';
import path from 'path';

const existsSync = (test) => {
  try {
    (fs.accessSync || fs.statSync)(test);
    return true;
  } catch (_) {
    return false;
  }
};

const FILE_PLATFORM_MAP = {
  win: 'win32',
  osx: 'darwin',
};

export const NODE_FILE_PATHS = {
  win32: 'node.exe',
  posix: path.join('bin', 'node'),
};
const NPM_FILE_PATHS = {
  win32: ['npm', path.join('node_modules', 'npm'), 'npm.cmd'],
  posix: [path.join('bin', 'npm'), path.join('lib', 'node_modules', 'npm')],
};

export default function validate(installPath: string, target) {
  let { filename, platform } = target;
  if (filename) {
    const filePlatform = filename.split('-')[0];
    platform = ['headers', 'src'].indexOf(filePlatform) >= 0 ? process.platform : FILE_PLATFORM_MAP[filePlatform] || filePlatform;
  }
  if (!platform) platform = process.platform;

  const nodePath = NODE_FILE_PATHS[platform] || NODE_FILE_PATHS.posix;
  assert.ok(existsSync(path.join(installPath, nodePath)), `${path.join(installPath, nodePath)} ${fs.readdirSync(path.dirname(path.join(installPath, nodePath)))}`);

  const npmPaths = NPM_FILE_PATHS[platform] || NPM_FILE_PATHS.posix;
  npmPaths.forEach((npmPath) => {
    assert.ok(existsSync(path.join(installPath, npmPath)), `${path.join(installPath, npmPath)} ${fs.readdirSync(path.dirname(path.join(installPath, npmPath)))}`);
  });
}
