const measurementLimits = {
  chest: [25, 70],
  waist: [20, 70],
  shoulder: [10, 30],
  hip: [25, 70],
  inseam: [20, 45]
};

function getMeasurementLimits(field) {
  return measurementLimits[field] || [1, 70];
}

function isValidMeasurement(field, inches) {
  const [min, max] = getMeasurementLimits(field);
  return inches >= min && inches <= max;
}

if (typeof module !== 'undefined') {
  module.exports = { getMeasurementLimits, isValidMeasurement };
}
