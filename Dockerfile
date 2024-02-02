# Use an official Node.js runtime as a parent image
FROM node:21

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Expose the port your NestJS app is running on
EXPOSE 3000

# Define the command to start your NestJS app
CMD [ "npm", "start" ]
