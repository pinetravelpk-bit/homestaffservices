FROM node:24-bookworm-slim
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && mkdir -p /app/data && chown -R node:node /app
USER node
ENV NODE_ENV=production
ENV DATA_DIR=/app/data
EXPOSE 3000
CMD ["npm","start"]
