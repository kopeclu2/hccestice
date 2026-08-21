# Standalone výstup zapíná `output: 'standalone'` v next.config.ts.
# Odvozeno z https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

# Node 24+ vyžaduje `payload-auditor` (engines.node: ">=24").
FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# `bun.lock` je v repu jediný lockfile — bez něj by build spadl na
# "Lockfile not found".
COPY package.json bun.lock ./
RUN npm i -g bun && bun install --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `next build` prerenderuje ~380 stránek přes Payload, takže build
# potřebuje živý Postgres a stejné veřejné klíče, jaké poběží v produkci —
# `NEXT_PUBLIC_*` se zapékají do klientského bundlu.
ARG DATABASE_URL
ARG PAYLOAD_SECRET
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV DATABASE_URL=$DATABASE_URL \
    PAYLOAD_SECRET=$PAYLOAD_SECRET \
    NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY \
    NEXT_TELEMETRY_DISABLED=1

# Fail fast: bez DATABASE_URL doběhne build až k prerenderu a spadne
# na nesrozumitelné chybě z pg poolu.
RUN test -n "$DATABASE_URL" || (echo "DATABASE_URL build arg chybí — prerender ho potřebuje." && exit 1)

RUN npm i -g bun && bun run build

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

USER nextjs

EXPOSE 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
