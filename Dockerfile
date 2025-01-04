FROM node:lts-alpine AS base
RUN --mount=type=cache,id=apk,target=/var/cache/apk apk add graphicsmagick
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts
RUN node build.mjs

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod --ignore-scripts

FROM base
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY ./drizzle ./drizzle
COPY ./locales ./locales
COPY ./views ./views
EXPOSE 3000
CMD ["node", "--enable-source-maps", "dist/index.js"]
