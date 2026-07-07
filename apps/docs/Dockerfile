# Dev - Docsify live server (bind-mount docs/ in compose for edits).
FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json ./
RUN pnpm install

COPY docs ./docs

EXPOSE 3100

CMD ["pnpm", "start"]
