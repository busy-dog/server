import assert from "node:assert";
import { describe, it } from "node:test";

describe("Expected Values To Be Strictly Equal", async () => {
  it('synchronous passing test', (t) => {
    assert.strictEqual(1, 1);
  });

  it('synchronous failing test', (t) => {
    assert.strictEqual(1, 2);
  });

  it('failing test using Promises', (t) => {
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        reject(new Error('this will cause the test to fail'));
      });
    });
  });

  it('callback passing test', (t, done) => {
    setImmediate(done);
  });

  it('callback failing test', (t, done) => {
    setImmediate(() => {
      done(new Error('callback failure'));
    });
  });

  it('top level test', async (t) => {
    await t.test('subtest 1', (t) => {
      assert.strictEqual(1, 1);
    });
  
    await t.test('subtest 2', (t) => {
      assert.strictEqual(2, 2);
    });
  });
});
