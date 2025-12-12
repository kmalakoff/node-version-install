/**
 * Compatibility Layer for Node.js 0.8+
 * Local to this package - contains only needed functions.
 */
import os from 'os';

const hasHomedir = typeof os.homedir === 'function';

export function homedir(): string {
  if (hasHomedir) {
    return os.homedir();
  }
  const home = require('homedir-polyfill');
  return home();
}
