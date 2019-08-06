Unified **R**eading **Ex**perience

[![Maintainability](https://api.codeclimate.com/v1/badges/c09c521f0a181481a91b/maintainability)](https://codeclimate.com/github/openstax/rex-web/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c09c521f0a181481a91b/test_coverage)](https://codeclimate.com/github/openstax/rex-web/test_coverage)
[![Updates](https://pyup.io/repos/github/openstax/rex-web/shield.svg)](https://pyup.io/repos/github/openstax/rex-web/) [![Greenkeeper badge](https://badges.greenkeeper.io/openstax/rex-web.svg)](https://greenkeeper.io/)


## Development Setup

install [nvm](https://github.com/creationix/nvm#installation)

```bash
# use the right version of node
nvm install

# install yarn, skip if you have it already
npm install -g yarn

# install dependencies
yarn

# start (browser will open automatically)
yarn start
```

### to fix scarry untrusted cert warning in chrome

*note:* you must do this for login to work

#### trust the certificate
- run `yarn trust-localhost` after you can see the security error in a browser
- reload the browser

## Architecture Overview

The app has two entrypoints, one for [prerender](script/prerender.tsx) and one for [browsers](src/index.tsx), both use [app](src/app/index.tsx) to construct the actual app container. The app container sets some stuff up and then passes [routes](src/app/content/routes.ts) into the [navigator](src/app/navigation/components/NavigationProvider.ts). Pages initialize their state by registering a [route hook](src/app/content/hooks/locationChange.ts), route hooks are a type of [action hook](src/app/content/hooks/receiveContent.ts) that can be used to respond to any redux action dispatched.

## Notes on Navigation

REX is just one part of the unified openstax experience. Depending on where you go, different applications will handle the request. In order for navigation to mostly work as intended, this development environment proxies some urls to other projects. Just because you can go to a url locally doesn't mean it is handled by REX. Urls handled by REX can be referenced [here](http://localhost:3000/), any other urls, even if they work locally, are being proxied to other apps.

If this situation is super confusing you can use the `SKIP_OS_WEB_PROXY` environment variable and _most_ non-rexy things will 404.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

Run `PORT=8000 yarn start` to change the webserver port.


### `yarn start:static`

Builds the app, builds prerendered content, and then serves it at [http://localhost:3000](http://localhost:3000) .

Run `PORT=8000 yarn start:static` to change the webserver port.

Run `REACT_APP_ENV=development yarn start:static` to build the books (defined in [config.development.js](./src/config.development.js)) and serve them.

To prerender the test fixture book and serve it, run `REACT_APP_ENV=test yarn start:static`.

### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `yarn test:unit`

runs only unit tests and react snapshots, these are the fast tests that generate code coverage.

#### `yarn test:screenshots`

CI runs on ubuntu, and because of minor rendering differences between platforms this command will _probably_ fail if you run it locally. after making changes if you need to update the screenshots, you can use the command `make screenshots` which will run the tests locally in a ubuntu docker container. this takes a while, which is why the tests are separated from the ones in `yarn test:unit`

**NOTE:** the `CI=true` flag makes it so screenshots will match if they are not quite exactly the same. this is included because there are still some things like math typesetting that are not 10000% deterministic in their rendering. if you want to make sure you get the updates you need for a minor change, you may have to remove the `CI=true` to see it, but you will probably also get some false positives.

### `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>

### Using Docker

install [docker](https://docs.docker.com/install/)

build the image

```bash
docker build -t openstax/rex-web .
```

run commands
```bash

# starts server
docker run -t openstax/rex-web yarn server

# runs tests
docker run -t openstax/rex-web yarn test
```

### Environment Variables

- `PUPPETEER_DEBUG=true yarn test` : Opens the browser with dev tools. This allows you to add `debugger` statements into the test _and_ into the browser code that is evaluated.
- `SKIP_OS_WEB_PROXY yarn start` : Runs development environment without the osweb proxy, can be less confusing if you're not sure what pages this project is rendering.

## Test Suites

### Developer Tests

run these with `yarn test`.

this suite:
- contains **unit tests** and **puppeteer** tests
- runs against a **local** dev server
- uses **fixture** data and content
- should be run locally by developers to make sure they don't break stuff
- is run by CI against pull requests in case developers are lazy
- should be **fast** to promote running frequently and prompt feedback on PRs
- should contain only high priority browser tests with puppeteer because browser tests are slow

### Selenium Tests

run these with `make test-local`

There are many more options when running these test. Please visit the [./pytest-selenium/README.md](./pytest-selenium/README.md) for more.

this suite:
- contains browser tests using selenium
- tests cross browser
- runs against a **remote** environment
- uses **real** content and **persistent** test data
- is run against release candidates when they are updated

# DOM Visitor

`yarn analyze:dom` visits every page of every book and reports when an content element is wider than the allowed content.
