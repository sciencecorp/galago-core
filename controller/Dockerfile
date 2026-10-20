# Multi-stage build for production
# Stage 1: .NET SDK for C# compilation only
FROM --platform=$TARGETPLATFORM mcr.microsoft.com/dotnet/sdk:7.0-alpine AS dotnet-compiler

# Stage 2: Generate TypeScript gRPC interfaces from the galago-tools protos
# (requires the vendor/galago-tools submodule). The output is plain TypeScript,
# so this stage runs on the build host's platform.
FROM --platform=$BUILDPLATFORM node:22.11-bookworm-slim AS proto-gen
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m venv /opt/protoc \
    && /opt/protoc/bin/pip install --no-cache-dir grpcio-tools
WORKDIR /proto

# ts-proto comes from the controller lockfile, same as local dev and CI.
# Install scripts only build native modules this stage doesn't use.
COPY controller/package.json controller/package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund

# Same options as proto_ts in bin/make
COPY vendor/galago-tools/interfaces ./interfaces
RUN mkdir gen-interfaces && /opt/protoc/bin/python -m grpc_tools.protoc \
    -I=interfaces \
    --plugin=protoc-gen-ts_proto=node_modules/.bin/protoc-gen-ts_proto \
    --ts_proto_out=gen-interfaces \
    --ts_proto_opt=stringEnums=true \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=snakeToCamel=false \
    --ts_proto_opt=outputServices=grpc-js \
    interfaces/*.proto interfaces/tools/grpc_interfaces/*.proto

# Stage 3: Node.js build environment
FROM --platform=$TARGETPLATFORM node:22.11-alpine3.19 AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY controller/package*.json ./controller/
WORKDIR /app/controller
RUN npm ci

# Copy the rest of the controller source code and the generated interfaces
COPY controller/ ./
COPY --from=proto-gen /proto/gen-interfaces ./gen-interfaces

# Build the Next.js application
RUN npm run build

# Stage 4: Production runtime with minimal .NET dependencies
FROM --platform=$TARGETPLATFORM node:22.11-alpine3.19 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install minimal dependencies for .NET runtime
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
