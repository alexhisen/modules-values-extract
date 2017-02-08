/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const postcss = require('postcss');
const moduleValuesPlugin = require('postcss-modules-values-replace');

/**
 * Extracts all CSS Module @values from a list of css files into an object.
 * @param {Object} options
 * @param {Array} options.files - list of fully-qualified css file names to extract @values from, for example for all .css files current dir:
 *  const path = require('path');
 *  const cssFiles = fs.readdirSync(__dirname).filter((file) => file.match(/\.css/i)).map((file) => path.resolve(__dirname, file));
 * @param {Array} [options.plugins] - list of postcss plugin functions to use in processing, i.e.:
 *                                    [require('postcss-calc'), require('precss')]
 * @returns {Promise|Object} - returns a promise which resolves to an object with values from all files combined.
 */
function extractValues(options = {}) {
  const variables = {};
  const plugins = options.plugins || [];
  const processor = postcss([moduleValuesPlugin].concat(plugins));
  const files = options.files || [];

  return new Promise((resolve, reject) => {
    const promises = [];
    files.forEach((file) => {
      const css = fs.readFileSync(file);
      // from/to below required by postcss for sourceMap, not actually used to read/write file:
      promises.push(processor
        .process(css, { from: file, to: `${file}.js` })
        .then(result => {
          if (result.messages.length) {
            const values = result.messages
              .filter(message => message.type === moduleValuesPlugin.messageType)
              .map(message => message.value)
            Object.assign(variables, ...values);
          }
        }));
    });
    Promise.all(promises).then(() => {
      resolve(variables);
    }).catch(reject);
  });
}

module.exports = extractValues;
