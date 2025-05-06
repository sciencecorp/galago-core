# Multi-stage build for production
# Stage 1: .NET SDK for C# compilation only
FROM mcr.microsoft.com/dotnet/sdk:7.0-alpine AS dotnet-compiler

# Stage 2: Node.js build environment
FROM node:18.20.3-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY controller/package*.json ./controller/
WORKDIR /app/controller
RUN npm ci

# Copy the rest of the controller source code
COPY controller/ ./

# Build the Next.js application
RUN npm run build

# Stage 3: Production runtime with minimal .NET dependencies
FROM node:18.20.3-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Install minimal dependencies for .NET runtime
# Updated packages for Alpine 3.21
RUN apk add --no-cache \
    libstdc++ \
    libintl \
    icu-libs \
    krb5-libs \
    libgcc \
    openssl \
    libssl3 \
    zlib

# Set .NET runtime environment variables
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

# Copy the .NET compiler from the SDK stage
COPY --from=dotnet-compiler /usr/share/dotnet /usr/share/dotnet
RUN ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet

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
ENV PORT=3010

# Start the app
CMD ["npm", "run", "start"]