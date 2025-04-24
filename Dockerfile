# ---------- Base stage ----------
FROM node:20-alpine AS base

WORKDIR /app

# Copy config files
COPY package.json yarn.lock ./

# ---------- Development stage ----------
FROM node:20-alpine AS dev

WORKDIR /app

# Copy config files
COPY package.json yarn.lock ./

# Install dependencies (development)
RUN yarn install \
  # Install Nest CLI globally for `nest` command availability
  && yarn global add @nestjs/cli

# Copy source code
COPY . .

# Build application (optional, as Nest can compile on-the-fly in dev)
RUN yarn build

# Expose port
EXPOSE 3000

# Use Nest CLI directly for hot-reload in dev
CMD ["nest", "start", "--watch"]

# ---------- Local stage ----------
FROM dev AS local

# (inherits dev with Nest CLI installed)

# ---------- Production build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production=false

COPY . .
RUN yarn build

# ---------- Production final stage ----------
FROM node:20-alpine AS prod

WORKDIR /app

# Copy only necessary files
COPY package.json yarn.lock ./
RUN yarn install --production

COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the compiled application
CMD ["node", "dist/main.js"]
