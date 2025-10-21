import assert from 'assert';

import install, { sync } from 'node-version-install';

describe('exports .ts', () => {
  it('defaults', () => {
    assert.equal(typeof install, 'function');
    assert.equal(typeof sync, 'function');
  });
});
