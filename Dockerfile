# ---------- Base stage ----------
FROM node:20-alpine AS base

WORKDIR /app

# Copia i file di configurazione
COPY package.json yarn.lock ./

# ---------- Development stage ----------
FROM node:20-alpine AS dev

WORKDIR /app

# Copia i file di configurazione
COPY package.json yarn.lock ./

# Installa le dipendenze (ambiente di sviluppo)
RUN yarn install

# Copia tutto il codice sorgente
COPY . .

# Compila opzionalmente (Nest compila on-the-fly in dev)
RUN yarn build

EXPOSE 3000
CMD ["yarn", "start:dev"]

# ---------- Local stage ----------
FROM dev AS local

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

# Copia solo i file necessari
COPY package.json yarn.lock ./
RUN yarn install --production

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
