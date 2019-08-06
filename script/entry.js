const fs = require('fs');
const path = require('path');
const identity = require('lodash/fp/identity');
const script = process.argv[2];
const scriptPath = `./${script}`;
const extensions = ['.ts', '.tsx'];

if (!script) {
  console.error('script argument is required');
  process.exit(1);
}

const exists = extensions
  .map(extension => fs.existsSync(path.resolve(__dirname, scriptPath + extension)))
  .filter(identity)
  .length > 0;

if (!exists) {
  console.error(`script "${script}" does not exist`);
  process.exit(1);
}

require('@babel/register')({
  ignore: [/node_modules/],
  extensions: ['.js', '.jsx', ...extensions],
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [
    'macros',
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/transform-runtime',
    'babel-plugin-transform-dynamic-import',
  ]
});

require(scriptPath);
