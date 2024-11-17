# Use official Node.js image as the base image
FROM node:22.11.0-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port that Next.js is running on
EXPOSE 3000

# Start the Next.js application
#CMD ["npm", "start"]
CMD ["npm", "run", "starthttps"]