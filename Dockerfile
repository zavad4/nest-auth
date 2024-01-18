FROM node:18-alpine3.16 as build
WORKDIR /app
COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine3.16
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/prisma /app/prisma
COPY package*.json ./
COPY tsconfig.json ./

CMD ["sh", "-c", "npm run migrate && npm run start:dev"]
