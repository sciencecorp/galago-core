# Base Node.js image
FROM node:18.20.3-alpine AS base

WORKDIR /app

# Install required packages
RUN apk add --no-cache curl unzip bash protobuf protobuf-dev

# Install protoc plugins globally
RUN npm install -g ts-proto protoc-gen-ts protoc-gen-grpc-web @bufbuild/protobuf

# Build Stage
FROM base AS builder

#WORKDIR /app

# Copy the interfaces and controller folders into the container
COPY interfaces /app/interfaces
COPY controller /app/controller

# Generate TypeScript interfaces
RUN mkdir -p /app/controller/gen-interfaces && \
    protoc \
      -I=/app/interfaces/ \
      -I=/usr/include/google/protobuf/ \
      --ts_proto_out=/app/controller/gen-interfaces/ \
      --ts_proto_opt=stringEnums=true \
      --ts_proto_opt=esModuleInterop=true \
      --ts_proto_opt=snakeToCamel=false \
      --ts_proto_opt=outputServices=grpc-js \
      /app/interfaces/*.proto /app/interfaces/tools/grpc_interfaces/*.proto

# Install dependencies and build the Next.js app
WORKDIR /app/controller
RUN npm update && npm install
RUN npm run build
#RUN npm install @bufbuild/protobuf --save

# Runner Stage
FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

# Add user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy artifacts from the builder stage
COPY --from=builder /app/controller/public ./public
COPY --from=builder /app/controller/gen-interfaces ./gen-interfaces

# Setup .next folder with correct permissions
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/controller/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/controller/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3010

ENV PORT 3010

# Start the app
CMD ["node", "server.js"]
