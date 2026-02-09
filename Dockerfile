FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY src ./src

RUN npm ci && npm run build

ENV PORT=3000
EXPOSE ${PORT}

CMD ["node", "dist/index.js"]
