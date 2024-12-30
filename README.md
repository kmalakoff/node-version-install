## node-version-install

Install NodeJs by version string asynchronously or synchronously.

### Example 1: Asynchronous Install

```typescript
import install from "node-version-install";

const result = await install("12", "/path/for/install");
console.log(result); // { version: "12.3.4", execPath, installPath }
```

### Example 2: Synchronous Install

```typescript

import install from "node-version-install";

const call = require("node-version-install");

const result = install("14,stable", "/path/for/install");
console.log(result); // [{ version: "14.4.5", execPath, installPath }, { version: "22.2.1", execPath, installPath }]
```

### Documentation

[API Docs](https://kmalakoff.github.io/node-version-install/)
