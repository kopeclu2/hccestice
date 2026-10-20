# syntax=docker/dockerfile:1.10
# Frontend ≥ 1.10 kvůli `env=` u `RUN --mount=type=secret` (build secrets níž).

# Standalone výstup zapíná `output: 'standalone'` v next.config.ts.
# Odvozeno z https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

# Verze bunu: stejná jako `bun-version` u `oven-sh/setup-bun` v CI.
# ARG před prvním FROM je vidět jen v něm, stage si ho proto deklaruje znovu.
ARG BUN_VERSION=1.3.11

# Node 24+ vyžaduje `payload-auditor` (engines.node: ">=24").
# Pinováno digestem (index multi-arch image), ať se base image nemění pod
# rukama; tag níž je jen čitelný popisek. Aktualizace: nový digest z
# `docker buildx imagetools inspect node:24-alpine`.
# node:24-alpine
FROM node@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS base

# Install dependencies only when needed
FROM base AS deps
ARG BUN_VERSION
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# `bun.lock` je v repu jediný lockfile — bez něj by build spadl na
# "Lockfile not found".
COPY package.json bun.lock ./
RUN npm i -g bun@${BUN_VERSION} && bun install --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
ARG BUN_VERSION
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `next build` prerenderuje ~380 stránek přes Payload, takže build
# potřebuje živý Postgres a stejné veřejné klíče, jaké poběží v produkci —
# `NEXT_PUBLIC_*` se zapékají do klientského bundlu, takže jsou veřejné
# a smějí být build args.
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
# Org a projekt Sentry nejsou tajné; slouží jen k uploadu source map.
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID \
    SENTRY_ORG=$SENTRY_ORG \
    SENTRY_PROJECT=$SENTRY_PROJECT \
    NEXT_TELEMETRY_DISABLED=1

# Tajemství jdou přes BuildKit secrets, ne přes ARG/ENV: build arg i ENV
# zůstávají v metadatech image (`docker history`, `docker inspect`) a image
# leží v GHCR. Secret je připojený jen k tomuhle jednomu `RUN` jako proměnná
# prostředí a do žádné vrstvy se nezapíše. `SENTRY_AUTH_TOKEN` je volitelný
# (bez něj plugin přeskočí upload source map).
#
# Fail fast: bez DATABASE_URL doběhne build až k prerenderu a spadne
# na nesrozumitelné chybě z pg poolu.
RUN --mount=type=secret,id=database_url,env=DATABASE_URL \
    --mount=type=secret,id=payload_secret,env=PAYLOAD_SECRET \
    --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN,required=false \
    test -n "$DATABASE_URL" \
      || (echo "Secret database_url chybí — prerender ho potřebuje." && exit 1) \
    && npm i -g bun@${BUN_VERSION} \
    && bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Média jdou na persistent volume. Adresář musí v image existovat
# a patřit uživateli `nextjs` — Docker přebírá vlastníka z image, takže
# jinak by volume vznikl jako root a Payload by neměl kam ukládat uploady.
RUN mkdir -p public/media && chown -R nextjs:nodejs public/media

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Runtime cache: `.next/cache/images` (optimalizované varianty) a
# `.next/cache/fetch-cache` (`unstable_cache`). Prerenderované HTML tu
# **není** — to jde do `.next/server/app` a nese ho standalone výše.
#
# Adresář musí v image existovat a patřit uživateli `nextjs`, i když se
# volume nenamountuje. Docker přebírá vlastníka z image, takže jinak by
# volume vznikl jako root a optimizer by do cache nezapsal — stejná past
# jako u `public/media`, jen tišší: web by fungoval dál a jen by každý
# obrázek překódovával znovu.
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
