FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Expose port and handle Render's dynamic PORT
ENV PORT=3000
EXPOSE 3000

CMD ["node", "index.js"]
