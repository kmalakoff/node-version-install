# node-version-install

Install one or more released Node.js versions by a version string. The installer downloads releases and returns their installed paths.

## Install

```sh
npm install node-version-install
```

## Asynchronous install

```js
import install from 'node-version-install';

const result = await install('12', { storagePath: '/path/for/install' });
console.log(result); // [{ version, execPath, installPath, ... }]
```

## Synchronous install

```js
import { sync as installSync } from 'node-version-install';

const result = installSync('14', { storagePath: '/path/for/install' });
console.log(result); // [{ version, execPath, installPath, ... }]
```

Use an options object such as `{ storagePath }` to choose where versions are installed. See the [API docs](https://kmalakoff.github.io/node-version-install/) for callbacks and other options.
