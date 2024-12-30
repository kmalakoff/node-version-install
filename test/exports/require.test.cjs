const assert = require('assert');
const install = require('node-version-install');

describe('exports .cjs', () => {
  it('defaults', () => {
    assert.equal(typeof install, 'function');
    assert.equal(typeof install.sync, 'function');
  });
});
