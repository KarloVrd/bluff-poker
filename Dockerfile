FROM node:20-alpine
ENV NODE_ENV=development
ENV PORT 3000
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
