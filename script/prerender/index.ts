/*
 * this stuff taken from:
 * https://github.com/cereallarceny/cra-ssr/blob/master/server/index.js
 *
 * and in general a bunch of ssr logic based on:
 * https://github.com/cereallarceny/cra-ssr
 */
import ignoreStyles, { DEFAULT_EXTENSIONS, noOp } from 'ignore-styles';
import md5File from 'md5-file';
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

    mod.exports = `${process.env.PUBLIC_URL || ''}/static/media/${bn}`;
  }
});

// tslint:disable-next-line:no-var-requires for some reason this doesn't work as an import
require('./prerender');
