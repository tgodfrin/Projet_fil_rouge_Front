# --- Build stage : compile l'application Angular en mode production ---
FROM node:20-alpine AS build
WORKDIR /app

# Cache des dependances : on copie d'abord les manifests, npm ci ne se relance
# que si package.json / package-lock.json changent.
COPY package*.json ./
RUN npm ci

# Code source puis build prod (ng build, defaultConfiguration=production
# -> applique fileReplacements : environment.prod.ts, apiUrl='/api').
COPY . .
RUN npm run build

# --- Runtime stage : nginx sert les fichiers statiques + proxy /api ---
FROM nginx:alpine

# Les fichiers compiles (Angular 17+ : sortie dans dist/<projet>/browser).
COPY --from=build /app/dist/loc-mns-front/browser /usr/share/nginx/html

# Configuration nginx (fallback SPA + reverse-proxy vers le back).
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
