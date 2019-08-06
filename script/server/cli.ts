// tslint:disable:no-console
import { argv } from 'yargs';
import { Options, startServer } from '.';

startServer(argv as Options)
  .then(({port}) => console.log(`WEBSERVER: running on port: ${port}`))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
;
