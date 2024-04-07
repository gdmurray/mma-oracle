# Step 1: Use the official Bun image as the base
FROM thebun/bun:latest as builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and bun.lockb (if you have one) to the working directory
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy the rest of your app's source code
COPY . .

# Build your TypeScript app if necessary. Skip if your app doesn't need a build step.
RUN bun run build

# Step 2: Use a multi-stage build to keep the image small
FROM thebun/bun:latest

WORKDIR /app

# Copy over the built app and dependencies from the 'builder' stage
COPY --from=builder /app .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["bun", "start"]
