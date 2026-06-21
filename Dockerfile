FROM node:20-alpine
WORKDIR /app

# 安装依赖
COPY server/package.json server/package-lock.json* ./
RUN cd server && npm install --production 2>/dev/null || npm install

# 复制全部文件
COPY . .

WORKDIR /app/server
EXPOSE 3000
CMD ["node", "index.mjs"]
