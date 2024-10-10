# Step 1: Build the dashboard application
FROM node:16 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Step 2: Serve the dashboard application using a lightweight web server
FROM nginx:alpine

# Copy the build output to the Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port that Nginx is listening on
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
