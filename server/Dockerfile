FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies without running Husky prepare scripts
RUN npm install --ignore-scripts

# Copy Prisma schema first
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

EXPOSE 5000

CMD ["npm", "start"]