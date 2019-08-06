# this dockerfile is not for production, its for QA and CI
FROM node:10.15-jessie as puppeteer

# debian deps from https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch
RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  gconf-service \
  libappindicator1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  shellcheck \
  wget \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

FROM puppeteer as slim

WORKDIR /code

COPY package.json yarn.lock ./
COPY ./script ./script
COPY ./src/config*js ./src/

RUN yarn install

COPY . .

EXPOSE 8000

CMD ["yarn", "run", "server"]

FROM slim as built

ARG PUBLIC_URL
ARG REACT_APP_CODE_VERSION
ARG REACT_APP_RELEASE_ID
ARG REACT_APP_BOOKS

ENV PUBLIC_URL=$PUBLIC_URL
ENV REACT_APP_CODE_VERSION=$REACT_APP_CODE_VERSION
ENV REACT_APP_RELEASE_ID=$REACT_APP_RELEASE_ID
ENV REACT_APP_BOOKS=$REACT_APP_BOOKS

ENV REACT_APP_ENV=production

RUN yarn run build
