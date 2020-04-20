FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci

COPY src/ ./src
COPY test/ ./test
COPY ts* ./
COPY nest* ./

# build production app
RUN npm run build

EXPOSE 3000
CMD [ "node", "dist/main.js" ]