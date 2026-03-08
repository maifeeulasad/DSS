FROM node:18.18.2-alpine3.17 AS builder

WORKDIR /app

COPY . .

RUN npm i -g pnpm

RUN pnpm i

RUN pnpm build

# Stage 2: Nginx
FROM nginx:1.25-alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3010

CMD ["nginx", "-g", "daemon off;"]