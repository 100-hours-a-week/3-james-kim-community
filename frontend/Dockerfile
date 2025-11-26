# Dependencies Stage
FROM node:22-alpine AS builder

# Work Directory
WORKDIR /app

# Layer1: package*.json 복사
COPY package.json package-lock.json ./

# Layer2: 프로덕션 의존성만
RUN npm ci --omit-dev

# =======================================

# Runtime Stage 
FROM node:22-alpine

# Work Directory
WORKDIR /app

# 실행에 필요한 node_modules만 복사
COPY --from=builder /app/node_modules ./node_modules

## 소스 코드 복사
COPY package.json ./
COPY app.js ./
COPY public ./public
COPY assets ./assets

# 포트 노출 명시
EXPOSE 3000

# Express 서버 실행
CMD ["npm", "start"]
