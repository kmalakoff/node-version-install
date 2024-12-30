export const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
export const NODE = isWindows ? 'node.exe' : 'node';
