FROM node:18.18.2-alpine3.17

WORKDIR /app

COPY . .

RUN npm i -g pnpm

RUN pnpm i

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "serve"]