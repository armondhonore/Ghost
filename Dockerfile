FROM mirror.gcr.io/library/node:22-alpine AS base
RUN npm install -g pnpm@11.6.0

FROM base AS build
# Install build dependencies for native modules if any
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm run build

FROM mirror.gcr.io/library/node:22-alpine
RUN npm install -g pnpm@11.6.0
WORKDIR /app

# Copy the built application and necessary files
COPY --from=build /app /app

EXPOSE 2368
ENV PORT=2368
ENV HOSTNAME=0.0.0.0

CMD ["pnpm", "start"]