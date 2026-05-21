FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json /app/
COPY apps/web/package.json /app/apps/web/package.json
COPY packages/shared/package.json /app/packages/shared/package.json

RUN npm install

COPY packages/shared /app/packages/shared
COPY apps/web /app/apps/web

RUN npm run build -w packages/shared && npm run build -w apps/web

EXPOSE 3000
CMD ["npm", "run", "start", "-w", "apps/web"]

