FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build arguments for Next.js build
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG DATABASE_URL

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV DATABASE_URL=${DATABASE_URL}
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Install OpenSSL for Prisma and Chromium for Puppeteer
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy entrypoint script
COPY docker-entrypoint.sh ./
USER root
RUN chmod +x docker-entrypoint.sh

# Create uploads directory
RUN mkdir -p /app/public/uploads/audio /app/public/uploads/videos
RUN chown -R nextjs:nodejs /app/public/uploads
RUN chown nextjs:nodejs /app/docker-entrypoint.sh

# Fix permissions for Prisma
RUN chown -R nextjs:nodejs /app/node_modules/.prisma
RUN chown -R nextjs:nodejs /app/node_modules/@prisma
RUN chown -R nextjs:nodejs /app/node_modules/prisma
RUN chown -R nextjs:nodejs /app/prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["./docker-entrypoint.sh"]
