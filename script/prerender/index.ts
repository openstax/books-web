/*
 * this stuff taken from:
 * https://github.com/cereallarceny/cra-ssr/blob/master/server/index.js
 *
 * and in general a bunch of ssr logic based on:
 * https://github.com/cereallarceny/cra-ssr
 *
 * cra-ssr is deprecated, but i think the only really bad thing is that
 * ignore-styles relies on deprecated nodejs behavior, we should
 * look into other ways do do that import wrangling.
 *
 */
import * as fs from 'fs';
import ignoreStyles, { DEFAULT_EXTENSIONS, noOp } from 'ignore-styles';
import { JSDOM } from 'jsdom';
import md5File from 'md5-file';
import mime from 'mime';
import * as path from 'path';

// We also want to ignore all image requests
// When running locally these will load from a standard import
// When running on the server, we want to load via their hashed version in the build folder
const extensions = ['.gif', '.jpeg', '.jpg', '.png', '.svg'];

// Override the default style ignorer, also modifying all image requests
ignoreStyles(DEFAULT_EXTENSIONS, (mod, filename) => {
  if (!extensions.find((f) => filename.endsWith(f))) {
    // If we find a style
    return noOp();
  } else {
    // If we find an image
    const hash = md5File.sync(filename).slice(0, 8);
    const bn = path.basename(filename).replace(/(\.\w{3})$/, `.${hash}$1`);
    const filePath = `/static/media/${bn}`;

    if (fs.existsSync(path.resolve(__dirname, '../../build', filePath.replace(/^\//, '')))) {
      // file exists in build folder, refrence it by url here
      mod.exports = `${process.env.PUBLIC_URL || ''}${filePath}`;
    } else {
      // file doesn't exist in build folder, assume it is an inlined image
      // and inline it again here
      const fileContent = fs.readFileSync(filename);
      const mimetype = mime.getType(filename);
      mod.exports = `data:${mimetype || ''};base64,${new Buffer(fileContent).toString('base64')}`;
    }
  }
});

(global as any).DOMParser = new JSDOM().window.DOMParser;

// tslint:disable-next-line:no-var-requires for some reason this doesn't work as an import
require('./prerender');
