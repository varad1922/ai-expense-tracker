FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --ignore-scripts

COPY prisma ./prisma/

RUN npx prisma generate

COPY . .

EXPOSE 10000

CMD ["npm", "start"]