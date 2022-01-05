const validator = require('validator');

const validateUrlError = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error('string.uri');
}

module.exports = validateUrlError;