export const EPSILON = 1.19e-7;

export default {
  toBeApprox() {
    return {
      compare(actual, expected) {
        let result = {};
        result.pass = Math.abs(actual - expected) <=
          Math.max(Math.abs(actual), Math.abs(expected)) * EPSILON;
        result.message = `Expected ${actual} ${result.pass ? 'not to' : 'to'} be approximately ${expected}`;
        return result;
      }
    };
  }
};
