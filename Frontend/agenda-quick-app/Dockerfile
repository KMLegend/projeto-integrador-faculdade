FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Running dev server for simplicity as requested
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
