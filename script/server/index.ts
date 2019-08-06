import express from 'express';
import { Handler } from 'express-serve-static-core';
import http from 'http';
import path from 'path';
import serveStatic from 'serve-static';
import config from '../../src/config';
import setupProxy from '../../src/setupProxy';

export interface Options {
  fallback404?: boolean;
  onlyProxy?: boolean;
  port?: number;
}

interface ServerConfig {
  fallback404: boolean;
  onlyProxy: boolean;
  port: number;
  baseDir: string;
}

const makeFallback = (serve: Handler, fallback404: boolean) => {
  const handler = (url: string): express.Handler => (req, res, next) => {
    req.url = url;
    serve(req, res, next);
  };

  return fallback404
    ? handler('/')
    : handler('/errors/404');
};

const makeServe = (baseDir: string) => {
  const setHeaders = (res: http.ServerResponse, file: string) => {
    if (file.match(`^${baseDir}/(books|errors)`)) {
      res.setHeader('Content-Type', 'text/html');
    }
  };

  return serveStatic(baseDir, {setHeaders});
};

const makeOptions = (options: Options): ServerConfig => ({
  port: config.PORT,
  ...options,
  baseDir: path.join(__dirname, '../../build'),
  fallback404: !!options.fallback404,
  onlyProxy: !!options.onlyProxy,
});

const makeMiddleware = (options: ServerConfig) => {
  const app = express();

  setupProxy(app);

  if (!options.onlyProxy) {
    const serve = makeServe(options.baseDir);
    app.use(serve);
    app.use(makeFallback(serve, options.fallback404));
  }

  return app;
};

type StartServer = (options: Options) => Promise<{server: http.Server, port: number}>;
export const startServer: StartServer = (options) => new Promise((resolve) => {
  const serverConfig = makeOptions(options);
  const app = makeMiddleware(serverConfig);
  const server = http.createServer(app);

  server.listen(serverConfig.port, () => resolve({server, port: serverConfig.port}));
});
