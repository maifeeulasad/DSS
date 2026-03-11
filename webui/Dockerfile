FROM node:18.18.2-alpine3.17

WORKDIR /app

RUN apk update

RUN apk add --no-cache git chromium

RUN npx puppeteer browsers install chrome

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY . .

RUN npm i -g pnpm

RUN pnpm i

RUN pnpm build

EXPOSE 4173

CMD ["npx", "serve", "build", "-l", "4173"]