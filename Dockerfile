# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set build-time arguments
ARG VITE_API_URL

# Set them as environment variables for the build stage
ENV VITE_API_URL=${VITE_API_URL}

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN VITE_API_URL=${VITE_API_URL} npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.21.3-alpine

# Copy the built application from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
