FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Let Cloud Run set the PORT dynamically (Cloud Run uses 8080 by default)
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "start"]
