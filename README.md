# modules-values-extract

Extracts all CSS Module @values from a list of css files into an object.

This allows you to feed them, for example, to postcss-custom-properties in webpack.config.js

## Installation
`npm install modules-values-extract --save-dev`

Depends on `postcss` as a peer dependency.

## Usage
In your webpack.config.js:
```js
const fs = require('fs');
const path = require('path');
const extractValues = require('modules-values-extract');

// get all *.css files in current directory:
const cssFiles = fs.readdirSync(__dirname)
  .filter((file) => file.match(/\.css/i))
  .map((file) => path.resolve(__dirname, file));

let config;
let myVariables;

module.exports = extractValues({
 files: cssFiles,
 /* optional list of plugin functions to use in processing, for example: */
 /* eslint-disable global-require */
 plugins: [require('postcss-calc'), require('precss')],
 /* eslint-enable global-require */
}).then((variables) => {
  myVariables = variables;
  return config;
});

config = {
  // ... various webpack config

  postcss: () => {
    return [
      /* eslint-disable global-require */
      require('postcss-cssnext')({
        features: {
          customProperties: {
            variables: myVariables,
          },
        },
      }),
      require('postcss-modules-values'),
      /* eslint-enable global-require */
    ];
  },
};
```

Note that the above module.exports in wepback.config.js is actually a Promise that resolves to the config object, not the config object itself.

This requires webpack-dev-server 2.x or 1.16.3+.