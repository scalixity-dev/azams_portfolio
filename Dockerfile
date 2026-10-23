# Azam portfolio — static Vite build served by nginx.
# Built and run by deploy/production (see deploy.sh there).

FROM node:22.20.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.28.0-alpine
# The nginx image renders /etc/nginx/templates/*.template with envsubst at start,
# so PORT picks the listen port (the deploy health-checks on a throwaway port).
ENV PORT=3200
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
