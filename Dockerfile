# Use an official Node.js runtime as the base image
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only the package files to install dependencies
COPY package.json package-lock.json* ./ 

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Use a minimal Node.js environment for the final image
FROM node:18-alpine AS runner

# Set the working directory inside the container
WORKDIR /app

# Copy the built app from the builder stage
COPY --from=builder /app ./

# Expose the port that the app will run on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
