import assert from 'node:assert';
import { describe, it } from 'node:test';

describe('Expected Values To Be Strictly Equal', async () => {
  it('synchronous passing test', () => {
    assert.strictEqual(1, 1);
  });

  it('synchronous failing test', () => {
    assert.strictEqual(1, 2);
  });

  it('failing test using Promises', async () => {
    await new Promise((_, reject) => {
      setImmediate(() => {
        reject(new Error('this will cause the test to fail'));
      });
    });
  });

  it('callback passing test', (_, done) => {
    setImmediate(done);
  });

  it('callback failing test', (_, done) => {
    setImmediate(() => {
      done(new Error('callback failure'));
    });
  });

  it('top level test', async (t) => {
    await t.test('subtest 1', (_) => {
      assert.strictEqual(1, 1);
    });

    await t.test('subtest 2', (_) => {
      assert.strictEqual(2, 2);
    });
  });
});
