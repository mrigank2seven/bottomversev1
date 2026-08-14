const assert = require('node:assert/strict');
const { getMeasurementLimits, isValidMeasurement } = require('../js/fit-guide-validation.js');

assert.deepEqual(getMeasurementLimits('shoulder'), [10, 30]);
assert.equal(isValidMeasurement('shoulder', 17), true);
assert.equal(isValidMeasurement('shoulder', 40), false);
assert.equal(isValidMeasurement('chest', 24), false);
assert.equal(isValidMeasurement('chest', 40), true);
assert.equal(isValidMeasurement('inseam', 45.1), false);

console.log('fit-guide validation regression tests passed');
