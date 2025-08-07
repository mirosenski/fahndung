# syntax=docker/dockerfile:1

## Build stage: install dependencies and run build
FROM node:20-bullseye AS builder
WORKDIR /app

# Install pnpm globally and enable corepack
RUN corepack enable && corepack prepare pnpm@8.15.3 --activate

# Copy source
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the Next.js application
ENV NODE_ENV=production
RUN pnpm run build


## Production stage: copy built assets and run the app with Next.js
FROM node:20-bullseye-slim AS runner
WORKDIR /app

# Copy package.json and pnpm lock file for production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Only install production dependencies
RUN corepack enable && corepack prepare pnpm@8.15.3 --activate && pnpm install --prod --frozen-lockfile

# Copy the built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Expose Next.js port
EXPOSE 3000

# Start the Next.js server
CMD [ "pnpm", "start" ]