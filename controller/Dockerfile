
# --- Base Stage ---
FROM node:18.20.3-alpine AS base

WORKDIR /app

RUN apk add --no-cache curl unzip bash

# --- Builder Stage ---
FROM base AS builder

WORKDIR /app

# Copy package files first for caching.
COPY controller/package*.json ./controller/
WORKDIR /app/controller

# Use npm ci for a clean install using your lockfile.
RUN npm ci

# Copy the rest of the controller source code.
# This should include your prebuilt "gen-interfaces" folder.
COPY controller/ ./

# Build the Next.js application.
RUN npm run build

# --- Runner Stage ---
FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

# Add user and group for prerender cache
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy artifacts from the builder stage
COPY --from=builder /app/controller/public ./public
COPY --from=builder /app/controller/gen-interfaces ./gen-interfaces

# Setup .next folder with correct permissions
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/controller/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/controller/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/controller/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/controller/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3010

ENV PORT 3010

# Start the app
CMD ["npm", "run", "start"]