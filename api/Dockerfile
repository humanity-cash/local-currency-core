
FROM node:12 AS builder
LABEL "maintainer"="Aaron Boyd <https://github.com/aaronmboyd>"

WORKDIR /app
COPY package.json yarn.lock .snyk /app/

RUN yarn --network-timeout 100000

COPY tsconfig.json /app/
COPY src /app/src/
RUN yarn build

FROM node:slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder "/app/dist/" "/app/dist/"
COPY --from=builder "/app/node_modules/" "/app/node_modules/"
COPY --from=builder "/app/package.json" "/app/package.json"

EXPOSE $PORT

CMD ["yarn", "start"]