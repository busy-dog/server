FROM guergeiro/pnpm:22-10-alpine AS base

FROM base AS builder

# RUN apk add --no-cache gcompat
WORKDIR /app

COPY .env *.d.ts package*json pnpm-lock.yaml src scripts ./
COPY tsconfig.build.json ./tsconfig.json

RUN pnpm install --frozen-lockfile && \
    pnpm run build && \
    pnpm prune --prod

ENV CI='true'
ENV HUSKY=0

FROM base AS runner
WORKDIR /app

# Install dotenvx
RUN curl -sfS https://dotenvx.sh/install.sh | sh

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

USER hono
EXPOSE 3000

CMD ["node", "/app/dist/run.js"]