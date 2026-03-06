FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile || pnpm install
COPY . .
EXPOSE 5173
CMD ["pnpm", "dev", "--host"]
