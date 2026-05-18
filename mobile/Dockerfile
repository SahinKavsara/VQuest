FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Tünel modunda başlat
CMD ["npx", "expo", "start", "--tunnel"]
