FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src src
COPY migrations migrations

RUN npm run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/dist dist
COPY --from=build /app/migrations migrations

EXPOSE 8080

CMD ["node", "dist/server.js"]
