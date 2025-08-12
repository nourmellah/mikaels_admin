# build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build-time env for Vite (exposed to client code)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Skip TS typecheck during Docker image build (optional). Set to 0 to enforce.
ARG CLIENT_SKIP_TSC=1
RUN if [ "$CLIENT_SKIP_TSC" = "1" ]; then npx vite build; else npm run build; fi

# serve via nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
