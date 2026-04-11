ARG NODE_VERSION=22.11.0

FROM node:${NODE_VERSION}

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]