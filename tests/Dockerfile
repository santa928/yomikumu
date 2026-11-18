FROM mcr.microsoft.com/playwright:v1.61.1-noble
ENV NODE_PATH=/opt/verify/node_modules
RUN npm install --prefix /opt/verify --no-audit --no-fund playwright@1.61.1
WORKDIR /course
CMD ["node", "tests/course.cjs"]
