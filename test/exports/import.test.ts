import assert from 'assert';

// @ts-ignore
import install, { sync } from 'node-version-install';

describe('exports .ts', () => {
  it('defaults', () => {
    assert.equal(typeof install, 'function');
    assert.equal(typeof sync, 'function');
  });
});
