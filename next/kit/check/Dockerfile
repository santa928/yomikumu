FROM mcr.microsoft.com/playwright:v1.61.1-noble
WORKDIR /exam
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENTRYPOINT ["node","grade.mjs"]
