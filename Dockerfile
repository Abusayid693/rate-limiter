FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Install dev dependencies for TypeScript
RUN npm install --only=dev

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "dist/index.js"]
