import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config();

// jest-puppeteer will expose the `page` and `browser` globals to Jest tests.
const browser = (global as any).browser as puppeteer.Browser;
const page = (global as any).page as puppeteer.Page;
const puppeteerConfig = (global as any).puppeteerConfig as {server: {port: number}};

if (!browser || !page) {
  throw new Error('Browser has not been started! Did you remember to specify `@jest-environment puppeteer`?');
}

export {
  browser,
  page,
};

export const url = (path: string) => `http://localhost:${puppeteerConfig.server.port}/${path}`;
