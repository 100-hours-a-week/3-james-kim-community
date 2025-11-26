const assert = require('assert');

describe('Basic Test', () => {
    it('should pass simple assertion', () => {
        const result = 1 + 1;
        assert.strictEqual(result, 2);
    });
});