// code/client/tests/harness/index.js
import assert from 'node:assert/strict';

class TestHarness {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.errors = [];
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeEachHooks: [],
      afterEachHooks: [],
      beforeAllHooks: [],
      afterAllHooks: [],
    };
    this.suites.push(suite);
    const parentSuite = this.currentSuite;
    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = parentSuite;
    }
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEachHooks.push(fn);
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEachHooks.push(fn);
    }
  }

  it(description, fn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {});
    }
    this.currentSuite.tests.push({
      description,
      fn,
      skip: false,
    });
  }

  itSkip(description, fn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {});
    }
    this.currentSuite.tests.push({
      description,
      fn,
      skip: true,
    });
  }

  expect(actual) {
    return {
      toBe: (expected) => {
        assert.equal(actual, expected, `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
      },
      toEqual: (expected) => {
        assert.deepEqual(actual, expected, `Expected ${JSON.stringify(actual)} to deeply equal ${JSON.stringify(expected)}`);
      },
      toBeTruthy: () => {
        assert.ok(actual, `Expected ${actual} to be truthy`);
      },
      toBeFalsy: () => {
        assert.ok(!actual, `Expected ${actual} to be falsy`);
      },
      toBeNull: () => {
        assert.equal(actual, null, `Expected ${actual} to be null`);
      },
      toBeDefined: () => {
        assert.notEqual(actual, undefined, `Expected value to be defined`);
      },
      toBeUndefined: () => {
        assert.equal(actual, undefined, `Expected ${actual} to be undefined`);
      },
      toContain: (item) => {
        if (typeof actual === 'string' || Array.isArray(actual)) {
          assert.ok(actual.includes(item), `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
        } else if (actual && typeof actual === 'object') {
          assert.ok(item in actual, `Expected object to contain key ${item}`);
        } else {
          throw new Error(`Cannot call toContain on type ${typeof actual}`);
        }
      },
      toBeGreaterThan: (expected) => {
        assert.ok(actual > expected, `Expected ${actual} > ${expected}`);
      },
      toBeGreaterThanOrEqual: (expected) => {
        assert.ok(actual >= expected, `Expected ${actual} >= ${expected}`);
      },
      toBeLessThan: (expected) => {
        assert.ok(actual < expected, `Expected ${actual} < ${expected}`);
      },
      toBeLessThanOrEqual: (expected) => {
        assert.ok(actual <= expected, `Expected ${actual} <= ${expected}`);
      },
      toMatch: (regex) => {
        assert.match(String(actual), regex, `Expected "${actual}" to match ${regex}`);
      },
      toHaveLength: (length) => {
        assert.equal(actual?.length, length, `Expected length ${actual?.length} to be ${length}`);
      },
      toHaveProperty: (prop, expectedValue) => {
        assert.ok(actual && typeof actual === 'object' && prop in actual, `Expected object to have property ${prop}`);
        if (expectedValue !== undefined) {
          assert.deepEqual(actual[prop], expectedValue, `Expected property ${prop} to equal ${expectedValue}`);
        }
      },
      toThrow: (expectedRegex) => {
        let threw = false;
        let thrownError = null;
        try {
          if (typeof actual === 'function') {
            actual();
          }
        } catch (err) {
          threw = true;
          thrownError = err;
        }
        assert.ok(threw, `Expected function to throw`);
        if (expectedRegex && thrownError) {
          assert.match(thrownError.message, expectedRegex);
        }
      },
      toReject: async (expectedRegex) => {
        let threw = false;
        let thrownError = null;
        try {
          if (typeof actual === 'function') {
            await actual();
          } else if (actual && typeof actual.then === 'function') {
            await actual;
          }
        } catch (err) {
          threw = true;
          thrownError = err;
        }
        assert.ok(threw, `Expected promise to reject`);
        if (expectedRegex && thrownError) {
          assert.match(thrownError.message, expectedRegex);
        }
      }
    };
  }

  async run() {
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.errors = [];

    console.log('\n======================================================');
    console.log('   MediBridge Requirement-Driven E2E Test Suite       ');
    console.log('======================================================\n');

    const startTime = Date.now();

    for (const suite of this.suites) {
      console.log(`\n\x1b[36m▶ Suite: ${suite.name}\x1b[0m`);

      for (const hook of suite.beforeAllHooks) {
        await hook();
      }

      for (const test of suite.tests) {
        this.totalTests++;
        if (test.skip) {
          this.skippedTests++;
          console.log(`  \x1b[33m- [SKIP]\x1b[0m ${test.description}`);
          continue;
        }

        try {
          for (const hook of suite.beforeEachHooks) {
            await hook();
          }

          const testStart = Date.now();
          await test.fn();
          const duration = Date.now() - testStart;

          for (const hook of suite.afterEachHooks) {
            await hook();
          }

          this.passedTests++;
          console.log(`  \x1b[32m✔ [PASS]\x1b[0m ${test.description} \x1b[90m(${duration}ms)\x1b[0m`);
        } catch (err) {
          this.failedTests++;
          this.errors.push({
            suite: suite.name,
            test: test.description,
            error: err,
          });
          console.log(`  \x1b[31m✖ [FAIL]\x1b[0m ${test.description}`);
          console.log(`     \x1b[31mError:\x1b[0m ${err.message}`);
        }
      }

      for (const hook of suite.afterAllHooks) {
        await hook();
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log('\n------------------------------------------------------');
    console.log(' Test Execution Summary');
    console.log('------------------------------------------------------');
    console.log(` Total Suites : ${this.suites.length}`);
    console.log(` Total Tests  : ${this.totalTests}`);
    console.log(` \x1b[32mPassed       : ${this.passedTests}\x1b[0m`);
    if (this.failedTests > 0) {
      console.log(` \x1b[31mFailed       : ${this.failedTests}\x1b[0m`);
    } else {
      console.log(` Failed       : 0`);
    }
    if (this.skippedTests > 0) {
      console.log(` \x1b[33mSkipped      : ${this.skippedTests}\x1b[0m`);
    }
    console.log(` Duration     : ${totalDuration}ms`);
    console.log('------------------------------------------------------');

    if (this.failedTests > 0) {
      console.log('\n\x1b[31mFailed Tests Detail:\x1b[0m');
      this.errors.forEach((e, idx) => {
        console.log(`\n${idx + 1}) [${e.suite}] -> ${e.test}`);
        console.log(`   ${e.error.stack || e.error.message}`);
      });
      return false;
    }

    console.log('\n\x1b[32m✔ All tests completed successfully.\x1b[0m\n');
    return true;
  }
}

export const harness = new TestHarness();
export const describe = (name, fn) => harness.describe(name, fn);
export const it = (desc, fn) => harness.it(desc, fn);
export const itSkip = (desc, fn) => harness.itSkip(desc, fn);
export const beforeEach = (fn) => harness.beforeEach(fn);
export const afterEach = (fn) => harness.afterEach(fn);
export const expect = (val) => harness.expect(val);
