# Stage 1: Build the application
FROM node:22-alpine as builder
WORKDIR /app

# Copy package files for services-api and install all dependencies
COPY ./package*.json ./services-api/
WORKDIR /app/services-api
RUN npm install

# Copy the remaining application code into the container
COPY ./ ./

# Build the app (ensure your build script compiles the source to the "dist" folder)
RUN npm run build

# Stage 2: Prepare the production image
FROM node:22-alpine as runner
WORKDIR /app

# Copy only the package files to install production dependencies in the final image
COPY package*.json ./services-api/
WORKDIR /app/services-api
RUN npm install --only=production

# Copy the build output from the builder stage
COPY --from=builder /app/services-api/dist/ ./dist/

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["node", "dist/main.js"] 
