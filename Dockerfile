FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci

COPY . .

# build production app
RUN npm run build

EXPOSE 3000
CMD [ "env", "NODE_ENV=prod", "node", "dist/main.js" ]