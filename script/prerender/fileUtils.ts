import fs from 'fs';
import flow from 'lodash/fp/flow';
import path from 'path';

const ASSET_DIR = path.resolve(__dirname, '../../build');

const prefixPath = (filePath: string) => path.join(ASSET_DIR, filePath);
const directoryExists = (filePath: string) => fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory();

export const assetDirectoryExists = flow(prefixPath, directoryExists);

function makeDirectories(filepath: string) {
  const dirname = path.dirname(filepath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  makeDirectories(dirname);
  fs.mkdirSync(dirname);
}

function writeFile(filepath: string, contents: string) {
  if (filepath === `${ASSET_DIR}/index.html`) {
    throw new Error(`can't write to index.html`);
  }
  makeDirectories(filepath);
  fs.writeFile(filepath, contents, () => null);
}

export const writeAssetFile = (filePath: string, contents: string) => writeFile(prefixPath(filePath), contents);

const readFile = (filePath: string) => fs.readFileSync(filePath, 'utf8');

export const readAssetFile = flow(prefixPath, readFile);
