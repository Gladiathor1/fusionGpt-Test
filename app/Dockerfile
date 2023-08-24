FROM node:alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and tsconfig.json
COPY ./package.json ./
COPY ./tsconfig.json ./

# Install Node.js dependencies
RUN apk add --no-cache git
ENV PATH /usr/bin/git:$PATH
RUN npm config set fetch-retry-mintimeout 20000

RUN npm config set fetch-retry-maxtimeout 120000


RUN npm install

# Copy craco.config.js, public, and src directories
COPY ./craco.config.js ./craco.config.js
COPY ./public ./public
COPY ./src ./src

# Set environment variables
ENV NODE_ENV=production

# Build the application
RUN npm run build

FROM nginx
COPY --from=build /app/build /usr/share/nginx/html
