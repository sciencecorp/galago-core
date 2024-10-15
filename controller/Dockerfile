# Base Node.js image
FROM node:18-alpine AS base

WORKDIR /app

COPY ./package.json ./
RUN npm update && npm install

COPY ./gen-interfaces ./


# Build Stage
FROM base AS builder
WORKDIR /app
COPY . .

RUN npm run build

# Runner Stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3010

ENV PORT 3010

CMD ["node", "server.js"]
